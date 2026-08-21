import uuid
import logging
import urllib.parse
from django.db import transaction
from django.utils import timezone
from .models import BookingQRCode
from apps.bookings.models import Booking
from apps.accounts.models import User

logger = logging.getLogger(__name__)

def verify_and_attend_booking(token_str: str, scanned_by_user: User = None) -> dict:
    """
    Verifies a booking QR code token, URL, or booking reference and atomically transitions booking to ATTENDED.
    Guarantees single-use verification and accepts all valid QR payloads.
    """
    if not token_str:
        return {
            'success': False,
            'status': 'INVALID_TOKEN',
            'message': 'No QR code token provided.'
        }

    raw = str(token_str).strip()

    # 1. Extract from URL if full URI was scanned (e.g. /booking/verify?token=... or /booking/:id)
    if 'token=' in raw:
        try:
            parsed = urllib.parse.urlparse(raw)
            qs = urllib.parse.parse_qs(parsed.query)
            if 'token' in qs:
                raw = qs['token'][0]
        except Exception:
            pass
    elif '/booking/' in raw:
        try:
            parsed = urllib.parse.urlparse(raw)
            path_parts = [p for p in parsed.path.split('/') if p]
            if path_parts:
                raw = path_parts[-1]
        except Exception:
            pass

    # 2. Clean prefixes
    clean_token = raw.replace("AGAMOS:VERIFY:", "").replace("AGAMOS:", "").strip()

    token_uuid = None
    try:
        token_uuid = uuid.UUID(clean_token)
    except (ValueError, TypeError):
        token_uuid = None

    with transaction.atomic():
        qr_obj = None

        # 3. Lookup by UUID token
        if token_uuid:
            qr_obj = BookingQRCode.objects.select_for_update().select_related('booking', 'booking__service').filter(
                secure_token=token_uuid
            ).first()

        # 4. Lookup by Booking Reference (e.g. AGM-BK-20260821-XXXX)
        if not qr_obj:
            qr_obj = BookingQRCode.objects.select_for_update().select_related('booking', 'booking__service').filter(
                booking__booking_reference__iexact=clean_token
            ).first()

        # 5. Lookup by Payment Transaction Reference (e.g. AGM-PAY-...)
        if not qr_obj:
            qr_obj = BookingQRCode.objects.select_for_update().select_related('booking', 'booking__service').filter(
                booking__payments__reference__iexact=clean_token
            ).first()

        # 6. If no QR record exists yet for this booking, find the booking and generate it on the fly
        if not qr_obj:
            booking = Booking.objects.select_for_update().select_related('service').filter(
                booking_reference__iexact=clean_token
            ).first()
            if booking:
                from .generator import generate_booking_qr_code
                qr_obj = generate_booking_qr_code(booking)

        # If still not found
        if not qr_obj:
            return {
                'success': False,
                'status': 'NOT_FOUND',
                'message': f"No booking record found matching reference or QR token '{clean_token}'."
            }

        booking = qr_obj.booking

        # 7. Check if already used
        if qr_obj.is_used or booking.status == Booking.Status.ATTENDED:
            scanned_time_str = qr_obj.scanned_at.strftime('%B %d, %Y at %I:%M %p') if qr_obj.scanned_at else 'Earlier'
            staff_name = qr_obj.scanned_by.get_full_name() if qr_obj.scanned_by else 'Concierge Staff'
            return {
                'success': False,
                'status': 'ALREADY_USED',
                'message': f"This appointment pass was already verified on {scanned_time_str} by {staff_name}.",
                'booking': {
                    'reference': booking.booking_reference,
                    'guest_name': booking.guest_name,
                    'service': booking.service.name,
                    'booking_date': booking.booking_date.strftime('%B %d, %Y'),
                    'start_time': booking.start_time.strftime('%I:%M %p'),
                    'status': booking.status,
                    'attended_at': scanned_time_str,
                }
            }

        # 8. Check if cancelled or no-show
        if booking.status in [Booking.Status.CANCELLED, Booking.Status.NO_SHOW]:
            return {
                'success': False,
                'status': 'EXPIRED_OR_CANCELLED',
                'message': f"This appointment cannot be attended because it is marked as {booking.get_status_display()}.",
                'booking': {
                    'reference': booking.booking_reference,
                    'guest_name': booking.guest_name,
                    'status': booking.status,
                }
            }

        # 9. Atomically mark attended
        now = timezone.now()
        qr_obj.is_used = True
        qr_obj.scanned_at = now
        qr_obj.scanned_by = scanned_by_user if (scanned_by_user and scanned_by_user.is_authenticated) else None
        qr_obj.save()

        booking.status = Booking.Status.ATTENDED
        booking.attended_at = now
        booking.save()

        logger.info(f"Booking {booking.booking_reference} successfully marked ATTENDED at {now}.")

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
