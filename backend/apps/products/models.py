from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)

    description = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Product(models.Model):

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    name = models.CharField(max_length=255)

    description = models.TextField(
        blank=True,
        null=True
    )

    image = models.URLField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name


class ProductVariant(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    name = models.CharField(max_length=100)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    stock = models.PositiveIntegerField(
        default=0
    )

    is_available = models.BooleanField(
        default=True
    )

    class Meta:
        verbose_name_plural = "Product Variants"

    def save(self, *args, **kwargs):
        self.is_available = self.stock > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.name}"