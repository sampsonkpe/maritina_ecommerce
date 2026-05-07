from django.urls import path
from .views import AddressListCreateView

urlpatterns = [
    path("", AddressListCreateView.as_view(), name="addresses"),
]