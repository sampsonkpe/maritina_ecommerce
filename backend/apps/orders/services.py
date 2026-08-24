from django.db import transaction
from django.db.models import Q

from .models import (
    Order,
    OrderStatusHistory,
)

from .delivery import DeliveryService

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
    STATUS_CANCELLED,
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

    @staticmethod
    @transaction.atomic
    def cancel_order(
        order_id,
        *,
        user,
    ):
        """
        Cancel an order belonging to the authenticated customer.

        Customer cancellation is only permitted while the order
        has not entered fulfilment.

        Paid orders cannot be cancelled through this method
        until the refund workflow is available.
        """

        order = (
            Order.objects
            .select_for_update()
            .get(id=order_id)
        )

        if order.user_id != user.id:
            raise ValueError(
                "You do not have permission to cancel this order."
            )

        if order.status not in {
            STATUS_PENDING,
            STATUS_CONFIRMED,
        }:
            raise ValueError(
                "This order can no longer be cancelled."
            )

        if order.payment_status == PAYMENT_PAID:
            raise ValueError(
                "Paid orders require a refund before they "
                "can be cancelled."
            )

        old_status = order.status

        order.status = STATUS_CANCELLED

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status=STATUS_CANCELLED,
            updated_by=user,
        )

        return order