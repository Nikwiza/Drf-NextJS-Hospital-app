from django.urls import path
from .views import EquipmentListCreateAPIView, EquipmentWithCompaniesListView

urlpatterns = [
    path('', EquipmentListCreateAPIView.as_view(), name='list_create'),
    path('equipment-with-companies/', EquipmentWithCompaniesListView.as_view(), name='equipment-with-companies'),
]
