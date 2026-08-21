import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class PaymentTransaction(models.Model):
    class PaymentType(models.TextChoices):
        BOOKING = 'BOOKING', _('Appointment Booking')
        ORDER = 'ORDER', _('Product Store Order')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        SUCCESS = 'SUCCESS', _('Success')
        FAILED = 'FAILED', _('Failed')
        ABANDONED = 'ABANDONED', _('Abandoned')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=50, unique=True, db_index=True)
    paystack_reference = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    guest_email = models.EmailField(db_index=True)
    
    payment_type = models.CharField(max_length=20, choices=PaymentType.choices)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    order = models.ForeignKey('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2, help_text="Amount in NGN")
    currency = models.CharField(max_length=10, default='NGN')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    
    paystack_response_data = models.JSONField(default=dict, blank=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.reference:
            date_str = timezone.now().strftime('%Y%m%d')
            unique_suffix = uuid.uuid4().hex[:8].upper()
            self.reference = f"AGM-PAY-{date_str}-{unique_suffix}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} ({self.payment_type}) - ₦{self.amount:,.2f} [{self.status}]"
