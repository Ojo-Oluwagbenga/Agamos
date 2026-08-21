from rest_framework import serializers
from .models import Booking, BookingItemProduct
from apps.services.serializers import ServiceSerializer
from apps.qr_codes.serializers import BookingQRCodeSerializer

class BookingItemProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = BookingItemProduct
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price']


class BookingDetailSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)
    session_products = BookingItemProductSerializer(many=True, read_only=True)
    qr_code = BookingQRCodeSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_reference', 'user', 'guest_name', 'guest_email',
            'guest_phone', 'guest_address', 'service', 'booking_date',
            'start_time', 'end_time', 'status', 'status_display',
            'payment_status', 'payment_status_display', 'service_price',
            'product_addon_total', 'total_amount', 'customer_notes',
            'admin_notes', 'session_products', 'qr_code', 'hold_expires_at',
            'attended_at', 'cancelled_at', 'created_at', 'updated_at'
        ]


class BookingInitiateSerializer(serializers.Serializer):
    service_id = serializers.IntegerField(required=True)
    booking_date = serializers.DateField(required=True)
    start_time = serializers.TimeField(required=True)
    
    guest_name = serializers.CharField(max_length=200, required=True)
    guest_email = serializers.EmailField(required=True)
    guest_phone = serializers.CharField(max_length=30, required=True)
    guest_address = serializers.CharField(required=False, allow_blank=True)
    customer_notes = serializers.CharField(required=False, allow_blank=True)
    
    # Optional products to use during appointment
    session_products = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )
