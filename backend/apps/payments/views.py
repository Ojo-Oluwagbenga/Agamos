import json
from django.utils import timezone
from rest_framework import views, permissions, status
from rest_framework.response import Response
from .models import PaymentTransaction
from .paystack import verify_paystack_transaction, verify_webhook_signature
from apps.bookings.services import finalize_booking_payment
from apps.orders.services import finalize_order_payment

class VerifyPaymentView(views.APIView):
    """
    Verifies a transaction via Paystack server-side and finalizes the booking or order.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, reference):
        payment_tx = PaymentTransaction.objects.filter(reference=reference).first()
        if not payment_tx:
            return Response({'error': 'Payment transaction reference not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Call Paystack verification
        result = verify_paystack_transaction(reference)

        if result.get('status') and result.get('data', {}).get('status') == 'success':
            payment_tx.status = PaymentTransaction.Status.SUCCESS
            payment_tx.verified_at = timezone.now()
            payment_tx.paystack_response_data = result['data']
            payment_tx.save()

            if payment_tx.payment_type == PaymentTransaction.PaymentType.BOOKING and payment_tx.booking:
                booking = finalize_booking_payment(payment_tx.booking, paystack_ref=reference)
                return Response({
                    'status': 'success',
                    'payment_type': 'BOOKING',
                    'booking_reference': booking.booking_reference,
                    'message': 'Booking payment verified successfully.'
                })
            elif payment_tx.payment_type == PaymentTransaction.PaymentType.ORDER and payment_tx.order:
                order = finalize_order_payment(payment_tx.order, paystack_ref=reference)
                return Response({
                    'status': 'success',
                    'payment_type': 'ORDER',
                    'order_reference': order.order_reference,
                    'message': 'Order payment verified successfully.'
                })

        return Response({
            'status': 'pending_or_failed',
            'message': 'Payment could not be verified as successful.'
        }, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, reference):
        return self.get(request, reference)


class PaystackWebhookView(views.APIView):
    """
    Paystack Webhook Endpoint.
    Validates HMAC-SHA512 signature and processes charge.success events.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        signature = request.headers.get('x-paystack-signature', '')
        raw_body = request.body

        # Verify HMAC signature in production
        from django.conf import settings
        secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        if not secret_key.startswith('sk_test_agamos_dummy'):
            if not verify_webhook_signature(raw_body, signature):
                return Response({'error': 'Invalid webhook signature.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event_data = json.loads(raw_body.decode('utf-8'))
        except Exception:
            return Response({'error': 'Malformed JSON body.'}, status=status.HTTP_400_BAD_REQUEST)

        event = event_data.get('event')
        data = event_data.get('data', {})

        if event == 'charge.success':
            reference = data.get('reference')
            payment_tx = PaymentTransaction.objects.filter(reference=reference).first()

            if payment_tx and payment_tx.status != PaymentTransaction.Status.SUCCESS:
                payment_tx.status = PaymentTransaction.Status.SUCCESS
                payment_tx.verified_at = timezone.now()
                payment_tx.paystack_response_data = data
                payment_tx.save()

                if payment_tx.payment_type == PaymentTransaction.PaymentType.BOOKING and payment_tx.booking:
                    finalize_booking_payment(payment_tx.booking, paystack_ref=reference)
                elif payment_tx.payment_type == PaymentTransaction.PaymentType.ORDER and payment_tx.order:
                    finalize_order_payment(payment_tx.order, paystack_ref=reference)

        return Response({'status': 'webhook_received'}, status=status.HTTP_200_OK)
