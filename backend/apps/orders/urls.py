from django.urls import path
from .views import CreateOrderView, UserOrdersView

urlpatterns = [
    path("create/", CreateOrderView.as_view()),
    path("my-orders/", UserOrdersView.as_view()),
]