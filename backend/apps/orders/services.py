from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q, Case, When, Value, IntegerField

from .models import (
    Order,
    OrderStatusHistory,
)

from .delivery import DeliveryService
from apps.cart.services import CartService
from apps.products.models import ProductVariant
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
            .annotate(
                order_priority=Case(
                    When(
                        status__in={
                            STATUS_PENDING,
                            STATUS_CONFIRMED,
                            STATUS_PREPARING,
                            STATUS_OUT_FOR_DELIVERY,
                            STATUS_READY_FOR_PICKUP,
                        },
                        then=Value(0),
                    ),
                    When(
                        status__in={
                            STATUS_DELIVERED,
                            STATUS_PICKED_UP,
                        },
                        then=Value(1),
                    ),
                    When(
                        status=STATUS_CANCELLED,
                        then=Value(2),
                    ),
                    default=Value(3),
                    output_field=IntegerField(),
                )
            )
            .order_by(
                "order_priority",
                "-created_at",
            )
        )

    @staticmethod
    def get_user_order(
        order_id,
        *,
        user,
    ):
        return (
            Order.objects
            .filter(
                id=order_id,
                user=user,
            )
            .select_related(
                "user",
                "address",
            )
            .prefetch_related(
                "items",
            )
            .first()
        )

    @staticmethod
    def list_admin_orders(
        status_filter=None,
        payment_status_filter=None,
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

        if payment_status_filter:
            orders = orders.filter(
                payment_status=payment_status_filter
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

        if new_status == STATUS_CANCELLED:
            raise ValueError(
                "Order cancellation must use the cancellation workflow."
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

        Customers can cancel unpaid orders immediately. Paid orders
        must be cancelled through the admin refund workflow.
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
                "Paid orders require a refund before they can be cancelled."
            )

        return OrderService._cancel_unpaid_order(
            order,
            updated_by=user,
        )

    @staticmethod
    def admin_cancel_order(
        order_id,
        *,
        updated_by,
    ):
        """
        Initiate cancellation of an order from the admin interface.

        Unpaid orders are cancelled immediately. Paid orders remain
        in their current fulfilment status until the full refund is
        confirmed as processed by Paystack.
        """

        from apps.payments.models import Payment, Refund
        from apps.payments.services.factory import PaymentServiceFactory

        # Keep the lock order consistent with refund-state synchronisation:
        # Payment first, then Order. This avoids a Payment/Order lock cycle.
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .filter(order_id=order_id)
                .order_by("-created_at")
                .first()
            )

            order = (
                Order.objects
                .select_for_update()
                .get(id=order_id)
            )

            if order.status == STATUS_CANCELLED:
                return order

            if order.status not in {
                STATUS_PENDING,
                STATUS_CONFIRMED,
            }:
                raise ValueError(
                    "This order can no longer be cancelled."
                )

            if order.payment_status != PAYMENT_PAID:
                return OrderService._cancel_unpaid_order(
                    order,
                    updated_by=updated_by,
                )

            if payment is None or payment.status not in {
                Payment.STATUS_SUCCESS,
                Payment.STATUS_REFUND_PENDING,
                Payment.STATUS_REFUND_FAILED,
            }:
                raise ValueError(
                    "No refundable payment was found for this order."
                )

            existing_refund = (
                Refund.objects
                .filter(
                    payment=payment,
                    is_cancellation_refund=True,
                    status__in=[
                        Refund.STATUS_PENDING,
                        Refund.STATUS_PROCESSING,
                        Refund.STATUS_NEEDS_ATTENTION,
                        Refund.STATUS_PROCESSED,
                    ],
                )
                .order_by("-created_at")
                .first()
            )

        # Do not hold database locks while making the Paystack request.
        if existing_refund is None:
            payment_service = PaymentServiceFactory.get_service()

            try:
                payment_service.refund(
                    payment=payment,
                    amount=payment.amount - payment.refunded_amount,
                    is_cancellation_refund=True,
                    initiated_by=updated_by,
                )
            except ValidationError:
                # Another admin request may have reserved the cancellation
                # refund after the check above. The payment lock inside
                # refund() prevents a second reservation; in that case,
                # treat the already-active cancellation as the same request.
                active_refund_exists = Refund.objects.filter(
                    payment=payment,
                    is_cancellation_refund=True,
                    status__in=[
                        Refund.STATUS_PENDING,
                        Refund.STATUS_PROCESSING,
                        Refund.STATUS_NEEDS_ATTENTION,
                        Refund.STATUS_PROCESSED,
                    ],
                ).exists()

                if not active_refund_exists:
                    raise

        # The order remains in its current status until refund-state
        # synchronisation confirms the full cancellation refund.
        order.refresh_from_db()
        return order

    @staticmethod
    def _cancel_unpaid_order(
        order,
        *,
        updated_by,
    ):
        """
        Cancel an unpaid order immediately.

        The caller must already hold the order lock.
        """

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
            updated_by=updated_by,
        )

        return order

    @staticmethod
    @transaction.atomic
    def reorder_order(
        order_id,
        *,
        user,
    ):
        """
        Add the items from a fulfilled order to the
        customer's current cart.

        Only Delivered and Picked Up orders can be reordered.
        Items whose original variant no longer exists or is
        unavailable are skipped and reported.
        """

        order = (
            Order.objects
            .prefetch_related("items")
            .select_for_update()
            .get(
                id=order_id,
                user=user,
            )
        )

        if order.status not in {
            STATUS_DELIVERED,
            STATUS_PICKED_UP,
        }:
            raise ValueError(
                "Only delivered or picked up orders can be reordered."
            )

        cart = CartService.get_or_create_cart(
            user=user,
        )

        added_items = []
        unavailable_items = []

        for order_item in order.items.all():

            variant = (
                ProductVariant.objects
                .select_related("product")
                .filter(
                    product__name=order_item.product_name,
                    name=order_item.variant_name,
                )
                .first()
            )

            if not variant:
                unavailable_items.append({
                    "product_name": order_item.product_name,
                    "variant_name": order_item.variant_name,
                    "reason": "This variant is no longer available.",
                })
                continue

            if variant.stock < order_item.quantity:
                unavailable_items.append({
                    "product_name": order_item.product_name,
                    "variant_name": order_item.variant_name,
                    "reason": (
                        f"Only {variant.stock} "
                        f"available."
                    ),
                })
                continue

            try:
                CartService.add_to_cart(
                    cart=cart,
                    variant_id=variant.id,
                    quantity=order_item.quantity,
                )

            except ValueError as error:
                unavailable_items.append({
                    "product_name": order_item.product_name,
                    "variant_name": order_item.variant_name,
                    "reason": str(error),
                })
                continue

            added_items.append({
                "product_name": variant.product.name,
                "variant_name": variant.name,
                "quantity": order_item.quantity,
            })

        return {
            "order": order,
            "added_items": added_items,
            "unavailable_items": unavailable_items,
        }