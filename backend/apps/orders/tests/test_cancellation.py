from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.common.constants import (
    PAYMENT_PAID,
    PAYMENT_PENDING,
    STATUS_CANCELLED,
    STATUS_CONFIRMED,
    STATUS_DELIVERED,
    STATUS_PENDING,
)

from apps.orders.models import Order, OrderStatusHistory
from apps.orders.services import OrderService


User = get_user_model()


class CustomerOrderCancellationTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="customer@example.com",
            password="testpassword123",
        )

        self.other_user = User.objects.create_user(
            email="other@example.com",
            password="testpassword123",
        )

    def create_order(
        self,
        *,
        user=None,
        status=STATUS_PENDING,
        payment_status=PAYMENT_PENDING,
    ):
        return Order.objects.create(
            user=user or self.user,
            subtotal=10000,
            delivery_fee=0,
            total_amount=10000,
            status=status,
            payment_status=payment_status,
            delivery_type="PICKUP",
        )

    def test_customer_can_cancel_pending_unpaid_order(self):
        order = self.create_order()

        cancelled = OrderService.cancel_order(
            order.id,
            user=self.user,
        )

        self.assertEqual(
            cancelled.status,
            STATUS_CANCELLED,
        )

        history = OrderStatusHistory.objects.get(
            order=order,
        )

        self.assertEqual(
            history.old_status,
            STATUS_PENDING,
        )

        self.assertEqual(
            history.new_status,
            STATUS_CANCELLED,
        )

        self.assertEqual(
            history.updated_by,
            self.user,
        )

    def test_customer_can_cancel_confirmed_unpaid_order(self):
        order = self.create_order(
            status=STATUS_CONFIRMED,
        )

        cancelled = OrderService.cancel_order(
            order.id,
            user=self.user,
        )

        self.assertEqual(
            cancelled.status,
            STATUS_CANCELLED,
        )

    def test_customer_cannot_cancel_someone_elses_order(self):
        order = self.create_order()

        with self.assertRaisesMessage(
            ValueError,
            "You do not have permission to cancel this order.",
        ):
            OrderService.cancel_order(
                order.id,
                user=self.other_user,
            )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            STATUS_PENDING,
        )

    def test_customer_cannot_cancel_delivered_order(self):
        order = self.create_order(
            status=STATUS_DELIVERED,
        )

        with self.assertRaisesMessage(
            ValueError,
            "This order can no longer be cancelled.",
        ):
            OrderService.cancel_order(
                order.id,
                user=self.user,
            )

    def test_customer_cannot_cancel_paid_order(self):
        order = self.create_order(
            payment_status=PAYMENT_PAID,
        )

        with self.assertRaisesMessage(
            ValueError,
            "Paid orders require a refund before they can be cancelled.",
        ):
            OrderService.cancel_order(
                order.id,
                user=self.user,
            )

        order.refresh_from_db()

        self.assertEqual(
            order.status,
            STATUS_PENDING,
        )