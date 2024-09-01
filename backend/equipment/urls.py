from django.urls import path
from .views import EquipmentListCreateAPIView

urlpatterns = [
    path('', EquipmentListCreateAPIView.as_view(), name='list_create'),
]
