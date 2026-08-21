from django.urls import path
from .views import (
    InitiateBookingView,
    BookingDetailByRefView,
    CancelBookingView,
    CustomerBookingListView
)

urlpatterns = [
    path('initiate/', InitiateBookingView.as_view(), name='booking_initiate'),
    path('my-bookings/', CustomerBookingListView.as_view(), name='customer_bookings'),
    path('<str:reference>/', BookingDetailByRefView.as_view(), name='booking_detail'),
    path('<str:reference>/cancel/', CancelBookingView.as_view(), name='booking_cancel'),
]
