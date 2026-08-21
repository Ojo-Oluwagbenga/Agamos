from django.urls import path
from .views import VerifyPaymentView, PaystackWebhookView

urlpatterns = [
    path('verify/<str:reference>/', VerifyPaymentView.as_view(), name='payment_verify'),
    path('webhook/paystack/', PaystackWebhookView.as_view(), name='paystack_webhook'),
]
