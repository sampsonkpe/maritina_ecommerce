from django.urls import path
from .views import InitializePaymentView, VerifyPaymentView
from .webhooks import paystack_webhook

urlpatterns = [
    path("initialize/", InitializePaymentView.as_view()),
    path("verify/<str:reference>/", VerifyPaymentView.as_view()),
    path("webhook/", paystack_webhook),
]