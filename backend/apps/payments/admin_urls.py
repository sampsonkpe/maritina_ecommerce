from django.urls import path
from .admin_views import AdminPaymentsView

urlpatterns = [
    path("admin/all/", AdminPaymentsView.as_view()),
]