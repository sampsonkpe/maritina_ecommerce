from django import forms

from .models import ProductImage


class ProductImageAdminForm(forms.ModelForm):

    image_upload = forms.FileField(
        required=False,
        label="Upload image",
        help_text="Upload an image to Cloudinary.",
    )

    class Meta:
        model = ProductImage
        fields = [
            "product",
            "image_upload",
            "is_primary",
            "display_order",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)