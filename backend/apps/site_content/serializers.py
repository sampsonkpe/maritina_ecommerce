from rest_framework import serializers

from .models import SiteImage


class SiteImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = SiteImage
        fields = [
            "id",
            "image_type",
            "image",
        ]