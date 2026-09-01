from django.contrib import admin

from .models import FavouriteItem


@admin.register(FavouriteItem)
class FavouriteItemAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "user",
        "variant",
        "created_at",
    ]

    list_filter = [
        "created_at",
    ]

    search_fields = [
        "user__email",
        "product__name",
    ]

    ordering = [
        "-created_at",
    ]