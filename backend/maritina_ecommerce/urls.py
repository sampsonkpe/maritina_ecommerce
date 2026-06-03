from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
     TokenObtainPairView,
     TokenRefreshView,
)

def home(request):
    return JsonResponse({
        "message": "Welcome to the Maritina E-commerce API!",
        "status": "running"
        })

urlpatterns = [
    path('', home),

    path('admin/', admin.site.urls),

    path("api/auth/", include("apps.users.urls")),

    path("api/products/", include("apps.products.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/addresses/", include("apps.addresses.urls")),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
