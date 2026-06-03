from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
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
    price = models.IntegerField()  # in pesewas
    description = models.TextField(blank=True, null=True)

    image = models.URLField(blank=True, null=True)

    stock = models.IntegerField(default=0)
    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # safeguard against invalid stock
        if self.stock < 0:
            self.stock = 0

        self.is_available = self.stock > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name