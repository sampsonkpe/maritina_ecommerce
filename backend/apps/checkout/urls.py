from django.urls import path

from .views import CreateCheckoutView


urlpatterns = [
    path(
        "create/",
        CreateCheckoutView.as_view(),
    ),
]