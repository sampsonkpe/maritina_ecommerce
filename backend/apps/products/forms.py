from django import forms

from .models import Category, ProductImage


class CategoryAdminForm(forms.ModelForm):

    image_upload = forms.FileField(
        required=False,
        label="Upload image",
        help_text="Upload an image to Cloudinary.",
    )

    class Meta:
        model = Category
        fields = [
            "name",
            "description",
            "image_upload",
        ]


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