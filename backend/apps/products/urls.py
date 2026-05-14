from django.urls import path
from .views import CategoryListCreateView, ProductListView, ProductCreateView

urlpatterns = [
    path("", ProductListView.as_view()),
    path("categories/", CategoryListCreateView.as_view()),
    path("create/", ProductCreateView.as_view()),
]