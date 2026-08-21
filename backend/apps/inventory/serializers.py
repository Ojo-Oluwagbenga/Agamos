from rest_framework import serializers
from .models import InventoryTransaction
from apps.products.serializers import ProductSerializer

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'transaction_type', 'quantity_delta', 'previous_stock',
            'new_stock', 'reference', 'performed_by_name',
            'reason', 'created_at'
        ]


class InventoryAdjustSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)
    quantity_delta = serializers.IntegerField(required=True)
    transaction_type = serializers.ChoiceField(
        choices=InventoryTransaction.TransactionType.choices,
        default=InventoryTransaction.TransactionType.ADJUSTMENT
    )
    reason = serializers.CharField(required=True)
