from .models import Product


class ProductService:

    @staticmethod
    def create_product(validated_data):
        """
        Handles product creation with business rules.
        """

        stock = validated_data.get("stock", 0)

        if stock < 0:
            raise ValueError("Stock cannot be negative")

        product = Product.objects.create(**validated_data)

        # availability is handled in model.save()
        return product

    @staticmethod
    def update_stock(product, quantity):
        """
        Reduce stock after order purchase.
        """

        if quantity < 0:
            raise ValueError("Quantity cannot be negative")

        product.stock -= quantity
        product.save()

        return product