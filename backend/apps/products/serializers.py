from rest_framework import serializers
from .models import ProductCategory, Product, ProductImage

class ProductCategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'products_count']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'display_order']

    def get_image(self, obj):
        if not obj.image:
            return None
        img_str = str(obj.image)
        if img_str.startswith(('http://', 'https://', 'data:')):
            return img_str
        try:
            url = obj.image.url
            request = self.context.get('request')
            if request and not url.startswith(('http://', 'https://')):
                return request.build_absolute_uri(url)
            return url
        except Exception:
            return img_str


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    image_url = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    primary_image = serializers.SerializerMethodField()
    short_description = serializers.CharField(required=False, allow_blank=True, default='')
    description = serializers.CharField(required=False, allow_blank=True, default='')
    sku = serializers.CharField(required=False, allow_blank=True)
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
            'is_in_stock', 'is_low_stock', 'images', 'primary_image', 'image', 'image_url',
            'created_at', 'updated_at'
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if not primary or not primary.image:
            return None
        img_str = str(primary.image)
        if img_str.startswith(('http://', 'https://', 'data:')):
            return img_str
        try:
            url = primary.image.url
            request = self.context.get('request')
            if request and not url.startswith(('http://', 'https://')):
                return request.build_absolute_uri(url)
            return url
        except Exception:
            return img_str

    def create(self, validated_data):
        image_file = validated_data.pop('image', None)
        image_url = validated_data.pop('image_url', None)
        product = Product.objects.create(**validated_data)
        
        if image_file:
            ProductImage.objects.create(product=product, image=image_file, is_primary=True)
        elif image_url:
            ProductImage.objects.create(product=product, image=image_url, is_primary=True)
            
        return product

    def update(self, instance, validated_data):
        image_file = validated_data.pop('image', None)
        image_url = validated_data.pop('image_url', None)
        
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        
        if image_file:
            instance.images.filter(is_primary=True).update(is_primary=False)
            ProductImage.objects.create(product=instance, image=image_file, is_primary=True)
        elif image_url:
            instance.images.filter(is_primary=True).update(is_primary=False)
            ProductImage.objects.create(product=instance, image=image_url, is_primary=True)
            
        return instance
