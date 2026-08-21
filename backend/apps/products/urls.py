from django.urls import path
from .views import (
    PublicProductCategoryListView,
    PublicProductListView,
    PublicProductDetailView
)

urlpatterns = [
    path('categories/', PublicProductCategoryListView.as_view(), name='product_categories'),
    path('', PublicProductListView.as_view(), name='product_list'),
    path('<slug:slug>/', PublicProductDetailView.as_view(), name='product_detail'),
]
