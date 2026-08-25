from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from requests.exceptions import RequestException
from rest_framework.test import APITestCase

from apps.common.constants import PICKUP

from apps.checkout.models import CheckoutTransaction
from apps.payments.models import Payment
from apps.payments.services.paystack import PaystackPaymentService
from apps.cart.models import Cart, CartItem
from apps.products.models import Category, Product, ProductVariant
from apps.orders.models import Order
from apps.checkout.services import CheckoutService
from apps.checkout.models import CheckoutTransaction, CheckoutTransactionItem, StockReservation


class PaystackPaymentVerificationTests(TestCase):

    def setUp(self):
        self.checkout = CheckoutTransaction.objects.create(
            status=CheckoutTransaction.STATUS_PENDING,
            delivery_type="PICKUP",
            subtotal=100,
            delivery_fee=0,
            total_amount=100,
            expires_at="2030-01-01T00:00:00Z",
        )

        self.payment = Payment.objects.create(
            checkout=self.checkout,
            reference="CHECKOUT-1-TEST1234",
            amount=100,
            status=Payment.STATUS_INITIATED,
            provider="paystack",
        )

        self.service = PaystackPaymentService()

    @patch("apps.payments.services.paystack.requests.get")
    def test_successful_verification_marks_payment_paid(
        self,
        mock_get,
    ):
        mock_get.return_value.json.return_value = {
            "status": True,
            "data": {
                "status": "success",
                "reference": self.payment.reference,
                "amount": 10000,
            },
        }
        mock_get.return_value.raise_for_status.return_value = None

        response = self.service.verify_payment(
            self.payment.reference
        )

        self.assertTrue(response["status"])

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.STATUS_SUCCESS,
        )

    @patch("apps.payments.services.paystack.requests.get")
    def test_verification_rejects_amount_mismatch(
        self,
        mock_get,
    ):
        mock_get.return_value.json.return_value = {
            "status": True,
            "data": {
                "status": "success",
                "reference": self.payment.reference,
                "amount": 9999,
            },
        }
        mock_get.return_value.raise_for_status.return_value = None

        response = self.service.verify_payment(
            self.payment.reference
        )

        self.assertFalse(response["status"])

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.STATUS_INITIATED,
        )

    @patch("apps.payments.services.paystack.requests.get")
    def test_verification_rejects_reference_mismatch(
        self,
        mock_get,
    ):
        mock_get.return_value.json.return_value = {
            "status": True,
            "data": {
                "status": "success",
                "reference": "WRONG-REFERENCE",
                "amount": 10000,
            },
        }
        mock_get.return_value.raise_for_status.return_value = None

        response = self.service.verify_payment(
            self.payment.reference
        )

        self.assertFalse(response["status"])

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.STATUS_INITIATED,
        )


class PaymentFinalisationTests(TestCase):

    def setUp(self):
        self.category = Category.objects.create(
            name="Test Category",
        )

        self.product = Product.objects.create(
            name="Test Coffee",
            category=self.category,
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            name="250g",
            price=100,
            stock=10,
            is_available=True,
        )

        self.cart = Cart.objects.create(
            session_id="test-session",
        )

        CartItem.objects.create(
            cart=self.cart,
            variant=self.variant,
            quantity=2,
        )

        self.checkout = CheckoutTransaction.objects.create(
            session_id="test-session",
            status=CheckoutTransaction.STATUS_PAID,
            delivery_type="PICKUP",
            subtotal=200,
            delivery_fee=0,
            total_amount=200,
            expires_at="2030-01-01T00:00:00Z",
        )

        CheckoutTransactionItem.objects.create(
            checkout=self.checkout,
            variant_id=self.variant.id,
            product_name=self.product.name,
            variant_name=self.variant.name,
            unit_price=100,
            quantity=2,
            subtotal=200,
        )

        self.payment = Payment.objects.create(
            checkout=self.checkout,
            reference="CHECKOUT-FINALISE-001",
            amount=200,
            status=Payment.STATUS_SUCCESS,
            provider="paystack",
        )

        StockReservation.objects.create(
            checkout=self.checkout,
            variant_id=self.variant.id,
            quantity=2,
            expires_at=self.checkout.expires_at,
        )

    def test_paid_checkout_creates_order_and_consumes_stock(self):

        order = CheckoutService.finalise_checkout(
            self.checkout.id
        )

        self.assertIsNotNone(order)

        self.assertEqual(
            order.total_amount,
            200,
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            8,
        )

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.order_id,
            order.id,
        )

        self.checkout.refresh_from_db()

        self.assertEqual(
            self.checkout.status,
            CheckoutTransaction.STATUS_FINALISED,
        )

        self.assertFalse(
            StockReservation.objects.filter(
                checkout=self.checkout,
            ).exists()
        )

        self.assertFalse(
            CartItem.objects.filter(
                cart=self.cart,
            ).exists()
        )

        self.assertEqual(
            Order.objects.count(),
            1,
        )

        def test_finalising_same_checkout_twice_returns_same_order(self):

            first_order = CheckoutService.finalise_checkout(
                self.checkout.id
            )

            second_order = CheckoutService.finalise_checkout(
                self.checkout.id
            )

            self.assertEqual(
                first_order.id,
                second_order.id,
            )

            self.assertEqual(
                Order.objects.count(),
                1,
            )

            self.variant.refresh_from_db()

            self.assertEqual(
                self.variant.stock,
                8,
            )

        def test_payment_cannot_be_reused_after_order_linked(self):

            order = CheckoutService.finalise_checkout(
                self.checkout.id
            )

            self.payment.refresh_from_db()

            self.assertEqual(
                self.payment.order_id,
                order.id,
            )

            with self.assertRaises(ValueError):
                CheckoutService.finalise_checkout(
                    self.checkout.id
                )

            self.assertEqual(
                Order.objects.count(),
                1,
            )

class CheckoutFailureTests(TestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="failuretest",
            email="failure@example.com",
            password="testpassword123",
        )

        self.category = Category.objects.create(
            name="Coffee",
        )

        self.product = Product.objects.create(
            name="Test Coffee",
            category=self.category,
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            name="250g",
            price=10000,
            stock=10,
            is_available=True,
        )

        self.cart = Cart.objects.create(
            user=self.user,
        )

        CartItem.objects.create(
            cart=self.cart,
            variant=self.variant,
            quantity=2,
        )

        self.checkout = CheckoutService.create_checkout(
            user=self.user,
            session_id="failure-test-session",
            delivery_type=PICKUP,
        )

    def test_failed_checkout_releases_reservation(self):

        self.assertEqual(
            StockReservation.objects.filter(
                checkout=self.checkout,
            ).count(),
            1,
        )

        self.assertEqual(
            self.checkout.status,
            CheckoutTransaction.STATUS_PENDING,
        )

        CheckoutService.fail_checkout(
            self.checkout.id,
        )

        self.checkout.refresh_from_db()

        self.assertEqual(
            self.checkout.status,
            CheckoutTransaction.STATUS_FAILED,
        )

        self.assertEqual(
            StockReservation.objects.filter(
                checkout=self.checkout,
            ).count(),
            0,
        )

        self.variant.refresh_from_db()

        # Stock was reserved, not deducted.
        self.assertEqual(
            self.variant.stock,
            10,
        )

class PaystackInitialisationFailureTests(TestCase):

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="paystackfailure",
            email="paystackfailure@example.com",
            password="testpassword123",
        )

        self.category = Category.objects.create(
            name="Coffee",
        )

        self.product = Product.objects.create(
            name="Test Coffee",
            category=self.category,
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            name="250g",
            price=10000,
            stock=10,
            is_available=True,
        )

        self.cart = Cart.objects.create(
            user=self.user,
        )

        CartItem.objects.create(
            cart=self.cart,
            variant=self.variant,
            quantity=2,
        )

        self.checkout = CheckoutService.create_checkout(
            user=self.user,
            session_id="paystack-failure-session",
            delivery_type=PICKUP,
        )

        self.service = PaystackPaymentService()

    @patch("apps.payments.services.paystack.requests.post")
    def test_paystack_rejected_initialisation_fails_checkout(
        self,
        mock_post,
    ):
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "status": False,
            "message": "Unable to initialise transaction.",
        }

        with self.assertRaises(ValidationError):
            self.service.initialize_payment(
                self.checkout,
                self.user.email,
            )

        self.checkout.refresh_from_db()

        self.assertEqual(
            self.checkout.status,
            CheckoutTransaction.STATUS_FAILED,
        )

        self.assertEqual(
            StockReservation.objects.filter(
                checkout=self.checkout,
            ).count(),
            0,
        )

        payment = Payment.objects.get(
            checkout=self.checkout,
        )

        self.assertEqual(
            payment.status,
            Payment.STATUS_FAILED,
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            10,
        )

    @patch("apps.payments.services.paystack.requests.post")
    def test_paystack_connection_failure_fails_checkout(
        self,
        mock_post,
    ):
        mock_post.side_effect = RequestException(
            "Paystack unavailable"
        )

        with self.assertRaises(ValidationError):
            self.service.initialize_payment(
                self.checkout,
                self.user.email,
            )

        self.checkout.refresh_from_db()

        self.assertEqual(
            self.checkout.status,
            CheckoutTransaction.STATUS_FAILED,
        )

        self.assertEqual(
            StockReservation.objects.filter(
                checkout=self.checkout,
            ).count(),
            0,
        )

        payment = Payment.objects.get(
            checkout=self.checkout,
        )

        self.assertEqual(
            payment.status,
            Payment.STATUS_FAILED,
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            10,
        )

class PaymentIdempotencyTests(TestCase):

    def setUp(self):
        self.category = Category.objects.create(
            name="Coffee",
        )

        self.product = Product.objects.create(
            name="Test Coffee",
            category=self.category,
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            name="250g",
            price=100,
            stock=10,
            is_available=True,
        )

        self.checkout = CheckoutTransaction.objects.create(
            session_id="idempotency-session",
            status=CheckoutTransaction.STATUS_PAID,
            delivery_type=PICKUP,
            subtotal=100,
            delivery_fee=0,
            total_amount=100,
            expires_at="2030-01-01T00:00:00Z",
        )

        CheckoutTransactionItem.objects.create(
            checkout=self.checkout,
            variant_id=self.variant.id,
            product_name=self.product.name,
            variant_name=self.variant.name,
            unit_price=100,
            quantity=1,
            subtotal=100,
        )

        StockReservation.objects.create(
            checkout=self.checkout,
            variant_id=self.variant.id,
            quantity=1,
            expires_at=self.checkout.expires_at,
        )

        self.payment = Payment.objects.create(
            checkout=self.checkout,
            reference="IDEMPOTENCY-001",
            amount=100,
            status=Payment.STATUS_INITIATED,
            provider="paystack",
        )

        self.service = PaystackPaymentService()

    def test_mark_as_paid_is_idempotent(self):

        first_order = self.service.mark_as_paid(
            self.payment.reference
        )

        self.assertIsNotNone(first_order)

        self.payment.refresh_from_db()
        self.checkout.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.STATUS_SUCCESS,
        )

        self.assertEqual(
            self.checkout.status,
            CheckoutTransaction.STATUS_FINALISED,
        )

        second_order = self.service.mark_as_paid(
            self.payment.reference
        )

        self.assertEqual(
            first_order.id,
            second_order.id,
        )

        self.assertEqual(
            Order.objects.count(),
            1,
        )

        self.variant.refresh_from_db()

        self.assertEqual(
            self.variant.stock,
            9,
        )

    def test_failed_payment_cannot_overwrite_successful_payment(self):

        order = self.service.mark_as_paid(
            self.payment.reference
        )

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.STATUS_SUCCESS,
        )

        result = self.service.mark_as_failed(
            self.payment.reference
        )

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.STATUS_SUCCESS,
        )

        self.assertEqual(
            result.id,
            self.payment.id,
        )

        self.assertEqual(
            self.payment.order_id,
            order.id,
        )

        self.assertEqual(
            Order.objects.count(),
            1,
        )

class PaymentRefundTests(APITestCase):

    def setUp(self):
        User = get_user_model()

        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="testpassword",
            is_staff=True,
            is_superuser=True,
        )

        self.payment = Payment.objects.create(
            reference="TEST-REFUND-123",
            amount=10000,
            status=Payment.STATUS_SUCCESS,
            provider="paystack",
        )

        self.client.force_authenticate(
            user=self.admin,
        )

    @patch(
        "apps.payments.services.paystack.requests.post"
    )
    def test_admin_can_initiate_refund(
        self,
        mock_post,
    ):
        mock_post.return_value.status_code = 200
        mock_post.return_value.raise_for_status.return_value = None
        mock_post.return_value.json.return_value = {
            "status": True,
            "message": "Refund initiated",
            "data": {
                "refund_reference": "REFUND-123",
            },
        }

        response = self.client.post(
            f"/api/payments/admin/"
            f"{self.payment.id}/refund/",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.payment.refresh_from_db()

        self.assertEqual(
            self.payment.status,
            Payment.STATUS_REFUNDED,
        )

        self.assertEqual(
            self.payment.refunded_amount,
            10000,
        )

        self.assertEqual(
            self.payment.refund_reference,
            "REFUND-123",
        )

    def test_cannot_refund_failed_payment(self):

        self.payment.status = Payment.STATUS_FAILED
        self.payment.save()

        response = self.client.post(
            f"/api/payments/admin/"
            f"{self.payment.id}/refund/",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_cannot_refund_more_than_payment(self):

        response = self.client.post(
            f"/api/payments/admin/"
            f"{self.payment.id}/refund/",
            {
                "amount": 10001,
            },
        )

        self.assertEqual(
            response.status_code,
            400,
        )