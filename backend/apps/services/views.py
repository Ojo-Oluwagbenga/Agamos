from rest_framework import viewsets, generics, permissions, filters
from .models import ServiceCategory, Service
from .serializers import ServiceCategorySerializer, ServiceSerializer

class PublicServiceCategoryListView(generics.ListAPIView):
    queryset = ServiceCategory.objects.filter(is_active=True).order_by('display_order', 'name')
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


class PublicServiceListView(generics.ListAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_description', 'full_description']
    ordering_fields = ['price', 'duration_minutes', 'display_order', 'name']

    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True, category__is_active=True).select_related('category')
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() in ('true', '1'):
            queryset = queryset.filter(is_featured=True)
        return queryset


class PublicServiceDetailView(generics.RetrieveAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Service.objects.filter(is_active=True).select_related('category')


# Admin ViewSets
class AdminServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all().order_by('display_order', 'name')
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAdminUser]


class AdminServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().select_related('category').order_by('category__display_order', 'name')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category__name']
