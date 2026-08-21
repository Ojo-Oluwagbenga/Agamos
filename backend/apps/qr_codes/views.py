from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import BookingQRCode
from .verifier import verify_and_attend_booking

class VerifyQRCodeView(views.APIView):
    """
    Staff / Admin endpoint for scanning booking QR codes via device camera.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'QR Token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        scanned_user = request.user if request.user.is_authenticated else None
        result = verify_and_attend_booking(token_str=token, scanned_by_user=scanned_user)
        
        status_code = status.HTTP_200_OK if result['success'] else status.HTTP_400_BAD_REQUEST
        return Response(result, status=status_code)


class PublicQRStatusView(views.APIView):
    """
    Lookup booking status by secure token.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        qr_obj = get_object_or_404(BookingQRCode, secure_token=token)
        booking = qr_obj.booking
        return Response({
            'reference': booking.booking_reference,
            'guest_name': booking.guest_name,
            'service_name': booking.service.name,
            'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
            'start_time': booking.start_time.strftime('%H:%M'),
            'is_used': qr_obj.is_used,
            'status': booking.get_status_display(),
            'payment_status': booking.get_payment_status_display(),
        })
