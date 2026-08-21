from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.bookings.models import Booking
from apps.orders.models import Order
from apps.products.models import Product
from apps.payments.models import PaymentTransaction
from apps.accounts.models import User
from apps.bookings.serializers import BookingDetailSerializer
from apps.orders.serializers import OrderDetailSerializer
from apps.products.serializers import ProductSerializer

class AdminDashboardMetricsView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        first_day_of_month = today.replace(day=1)

        # Revenue
        total_booking_rev = Booking.objects.filter(
            payment_status=Booking.PaymentStatus.PAID
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        total_order_rev = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        total_revenue = total_booking_rev + total_order_rev

        month_booking_rev = Booking.objects.filter(
            payment_status=Booking.PaymentStatus.PAID,
            created_at__date__gte=first_day_of_month
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        month_order_rev = Order.objects.filter(
            payment_status=Order.PaymentStatus.PAID,
            created_at__date__gte=first_day_of_month
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        monthly_revenue = month_booking_rev + month_order_rev

        # Bookings Metrics
        total_bookings = Booking.objects.count()
        upcoming_bookings = Booking.objects.filter(
            booking_date__gte=today,
            status__in=[Booking.Status.CONFIRMED, Booking.Status.PAID]
        ).count()
        today_bookings = Booking.objects.filter(booking_date=today).select_related('service', 'qr_code').order_by('start_time')

        # Orders Metrics
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status__in=[Order.Status.PAID, Order.Status.PROCESSING]).count()

        # Products & Inventory
        products = Product.objects.filter(is_active=True)
        low_stock_products = [p for p in products if p.is_low_stock]
        out_of_stock_products = products.filter(stock_quantity__lte=0)

        # Recent transactions
        recent_bookings = Booking.objects.all().select_related('service').order_by('-created_at')[:5]
        recent_orders = Order.objects.all().order_by('-created_at')[:5]

        return Response({
            'metrics': {
                'total_revenue': float(total_revenue),
                'total_revenue_formatted': f"₦{total_revenue:,.2f}",
                'monthly_revenue': float(monthly_revenue),
                'monthly_revenue_formatted': f"₦{monthly_revenue:,.2f}",
                'total_bookings': total_bookings,
                'upcoming_bookings': upcoming_bookings,
                'total_orders': total_orders,
                'pending_orders': pending_orders,
                'total_products': products.count(),
                'low_stock_count': len(low_stock_products),
                'out_of_stock_count': out_of_stock_products.count(),
            },
            'today_agenda': BookingDetailSerializer(today_bookings, many=True).data,
            'recent_bookings': BookingDetailSerializer(recent_bookings, many=True).data,
            'recent_orders': OrderDetailSerializer(recent_orders, many=True).data,
            'low_stock_items': ProductSerializer(low_stock_products[:5], many=True).data,
        })
