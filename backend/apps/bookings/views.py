from rest_framework import views, viewsets, generics, permissions, status, filters
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.conf import settings
from .models import Booking
from .serializers import BookingInitiateSerializer, BookingDetailSerializer
from .services import create_booking_reservation
from apps.payments.paystack import initialize_paystack_payment

class InitiateBookingView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = BookingInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user if request.user.is_authenticated else None

        try:
            booking, payment_tx = create_booking_reservation(
                data=serializer.validated_data,
                user=user
            )
        except ValidationError as e:
            msg = e.messages[0] if hasattr(e, 'messages') else str(e)
            return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to process booking reservation: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Initialize Paystack Payment Transaction
        paystack_result = initialize_paystack_payment(
            reference=payment_tx.reference,
            amount_ngn=payment_tx.amount,
            email=payment_tx.guest_email,
            callback_url=request.data.get('callback_url', 'http://localhost:5173/booking/verify'),
            metadata={
                'payment_type': 'BOOKING',
                'booking_reference': booking.booking_reference,
                'client_name': booking.guest_name,
                'service_name': booking.service.name
            }
        )

        if paystack_result.get('status'):
            payment_tx.paystack_reference = paystack_result['data'].get('reference')
            payment_tx.paystack_response_data = paystack_result['data']
            payment_tx.save()

        booking_data = BookingDetailSerializer(booking).data

        return Response({
            'booking': booking_data,
            'payment': {
                'reference': payment_tx.reference,
                'amount': str(payment_tx.amount),
                'authorization_url': paystack_result.get('data', {}).get('authorization_url', ''),
                'access_code': paystack_result.get('data', {}).get('access_code', ''),
                'paystack_public_key': getattr(settings, 'PAYSTACK_PUBLIC_KEY', '') if hasattr(self, 'settings') else 'pk_test_dummy'
            }
        }, status=status.HTTP_201_CREATED)


class BookingDetailByRefView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, reference):
        booking = get_object_or_404(
            Booking.objects.select_related('service', 'service__category', 'qr_code').prefetch_related('session_products__product'),
            booking_reference=reference
        )
        # Verify guest access or user ownership
        if request.user.is_authenticated and not request.user.is_staff:
            if booking.user and booking.user != request.user and booking.guest_email.lower() != request.user.email.lower():
                return Response({'error': 'Unauthorized to view this booking.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CancelBookingView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, reference):
        booking = get_object_or_404(Booking, booking_reference=reference)
        
        if booking.status in [Booking.Status.ATTENDED, Booking.Status.COMPLETED, Booking.Status.CANCELLED]:
            return Response({'error': f'Booking is already {booking.get_status_display()} and cannot be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.utils import timezone
        booking.status = Booking.Status.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.save()

        # Send cancellation notification
        from apps.notifications.tasks import send_transactional_email_task
        send_transactional_email_task(
            email_type='BOOKING_CANCELLED',
            recipient_email=booking.guest_email,
            recipient_name=booking.guest_name,
            subject=f"Booking Cancelled — AGAMOS Concierge ({booking.booking_reference})",
            context_data={
                'booking_reference': booking.booking_reference,
                'client_name': booking.guest_name,
                'service_name': booking.service.name,
            }
        )

        return Response({'message': 'Booking successfully cancelled.', 'booking': BookingDetailSerializer(booking).data})


class CustomerBookingListView(generics.ListAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            models_filter=(models.Q(user=self.request.user) | models.Q(guest_email__iexact=self.request.user.email))
        ) if False else Booking.objects.filter(
            guest_email__iexact=self.request.user.email
        ).select_related('service', 'qr_code').order_by('-booking_date', '-start_time')


# Admin Bookings ViewSet
class AdminBookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().select_related('service', 'user', 'qr_code').prefetch_related('session_products__product').order_by('-booking_date', '-start_time')
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['booking_reference', 'guest_name', 'guest_email', 'guest_phone', 'service__name']
    ordering_fields = ['booking_date', 'start_time', 'total_amount', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(booking_date=date_param)
        service_id = self.request.query_params.get('service_id')
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        return queryset
