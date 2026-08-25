from django.urls import path
from .admin_views import AdminPaymentsView, AdminPaymentRefundView

urlpatterns = [
    path("admin/all/", AdminPaymentsView.as_view()),
    path("admin/<int:payment_id>/refund/", AdminPaymentRefundView.as_view()),
]