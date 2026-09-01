from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):

    list_display = [
        "product",
        "variant",
        "user",
        "rating",
        "created_at",
    ]

    list_filter = [
        "rating",
        "created_at",
    ]

    search_fields = [
        "product__name",
        "variant__name",
        "user__email",
        "user__first_name",
        "comment",
    ]

    readonly_fields = [
        "created_at",
    ]