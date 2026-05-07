from .models import Product, Category


class ProductService:

    @staticmethod
    def create_product(validated_data):
        return Product.objects.create(**validated_data)

    @staticmethod
    def update_stock(product, quantity):
        product.stock -= quantity
        product.save()
        return product