import io
import qrcode
from PIL import Image, ImageDraw
from django.core.files.base import ContentFile
from .models import BookingQRCode

def generate_booking_qr_code(booking) -> BookingQRCode:
    """
    Generates a secure, cryptographically verifiable QR code image for an AGAMOS booking.
    """
    qr_obj, created = BookingQRCode.objects.get_or_create(booking=booking)
    
    # Payload encodes the secure verification UUID token (No plaintext customer PII)
    qr_payload = f"AGAMOS:VERIFY:{qr_obj.secure_token}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=3,
    )
    qr.add_data(qr_payload)
    qr.make(fit=True)

    # Luxury styled QR code (Dark charcoal/black on clean white background)
    img = qr.make_image(fill_color="#111111", back_color="#FFFFFF").convert('RGBA')

    # Save to in-memory buffer
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    filename = f"qr_{booking.booking_reference}_{qr_obj.secure_token.hex[:8]}.png"

    qr_obj.qr_image.save(filename, ContentFile(buffer.getvalue()), save=True)
    return qr_obj
