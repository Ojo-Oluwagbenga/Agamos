from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import CustomerProfile

User = get_user_model()

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ['phone', 'address', 'is_suspended_from_booking', 'no_show_count', 'notes', 'avatar']
        read_only_fields = ['is_suspended_from_booking', 'no_show_count']


class UserSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'profile', 'date_joined']
        read_only_fields = ['id', 'role', 'date_joined']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data:
            profile, _ = CustomerProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone', 'address']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=phone,
            role=User.Role.CUSTOMER
        )
        
        CustomerProfile.objects.create(
            user=user,
            phone=phone,
            address=address
        )

        # Retroactively link past guest bookings and orders with this email
        from apps.bookings.models import Booking
        from apps.orders.models import Order
        Booking.objects.filter(guest_email__iexact=user.email, user__isnull=True).update(user=user)
        Order.objects.filter(guest_email__iexact=user.email, user__isnull=True).update(user=user)

        return user


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(required=True, help_text="Google ID Token / Credential string")
