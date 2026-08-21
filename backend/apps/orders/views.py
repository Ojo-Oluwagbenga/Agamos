from rest_framework import views, viewsets, generics, permissions, status, filters
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .models import Cart, CartItem, Order
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    OrderDetailSerializer,
    CheckoutInitiateSerializer
)
from .services import create_order_checkout
from apps.payments.paystack import initialize_paystack_payment

class CartView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            return cart
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart

    def get(self, request):
        cart = self.get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        cart = self.get_cart(request)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.products.models import Product
        product = get_object_or_404(Product, id=product_id, is_active=True)

        if product.stock_quantity < quantity:
            return Response({'error': f'Only {product.stock_quantity} unit(s) available in stock.'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if product.stock_quantity < new_qty:
                return Response({'error': f'Cannot add more units. Total in cart would exceed stock.'}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity = new_qty
            cart_item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request):
        cart = self.get_cart(request)
        item_id = request.data.get('item_id')
        if item_id:
            CartItem.objects.filter(cart=cart, id=item_id).delete()
        else:
            cart.items.all().delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CheckoutInitiateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CheckoutInitiateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user if request.user.is_authenticated else None

        try:
            order, payment_tx = create_order_checkout(
                data=serializer.validated_data,
                user=user
            )
        except ValidationError as e:
            msg = e.messages[0] if hasattr(e, 'messages') else str(e)
            return Response({'error': msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to process order checkout: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Initialize Paystack
        paystack_result = initialize_paystack_payment(
            reference=payment_tx.reference,
            amount_ngn=payment_tx.amount,
            email=payment_tx.guest_email,
            callback_url=request.data.get('callback_url', 'http://localhost:5173/order/verify'),
            metadata={
                'payment_type': 'ORDER',
                'order_reference': order.order_reference,
                'client_name': order.guest_name,
            }
        )

        if paystack_result.get('status'):
            payment_tx.paystack_reference = paystack_result['data'].get('reference')
            payment_tx.paystack_response_data = paystack_result['data']
            payment_tx.save()

        order_data = OrderDetailSerializer(order).data

        return Response({
            'order': order_data,
            'payment': {
                'reference': payment_tx.reference,
                'amount': str(payment_tx.amount),
                'authorization_url': paystack_result.get('data', {}).get('authorization_url', ''),
                'access_code': paystack_result.get('data', {}).get('access_code', ''),
            }
        }, status=status.HTTP_201_CREATED)


class OrderDetailByRefView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, reference):
        from django.db.models import Q
        order = Order.objects.prefetch_related('items__product').filter(
            Q(order_reference=reference) | Q(payments__reference=reference) | Q(payments__paystack_reference=reference)
        ).first()

        if not order:
            return Response({'error': 'No order found matching the provided reference.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CustomerOrderListView(generics.ListAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            guest_email__iexact=self.request.user.email
        ).prefetch_related('items__product').order_by('-created_at')


# Admin Order ViewSet
class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('items__product').order_by('-created_at')
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_reference', 'guest_name', 'guest_email', 'guest_phone']
    ordering_fields = ['created_at', 'total_amount', 'status']

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset
