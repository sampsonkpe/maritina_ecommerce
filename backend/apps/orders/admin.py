from django.contrib import admin

from .models import (
    Order,
    OrderItem,
    OrderStatusHistory,
)

from .services import OrderService

from apps.common.constants import (
    STATUS_PREPARING,
    STATUS_OUT_FOR_DELIVERY,
    STATUS_READY_FOR_PICKUP,
    STATUS_DELIVERED,
    STATUS_PICKED_UP,
)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "status",
        "payment_status",
        "delivery_type",
        "total_amount",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "delivery_type",
        "created_at",
    )

    search_fields = (
        "=id",
        "user__email",
        "guest_email",
        "guest_full_name",
        "guest_phone",
    )

    readonly_fields = (
        "status",
        "payment_status",
        "payment_reference",
        "paid_at",
        "created_at",
        "updated_at",
    )

    actions = [
        "mark_as_preparing",
        "mark_as_out_for_delivery",
        "mark_as_ready_for_pickup",
        "mark_as_delivered",
        "mark_as_picked_up",
    ]

    def get_readonly_fields(self, request, obj=None):
        return (
            "status",
            "payment_status",
            "payment_reference",
            "paid_at",
            "created_at",
            "updated_at",
        )

    def _update_status(
        self,
        request,
        queryset,
        new_status,
    ):
        success_count = 0

        for order in queryset:
            try:
                OrderService.update_order_status(
                    order_id=order.id,
                    new_status=new_status,
                    updated_by=request.user,
                )

                success_count += 1

            except ValueError as error:
                self.message_user(
                    request,
                    f"Order #{order.id}: {error}",
                    level="ERROR",
                )

        if success_count:
            self.message_user(
                request,
                f"{success_count} order(s) updated successfully.",
            )

    @admin.action(
        description="Mark selected orders as Preparing"
    )
    def mark_as_preparing(self, request, queryset):
        self._update_status(
            request,
            queryset,
            STATUS_PREPARING,
        )

    @admin.action(
        description="Mark selected delivery orders as Out for Delivery"
    )
    def mark_as_out_for_delivery(self, request, queryset):
        self._update_status(
            request,
            queryset,
            STATUS_OUT_FOR_DELIVERY,
        )

    @admin.action(
        description="Mark selected pickup orders as Ready for Pickup"
    )
    def mark_as_ready_for_pickup(self, request, queryset):
        self._update_status(
            request,
            queryset,
            STATUS_READY_FOR_PICKUP,
        )

    @admin.action(
        description="Mark selected delivery orders as Delivered"
    )
    def mark_as_delivered(self, request, queryset):
        self._update_status(
            request,
            queryset,
            STATUS_DELIVERED,
        )

    @admin.action(
        description="Mark selected pickup orders as Picked Up"
    )
    def mark_as_picked_up(self, request, queryset):
        self._update_status(
            request,
            queryset,
            STATUS_PICKED_UP,
        )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "product_name",
        "variant_name",
        "quantity",
        "subtotal",
    )


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "old_status",
        "new_status",
        "updated_by",
        "created_at",
    )

    list_filter = (
        "new_status",
        "created_at",
    )

    search_fields = (
        "=order__id",
        "updated_by__email",
    )