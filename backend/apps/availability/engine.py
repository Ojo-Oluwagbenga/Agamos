from datetime import datetime, date, time, timedelta
from django.utils import timezone
from .models import WeeklyAvailability, DateOverride, BlockedSlot
from apps.services.models import Service
from apps.bookings.models import Booking

def calculate_available_slots(service_id: int, target_date: date) -> dict:
    """
    Computes real-time available appointment slots for a given service and date.
    Enforces business hours, buffer times, blocked dates/slots, and max concurrent capacity.
    """
    try:
        service = Service.objects.get(id=service_id, is_active=True)
    except Service.DoesNotExist:
        return {'is_open': False, 'reason': 'Service not found or inactive.', 'slots': []}

    # 1. Check DateOverride
    override = DateOverride.objects.filter(date=target_date).first()
    if override and override.is_closed:
        return {
            'is_open': False,
            'reason': override.reason or 'AGAMOS is closed on this date for a private event or holiday.',
            'slots': []
        }

    # 2. Check Weekly Schedule
    weekday = target_date.weekday()
    weekly_schedule = WeeklyAvailability.objects.filter(day_of_week=weekday).first()
    
    if not weekly_schedule or not weekly_schedule.is_active:
        return {'is_open': False, 'reason': 'AGAMOS is closed on this day of the week.', 'slots': []}

    # Determine open & close hours
    open_time = (override.custom_open_time if override and override.custom_open_time else weekly_schedule.open_time)
    close_time = (override.custom_close_time if override and override.custom_close_time else weekly_schedule.close_time)
    slot_step_mins = weekly_schedule.slot_interval_minutes or 30
    max_capacity = weekly_schedule.max_concurrent_clients or 2

    # Total duration needed for this treatment (duration + turnover buffer)
    total_service_mins = service.duration_minutes + service.buffer_time_minutes
    treatment_delta = timedelta(minutes=service.duration_minutes)
    total_delta = timedelta(minutes=total_service_mins)

    open_dt = datetime.combine(target_date, open_time)
    close_dt = datetime.combine(target_date, close_time)

    # 3. Fetch Blocked Slots
    blocked_slots = BlockedSlot.objects.filter(
        date=target_date
    ).filter(
        models_or_service=service
    ) if hasattr(BlockedSlot.objects, 'models_or_service') else BlockedSlot.objects.filter(
        date=target_date
    ).filter(models_filter=(models.Q(service=service) | models.Q(service__isnull=True))) if False else BlockedSlot.objects.filter(
        date=target_date
    )

    from django.db.models import Q
    blocked_slots = BlockedSlot.objects.filter(
        date=target_date
    ).filter(Q(service=service) | Q(service__isnull=True))

    # 4. Fetch Active Bookings on this date
    # Valid bookings are: PAID, CONFIRMED, ATTENDED, or PENDING with valid non-expired hold
    now = timezone.now()
    active_bookings = Booking.objects.filter(
        booking_date=target_date
    ).exclude(
        status__in=[Booking.Status.CANCELLED, Booking.Status.NO_SHOW]
    )

    # Filter out expired pending holds
    valid_bookings = []
    for b in active_bookings:
        if b.status == Booking.Status.PENDING:
            if b.hold_expires_at and b.hold_expires_at < now:
                continue  # expired hold, slot is freed
        valid_bookings.append(b)

    # 5. Generate Candidate Slots
    candidate_dt = open_dt
    available_slots = []

    # Current local time comparison for today's bookings
    local_now = timezone.localtime(now)
    is_today = (target_date == local_now.date())
    min_advance_time = local_now + timedelta(minutes=30)  # Require at least 30 mins lead time

    while candidate_dt + total_delta <= close_dt:
        slot_start = candidate_dt.time()
        slot_treatment_end = (candidate_dt + treatment_delta).time()
        slot_end_with_buffer = (candidate_dt + total_delta).time()

        # Check if in the past for today
        if is_today and candidate_dt < min_advance_time:
            candidate_dt += timedelta(minutes=slot_step_mins)
            continue

        # Check if overlaps with any BlockedSlot
        is_blocked = False
        for b_slot in blocked_slots:
            if not (slot_end_with_buffer <= b_slot.start_time or slot_start >= b_slot.end_time):
                is_blocked = True
                break

        if is_blocked:
            candidate_dt += timedelta(minutes=slot_step_mins)
            continue

        # Check concurrent bookings collision
        concurrent_count = 0
        for booking in valid_bookings:
            # Overlap condition: not (slot_end <= booking_start or slot_start >= booking_end)
            if not (slot_treatment_end <= booking.start_time or slot_start >= booking.end_time):
                concurrent_count += 1

        if concurrent_count < max_capacity:
            available_slots.append({
                'start_time': slot_start.strftime('%H:%M'),
                'end_time': slot_treatment_end.strftime('%H:%M'),
                'duration_minutes': service.duration_minutes,
                'available_capacity': max_capacity - concurrent_count
            })

        candidate_dt += timedelta(minutes=slot_step_mins)

    return {
        'is_open': True,
        'date': target_date.strftime('%Y-%m-%d'),
        'service_id': service.id,
        'service_name': service.name,
        'price': str(service.price),
        'slots': available_slots
    }
