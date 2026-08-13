from django.db import transaction
from django.db.models import Q

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)

from .delivery import DeliveryService

from apps.cart.models import Cart
from apps.addresses.models import Address

from apps.common.constants import (
    DELIVERY,
    PICKUP,
    STATUS_PENDING,
    STATUS_CONFIRMED,
    STATUS_PREPARING,
    STATUS_OUT_FOR_DELIVERY,
    STATUS_READY_FOR_PICKUP,
    STATUS_DELIVERED,
    STATUS_PICKED_UP,
    PAYMENT_PENDING,
    PAYMENT_PAID,
    ORDER_STATUS_TRANSITIONS,
)


class OrderService:

    @staticmethod
    def calculate_delivery_fee(
        *,
        user=None,
        delivery_type,
        address_id=None,
        guest_address="",
    ):
        """
        Calculate the delivery fee without creating an order.
        """

        if delivery_type != DELIVERY:
            return 0

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

            distance = DeliveryService.estimate_distance(
                address.address_text
            )

        else:

            if not guest_address:
                raise ValueError(
                    "Address is required."
                )

            distance = DeliveryService.estimate_distance(
                guest_address
            )

        return DeliveryService.calculate_fee(
            distance
        )

    @staticmethod
    @transaction.atomic
    def create_order_from_cart(
        *,
        user=None,
        session_id=None,
        delivery_type,
        address_id=None,
        guest_data=None,
    ):
        """
        Create an unpaid order from the current cart.

        The order is created with PAYMENT_PENDING.
        Payment must be confirmed separately before
        the order can enter fulfilment.
        """

        # -------------------------------------------------
        # Get and lock the cart
        # -------------------------------------------------

        if user:

            cart = (
                Cart.objects
                .select_for_update()
                .get(user=user)
            )

        else:

            if not session_id:
                raise ValueError(
                    "Checkout session is required."
                )

            cart = (
                Cart.objects
                .select_for_update()
                .get(session_id=session_id)
            )

        # -------------------------------------------------
        # Get and lock cart items
        # -------------------------------------------------

        items = (
            cart.items
            .select_related(
                "variant",
                "variant__product",
            )
            .select_for_update()
        )

        if not items.exists():
            raise ValueError(
                "Cart is empty."
            )

        # -------------------------------------------------
        # Delivery information
        # -------------------------------------------------

        address = None
        guest_address = ""
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

                delivery_fee = (
                    OrderService.calculate_delivery_fee(
                        user=user,
                        delivery_type=delivery_type,
                        address_id=address_id,
                    )
                )

            else:

                guest_address = (
                    guest_data.get("address", "")
                    if guest_data
                    else ""
                )

                delivery_fee = (
                    OrderService.calculate_delivery_fee(
                        delivery_type=delivery_type,
                        guest_address=guest_address,
                    )
                )

        # -------------------------------------------------
        # Create order
        # -------------------------------------------------

        order = Order.objects.create(
            user=user,

            checkout_session_id=session_id,

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

            guest_address=guest_address,

            subtotal=0,
            delivery_fee=delivery_fee,
            total_amount=0,

            status=STATUS_PENDING,
            payment_status=PAYMENT_PENDING,

            delivery_type=delivery_type,
            address=address,
        )

        # -------------------------------------------------
        # Create order items
        # -------------------------------------------------

        subtotal = 0

        for item in items:

            variant = item.variant

            if variant.stock < item.quantity:
                raise ValueError(
                    f"Insufficient stock for "
                    f"{variant.product.name} "
                    f"({variant.name})."
                )

            line_total = (
                variant.price * item.quantity
            )

            subtotal += line_total

            OrderItem.objects.create(
                order=order,
                product_name=variant.product.name,
                variant_name=variant.name,
                unit_price=variant.price,
                quantity=item.quantity,
                subtotal=line_total,
            )

            # Temporary current behaviour:
            # stock is reserved/deducted when the order
            # is created. We will address failed/
            # abandoned payment stock handling next.
            variant.stock -= item.quantity
            variant.save(
                update_fields=["stock"]
            )

        # -------------------------------------------------
        # Finalise totals
        # -------------------------------------------------

        order.subtotal = subtotal
        order.total_amount = (
            subtotal + delivery_fee
        )

        order.save(
            update_fields=[
                "subtotal",
                "total_amount",
                "updated_at",
            ]
        )

        # -------------------------------------------------
        # Clear cart
        # -------------------------------------------------

        cart.items.all().delete()

        return order

    @staticmethod
    def list_user_orders(user):

        return (
            Order.objects
            .filter(user=user)
            .select_related(
                "user",
                "address",
            )
            .prefetch_related(
                "items",
            )
            .order_by("-created_at")
        )

    @staticmethod
    def list_admin_orders(
        status_filter=None,
        delivery_filter=None,
        search=None,
    ):

        orders = (
            Order.objects
            .select_related(
                "user",
                "address",
            )
            .prefetch_related(
                "items",
            )
        )

        if status_filter:
            orders = orders.filter(
                status=status_filter
            )

        if delivery_filter:
            orders = orders.filter(
                delivery_type=delivery_filter
            )

        if search:

            search_query = (
                Q(user__email__icontains=search)
                | Q(user__full_name__icontains=search)
                | Q(user__phone__icontains=search)
                | Q(guest_email__icontains=search)
                | Q(guest_full_name__icontains=search)
                | Q(guest_phone__icontains=search)
            )

            if search.isdigit():
                search_query |= Q(
                    id=int(search)
                )

            orders = orders.filter(
                search_query
            )

        return orders.order_by(
            "-created_at"
        )

    @staticmethod
    @transaction.atomic
    def update_order_status(
        order_id,
        new_status,
        updated_by,
    ):

        order = (
            Order.objects
            .select_for_update()
            .get(id=order_id)
        )

        allowed_transitions = (
            ORDER_STATUS_TRANSITIONS.get(
                order.status,
                [],
            )
        )

        if new_status not in allowed_transitions:
            raise ValueError(
                f"Cannot move Order#{order.id} "
                f"from {order.status} "
                f"to {new_status}"
            )

        # -------------------------------------------------
        # Payment protection
        # -------------------------------------------------

        if (
            new_status
            in {
                STATUS_CONFIRMED,
                STATUS_PREPARING,
                STATUS_OUT_FOR_DELIVERY,
                STATUS_READY_FOR_PICKUP,
                STATUS_DELIVERED,
                STATUS_PICKED_UP,
            }
            and order.payment_status != PAYMENT_PAID
        ):
            raise ValueError(
                "Order must be paid before it can enter "
                "fulfilment."
            )

        # -------------------------------------------------
        # Delivery / pickup protection
        # -------------------------------------------------

        if (
            new_status == STATUS_OUT_FOR_DELIVERY
            and order.delivery_type != DELIVERY
        ):
            raise ValueError(
                "Only delivery orders can be marked "
                "Out for Delivery."
            )

        if (
            new_status == STATUS_DELIVERED
            and order.delivery_type != DELIVERY
        ):
            raise ValueError(
                "Only delivery orders can be marked "
                "Delivered."
            )

        if (
            new_status == STATUS_READY_FOR_PICKUP
            and order.delivery_type != PICKUP
        ):
            raise ValueError(
                "Only pickup orders can be marked "
                "Ready for Pickup."
            )

        if (
            new_status == STATUS_PICKED_UP
            and order.delivery_type != PICKUP
        ):
            raise ValueError(
                "Only pickup orders can be marked "
                "Picked Up."
            )

        # -------------------------------------------------
        # Record history
        # -------------------------------------------------

        OrderStatusHistory.objects.create(
            order=order,
            old_status=order.status,
            new_status=new_status,
            updated_by=updated_by,
        )

        order.status = new_status

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return order

    @staticmethod
    @transaction.atomic
    def claim_guest_orders(user):

        if not user.email:
            return 0

        if not user.email_verified:
            raise ValueError(
                "Email verification is required to claim guest orders."
            )

        orders = Order.objects.filter(
            user__isnull=True,
            guest_email__iexact=user.email,
        )

        claimed_count = orders.update(
            user=user
        )

        return claimed_count