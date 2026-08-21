from rest_framework import views, generics, permissions, status
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import InventoryTransaction
from .serializers import InventoryTransactionSerializer, InventoryAdjustSerializer
from apps.products.models import Product
from apps.products.serializers import ProductSerializer

class AdminInventoryOverviewView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        products = Product.objects.filter(is_active=True)
        total_products = products.count()
        low_stock_products = [p for p in products if p.is_low_stock]
        out_of_stock_products = products.filter(stock_quantity__lte=0)
        
        total_stock_units = sum(p.stock_quantity for p in products)
        total_inventory_value = sum(p.stock_quantity * p.price for p in products)

        return Response({
            'total_products': total_products,
            'total_stock_units': total_stock_units,
            'total_inventory_value': f"₦{total_inventory_value:,.2f}",
            'low_stock_count': len(low_stock_products),
            'out_of_stock_count': out_of_stock_products.count(),
            'low_stock_items': ProductSerializer(low_stock_products, many=True).data,
            'out_of_stock_items': ProductSerializer(out_of_stock_products, many=True).data,
        })


class AdminInventoryTransactionListView(generics.ListAPIView):
    queryset = InventoryTransaction.objects.all().select_related('product', 'performed_by').order_by('-created_at')
    serializer_class = InventoryTransactionSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminManualInventoryAdjustView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = InventoryAdjustSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        delta = serializer.validated_data['quantity_delta']
        tx_type = serializer.validated_data['transaction_type']
        reason = serializer.validated_data['reason']

        with transaction.atomic():
            product = get_object_or_404(Product.objects.select_for_update(), id=product_id)
            prev_stock = product.stock_quantity
            new_stock = max(0, prev_stock + delta)
            product.stock_quantity = new_stock
            product.save()

            tx = InventoryTransaction.objects.create(
                product=product,
                transaction_type=tx_type,
                quantity_delta=delta,
                previous_stock=prev_stock,
                new_stock=new_stock,
                performed_by=request.user,
                reason=reason
            )

        return Response({
            'message': 'Inventory successfully adjusted.',
            'product': ProductSerializer(product).data,
            'transaction': InventoryTransactionSerializer(tx).data
        }, status=status.HTTP_200_OK)
