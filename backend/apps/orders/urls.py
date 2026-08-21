from django.urls import path
from .views import (
    CartView,
    CheckoutInitiateView,
    OrderDetailByRefView,
    CustomerOrderListView
)

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart_view'),
    path('checkout/', CheckoutInitiateView.as_view(), name='order_checkout'),
    path('my-orders/', CustomerOrderListView.as_view(), name='customer_orders'),
    path('<str:reference>/', OrderDetailByRefView.as_view(), name='order_detail'),
]
