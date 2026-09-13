from rest_framework import serializers
from django.conf import settings
from .models import BookingQRCode

class BookingQRCodeSerializer(serializers.ModelSerializer):
    qr_image = serializers.SerializerMethodField()

    class Meta:
        model = BookingQRCode
        fields = ['id', 'secure_token', 'qr_image', 'is_used', 'scanned_at', 'created_at']
        read_only_fields = ['id', 'secure_token', 'qr_image', 'is_used', 'scanned_at', 'created_at']

    def get_qr_image(self, obj):
        if not obj.qr_image:
            return None
        request = self.context.get('request')
        if request:
            try:
                return request.build_absolute_uri(obj.qr_image.url)
            except Exception:
                pass
        
        backend_url = getattr(settings, 'BACKEND_URL', 'http://127.0.0.1:8000').rstrip('/')
        return f"{backend_url}{obj.qr_image.url}"
