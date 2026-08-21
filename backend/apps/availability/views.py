from datetime import datetime
from rest_framework import views, viewsets, permissions, status
from rest_framework.response import Response
from .models import WeeklyAvailability, DateOverride, BlockedSlot
from .serializers import WeeklyAvailabilitySerializer, DateOverrideSerializer, BlockedSlotSerializer
from .engine import calculate_available_slots

class AvailableSlotsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        service_id = request.query_params.get('service_id')
        date_str = request.query_params.get('date')

        if not service_id or not date_str:
            return Response(
                {'error': 'Both service_id and date (YYYY-MM-DD) query parameters are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Expected YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = calculate_available_slots(service_id=int(service_id), target_date=target_date)
        return Response(result, status=status.HTTP_200_OK)


# Admin Viewsets
class AdminWeeklyAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = WeeklyAvailability.objects.all().order_by('day_of_week')
    serializer_class = WeeklyAvailabilitySerializer
    permission_classes = [permissions.IsAdminUser]


class AdminDateOverrideViewSet(viewsets.ModelViewSet):
    queryset = DateOverride.objects.all().order_by('-date')
    serializer_class = DateOverrideSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminBlockedSlotViewSet(viewsets.ModelViewSet):
    queryset = BlockedSlot.objects.all().select_related('service').order_by('-date', 'start_time')
    serializer_class = BlockedSlotSerializer
    permission_classes = [permissions.IsAdminUser]
