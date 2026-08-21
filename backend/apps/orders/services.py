from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Order, OrderItem
from apps.products.models import Product
from apps.inventory.models import InventoryTransaction
from apps.payments.models import PaymentTransaction
from apps.cms.models import SiteSetting

def create_order_checkout(data: dict, user = None) -> tuple[Order, PaymentTransaction]:
    """
    Creates an E-Commerce store order with zero client trust on pricing and stock.
    Locks product records and calculates exact server-side pricing.
    """
    items_data = data.get('items', [])
    if not items_data:
        raise ValidationError("Your shopping cart is empty.")

    delivery_type = data.get('delivery_type', Order.DeliveryType.PICKUP)
    guest_email = data['guest_email'].strip().lower()

    with transaction.atomic():
        subtotal = Decimal('0.00')
        order_items_to_create = []

        for item in items_data:
            product_id = item.get('product_id') or item.get('id')
            quantity = int(item.get('quantity', 1))

            if not product_id or quantity <= 0:
                continue

            try:
                product = Product.objects.select_for_update().get(id=product_id, is_active=True)
            except Product.DoesNotExist:
                raise ValidationError(f"Product with ID {product_id} is no longer available.")

            if product.stock_quantity < quantity:
                raise ValidationError(
                    f"Insufficient stock for '{product.name}'. Only {product.stock_quantity} unit(s) remaining."
                )

            unit_price = product.effective_price
            item_subtotal = unit_price * quantity
            subtotal += item_subtotal

            order_items_to_create.append({
                'product': product,
                'product_name': product.name,
                'sku': product.sku,
                'unit_price': unit_price,
                'quantity': quantity,
                'subtotal': item_subtotal,
            })

        if not order_items_to_create:
            raise ValidationError("No valid items in the order.")

        # Determine delivery fee from dynamic SiteSettings
        if delivery_type == Order.DeliveryType.DELIVERY:
            site_settings = SiteSetting.get_settings()
            delivery_fee = Decimal(str(site_settings.delivery_flat_fee))
        else:
            delivery_fee = Decimal('0.00')

        total_amount = subtotal + delivery_fee

        order = Order.objects.create(
            user=user if (user and user.is_authenticated) else None,
            guest_name=data['guest_name'],
            guest_email=guest_email,
            guest_phone=data['guest_phone'],
            delivery_type=delivery_type,
            shipping_address=data.get('shipping_address', ''),
            shipping_city=data.get('shipping_city', ''),
            shipping_state=data.get('shipping_state', ''),
            subtotal_amount=subtotal,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            status=Order.Status.PENDING,
            payment_status=Order.PaymentStatus.UNPAID
        )

        for item_data in order_items_to_create:
            OrderItem.objects.create(
                order=order,
                product=item_data['product'],
                product_name=item_data['product_name'],
                sku=item_data['sku'],
                unit_price=item_data['unit_price'],
                quantity=item_data['quantity'],
                subtotal=item_data['subtotal']
            )

        # Create Payment Transaction
        payment_tx = PaymentTransaction.objects.create(
            user=user if (user and user.is_authenticated) else None,
            guest_email=guest_email,
            payment_type=PaymentTransaction.PaymentType.ORDER,
            order=order,
            amount=total_amount,
            currency='NGN',
            status=PaymentTransaction.Status.PENDING
        )

    return order, payment_tx


def finalize_order_payment(order: Order, paystack_ref: str = None) -> Order:
    """
    Finalizes an order upon payment confirmation.
    Transitions status to PAID, deducts stock, creates inventory ledger entries, and queues receipt emails.
    """
    with transaction.atomic():
        order = Order.objects.select_for_update().get(id=order.id)
        if order.payment_status == Order.PaymentStatus.PAID:
            return order  # Idempotent return

        order.status = Order.Status.PAID
        order.payment_status = Order.PaymentStatus.PAID
        order.save()

        # Deduct inventory & record audit ledger
        for item in order.items.all():
            product = Product.objects.select_for_update().get(id=item.product.id)
            prev_stock = product.stock_quantity
            product.stock_quantity = max(0, product.stock_quantity - item.quantity)
            product.save()

            InventoryTransaction.objects.create(
                product=product,
                transaction_type=InventoryTransaction.TransactionType.SALE,
                quantity_delta=-item.quantity,
                previous_stock=prev_stock,
                new_stock=product.stock_quantity,
                reference=order.order_reference,
                reason=f"Store Sale Order {order.order_reference}"
            )

        # Send confirmation email
        from apps.notifications.tasks import send_transactional_email_task
        send_transactional_email_task(
            email_type='ORDER_CONFIRMATION',
            recipient_email=order.guest_email,
            recipient_name=order.guest_name,
            subject=f"Order Confirmed — AGAMOS Beauty Store ({order.order_reference})",
            context_data={
                'order_reference': order.order_reference,
                'client_name': order.guest_name,
                'delivery_type': order.get_delivery_type_display(),
                'total_amount': f"₦{order.total_amount:,.2f}",
                'items_count': order.items.count()
            }
        )

    return order
