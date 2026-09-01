from django.urls import path

from .views import (
    AllReviewsView,
    ProductReviewsView,
    CreateReviewView,
)


urlpatterns = [
    path(
        "",
        AllReviewsView.as_view(),
    ),
    
    path(
        "product/<int:product_id>/",
        ProductReviewsView.as_view(),
    ),

    path(
        "create/",
        CreateReviewView.as_view(),
    ),
]