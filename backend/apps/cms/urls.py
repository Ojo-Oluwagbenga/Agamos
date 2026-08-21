from django.urls import path
from .views import PublicCmsOverviewView, AdminSiteSettingView

urlpatterns = [
    path('content/', PublicCmsOverviewView.as_view(), name='cms_public_content'),
    path('settings/', AdminSiteSettingView.as_view(), name='cms_admin_settings'),
]
