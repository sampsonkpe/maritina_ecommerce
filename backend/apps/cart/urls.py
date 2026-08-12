from django.urls import path
from .views import (
    CartView,
    AddToCartView,
    UpdateCartItemView,
    RemoveFromCartView,
    ClearCartView,
    MergeGuestCartView
)

urlpatterns = [
    path("", CartView.as_view()),
    path("add/", AddToCartView.as_view()),
    path("update/", UpdateCartItemView.as_view()),
    path("remove/", RemoveFromCartView.as_view()),
    path("clear/", ClearCartView.as_view()),
    path("merge-guest/", MergeGuestCartView.as_view()),
]