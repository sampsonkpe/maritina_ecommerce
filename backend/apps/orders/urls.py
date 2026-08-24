from django.urls import path
from .views import UserOrdersView, ClaimGuestOrdersView, CancelOrderView
from .admin_views import AdminOrdersView, UpdateOrderStatusView, AdminCancelOrderView

urlpatterns = [
    path("", UserOrdersView.as_view()),
    path("claim-guest/", ClaimGuestOrdersView.as_view()),
    path("admin/all/", AdminOrdersView.as_view()),
    path("admin/update-status/<int:order_id>/", UpdateOrderStatusView.as_view()),
    path("cancel/<int:order_id>/", CancelOrderView.as_view()),
    path("admin/cancel/<int:order_id>/", AdminCancelOrderView.as_view()),
]