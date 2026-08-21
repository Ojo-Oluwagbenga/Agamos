import uuid
from django.db import transaction
from django.utils import timezone
from .models import BookingQRCode
from apps.bookings.models import Booking
from apps.accounts.models import User

def verify_and_attend_booking(token_str: str, scanned_by_user: User = None) -> dict:
    """
    Verifies a booking QR code token and atomically transitions booking to ATTENDED.
    Guarantees single-use verification.
    """
    # Clean token string if scanned as full URI payload
    clean_token = token_str.replace("AGAMOS:VERIFY:", "").strip()

    try:
        token_uuid = uuid.UUID(clean_token)
    except (ValueError, TypeError):
        return {
            'success': False,
            'status': 'INVALID_TOKEN',
            'message': 'The scanned QR code is malformed or invalid.'
        }

    with transaction.atomic():
        qr_obj = BookingQRCode.objects.select_for_update().select_related('booking', 'booking__service').filter(
            secure_token=token_uuid
        ).first()

        if not qr_obj:
            return {
                'success': False,
                'status': 'NOT_FOUND',
                'message': 'No booking found matching this QR token.'
            }

        booking = qr_obj.booking

        # Check if already used
        if qr_obj.is_used or booking.status == Booking.Status.ATTENDED:
            scanned_time_str = qr_obj.scanned_at.strftime('%B %d, %Y at %I:%M %p') if qr_obj.scanned_at else 'Earlier'
            staff_name = qr_obj.scanned_by.get_full_name() if qr_obj.scanned_by else 'Staff'
            return {
                'success': False,
                'status': 'ALREADY_USED',
                'message': f"This booking was already verified and marked attended on {scanned_time_str} by {staff_name}.",
                'booking': {
                    'reference': booking.booking_reference,
                    'guest_name': booking.guest_name,
                    'service': booking.service.name,
                    'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
                    'start_time': booking.start_time.strftime('%H:%M'),
                    'status': booking.status,
                }
            }

        # Check if cancelled or no-show
        if booking.status in [Booking.Status.CANCELLED, Booking.Status.NO_SHOW]:
            return {
                'success': False,
                'status': 'EXPIRED_OR_CANCELLED',
                'message': f"This appointment cannot be attended because it is currently marked as {booking.get_status_display()}.",
                'booking': {
                    'reference': booking.booking_reference,
                    'guest_name': booking.guest_name,
                    'status': booking.status,
                }
            }

        # Atomically mark attended
        now = timezone.now()
        qr_obj.is_used = True
        qr_obj.scanned_at = now
        qr_obj.scanned_by = scanned_by_user if (scanned_by_user and scanned_by_user.is_authenticated) else None
        qr_obj.save()

        booking.status = Booking.Status.ATTENDED
        booking.attended_at = now
        booking.save()

        return {
            'success': True,
            'status': 'VERIFIED_AND_ATTENDED',
            'message': f"Appointment successfully verified! Welcome {booking.guest_name}.",
            'booking': {
                'reference': booking.booking_reference,
                'guest_name': booking.guest_name,
                'guest_email': booking.guest_email,
                'guest_phone': booking.guest_phone,
                'service': booking.service.name,
                'booking_date': booking.booking_date.strftime('%B %d, %Y'),
                'start_time': booking.start_time.strftime('%I:%M %p'),
                'end_time': booking.end_time.strftime('%I:%M %p'),
                'total_amount': f"₦{booking.total_amount:,.2f}",
                'payment_status': booking.get_payment_status_display(),
                'status': booking.get_status_display(),
                'attended_at': now.strftime('%I:%M %p, %b %d, %Y')
            }
        }
