from django.urls import path

from .views import (
    ProductReviewsView,
    CreateReviewView,
)


urlpatterns = [
    path(
        "product/<int:product_id>/",
        ProductReviewsView.as_view(),
    ),

    path(
        "create/",
        CreateReviewView.as_view(),
    ),
]