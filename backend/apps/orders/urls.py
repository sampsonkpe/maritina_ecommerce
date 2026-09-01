from django.urls import path
from .views import UserOrdersView, UserOrderDetailView, ClaimGuestOrdersView, CancelOrderView, ReorderOrderView
from .admin_views import AdminOrdersView, UpdateOrderStatusView, AdminCancelOrderView

urlpatterns = [
    path("", UserOrdersView.as_view()),
    path("<int:order_id>/", UserOrderDetailView.as_view()),
    path("claim-guest/", ClaimGuestOrdersView.as_view()),
    path("admin/all/", AdminOrdersView.as_view()),
    path("admin/update-status/<int:order_id>/", UpdateOrderStatusView.as_view()),
    path("cancel/<int:order_id>/", CancelOrderView.as_view()),
    path("reorder/<int:order_id>/", ReorderOrderView.as_view()),
    path("admin/cancel/<int:order_id>/", AdminCancelOrderView.as_view()),
]