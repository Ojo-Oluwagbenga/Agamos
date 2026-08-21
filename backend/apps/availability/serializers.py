from rest_framework import serializers
from .models import WeeklyAvailability, DateOverride, BlockedSlot

class WeeklyAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = WeeklyAvailability
        fields = ['id', 'day_of_week', 'day_name', 'open_time', 'close_time', 'slot_interval_minutes', 'max_concurrent_clients', 'is_active']


class DateOverrideSerializer(serializers.ModelSerializer):
    class Meta:
        model = DateOverride
        fields = ['id', 'date', 'is_closed', 'custom_open_time', 'custom_close_time', 'reason', 'created_at']


class BlockedSlotSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = BlockedSlot
        fields = ['id', 'date', 'start_time', 'end_time', 'service', 'service_name', 'reason', 'created_at']
