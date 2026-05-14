from django.urls import path
from .views import CreateOrderView, UserOrdersView
from .admin_views import AdminOrdersView, UpdateOrderStatusView
from .views import OrderListView

urlpatterns = [
    path("", OrderListView.as_view()),
    path("create/", CreateOrderView.as_view()),
    path("my-orders/", UserOrdersView.as_view()),
    path("admin/all/", AdminOrdersView.as_view()),
    path("admin/update-status/<int:order_id>/", UpdateOrderStatusView.as_view()),
]