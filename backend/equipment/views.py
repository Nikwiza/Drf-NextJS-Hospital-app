from .serializers import EquipmentSerializer
from .models import Equipment
from rest_framework import generics
from companies.serializers import EquipmentWithCompaniesListSerializer

class EquipmentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer


class EquipmentWithCompaniesListView(generics.ListAPIView):
    queryset = Equipment.objects.prefetch_related('companyequipment_set__company')
    serializer_class = EquipmentWithCompaniesListSerializer