from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.cart.models import Cart
from apps.addresses.models import Address
from apps.common.constants import DELIVERY
from apps.orders.delivery import DeliveryService

from .models import (
    CheckoutTransaction,
    CheckoutTransactionItem,
)


class CheckoutService:

    CHECKOUT_DURATION_MINUTES = 30

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

        It only snapshots the cart and checkout information
        required to begin payment.
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
        # Snapshot cart totals
        # -------------------------------------------------

        subtotal = 0

        for item in items:

            variant = item.variant

            if not variant:
                raise ValueError(
                    "A cart item has no product variant."
                )

            if variant.stock < item.quantity:
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
                status=CheckoutTransaction.STATUS_PENDING,
                delivery_type=delivery_type,
                delivery_address=delivery_address,
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
                    timezone.now()
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

            variant = item.variant

            line_total = (
                variant.price * item.quantity
            )

            checkout_items.append(
                CheckoutTransactionItem(
                    checkout=checkout,
                    variant_id=variant.id,
                    product_name=variant.product.name,
                    variant_name=variant.name,
                    unit_price=variant.price,
                    quantity=item.quantity,
                    subtotal=line_total,
                )
            )

        CheckoutTransactionItem.objects.bulk_create(
            checkout_items
        )

        return checkout