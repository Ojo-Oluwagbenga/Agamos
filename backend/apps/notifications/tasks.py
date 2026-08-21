from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import EmailNotificationLog
from .email_service import generate_luxury_html_template

def send_transactional_email_task(email_type: str, recipient_email: str, recipient_name: str, subject: str, context_data: dict):
    """
    Synchronous or Celery-compatible task for formatting and dispatching luxury transactional emails.
    """
    log_entry = EmailNotificationLog.objects.create(
        recipient_email=recipient_email,
        recipient_name=recipient_name,
        subject=subject,
        email_type=email_type,
        booking_reference=context_data.get('booking_reference'),
        order_reference=context_data.get('order_reference'),
        status=EmailNotificationLog.Status.QUEUED
    )

    body_html = ""
    cta_url = None
    cta_text = None

    base_url = getattr(settings, 'FRONTEND_URL', 'https://agamos.vercel.app').rstrip('/')

    if email_type == 'BOOKING_CONFIRMATION':
        booking_ref = context_data.get('booking_reference')
        body_html = f"""
        <p>Your luxury appointment at AGAMOS has been successfully confirmed.</p>
        <div style="background-color: #202020; border-left: 3px solid #D4AF37; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #D4AF37; font-weight: 600; font-size: 15px;">APPOINTMENT DOSSIER</p>
            <p style="margin: 4px 0;"><strong>Reference:</strong> {booking_ref}</p>
            <p style="margin: 4px 0;"><strong>Treatment:</strong> {context_data.get('service_name')}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> {context_data.get('booking_date')}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> {context_data.get('booking_time')}</p>
            <p style="margin: 4px 0;"><strong>Total Paid:</strong> {context_data.get('total_amount')}</p>
        </div>
        <p style="font-size: 13px; color: #AAAAAA;">
            Your secure verification QR code is attached to your booking record. Please present this QR code to the concierge upon arrival for seamless check-in.
        </p>
        """
        cta_url = f"{base_url}/booking/{booking_ref}"
        cta_text = "View Booking & QR Code"

    elif email_type == 'REMINDER_24H':
        booking_ref = context_data.get('booking_reference')
        body_html = f"""
        <p>This is a gentle reminder that your appointment at AGAMOS is scheduled for tomorrow.</p>
        <div style="background-color: #202020; border-left: 3px solid #D4AF37; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #D4AF37; font-weight: 600; font-size: 15px;">APPOINTMENT DETAILS</p>
            <p style="margin: 4px 0;"><strong>Reference:</strong> {booking_ref}</p>
            <p style="margin: 4px 0;"><strong>Treatment:</strong> {context_data.get('service_name')}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> {context_data.get('booking_date')}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> {context_data.get('booking_time')}</p>
        </div>
        <p style="font-size: 13px; color: #AAAAAA;">
            If you need to reschedule, please notify us at least 6 hours in advance.
        </p>
        """
        cta_url = f"{base_url}/booking/{booking_ref}"
        cta_text = "View Appointment"

    elif email_type == 'ORDER_CONFIRMATION':
        order_ref = context_data.get('order_reference')
        body_html = f"""
        <p>Thank you for shopping at the AGAMOS Beauty Store. Your order has been placed and confirmed.</p>
        <div style="background-color: #202020; border-left: 3px solid #D4AF37; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #D4AF37; font-weight: 600; font-size: 15px;">ORDER SUMMARY</p>
            <p style="margin: 4px 0;"><strong>Order Reference:</strong> {order_ref}</p>
            <p style="margin: 4px 0;"><strong>Delivery Method:</strong> {context_data.get('delivery_type')}</p>
            <p style="margin: 4px 0;"><strong>Total Paid:</strong> {context_data.get('total_amount')}</p>
        </div>
        <p style="font-size: 13px; color: #AAAAAA;">
            Our logistics team is preparing your bespoke packaging. You will be notified once ready for pickup or dispatched with courier.
        </p>
        """
        cta_url = f"{base_url}/order/{order_ref}"
        cta_text = "Track Order Status"

    elif email_type == 'PASSWORD_RESET':
        body_html = f"""
        <p>We received a request to reset your password for your AGAMOS account.</p>
        <p>Click the link below to securely choose a new password. This link is valid for 24 hours.</p>
        """
        cta_url = f"{base_url}{context_data.get('reset_link')}"
        cta_text = "Reset Password"

    elif email_type == 'BOOKING_CANCELLED':
        body_html = f"""
        <p>Your appointment ({context_data.get('booking_reference')}) for {context_data.get('service_name')} has been cancelled as requested.</p>
        <p>We hope to welcome you to the sanctuary of AGAMOS in the near future.</p>
        """
        cta_url = f"{base_url}/services"
        cta_text = "Browse Services"

    else:
        body_html = f"<p>{subject}</p>"

    full_html = generate_luxury_html_template(
        subject=subject,
        client_name=recipient_name,
        body_content_html=body_html,
        call_to_action_url=cta_url,
        cta_text=cta_text
    )

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AGAMOS <concierge@agamos.com>')
        send_mail(
            subject=subject,
            message=subject,  # Plain text fallback
            from_email=from_email,
            recipient_list=[recipient_email],
            html_message=full_html,
            fail_silently=False
        )
        log_entry.status = EmailNotificationLog.Status.SENT
        log_entry.sent_at = timezone.now()
        log_entry.save()
    except Exception as e:
        log_entry.status = EmailNotificationLog.Status.FAILED
        log_entry.error_message = str(e)
        log_entry.save()


def dispatch_24h_appointment_reminders():
    """
    Finds confirmed bookings scheduled in the next 24-hour window and sends reminder emails.
    """
    from apps.bookings.models import Booking
    now = timezone.now()
    tomorrow_start = (now + timedelta(hours=23)).date()
    tomorrow_end = (now + timedelta(hours=25)).date()

    target_bookings = Booking.objects.filter(
        booking_date__gte=tomorrow_start,
        booking_date__lte=tomorrow_end,
        status__in=[Booking.Status.CONFIRMED, Booking.Status.PAID]
    )

    count = 0
    for booking in target_bookings:
        # Check if reminder already sent
        already_sent = EmailNotificationLog.objects.filter(
            booking_reference=booking.booking_reference,
            email_type=EmailNotificationLog.EmailType.REMINDER_24H,
            status=EmailNotificationLog.Status.SENT
        ).exists()

        if not already_sent:
            send_transactional_email_task(
                email_type='REMINDER_24H',
                recipient_email=booking.guest_email,
                recipient_name=booking.guest_name,
                subject=f"Appointment Reminder — Tomorrow at AGAMOS ({booking.booking_reference})",
                context_data={
                    'booking_reference': booking.booking_reference,
                    'service_name': booking.service.name,
                    'booking_date': booking.booking_date.strftime('%B %d, %Y'),
                    'booking_time': booking.start_time.strftime('%I:%M %p')
                }
            )
            count += 1

    return count
