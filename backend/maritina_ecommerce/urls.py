from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
     TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/authentication/", include("apps.authentication.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/addresses/", include("apps.addresses.urls")),

    path("api/token/refresh/", TokenRefreshView.as_view()),
]
