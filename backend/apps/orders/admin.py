from django.contrib import admin

from .models import Order, OrderItem


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "status",
        "delivery_type",
        "total_amount",
        "created_at",
        "updated_at",
    )

    list_filter = (
        "status",
        "delivery_type",
        "created_at",
    )

    search_fields = (
        "=id",
        "user__email",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    actions = [
        "mark_as_preparing",
        "mark_as_out_for_delivery",
        "mark_as_delivered",
    ]

    @admin.action(
        description="Mark selected orders as Preparing"
    )
    def mark_as_preparing(
        self,
        request,
        queryset
    ):
        queryset.update(
            status=Order.STATUS_PREPARING
        )

    @admin.action(
        description="Mark selected orders as Out For Delivery"
    )
    def mark_as_out_for_delivery(
        self,
        request,
        queryset
    ):
        queryset.update(
            status=Order.STATUS_OUT_FOR_DELIVERY
        )

    @admin.action(
        description="Mark selected orders as Delivered"
    )
    def mark_as_delivered(
        self,
        request,
        queryset
    ):
        queryset.update(
            status=Order.STATUS_DELIVERED
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