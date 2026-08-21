from django.urls import path
from .views import (
    PublicServiceCategoryListView,
    PublicServiceListView,
    PublicServiceDetailView
)

urlpatterns = [
    path('categories/', PublicServiceCategoryListView.as_view(), name='service_categories'),
    path('', PublicServiceListView.as_view(), name='service_list'),
    path('<slug:slug>/', PublicServiceDetailView.as_view(), name='service_detail'),
]
