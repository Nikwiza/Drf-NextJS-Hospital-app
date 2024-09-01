from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .models import Company, PickupSlot
from .serializers import CompanyFullSerializer, CompanyProfileSerializer, CompanyUpdateSerializer, PickupSlotSerializer
from equipment.serializers import EquipmentSerializer
from equipment.models import Equipment
from user.models import Account
from user.serializers import ReservedUsersSerializer

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

class PickupSlotListView(generics.ListCreateAPIView):
    queryset = PickupSlot.objects.all()
    serializer_class = PickupSlotSerializer
        
class CreatePickupSlotView(generics.CreateAPIView):
    queryset = PickupSlot.objects.all()
    serializer_class = PickupSlotSerializer

    def perform_create(self, serializer):
        administrator = self.request.user.companyadministrator
        serializer.save(administrator=administrator, company=administrator.company)

        return Response(serializer.data)

class PickupSlotReserveView(generics.UpdateAPIView):
    queryset = PickupSlot.objects.all()
    serializer_class = PickupSlotSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_reserved:
            return Response({"error": "Slot already reserved"}, status=400)

        instance.is_reserved = True
        instance.save()
        return Response({"detail": "Slot reserved successfully"})
    
class ReservedUsersListView(generics.ListAPIView):
    serializer_class = ReservedUsersSerializer

    def get_queryset(self):
        company_id = self.kwargs['pk']     
        try:
            company = Company.objects.get(id=company_id)
            pickup_slots = PickupSlot.objects.filter(company=company, is_reserved=True)
            reserved_users = Account.objects.filter(id__in=[slot.administrator.account.id for slot in pickup_slots])
            return reserved_users
        except Company.DoesNotExist:
            return Response({"error": "Company not found"}, status=404)
        
class WorkCalendarListView(generics.ListAPIView):
    serializer_class = PickupSlotSerializer

    def get_queryset(self):
        company_id = self.kwargs['pk']
        return PickupSlot.objects.filter(company_id=company_id).order_by('date', 'time')
