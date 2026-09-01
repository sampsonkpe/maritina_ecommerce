from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
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

        product = serializer.validated_data[
            "product"
        ]

        variant = serializer.validated_data[
            "variant"
        ]

        try:
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

        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )