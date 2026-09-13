from datetime import date, time, timedelta
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from apps.services.models import ServiceCategory, Service
from apps.availability.models import WeeklyAvailability, DayOfWeek
from apps.availability.engine import calculate_available_slots
from apps.bookings.models import Booking
from apps.bookings.services import create_booking_reservation, finalize_booking_payment
from apps.products.models import ProductCategory, Product
from apps.inventory.models import InventoryTransaction
from apps.orders.models import Order
from apps.orders.services import create_order_checkout, finalize_order_payment
from apps.qr_codes.verifier import verify_and_attend_booking
from apps.qr_codes.models import BookingQRCode

User = get_user_model()

class AgamosCoreWorkflowTests(TestCase):
    def setUp(self):
        # 1. Create Admin & Customer Users
        self.admin_user = User.objects.create_superuser(
            email='admin@agamos.com',
            password='AdminPassword123!',
            first_name='Admin',
            last_name='Agamos'
        )
        self.customer_user = User.objects.create_user(
            email='vip@agamos.com',
            password='CustomerPassword123!',
            first_name='Vip',
            last_name='Customer'
        )

        # 2. Setup Weekly Availability (Mon-Sat 9AM-7PM, 30 min step, 1 client max for deterministic testing)
        for day_code, _ in DayOfWeek.choices:
            WeeklyAvailability.objects.create(
                day_of_week=day_code,
                open_time=time(9, 0),
                close_time=time(19, 0),
                slot_interval_minutes=30,
                max_concurrent_clients=1,  # Strict single client capacity for test
                is_active=True
            )

        # 3. Create Category and Service
        self.category = ServiceCategory.objects.create(
            name='Haute Hair Artistry',
            description='Luxury hair treatments'
        )
        self.service = Service.objects.create(
            category=self.category,
            name='Royal Silk Press',
            short_description='Silken hair ritual',
            full_description='Complete treatment with deep botanical steam',
            price=Decimal('45000.00'),
            duration_minutes=60,
            buffer_time_minutes=15,
            is_active=True
        )

        # 4. Create Product Category & Product
        self.prod_category = ProductCategory.objects.create(name='Hair Oils')
        self.product = Product.objects.create(
            category=self.prod_category,
            name='Imperial Hair Elixir',
            sku='AGM-ELX-001',
            short_description='Oud and 24K gold oil',
            description='Deep nourishment',
            price=Decimal('25000.00'),
            stock_quantity=10,
            low_stock_threshold=2,
            is_active=True
        )

    def test_availability_and_booking_concurrency_prevention(self):
        """Test slot calculation, reservation, and collision blocking."""
        target_date = date.today() + timedelta(days=3)

        # Check available slots
        availability = calculate_available_slots(service_id=self.service.id, target_date=target_date)
        self.assertTrue(availability['is_open'])
        self.assertTrue(len(availability['slots']) > 0)
        first_slot = availability['slots'][0]
        start_time = time.fromisoformat(first_slot['start_time'])

        # First client successfully reserves the slot
        booking_data = {
            'service_id': self.service.id,
            'booking_date': target_date,
            'start_time': start_time,
            'guest_name': 'Amara Okon',
            'guest_email': 'amara@example.com',
            'guest_phone': '+2348011112222',
        }
        booking1, payment1 = create_booking_reservation(booking_data)
        self.assertIsNotNone(booking1)
        self.assertEqual(booking1.status, Booking.Status.PENDING)
        self.assertEqual(booking1.total_amount, Decimal('45000.00'))

        # Second client attempts to reserve the SAME unavailable slot -> Must Raise ValidationError
        second_client_data = {
            'service_id': self.service.id,
            'booking_date': target_date,
            'start_time': start_time,
            'guest_name': 'Second Client',
            'guest_email': 'second@example.com',
            'guest_phone': '+2348033334444',
        }
        with self.assertRaises(ValidationError):
            create_booking_reservation(second_client_data)

    def test_payment_finalization_and_qr_verification_lifecycle(self):
        """Test payment confirmation, QR code generation, scanning, and reuse prevention."""
        target_date = date.today() + timedelta(days=2)
        booking_data = {
            'service_id': self.service.id,
            'booking_date': target_date,
            'start_time': time(14, 0),
            'guest_name': 'Zainab Bello',
            'guest_email': 'zainab@example.com',
            'guest_phone': '+2348055556666',
        }
        booking, _ = create_booking_reservation(booking_data)

        # Simulate Paystack payment success
        confirmed_booking = finalize_booking_payment(booking, paystack_ref='PAY_TEST_REF_123')
        self.assertEqual(confirmed_booking.status, Booking.Status.CONFIRMED)
        self.assertEqual(confirmed_booking.payment_status, Booking.PaymentStatus.PAID)

        # Check QR Code exists
        self.assertTrue(hasattr(confirmed_booking, 'qr_code'))
        qr_token = str(confirmed_booking.qr_code.secure_token)

        # 1. Staff scans QR code for the first time -> Must Succeed and mark ATTENDED
        scan_result = verify_and_attend_booking(token_str=qr_token, scanned_by_user=self.admin_user)
        self.assertTrue(scan_result['success'])
        self.assertEqual(scan_result['status'], 'VERIFIED_AND_ATTENDED')

        # Reload booking from DB
        confirmed_booking.refresh_from_db()
        self.assertEqual(confirmed_booking.status, Booking.Status.ATTENDED)
        self.assertTrue(confirmed_booking.qr_code.is_used)

        # 2. Staff (or malicious actor) scans the SAME QR code again -> Must Reject with ALREADY_USED
        rescan_result = verify_and_attend_booking(token_str=qr_token, scanned_by_user=self.admin_user)
        self.assertFalse(rescan_result['success'])
        self.assertEqual(rescan_result['status'], 'ALREADY_USED')

    def test_ecommerce_checkout_and_inventory_atomic_deduction(self):
        """Test e-commerce store orders, price calculation, and inventory audit deduction."""
        order_data = {
            'guest_name': 'Tola Shonibare',
            'guest_email': 'tola@example.com',
            'guest_phone': '+2348077778888',
            'delivery_type': Order.DeliveryType.DELIVERY,
            'shipping_address': 'Plot 8 Lekki Phase 1',
            'shipping_city': 'Lagos',
            'shipping_state': 'Lagos',
            'items': [
                {'product_id': self.product.id, 'quantity': 3}
            ]
        }

        order, payment_tx = create_order_checkout(order_data)
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(order.items.count(), 1)
        expected_subtotal = Decimal('25000.00') * 3  # 75,000
        self.assertEqual(order.subtotal_amount, expected_subtotal)
        self.assertEqual(order.total_amount, expected_subtotal + order.delivery_fee)

        # Finalize payment
        finalized_order = finalize_order_payment(order, paystack_ref='PAY_ORD_REF_999')
        self.assertEqual(finalized_order.status, Order.Status.PAID)

        # Check stock reduced from 10 to 7
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 7)

        # Check Inventory audit transaction
        inv_tx = InventoryTransaction.objects.filter(product=self.product, transaction_type=InventoryTransaction.TransactionType.SALE).first()
        self.assertIsNotNone(inv_tx)
        self.assertEqual(inv_tx.quantity_delta, -3)
        self.assertEqual(inv_tx.new_stock, 7)

    def test_overselling_prevention(self):
        """Test that purchasing more units than available raises ValidationError."""
        oversell_data = {
            'guest_name': 'Bulk Buyer',
            'guest_email': 'buyer@example.com',
            'guest_phone': '+2348000001111',
            'delivery_type': Order.DeliveryType.PICKUP,
            'items': [
                {'product_id': self.product.id, 'quantity': 50}  # Stock is only 10
            ]
        }
        with self.assertRaises(ValidationError):
            create_order_checkout(oversell_data)

    def test_skip_payment_order_checkout(self):
        """Test that with SKIP_PAYMENT=True, orders are directly confirmed and confirmation email dispatched."""
        from apps.notifications.models import EmailNotificationLog
        order_payload = {
            'guest_name': 'Amara Okonkwo',
            'guest_email': 'amara@example.com',
            'guest_phone': '+2348011223344',
            'delivery_type': 'PICKUP',
            'items': [
                {'product_id': self.product.id, 'quantity': 2}
            ]
        }
        initial_stock = self.product.stock_quantity
        response = self.client.post('/api/orders/checkout/', data=order_payload, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()

        # Payment should be skipped
        self.assertTrue(data['payment']['skipped'])
        self.assertIsNone(data['payment']['authorization_url'])

        # Order should be marked paid & confirmed
        self.assertEqual(data['order']['status'], 'PAID')
        self.assertEqual(data['order']['payment_status'], 'PAID')

        # Stock should be decremented by 2
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock - 2)

        # Email should be logged and sent
        email_log = EmailNotificationLog.objects.filter(
            recipient_email='amara@example.com',
            email_type='ORDER_CONFIRMATION'
        ).first()
        self.assertIsNotNone(email_log)
        self.assertEqual(email_log.status, EmailNotificationLog.Status.SENT)

    def test_skip_payment_booking_initiate(self):
        """Test that with SKIP_PAYMENT=True, bookings are directly confirmed with QR code and email dispatched."""
        from apps.notifications.models import EmailNotificationLog
        booking_payload = {
            'service_id': self.service.id,
            'booking_date': (date.today() + timedelta(days=3)).isoformat(),
            'start_time': '10:00',
            'guest_name': 'Khadijah Bello',
            'guest_email': 'khadijah@example.com',
            'guest_phone': '+2348099887766',
            'customer_notes': 'Luxury treatment prep',
            'session_products': []
        }
        response = self.client.post('/api/bookings/initiate/', data=booking_payload, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.json()

        # Payment should be skipped
        self.assertTrue(data['payment']['skipped'])
        self.assertIsNone(data['payment']['authorization_url'])

        # Booking should be confirmed and paid
        self.assertEqual(data['booking']['status'], 'CONFIRMED')
        self.assertEqual(data['booking']['payment_status'], 'PAID')

        # Booking QR code must exist
        booking_ref = data['booking']['booking_reference']
        booking_obj = Booking.objects.get(booking_reference=booking_ref)
        self.assertTrue(hasattr(booking_obj, 'qr_code'))

        # Email should be logged and sent
        email_log = EmailNotificationLog.objects.filter(
            recipient_email='khadijah@example.com',
            email_type='BOOKING_CONFIRMATION'
        ).first()
        self.assertIsNotNone(email_log)
        self.assertEqual(email_log.status, EmailNotificationLog.Status.SENT)

