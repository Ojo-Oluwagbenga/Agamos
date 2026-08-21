from rest_framework import serializers
from .models import ServiceCategory, Service

class ServiceCategorySerializer(serializers.ModelSerializer):
    services_count = serializers.IntegerField(source='services.count', read_only=True)

    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'display_order', 'is_active', 'services_count']


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'category', 'category_name', 'category_slug',
            'name', 'slug', 'short_description', 'full_description',
            'price', 'duration_minutes', 'buffer_time_minutes',
            'image', 'is_active', 'is_featured', 'created_at', 'updated_at'
        ]
