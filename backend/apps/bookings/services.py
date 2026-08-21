from datetime import datetime, timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Booking, BookingItemProduct
from apps.services.models import Service
from apps.products.models import Product
from apps.accounts.models import User, CustomerProfile
from apps.availability.engine import calculate_available_slots
from apps.payments.models import PaymentTransaction
from apps.qr_codes.generator import generate_booking_qr_code

def create_booking_reservation(data: dict, user: User = None) -> tuple[Booking, PaymentTransaction]:
    """
    Creates an appointment booking inside an atomic database transaction.
    Enforces concurrency availability, recalculates all prices, and creates a payment transaction.
    """
    service_id = data['service_id']
    booking_date = data['booking_date']
    start_time = data['start_time']
    guest_email = data['guest_email'].strip().lower()

    with transaction.atomic():
        # 1. Check No-Show suspension for registered or guest customer
        if user and hasattr(user, 'profile') and user.profile.is_suspended_from_booking:
            raise ValidationError("Your booking privileges are temporarily suspended due to an unexcused no-show. Please contact the concierge or select the next available slot.")

        past_no_show = Booking.objects.filter(
            guest_email__iexact=guest_email,
            status=Booking.Status.NO_SHOW
        ).exists()
        if past_no_show and not user:
            # Guest check
            profile_user = User.objects.filter(email__iexact=guest_email).first()
            if profile_user and hasattr(profile_user, 'profile') and profile_user.profile.is_suspended_from_booking:
                raise ValidationError("Your booking privileges are suspended due to a previous no-show. Please contact AGAMOS concierge.")

        # 2. Fetch service
        try:
            service = Service.objects.select_for_update().get(id=service_id, is_active=True)
        except Service.DoesNotExist:
            raise ValidationError("The requested luxury treatment is currently unavailable.")

        # 3. Concurrency check: recalculate available slots for this date and time
        availability_result = calculate_available_slots(service_id=service.id, target_date=booking_date)
        if not availability_result['is_open']:
            raise ValidationError(availability_result.get('reason', 'AGAMOS is closed on this date.'))

        start_time_str = start_time.strftime('%H:%M')
        slot_matched = False
        for slot in availability_result['slots']:
            if slot['start_time'] == start_time_str:
                slot_matched = True
                break

        if not slot_matched:
            raise ValidationError(f"The slot at {start_time_str} is no longer available. Please choose another time.")

        # 4. Calculate end time
        treatment_duration = timedelta(minutes=service.duration_minutes)
        start_dt = datetime.combine(booking_date, start_time)
        end_time = (start_dt + treatment_duration).time()

        # 5. Calculate pricing from database (Zero Client Trust)
        service_price = service.price
        addon_total = Decimal('0.00')

        # 6. Create Booking record with 15-minute hold
        hold_expiry = timezone.now() + timedelta(minutes=15)

        booking = Booking.objects.create(
            user=user if (user and user.is_authenticated) else None,
            guest_name=data['guest_name'],
            guest_email=guest_email,
            guest_phone=data['guest_phone'],
            guest_address=data.get('guest_address', ''),
            service=service,
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_time,
            status=Booking.Status.PENDING,
            payment_status=Booking.PaymentStatus.UNPAID,
            service_price=service_price,
            product_addon_total=Decimal('0.00'),
            total_amount=service_price,
            hold_expires_at=hold_expiry,
            customer_notes=data.get('customer_notes', ''),
        )

        # 7. Process optional session products
        session_products = data.get('session_products', [])
        for sp in session_products:
            p_id = sp.get('product_id') or sp.get('id')
            qty = int(sp.get('quantity', 1))
            if p_id and qty > 0:
                try:
                    product = Product.objects.select_for_update().get(id=p_id, is_active=True)
                    if product.stock_quantity >= qty:
                        unit_p = product.effective_price
                        item_subtotal = unit_p * qty
                        addon_total += item_subtotal

                        BookingItemProduct.objects.create(
                            booking=booking,
                            product=product,
                            quantity=qty,
                            unit_price=unit_p
                        )
                except Product.DoesNotExist:
                    pass

        # Update final amounts
        booking.product_addon_total = addon_total
        booking.total_amount = service_price + addon_total
        booking.save()

        # 8. Create Payment Transaction
        payment_tx = PaymentTransaction.objects.create(
            user=user if (user and user.is_authenticated) else None,
            guest_email=guest_email,
            payment_type=PaymentTransaction.PaymentType.BOOKING,
            booking=booking,
            amount=booking.total_amount,
            currency='NGN',
            status=PaymentTransaction.Status.PENDING
        )

    return booking, payment_tx


def finalize_booking_payment(booking: Booking, paystack_ref: str = None) -> Booking:
    """
    Called upon successful Paystack payment confirmation.
    Transitions booking to PAID/CONFIRMED, generates QR code, reduces session product inventory, and queues confirmation emails.
    """
    with transaction.atomic():
        booking = Booking.objects.select_for_update().get(id=booking.id)
        if booking.payment_status == Booking.PaymentStatus.PAID:
            return booking  # Idempotent return

        booking.status = Booking.Status.CONFIRMED
        booking.payment_status = Booking.PaymentStatus.PAID
        booking.hold_expires_at = None
        booking.save()

        # Deduct inventory for any session products
        from apps.inventory.models import InventoryTransaction
        for item in booking.session_products.all():
            product = Product.objects.select_for_update().get(id=item.product.id)
            prev_stock = product.stock_quantity
            product.stock_quantity = max(0, product.stock_quantity - item.quantity)
            product.save()

            InventoryTransaction.objects.create(
                product=product,
                transaction_type=InventoryTransaction.TransactionType.SESSION_USAGE,
                quantity_delta=-item.quantity,
                previous_stock=prev_stock,
                new_stock=product.stock_quantity,
                reference=booking.booking_reference,
                reason=f"Used in Booking Session {booking.booking_reference}"
            )

        # Generate Secure QR Code
        generate_booking_qr_code(booking)

        # Send confirmation email
        from apps.notifications.tasks import send_transactional_email_task
        send_transactional_email_task(
            email_type='BOOKING_CONFIRMATION',
            recipient_email=booking.guest_email,
            recipient_name=booking.guest_name,
            subject=f"Booking Confirmed — AGAMOS Luxury Experience ({booking.booking_reference})",
            context_data={
                'booking_reference': booking.booking_reference,
                'client_name': booking.guest_name,
                'service_name': booking.service.name,
                'booking_date': booking.booking_date.strftime('%B %d, %Y'),
                'booking_time': booking.start_time.strftime('%I:%M %p'),
                'total_amount': f"₦{booking.total_amount:,.2f}",
                'qr_token': str(booking.qr_code.secure_token) if hasattr(booking, 'qr_code') else ''
            }
        )

    return booking
