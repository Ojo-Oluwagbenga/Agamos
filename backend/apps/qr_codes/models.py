import uuid
import hmac
import hashlib
from django.db import models
from django.conf import settings

class BookingQRCode(models.Model):
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='qr_code')
    secure_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    verification_hash = models.CharField(max_length=64, blank=True, help_text="HMAC SHA-256 integrity hash")
    qr_image = models.ImageField(upload_to='booking_qrs/', blank=True, null=True)
    is_used = models.BooleanField(default=False, db_index=True)
    scanned_at = models.DateTimeField(blank=True, null=True)
    scanned_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='scanned_qrs'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_verification_hash(self):
        salt = getattr(settings, 'QR_SECURITY_SALT', 'agamos-salt')
        payload = f"{self.secure_token}:{self.booking.booking_reference}:{salt}"
        return hmac.new(salt.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()

    def save(self, *args, **kwargs):
        if not self.verification_hash:
            self.verification_hash = self.generate_verification_hash()
        super().save(*args, **kwargs)

    def __str__(self):
        status = "USED" if self.is_used else "ACTIVE"
        return f"QR [{status}] for Booking {self.booking.booking_reference}"
