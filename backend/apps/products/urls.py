from django.urls import path
from .views import CategoryListCreateView, ProductDetailView, ProductListView, ProductCreateView

urlpatterns = [
    path("", ProductListView.as_view()),
    path("categories/", CategoryListCreateView.as_view()),
    path("create/", ProductCreateView.as_view()),
    path("<int:pk>/", ProductDetailView.as_view()),
]