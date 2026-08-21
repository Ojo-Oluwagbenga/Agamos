from rest_framework import viewsets, generics, permissions, filters
from .models import ProductCategory, Product, ProductImage
from .serializers import ProductCategorySerializer, ProductSerializer, ProductImageSerializer

class PublicProductCategoryListView(generics.ListAPIView):
    queryset = ProductCategory.objects.filter(is_active=True).order_by('name')
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.AllowAny]


class PublicProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_description', 'description', 'sku']
    ordering_fields = ['price', 'created_at', 'name', 'stock_quantity']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True, category__is_active=True).select_related('category').prefetch_related('images')
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() in ('true', '1'):
            queryset = queryset.filter(is_featured=True)
        session_only = self.request.query_params.get('session_product')
        if session_only and session_only.lower() in ('true', '1'):
            queryset = queryset.filter(is_session_product=True)
        return queryset


class PublicProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')


# Admin ViewSets
class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('category').prefetch_related('images').order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'sku', 'category__name']


class AdminProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all().order_by('name')
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.IsAdminUser]
