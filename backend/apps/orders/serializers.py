from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'session_key', 'items', 'total_items', 'subtotal', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'sku', 'unit_price', 'quantity', 'subtotal']


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    delivery_type_display = serializers.CharField(source='get_delivery_type_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_reference', 'user', 'guest_name', 'guest_email',
            'guest_phone', 'delivery_type', 'delivery_type_display',
            'shipping_address', 'shipping_city', 'shipping_state',
            'subtotal_amount', 'delivery_fee', 'total_amount',
            'status', 'status_display', 'payment_status', 'payment_status_display',
            'admin_notes', 'items', 'created_at', 'updated_at'
        ]


class CheckoutInitiateSerializer(serializers.Serializer):
    guest_name = serializers.CharField(max_length=200, required=True)
    guest_email = serializers.EmailField(required=True)
    guest_phone = serializers.CharField(max_length=30, required=True)
    delivery_type = serializers.ChoiceField(choices=Order.DeliveryType.choices, default=Order.DeliveryType.PICKUP)
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    shipping_city = serializers.CharField(required=False, allow_blank=True)
    shipping_state = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(child=serializers.DictField(), required=True)
