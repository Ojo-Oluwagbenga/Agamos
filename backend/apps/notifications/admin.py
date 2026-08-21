from django.contrib import admin
from .models import EmailNotificationLog

@admin.register(EmailNotificationLog)
class EmailNotificationLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient_email', 'email_type', 'subject', 'status', 'created_at', 'sent_at')
    list_filter = ('status', 'email_type', 'created_at')
    search_fields = ('recipient_email', 'recipient_name', 'subject', 'booking_reference', 'order_reference', 'error_message')
    readonly_fields = ('created_at', 'sent_at', 'error_message')
