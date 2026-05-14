from django.urls import include, path
from .views import InitializePaymentView, VerifyPaymentView
from .webhooks import paystack_webhook

urlpatterns = [
    path("initialize/", InitializePaymentView.as_view()),
    path("verify/<str:reference>/", VerifyPaymentView.as_view()),
    path("webhook/", paystack_webhook),
    
    path("", include("apps.payments.admin_urls")),
]