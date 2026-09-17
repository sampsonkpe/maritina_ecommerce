from django.contrib import admin
from django.core.exceptions import ValidationError

import cloudinary
import cloudinary.uploader

from maritina_ecommerce.cloudinary_config import (
    configure_cloudinary,
)

from .forms import SiteImageAdminForm
from .models import SiteImage


@admin.register(SiteImage)
class SiteImageAdmin(admin.ModelAdmin):

    form = SiteImageAdminForm

    list_display = [
        "image_type",
        "image",
        "updated_at",
    ]

    list_filter = [
        "image_type",
    ]

    ordering = [
        "image_type",
    ]

    def save_model(self, request, obj, form, change):
        uploaded_file = form.cleaned_data.get(
            "image_upload"
        )

        if uploaded_file:
            configure_cloudinary()

            try:
                result = cloudinary.uploader.upload(
                    uploaded_file,
                    folder="kahwe/site",
                    resource_type="image",
                )

                obj.image = result["secure_url"]

            except Exception as error:
                raise ValidationError(
                    f"Cloudinary upload failed: {error}"
                )

        elif not obj.image:
            raise ValidationError(
                "Please upload an image."
            )

        super().save_model(
            request,
            obj,
            form,
            change,
        )