from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

# Admin ViewSets
from apps.services.views import AdminServiceViewSet, AdminServiceCategoryViewSet
from apps.products.views import AdminProductViewSet, AdminProductCategoryViewSet
from apps.bookings.views import AdminBookingViewSet
from apps.orders.views import AdminOrderViewSet
from apps.availability.views import (
    AdminWeeklyAvailabilityViewSet,
    AdminDateOverrideViewSet,
    AdminBlockedSlotViewSet
)
from apps.cms.views import AdminTestimonialViewSet, AdminSiteSettingView
from apps.accounts.admin_views import AdminDashboardMetricsView
from apps.inventory.views import (
    AdminInventoryOverviewView,
    AdminInventoryTransactionListView,
    AdminManualInventoryAdjustView
)

router = DefaultRouter()
router.register(r'admin/services', AdminServiceViewSet, basename='admin_services')
router.register(r'admin/service-categories', AdminServiceCategoryViewSet, basename='admin_service_categories')
router.register(r'admin/products', AdminProductViewSet, basename='admin_products')
router.register(r'admin/product-categories', AdminProductCategoryViewSet, basename='admin_product_categories')
router.register(r'admin/bookings', AdminBookingViewSet, basename='admin_bookings')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin_orders')
router.register(r'admin/weekly-availability', AdminWeeklyAvailabilityViewSet, basename='admin_weekly_availability')
router.register(r'admin/date-overrides', AdminDateOverrideViewSet, basename='admin_date_overrides')
router.register(r'admin/blocked-slots', AdminBlockedSlotViewSet, basename='admin_blocked_slots')
router.register(r'admin/testimonials', AdminTestimonialViewSet, basename='admin_testimonials')

urlpatterns = [
    path('django-admin/', admin.site.urls),
    
    # Domain APIs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/availability/', include('apps.availability.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/qr/', include('apps.qr_codes.urls')),
    path('api/cms/', include('apps.cms.urls')),

    # Admin Dashboard Specialized Endpoints
    path('api/admin/metrics/', AdminDashboardMetricsView.as_view(), name='admin_metrics'),
    path('api/admin/inventory/overview/', AdminInventoryOverviewView.as_view(), name='admin_inventory_overview'),
    path('api/admin/inventory/transactions/', AdminInventoryTransactionListView.as_view(), name='admin_inventory_transactions'),
    path('api/admin/inventory/adjust/', AdminManualInventoryAdjustView.as_view(), name='admin_inventory_adjust'),
    path('api/admin/cms/settings/', AdminSiteSettingView.as_view(), name='admin_cms_settings'),

    # Admin CRUD routers
    path('api/', include(router.urls)),
]

# Always serve media and static files
from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]
