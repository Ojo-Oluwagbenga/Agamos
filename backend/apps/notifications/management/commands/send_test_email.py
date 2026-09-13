from django.core.management.base import BaseCommand
from django.conf import settings
from apps.notifications.tasks import send_transactional_email_task
from apps.notifications.models import EmailNotificationLog

class Command(BaseCommand):
    help = "Test the free mailing system by sending a test luxury transactional email"

    def add_arguments(self, parser):
        parser.add_argument(
            'recipient',
            type=str,
            nargs='?',
            default='test@agamos.com',
            help='Recipient email address to test delivery'
        )

    def handle(self, *args, **options):
        recipient = options['recipient']
        self.stdout.write(f"Testing free mailing system with backend: {getattr(settings, 'EMAIL_BACKEND', 'unknown')}")
        self.stdout.write(f"Host: {getattr(settings, 'EMAIL_HOST', 'N/A')}:{getattr(settings, 'EMAIL_PORT', 'N/A')} (TLS: {getattr(settings, 'EMAIL_USE_TLS', False)}, SSL: {getattr(settings, 'EMAIL_USE_SSL', False)})")
        self.stdout.write(f"From: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'N/A')}")
        self.stdout.write(f"Dispatching test message to {recipient}...")

        send_transactional_email_task(
            email_type='ORDER_CONFIRMATION',
            recipient_email=recipient,
            recipient_name='Valued AGAMOS Guest',
            subject="Welcome to AGAMOS — Free Mailing System Verified",
            context_data={
                'order_reference': 'TEST-DISPATCH-001',
                'delivery_type': 'Store Pickup (Victoria Island Flagship)',
                'total_amount': '₦0.00',
                'items_count': 1,
                'items': [
                    {
                        'name': 'Bespoke Welcome Diagnostic Formulation',
                        'quantity': 1,
                        'subtotal': '₦0.00'
                    }
                ]
            }
        )

        last_log = EmailNotificationLog.objects.filter(recipient_email=recipient).order_by('-created_at').first()
        if last_log and last_log.status == EmailNotificationLog.Status.SENT:
            self.stdout.write(self.style.SUCCESS(f"Successfully dispatched test email to {recipient}! Log ID: {last_log.id}"))
        elif last_log:
            self.stdout.write(self.style.WARNING(f"Email task logged status: {last_log.status}. Error: {last_log.error_message}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Email task completed for {recipient}."))
