from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import (
    IsAdminUser,
    AllowAny,
)
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from .services import ProductService


class CategoryListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
    
        return [IsAdminUser()]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ProductListView(ListAPIView):
    permission_classes = [AllowAny]

    queryset = (
        Product.objects
        .select_related("category")
        .prefetch_related("variants")
    )
    serializer_class = ProductSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    filterset_fields = ["category"]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at"]


class ProductCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = ProductSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        product = ProductService.create_product(
            serializer.validated_data,
        )

        return Response(
            ProductSerializer(product).data,
            status=status.HTTP_201_CREATED,
        )


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects
            .select_related("category")
            .prefetch_related("variants"),
            id=pk,
        )
        return Response(
            ProductSerializer(product).data,
            status=status.HTTP_200_OK
        )