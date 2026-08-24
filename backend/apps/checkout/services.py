from datetime import timedelta

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from apps.addresses.models import Address
from apps.cart.models import Cart
from apps.common.constants import (
    DELIVERY,
    PICKUP,
    PAYMENT_PAID,
    STATUS_CONFIRMED,
    STATUS_PENDING,
)
from apps.orders.delivery import DeliveryService
from apps.orders.models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)
from apps.payments.models import Payment
from apps.products.models import ProductVariant

from .models import (
    CheckoutTransaction,
    CheckoutTransactionItem,
    StockReservation,
)


class CheckoutService:

    CHECKOUT_DURATION_MINUTES = 30

    # -----------------------------------------------------
    # Stock reservation helpers
    # -----------------------------------------------------

    @staticmethod
    def get_reserved_quantity(
        variant_id,
        *,
        exclude_checkout_id=None,
    ):
        """
        Return the quantity currently reserved for a variant
        by active pending checkouts.

        Expired reservations and reservations belonging to an
        excluded checkout are ignored.
        """

        now = timezone.now()

        reservations = StockReservation.objects.filter(
            variant_id=variant_id,
            expires_at__gt=now,
            checkout__status=(
                CheckoutTransaction.STATUS_PENDING
            ),
        )

        if exclude_checkout_id is not None:
            reservations = reservations.exclude(
                checkout_id=exclude_checkout_id,
            )

        return (
            reservations.aggregate(
                total=Sum("quantity"),
            )["total"]
            or 0
        )

    @staticmethod
    def create_stock_reservations(
        checkout,
        items,
    ):
        """
        Create stock reservations for a checkout.

        ProductVariant rows must already be locked by the
        caller's transaction.

        `items` must contain at most one entry per variant.
        """

        reservations = [
            StockReservation(
                checkout=checkout,
                variant_id=item.variant_id,
                quantity=item.quantity,
                expires_at=checkout.expires_at,
            )
            for item in items
        ]

        StockReservation.objects.bulk_create(
            reservations,
        )

        return reservations

    # -----------------------------------------------------
    # Create checkout
    # -----------------------------------------------------

    @staticmethod
    @transaction.atomic
    def create_checkout(
        *,
        user=None,
        session_id=None,
        delivery_type,
        address_id=None,
        guest_data=None,
    ):
        """
        Create a pending checkout transaction from the
        current cart.

        This does NOT:
        - create an Order
        - create a Payment
        - clear the cart
        - permanently deduct stock

        It snapshots the cart and creates temporary stock
        reservations which remain valid until the checkout
        expires.

        The cart is locked first, followed by ProductVariant
        rows, establishing a consistent lock order with
        checkout finalisation.
        """

        # -------------------------------------------------
        # Validate checkout type
        # -------------------------------------------------

        if delivery_type not in {
            DELIVERY,
            PICKUP,
        }:
            raise ValueError(
                "Invalid delivery type."
            )

        # -------------------------------------------------
        # Normalise guest data
        # -------------------------------------------------

        guest_data = guest_data or {}

        # -------------------------------------------------
        # Get and lock current cart
        # -------------------------------------------------

        if user:

            cart = (
                Cart.objects
                .select_for_update()
                .filter(
                    user=user,
                )
                .first()
            )

        else:

            if not session_id:
                raise ValueError(
                    "Checkout session is required."
                )

            cart = (
                Cart.objects
                .select_for_update()
                .filter(
                    session_id=session_id,
                    user__isnull=True,
                )
                .first()
            )

        if not cart:
            raise ValueError(
                "Cart not found."
            )

        # -------------------------------------------------
        # Read cart items while cart is locked
        # -------------------------------------------------

        cart_items = list(
            cart.items.select_related(
                "variant",
            )
        )

        if not cart_items:
            raise ValueError(
                "Cart is empty."
            )

        # -------------------------------------------------
        # Aggregate duplicate variants
        # -------------------------------------------------

        quantities = {}

        for cart_item in cart_items:

            if cart_item.variant_id is None:
                raise ValueError(
                    "One or more cart items "
                    "are no longer available."
                )

            quantities[cart_item.variant_id] = (
                quantities.get(
                    cart_item.variant_id,
                    0,
                )
                + cart_item.quantity
            )

        unique_variant_ids = set(
            quantities.keys()
        )

        # -------------------------------------------------
        # Lock product variants
        # -------------------------------------------------

        locked_variants = {
            variant.id: variant
            for variant in (
                ProductVariant.objects
                .select_for_update()
                .select_related("product")
                .filter(
                    id__in=unique_variant_ids,
                )
            )
        }

        if (
            len(locked_variants)
            != len(unique_variant_ids)
        ):
            raise ValueError(
                "One or more products in the cart "
                "are no longer available."
            )

        # -------------------------------------------------
        # Validate product availability
        # -------------------------------------------------

        for variant in locked_variants.values():

            if not variant.is_available:
                raise ValueError(
                    f"{variant.product.name} "
                    f"({variant.name}) is no longer available."
                )

        # -------------------------------------------------
        # Delivery information
        # -------------------------------------------------

        delivery_address = ""
        delivery_fee = 0
        address = None

        if delivery_type == DELIVERY:

            if user:

                if not address_id:
                    raise ValueError(
                        "Address is required."
                    )

                try:
                    address = (
                        Address.objects
                        .get(
                            id=address_id,
                            user=user,
                        )
                    )
                except Address.DoesNotExist:
                    raise ValueError(
                        "Invalid address."
                    )

                delivery_address = (
                    address.address_text
                )

            else:

                delivery_address = (
                    guest_data.get(
                        "address",
                        "",
                    )
                    or ""
                )

                if not delivery_address:
                    raise ValueError(
                        "Address is required."
                    )

            distance = (
                DeliveryService.estimate_distance(
                    delivery_address,
                )
            )

            delivery_fee = (
                DeliveryService.calculate_fee(
                    distance,
                )
            )

        # -------------------------------------------------
        # Calculate active reservations
        # -------------------------------------------------

        now = timezone.now()

        reservation_totals = (
            StockReservation.objects
            .filter(
                variant_id__in=unique_variant_ids,
                expires_at__gt=now,
                checkout__status=(
                    CheckoutTransaction.STATUS_PENDING
                ),
            )
            .values(
                "variant_id",
            )
            .annotate(
                total_reserved=Sum(
                    "quantity",
                ),
            )
        )

        active_reservations = {
            row["variant_id"]: row["total_reserved"]
            for row in reservation_totals
        }

        # -------------------------------------------------
        # Calculate authoritative checkout totals
        # -------------------------------------------------

        subtotal = 0

        checkout_item_data = []

        for variant_id, quantity in quantities.items():

            variant = locked_variants[
                variant_id
            ]

            reserved_quantity = (
                active_reservations.get(
                    variant.id,
                    0,
                )
            )

            available_quantity = (
                variant.stock
                - reserved_quantity
            )

            if available_quantity < quantity:
                raise ValueError(
                    f"Insufficient stock for "
                    f"{variant.product.name} "
                    f"({variant.name})."
                )

            line_total = (
                variant.price
                * quantity
            )

            subtotal += line_total

            checkout_item_data.append(
                {
                    "variant_id": variant.id,
                    "product_name": (
                        variant.product.name
                    ),
                    "variant_name": variant.name,
                    "unit_price": variant.price,
                    "quantity": quantity,
                    "subtotal": line_total,
                }
            )

        total_amount = (
            subtotal
            + delivery_fee
        )

        # -------------------------------------------------
        # Create checkout transaction
        # -------------------------------------------------

        checkout = (
            CheckoutTransaction.objects.create(
                user=user,
                session_id=session_id,

                status=(
                    CheckoutTransaction
                    .STATUS_PENDING
                ),

                delivery_type=delivery_type,
                delivery_address=delivery_address,

                address_id=(
                    address.id
                    if address
                    else None
                ),

                subtotal=subtotal,
                delivery_fee=delivery_fee,
                total_amount=total_amount,

                guest_full_name=(
                    guest_data.get(
                        "full_name",
                        "",
                    )
                    or ""
                ),

                guest_email=(
                    guest_data.get(
                        "email",
                        "",
                    )
                    or ""
                ),

                guest_phone=(
                    guest_data.get(
                        "phone",
                        "",
                    )
                    or ""
                ),

                expires_at=(
                    now
                    + timedelta(
                        minutes=(
                            CheckoutService
                            .CHECKOUT_DURATION_MINUTES
                        ),
                    )
                ),
            )
        )

        # -------------------------------------------------
        # Snapshot checkout items
        # -------------------------------------------------

        checkout_items = [
            CheckoutTransactionItem(
                checkout=checkout,
                **item_data,
            )
            for item_data in checkout_item_data
        ]

        CheckoutTransactionItem.objects.bulk_create(
            checkout_items,
        )

        # -------------------------------------------------
        # Create stock reservations
        # -------------------------------------------------

        CheckoutService.create_stock_reservations(
            checkout,
            checkout_items,
        )

        return checkout

    # -----------------------------------------------------
    # Finalise checkout
    # -----------------------------------------------------

    @staticmethod
    @transaction.atomic
    def finalise_checkout(
        checkout_id,
    ):
        """
        Convert a paid CheckoutTransaction into an Order.

        This is the only place where a checkout becomes
        an order.

        The operation is atomic and idempotent:

        - checkout is locked
        - cart is locked where applicable
        - payment is locked
        - product variants are locked
        - reservations are locked
        - reserved stock is converted into sold stock
        - order items are created from checkout snapshots
        - payment is linked to the order
        - cart is cleared
        - checkout is marked FINALISED

        Reservations are released by deletion only after
        successful stock conversion and order creation.
        """

        # -------------------------------------------------
        # Lock checkout
        # -------------------------------------------------

        checkout = (
            CheckoutTransaction.objects
            .select_for_update()
            .get(
                id=checkout_id,
            )
        )

        # -------------------------------------------------
        # Idempotency
        # -------------------------------------------------

        if (
            checkout.status
            == CheckoutTransaction.STATUS_FINALISED
        ):

            payment = (
                checkout.payments
                .select_related("order")
                .filter(
                    status=Payment.STATUS_SUCCESS,
                    order__isnull=False,
                )
                .order_by(
                    "-created_at",
                )
                .first()
            )

            if not payment:
                raise ValueError(
                    "Finalised checkout has no "
                    "successful linked payment."
                )

            return payment.order

        # -------------------------------------------------
        # Payment protection
        # -------------------------------------------------

        if (
            checkout.status
            != CheckoutTransaction.STATUS_PAID
        ):
            raise ValueError(
                "Checkout must be paid before "
                "it can be finalised."
            )

        # -------------------------------------------------
        # Expiry protection
        # -------------------------------------------------

        if checkout.expires_at <= timezone.now():
            raise ValueError(
                "Checkout has expired."
            )

        # -------------------------------------------------
        # Get successful payment
        # -------------------------------------------------

        payment = (
            checkout.payments
            .select_for_update()
            .filter(
                status=Payment.STATUS_SUCCESS,
            )
            .order_by(
                "-created_at",
            )
            .first()
        )

        if not payment:
            raise ValueError(
                "No successful payment exists "
                "for this checkout."
            )

        # -------------------------------------------------
        # Validate payment amount
        # -------------------------------------------------

        if payment.amount != checkout.total_amount:
            raise ValueError(
                "Payment amount does not match "
                "checkout total."
            )

        # -------------------------------------------------
        # Payment must not already belong to another order
        # -------------------------------------------------

        if payment.order_id is not None:
            raise ValueError(
                "Payment is already linked "
                "to an order."
            )

        # -------------------------------------------------
        # Lock cart before variants
        # -------------------------------------------------

        if checkout.user_id:

            cart = (
                Cart.objects
                .select_for_update()
                .filter(
                    user_id=checkout.user_id,
                )
                .first()
            )

        else:

            cart = (
                Cart.objects
                .select_for_update()
                .filter(
                    session_id=checkout.session_id,
                    user__isnull=True,
                )
                .first()
            )

        # -------------------------------------------------
        # Lock product variants
        # -------------------------------------------------

        variant_ids = set(
            checkout.items.values_list(
                "variant_id",
                flat=True,
            )
        )

        variants = {
            variant.id: variant
            for variant in (
                ProductVariant.objects
                .select_for_update()
                .select_related("product")
                .filter(
                    id__in=variant_ids,
                )
            )
        }

        if (
            set(variants.keys())
            != variant_ids
        ):
            raise ValueError(
                "One or more products in this "
                "checkout are no longer available."
            )

        # -------------------------------------------------
        # Validate product availability
        # -------------------------------------------------

        for variant in variants.values():

            if not variant.is_available:
                raise ValueError(
                    f"{variant.product.name} "
                    f"({variant.name}) is no longer available."
                )

        # -------------------------------------------------
        # Lock and validate reservations
        # -------------------------------------------------

        reservations = {
            reservation.variant_id: reservation
            for reservation in (
                StockReservation.objects
                .select_for_update()
                .filter(
                    checkout=checkout,
                )
            )
        }

        if (
            set(reservations.keys())
            != variant_ids
        ):
            raise ValueError(
                "Stock reservation is missing "
                "for one or more checkout items."
            )

        now = timezone.now()

        for item in checkout.items.all():

            reservation = reservations.get(
                item.variant_id,
            )

            if not reservation:
                raise ValueError(
                    f"Stock reservation is missing "
                    f"for {item.product_name} "
                    f"({item.variant_name})."
                )

            if (
                reservation.quantity
                != item.quantity
            ):
                raise ValueError(
                    f"Stock reservation mismatch "
                    f"for {item.product_name} "
                    f"({item.variant_name})."
                )

            if reservation.expires_at <= now:
                raise ValueError(
                    f"Stock reservation has expired "
                    f"for {item.product_name} "
                    f"({item.variant_name})."
                )

            variant = variants[
                item.variant_id
            ]

            if (
                variant.stock
                < reservation.quantity
            ):
                raise ValueError(
                    f"Insufficient stock for "
                    f"{item.product_name} "
                    f"({item.variant_name})."
                )

        # -------------------------------------------------
        # Convert reserved stock into sold stock
        # -------------------------------------------------

        for reservation in reservations.values():

            variant = variants[
                reservation.variant_id
            ]

            variant.stock -= (
                reservation.quantity
            )

            variant.save(
                update_fields=[
                    "stock",
                ]
            )

        # -------------------------------------------------
        # Create order
        # -------------------------------------------------

        order = Order.objects.create(
            user=checkout.user,

            checkout_session_id=(
                checkout.session_id
            ),

            guest_full_name=(
                checkout.guest_full_name
            ),

            guest_email=(
                checkout.guest_email
            ),

            guest_phone=(
                checkout.guest_phone
            ),

            guest_address=(
                checkout.delivery_address
            ),

            subtotal=checkout.subtotal,
            delivery_fee=checkout.delivery_fee,
            total_amount=checkout.total_amount,

            status=STATUS_CONFIRMED,
            payment_status=PAYMENT_PAID,

            payment_reference=(
                payment.reference
            ),

            paid_at=timezone.now(),

            delivery_type=(
                checkout.delivery_type
            ),

            address_id=(
                checkout.address_id
            ),
        )

        # -------------------------------------------------
        # Create immutable order item snapshots
        # -------------------------------------------------

        order_items = [
            OrderItem(
                order=order,
                product_name=item.product_name,
                variant_name=item.variant_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
                subtotal=item.subtotal,
            )
            for item in checkout.items.all()
        ]

        OrderItem.objects.bulk_create(
            order_items,
        )

        # -------------------------------------------------
        # Record initial fulfilment state
        # -------------------------------------------------

        OrderStatusHistory.objects.create(
            order=order,
            old_status=STATUS_PENDING,
            new_status=STATUS_CONFIRMED,
            updated_by=None,
        )

        # -------------------------------------------------
        # Link payment to order
        # -------------------------------------------------

        payment.order = order

        payment.save(
            update_fields=[
                "order",
                "updated_at",
            ]
        )

        # -------------------------------------------------
        # Consume stock reservations
        # -------------------------------------------------

        StockReservation.objects.filter(
            checkout=checkout,
        ).delete()

        # -------------------------------------------------
        # Clear cart
        # -------------------------------------------------

        if cart:
            cart.items.all().delete()

        # -------------------------------------------------
        # Finalise checkout
        # -------------------------------------------------

        checkout.status = (
            CheckoutTransaction
            .STATUS_FINALISED
        )

        checkout.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return order

    # -----------------------------------------------------
    # Fail checkout
    # -----------------------------------------------------

    @staticmethod
    @transaction.atomic
    def fail_checkout(
        checkout_id,
    ):
        """
        Mark a pending checkout as failed and immediately
        release its stock reservations.

        No stock is deducted because reservations never reduce
        ProductVariant.stock.
        """

        checkout = (
            CheckoutTransaction.objects
            .select_for_update()
            .get(
                id=checkout_id,
            )
        )

        # Idempotency
        if (
            checkout.status
            == CheckoutTransaction.STATUS_FAILED
        ):
            return checkout

        # A checkout that has already progressed cannot
        # subsequently be marked as failed.
        if (
            checkout.status
            != CheckoutTransaction.STATUS_PENDING
        ):
            raise ValueError(
                "Only a pending checkout can be failed."
            )

        checkout.status = (
            CheckoutTransaction.STATUS_FAILED
        )

        checkout.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        # Immediately release reserved stock.
        StockReservation.objects.filter(
            checkout=checkout,
        ).delete()

        # Mark any outstanding payment attempts as failed.
        Payment.objects.filter(
            checkout=checkout,
            status=Payment.STATUS_INITIATED,
        ).update(
            status=Payment.STATUS_FAILED,
        )

        return checkout

    # -----------------------------------------------------
    # Expire checkout
    # -----------------------------------------------------

    @staticmethod
    @transaction.atomic
    def expire_checkout(
        checkout_id,
    ):
        """
        Expire a pending checkout and release its stock
        reservations.

        No physical stock deduction is required because
        reservations do not reduce ProductVariant.stock.
        """

        checkout = (
            CheckoutTransaction.objects
            .select_for_update()
            .get(
                id=checkout_id,
            )
        )

        if (
            checkout.status
            != CheckoutTransaction.STATUS_PENDING
        ):
            return checkout

        if checkout.expires_at > timezone.now():
            return checkout

        checkout.status = (
            CheckoutTransaction
            .STATUS_EXPIRED
        )

        checkout.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        StockReservation.objects.filter(
            checkout=checkout,
        ).delete()

        Payment.objects.filter(
            checkout=checkout,
            status=Payment.STATUS_INITIATED,
        ).update(
            status=Payment.STATUS_FAILED,
        )

        return checkout

    # -----------------------------------------------------
    # Expire pending checkouts
    # -----------------------------------------------------

    @staticmethod
    def expire_pending_checkouts():
        """
        Expire all pending checkouts whose expiry time
        has passed.

        Each checkout is processed independently so that
        one failure does not roll back successfully expired
        checkouts.

        Returns the number of expired checkouts.
        """

        now = timezone.now()

        checkout_ids = list(
            CheckoutTransaction.objects
            .filter(
                status=(
                    CheckoutTransaction
                    .STATUS_PENDING
                ),
                expires_at__lte=now,
            )
            .values_list(
                "id",
                flat=True,
            )
        )

        expired_count = 0

        for checkout_id in checkout_ids:

            checkout = (
                CheckoutService
                .expire_checkout(
                    checkout_id,
                )
            )

            if (
                checkout.status
                == CheckoutTransaction
                .STATUS_EXPIRED
            ):
                expired_count += 1

        return expired_count