from .serializers import EquipmentSerializer
from .models import Equipment
from rest_framework import generics

class EquipmentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer