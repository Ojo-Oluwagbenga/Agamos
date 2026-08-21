from django.db import models
from django.utils.translation import gettext_lazy as _

class InventoryTransaction(models.Model):
    class TransactionType(models.TextChoices):
        INITIAL = 'INITIAL', _('Initial Stock')
        SALE = 'SALE', _('Store Sale Order')
        RESTOCK = 'RESTOCK', _('Supplier Restock')
        ADJUSTMENT = 'ADJUSTMENT', _('Manual Audit Adjustment')
        SESSION_USAGE = 'SESSION_USAGE', _('Used In Salon Session')
        RETURN = 'RETURN', _('Customer Return')

    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='inventory_transactions')
    transaction_type = models.CharField(max_length=25, choices=TransactionType.choices)
    quantity_delta = models.IntegerField(help_text="Positive for addition, negative for deduction")
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    reference = models.CharField(max_length=100, blank=True, null=True, help_text="Order or Booking reference ID")
    performed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_adjustments'
    )
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        sign = "+" if self.quantity_delta > 0 else ""
        return f"{self.product.name}: {sign}{self.quantity_delta} units ({self.transaction_type}) -> Now {self.new_stock}"
