from django.db import models


class SiteImage(models.Model):

    HERO = "HERO"
    TEAM = "TEAM"

    TYPE_CHOICES = [
        (HERO, "Hero"),
        (TEAM, "Team"),
    ]

    image_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        unique=True,
    )

    image = models.URLField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["image_type"]

    def __str__(self):
        return self.get_image_type_display()