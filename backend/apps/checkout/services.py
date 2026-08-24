from datetime import timedelta

from django.db import models, transaction
from django.db.models import Sum
from django.utils import timezone

from apps.cart.models import Cart
from apps.products.models import ProductVariant
from apps.addresses.models import Address

from apps.common.constants import (
    DELIVERY,
    STATUS_PENDING,
    STATUS_CONFIRMED,
    PAYMENT_PAID,
)

from apps.orders.delivery import DeliveryService

from apps.orders.models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)

from apps.payments.models import Payment

from .models import (
    CheckoutTransaction,
    CheckoutTransactionItem,
    StockReservation,
)


class CheckoutService:

    CHECKOUT_DURATION_MINUTES = 30

    @staticmethod
    def get_reserved_quantity(variant_id):
        """
        Return the quantity currently reserved for a product
        variant by active checkout transactions.

        Only reservations belonging to pending checkouts
        whose reservation has not expired are counted.
        """

        now = timezone.now()

        return (
            StockReservation.objects
            .filter(
                variant_id=variant_id,
                expires_at__gt=now,
                checkout__status=(
                    CheckoutTransaction.STATUS_PENDING
                ),
            )
            .aggregate(
                total=models.Sum("quantity")
            )["total"]
            or 0
        )

    @staticmethod
    def create_stock_reservations(checkout, items):
        """
        Create stock reservations for a checkout.

        ProductVariant rows must already be locked by the
        caller's transaction before this method is called.
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
            reservations
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

        It snapshots the cart and creates stock reservations
        which remain valid until the checkout expires.
        """

        # -------------------------------------------------
        # Get the current cart
        # -------------------------------------------------

        if user:

            cart = (
                Cart.objects
                .select_for_update()
                .prefetch_related(
                    "items__variant__product",
                )
                .filter(user=user)
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
                .prefetch_related(
                    "items__variant__product",
                )
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

        items = list(
            cart.items.all()
        )

        if not items:
            raise ValueError(
                "Cart is empty."
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
                    address = Address.objects.get(
                        id=address_id,
                        user=user,
                    )
                except Address.DoesNotExist:
                    raise ValueError(
                        "Invalid address."
                    )

                delivery_address = (
                    address.address_text
                )

                distance = (
                    DeliveryService.estimate_distance(
                        delivery_address
                    )
                )

                delivery_fee = (
                    DeliveryService.calculate_fee(
                        distance
                    )
                )

            else:

                delivery_address = (
                    guest_data.get("address", "")
                    if guest_data
                    else ""
                )

                if not delivery_address:
                    raise ValueError(
                        "Address is required."
                    )

                distance = (
                    DeliveryService.estimate_distance(
                        delivery_address
                    )
                )

                delivery_fee = (
                    DeliveryService.calculate_fee(
                        distance
                    )
                )

        # -------------------------------------------------
        # Lock product variants
        # -------------------------------------------------

        variant_ids = [
            item.variant_id
            for item in items
        ]

        unique_variant_ids = set(
            variant_ids
        )

        locked_variants = {
            variant.id: variant
            for variant in (
                ProductVariant.objects
                .select_for_update()
                .select_related("product")
                .filter(
                    id__in=unique_variant_ids
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
        # Calculate active reservations
        # -------------------------------------------------

        now = timezone.now()

        reservation_totals = (
            StockReservation.objects
            .filter(
                variant_id__in=unique_variant_ids,
                expires_at__gt=now,
            )
            .values(
                "variant_id",
            )
            .annotate(
                total_reserved=Sum("quantity")
            )
        )

        active_reservations = {
            row["variant_id"]: row["total_reserved"]
            for row in reservation_totals
        }

        # -------------------------------------------------
        # Calculate authoritative subtotal
        # -------------------------------------------------

        subtotal = 0

        for item in items:

            variant = locked_variants[item.variant_id]

            reserved_quantity = (
                CheckoutService.get_reserved_quantity(
                    variant.id
                )
            )

            available_quantity = (
                variant.stock - reserved_quantity
            )

            if available_quantity < item.quantity:
                raise ValueError(
                    f"Insufficient stock for "
                    f"{variant.product.name} "
                    f"({variant.name})."
                )

            subtotal += (
                variant.price * item.quantity
            )

        total_amount = (
            subtotal + delivery_fee
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
                    guest_data.get("full_name") or ""
                    if guest_data
                    else ""
                ),

                guest_email=(
                    guest_data.get("email") or ""
                    if guest_data
                    else ""
                ),

                guest_phone=(
                    guest_data.get("phone") or ""
                    if guest_data
                    else ""
                ),

                expires_at=(
                    now
                    + timedelta(
                        minutes=(
                            CheckoutService
                            .CHECKOUT_DURATION_MINUTES
                        )
                    )
                ),
            )
        )

        # -------------------------------------------------
        # Snapshot checkout items
        # -------------------------------------------------

        checkout_items = []

        for item in items:

            variant = locked_variants[
                item.variant_id
            ]

            line_total = (
                variant.price
                * item.quantity
            )

            checkout_items.append(
                CheckoutTransactionItem(
                    checkout=checkout,
                    variant_id=variant.id,
                    product_name=(
                        variant.product.name
                    ),
                    variant_name=variant.name,
                    unit_price=variant.price,
                    quantity=item.quantity,
                    subtotal=line_total,
                )
            )

        CheckoutTransactionItem.objects.bulk_create(
            checkout_items
        )

        # -------------------------------------------------
        # Create stock reservations
        # -------------------------------------------------

        CheckoutService.create_stock_reservations(
            checkout,
            items,
        )

        return checkout

    # -----------------------------------------------------
    # Finalise checkout
    # -----------------------------------------------------

    @staticmethod
    @transaction.atomic
    def finalise_checkout(checkout_id):

        """
        Convert a paid CheckoutTransaction into an Order.

        This is the only place where a checkout becomes
        an order.

        The operation is atomic and idempotent:

        - checkout is locked
        - payment is locked
        - product variants are locked
        - reserved stock is converted into sold stock
        - order items are created from checkout snapshots
        - payment is linked to the order
        - cart is cleared
        - checkout is marked FINALISED
        """

        checkout = (
            CheckoutTransaction.objects
            .select_for_update()
            .get(id=checkout_id)
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
                    status=Payment.STATUS_SUCCESS
                )
                .first()
            )

            return (
                payment.order
                if payment
                else None
            )

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
        # Get successful payment
        # -------------------------------------------------

        payment = (
            checkout.payments
            .select_for_update()
            .filter(
                status=Payment.STATUS_SUCCESS
            )
            .order_by("-created_at")
            .first()
        )

        if not payment:
            raise ValueError(
                "No successful payment exists "
                "for this checkout."
            )

        # -------------------------------------------------
        # Lock product variants
        # -------------------------------------------------

        variant_ids = list(
            checkout.items.values_list(
                "variant_id",
                flat=True,
            )
        )

        unique_variant_ids = set(
            variant_ids
        )

        variants = {
            variant.id: variant
            for variant in (
                ProductVariant.objects
                .select_for_update()
                .select_related("product")
                .filter(
                    id__in=unique_variant_ids
                )
            )
        }

        if (
            len(variants)
            != len(unique_variant_ids)
        ):
            raise ValueError(
                "One or more products in this checkout "
                "are no longer available."
            )

        # -------------------------------------------------
        # Verify stock before consuming reservation
        # -------------------------------------------------

        for item in checkout.items.all():

            variant = variants[
                item.variant_id
            ]

            if variant.stock < item.quantity:
                raise ValueError(
                    f"Insufficient stock for "
                    f"{item.product_name} "
                    f"({item.variant_name})."
                )

        # -------------------------------------------------
        # Convert reserved stock to sold stock
        # -------------------------------------------------

        for item in checkout.items.all():

            variant = variants[
                item.variant_id
            ]

            variant.stock -= item.quantity

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

        order_items = []

        for item in checkout.items.all():

            order_items.append(
                OrderItem(
                    order=order,
                    product_name=(
                        item.product_name
                    ),
                    variant_name=(
                        item.variant_name
                    ),
                    unit_price=(
                        item.unit_price
                    ),
                    quantity=item.quantity,
                    subtotal=item.subtotal,
                )
            )

        OrderItem.objects.bulk_create(
            order_items
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
            ]
        )

        # -------------------------------------------------
        # Mark reservations as consumed
        # -------------------------------------------------

        StockReservation.objects.filter(
            checkout=checkout,
        ).delete()

        # -------------------------------------------------
        # Clear cart
        # -------------------------------------------------

        if checkout.user_id:

            cart = (
                Cart.objects
                .filter(
                    user_id=checkout.user_id
                )
                .first()
            )

        else:

            cart = (
                Cart.objects
                .filter(
                    session_id=checkout.session_id,
                    user__isnull=True,
                )
                .first()
            )

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