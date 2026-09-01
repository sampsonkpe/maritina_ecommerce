from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from apps.products.models import (
    Product,
    ProductVariant,
)

from .models import Review
from .serializers import (
    ReviewSerializer,
    ReviewCreateSerializer,
)
from .services import ReviewService


class ProductReviewsView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, product_id):

        reviews = ReviewService.list_product_reviews(
            product_id
        )

        serializer = ReviewSerializer(
            reviews,
            many=True,
        )

        return Response(serializer.data)


class CreateReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ReviewCreateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        product_id = serializer.validated_data[
            "product"
        ]

        variant_id = serializer.validated_data[
            "variant"
        ]

        try:
            product = Product.objects.get(
                id=product_id
            )

            variant = ProductVariant.objects.get(
                id=variant_id
            )

            review = ReviewService.create_review(
                user=request.user,
                product=product,
                variant=variant,
                rating=serializer.validated_data[
                    "rating"
                ],
                comment=serializer.validated_data[
                    "comment"
                ],
            )

        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ProductVariant.DoesNotExist:
            return Response(
                {"error": "Product variant not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )