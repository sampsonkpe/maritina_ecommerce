from django.urls import path
from .views import UserOrdersView, ClaimGuestOrdersView
from .admin_views import AdminOrdersView, UpdateOrderStatusView

urlpatterns = [
    path("", UserOrdersView.as_view()),
    path("claim-guest/", ClaimGuestOrdersView.as_view()),
    path("admin/all/", AdminOrdersView.as_view()),
    path("admin/update-status/<int:order_id>/", UpdateOrderStatusView.as_view()),
]