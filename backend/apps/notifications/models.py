from django.db import models
from django.utils.translation import gettext_lazy as _

class EmailNotificationLog(models.Model):
    class EmailType(models.TextChoices):
        ACCOUNT_WELCOME = 'ACCOUNT_WELCOME', _('Account Welcome')
        PASSWORD_RESET = 'PASSWORD_RESET', _('Password Reset')
        BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION', _('Booking Confirmation & QR Code')
        REMINDER_24H = 'REMINDER_24H', _('24-Hour Appointment Reminder')
        BOOKING_CANCELLED = 'BOOKING_CANCELLED', _('Booking Cancellation')
        ORDER_CONFIRMATION = 'ORDER_CONFIRMATION', _('Order Confirmation & Receipt')
        ORDER_STATUS_UPDATE = 'ORDER_STATUS_UPDATE', _('Order Status Update')
        NO_SHOW_NOTICE = 'NO_SHOW_NOTICE', _('No-Show Policy Notification')

    class Status(models.TextChoices):
        QUEUED = 'QUEUED', _('Queued')
        SENT = 'SENT', _('Sent Successfully')
        FAILED = 'FAILED', _('Failed')

    recipient_email = models.EmailField(db_index=True)
    recipient_name = models.CharField(max_length=200)
    subject = models.CharField(max_length=300)
    email_type = models.CharField(max_length=30, choices=EmailType.choices)
    
    booking_reference = models.CharField(max_length=50, blank=True, null=True)
    order_reference = models.CharField(max_length=50, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.QUEUED)
    error_message = models.TextField(blank=True, null=True)
    
    sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email_type} to {self.recipient_email} [{self.status}]"
