from rest_framework import serializers
from .models import ProductCategory, Product, ProductImage

class ProductCategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'products_count']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'display_order']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    effective_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'category_slug',
            'name', 'slug', 'sku', 'short_description', 'description',
            'price', 'sale_price', 'effective_price', 'stock_quantity',
            'low_stock_threshold', 'is_active', 'is_featured', 'is_session_product',
            'is_in_stock', 'is_low_stock', 'images', 'created_at', 'updated_at'
        ]
