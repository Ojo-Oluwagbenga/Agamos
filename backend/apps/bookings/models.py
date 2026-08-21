import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending Payment')
        PAID = 'PAID', _('Paid & Confirmed')
        CONFIRMED = 'CONFIRMED', _('Confirmed')
        ATTENDED = 'ATTENDED', _('Attended')
        CANCELLED = 'CANCELLED', _('Cancelled')
        NO_SHOW = 'NO_SHOW', _('No Show')
        COMPLETED = 'COMPLETED', _('Completed')

    class PaymentStatus(models.TextChoices):
        UNPAID = 'UNPAID', _('Unpaid')
        PAID = 'PAID', _('Paid')
        REFUNDED = 'REFUNDED', _('Refunded')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_reference = models.CharField(max_length=40, unique=True, db_index=True)
    
    # Customer reference (null if guest)
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    
    # Guest or customer snapshot info
    guest_name = models.CharField(max_length=200)
    guest_email = models.EmailField(db_index=True)
    guest_phone = models.CharField(max_length=30)
    guest_address = models.TextField(blank=True, null=True)

    # Treatment & Schedule
    service = models.ForeignKey('services.Service', on_delete=models.PROTECT, related_name='bookings')
    booking_date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()

    # Statuses
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    
    # Pricing & financial snapshot
    service_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Original service price snapshot")
    product_addon_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Final payable NGN amount")
    
    # Reservation lock & expiry (for 15-minute checkout hold)
    hold_expires_at = models.DateTimeField(blank=True, null=True)

    # Notes
    customer_notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)

    # Timestamps
    attended_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-booking_date', '-start_time']
        indexes = [
            models.Index(fields=['booking_date', 'status']),
            models.Index(fields=['guest_email', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            date_str = timezone.now().strftime('%Y%m%d')
            unique_suffix = uuid.uuid4().hex[:6].upper()
            self.booking_reference = f"AGM-BK-{date_str}-{unique_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_reference} - {self.service.name} ({self.guest_name}) on {self.booking_date} @ {self.start_time}"

    @property
    def is_hold_expired(self):
        if self.status == self.Status.PENDING and self.hold_expires_at:
            return timezone.now() > self.hold_expires_at
        return False


class BookingItemProduct(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='session_products')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='session_usages')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} for Booking {self.booking.booking_reference}"
