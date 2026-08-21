import uuid
from django.db import models
from django.utils.text import slugify

class ProductCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='product_categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Product Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, blank=True, db_index=True)
    short_description = models.CharField(max_length=300, blank=True, default='', help_text="Short subtitle for luxury cards")
    description = models.TextField(blank=True, default='', help_text="Detailed ingredients, usage guide, and fragrance notes")
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Regular price in NGN")
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, help_text="Optional discounted price in NGN")
    stock_quantity = models.IntegerField(default=0, help_text="Available units in stock")
    low_stock_threshold = models.PositiveIntegerField(default=5, help_text="Alert threshold for admin dashboard")
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False)
    is_session_product = models.BooleanField(default=True, help_text="Can be added to in-salon sessions")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.sku:
            self.sku = f"AGM-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    @property
    def effective_price(self):
        return self.sale_price if self.sale_price and self.sale_price > 0 else self.price

    @property
    def is_in_stock(self):
        return self.stock_quantity > 0

    @property
    def is_low_stock(self):
        return 0 < self.stock_quantity <= self.low_stock_threshold

    def __str__(self):
        return f"{self.name} ({self.sku}) - ₦{self.effective_price:,.2f}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'display_order', 'id']

    def __str__(self):
        return f"Image for {self.product.name} (Primary: {self.is_primary})"
