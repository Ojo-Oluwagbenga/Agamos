from django.urls import path
from .views import VerifyQRCodeView, PublicQRStatusView

urlpatterns = [
    path('verify-and-attend/', VerifyQRCodeView.as_view(), name='qr_verify_attend'),
    path('status/<uuid:token>/', PublicQRStatusView.as_view(), name='qr_public_status'),
]
