from django.urls import path
from .views import CategoryListCreateView, ProductListView, ProductCreateView

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view()),
    path("products/", ProductListView.as_view()),
    path("products/create/", ProductCreateView.as_view()),
]