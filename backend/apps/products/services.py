from .models import Product


class ProductService:

    @staticmethod
    def create_product(validated_data):

        product = Product.objects.create(
            **validated_data
        )

        return product