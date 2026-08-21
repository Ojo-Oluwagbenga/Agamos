from rest_framework import serializers
from .models import BookingQRCode

class BookingQRCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingQRCode
        fields = ['id', 'secure_token', 'qr_image', 'is_used', 'scanned_at', 'created_at']
        read_only_fields = ['id', 'secure_token', 'qr_image', 'is_used', 'scanned_at', 'created_at']
