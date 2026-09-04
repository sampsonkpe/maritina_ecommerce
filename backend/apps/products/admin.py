from django.contrib import admin

from .models import (
    Category,
    Product,
    ProductImage,
    ProductVariant,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        "name",
    ]

    search_fields = [
        "name",
    ]


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

    fields = [
        "image",
        "is_primary",
        "display_order",
    ]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "created_at",
    ]

    list_filter = [
        "category",
    ]

    search_fields = [
        "name",
        "description",
    ]

    inlines = [
        ProductVariantInline,
        ProductImageInline,
    ]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = [
        "product",
        "name",
        "price",
        "stock",
        "is_available",
    ]

    list_filter = [
        "is_available",
        "product",
    ]

    search_fields = [
        "product__name",
        "name",
    ]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = [
        "product",
        "is_primary",
        "display_order",
        "created_at",
    ]

    list_filter = [
        "is_primary",
        "product",
    ]

    search_fields = [
        "product__name",
    ]

    ordering = [
        "product",
        "display_order",
        "id",
    ]