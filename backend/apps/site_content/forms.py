from django import forms

from .models import SiteImage


class SiteImageAdminForm(forms.ModelForm):

    image_upload = forms.FileField(
        required=False,
        label="Upload image",
        help_text="Upload an image to Cloudinary.",
    )

    class Meta:
        model = SiteImage
        fields = [
            "image_type",
            "image_upload",
        ]