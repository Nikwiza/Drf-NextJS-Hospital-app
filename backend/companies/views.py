from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .models import Company
from .serializers import CompanyFullSerializer, CompanyProfileSerializer, CompanyUpdateSerializer
from equipment.serializers import EquipmentSerializer
from equipment.models import Equipment

class CompanyListView(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyFullSerializer

class CompanyProfileView(generics.RetrieveAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyProfileSerializer
    lookup_field = 'pk'

class CompanyUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyUpdateSerializer
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error during update: {e}")
            return Response({"error": "Internal Server Error"}, status=500)

class EquipmentListView(generics.ListAPIView):
    serializer_class = EquipmentSerializer

    def get_queryset(self):
        company_id = self.kwargs['pk']
        try:
            company = Company.objects.get(id=company_id)
            equipment_list = company.equipment.all()
            return equipment_list
        except Company.DoesNotExist:
            return Equipment.objects.none()
        
class AddEquipmentToCompanyView(generics.UpdateAPIView):
    serializer_class = CompanyFullSerializer

    def update(self, request, *args, **kwargs):
        company_id = kwargs.get('company_pk')
        equipment_id = kwargs.get('equipment_pk')
        try:
            company = Company.objects.get(pk=company_id)
            equipment = Equipment.objects.get(pk=equipment_id)
            company.equipment.add(equipment)
            return Response({"detail": "Equipment added successfully"})
        except Company.DoesNotExist or Equipment.DoesNotExist:
            return Response({"error": "Company or Equipments not found"}, status=404)
        except Exception as e:
            print(f"Error during add equipment: {e}")
            return Response({"error": "Internal Server Error"}, status=500)
        
class RemoveEquipmentFromCompanyView(generics.DestroyAPIView):
    serializer_class = CompanyFullSerializer

    def destroy(self, request, *args, **kwargs):
        company_id = kwargs.get('company_pk')
        equipment_id = kwargs.get('equipment_pk')

        try:
            company = Company.objects.get(pk = company_id)
            equipment = Equipment.objects.get(pk = equipment_id)
            company.equipment.remove(equipment)
            return Response({"detail": "Equipment removed successfully"})
        except Company.DoesNotExist or Equipment.DoesNotExist:
            return Response({"error": "Company or Equipments not found"}, status=404)
        except Exception as e:
            print(f"Error during add equipment: {e}")
            return Response({"error": "Internal Server Error"}, status=500)
