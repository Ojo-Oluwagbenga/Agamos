from django.db import models
from django.utils.translation import gettext_lazy as _

class DayOfWeek(models.IntegerChoices):
    MONDAY = 0, _('Monday')
    TUESDAY = 1, _('Tuesday')
    WEDNESDAY = 2, _('Wednesday')
    THURSDAY = 3, _('Thursday')
    FRIDAY = 4, _('Friday')
    SATURDAY = 5, _('Saturday')
    SUNDAY = 6, _('Sunday')


class WeeklyAvailability(models.Model):
    day_of_week = models.IntegerField(choices=DayOfWeek.choices, unique=True)
    open_time = models.TimeField(default='09:00:00')
    close_time = models.TimeField(default='19:00:00')
    slot_interval_minutes = models.PositiveIntegerField(default=30, help_text="Grid step in minutes (e.g. 30 mins)")
    max_concurrent_clients = models.PositiveIntegerField(default=2, help_text="Number of clients that can be served simultaneously")
    is_active = models.BooleanField(default=True, help_text="Whether the salon/spa is open on this day of the week")

    class Meta:
        ordering = ['day_of_week']
        verbose_name_plural = 'Weekly Availabilities'

    def __str__(self):
        day_name = DayOfWeek(self.day_of_week).label
        status = f"{self.open_time.strftime('%H:%M')} - {self.close_time.strftime('%H:%M')}" if self.is_active else "Closed"
        return f"{day_name}: {status} (Max {self.max_concurrent_clients})"


class DateOverride(models.Model):
    date = models.DateField(unique=True, db_index=True)
    is_closed = models.BooleanField(default=False, help_text="Mark entire date as closed (holiday, maintenance, private event)")
    custom_open_time = models.TimeField(blank=True, null=True)
    custom_close_time = models.TimeField(blank=True, null=True)
    reason = models.CharField(max_length=255, blank=True, null=True, help_text="Reason for schedule override (e.g. Public Holiday, VIP Private Session)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        status = "Closed" if self.is_closed else f"Special Hours: {self.custom_open_time} - {self.custom_close_time}"
        return f"Override {self.date}: {status} ({self.reason or 'No reason'})"


class BlockedSlot(models.Model):
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    service = models.ForeignKey('services.Service', on_delete=models.CASCADE, null=True, blank=True, help_text="If set, blocks only this specific service; if null, blocks all services")
    reason = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"Blocked: {self.date} [{self.start_time} - {self.end_time}] ({self.reason or 'Staff Unavailable'})"
