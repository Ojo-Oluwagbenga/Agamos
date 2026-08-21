from rest_framework import serializers
from .models import SiteSetting, Testimonial

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = '__all__'


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'client_name', 'client_title', 'quote', 'rating', 'avatar', 'is_featured', 'display_order', 'created_at']
