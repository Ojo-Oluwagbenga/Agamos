from django.urls import path
from .views import (
    AdminInventoryOverviewView,
    AdminInventoryTransactionListView,
    AdminManualInventoryAdjustView
)

urlpatterns = [
    path('overview/', AdminInventoryOverviewView.as_view(), name='inventory_overview'),
    path('transactions/', AdminInventoryTransactionListView.as_view(), name='inventory_transactions'),
    path('adjust/', AdminManualInventoryAdjustView.as_view(), name='inventory_adjust'),
]
