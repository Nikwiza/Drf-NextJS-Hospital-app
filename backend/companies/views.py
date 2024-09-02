from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .models import Company, CompanyEquipment, PickupSlot
from .serializers import CompanyEquipmentSerializer, CompanyFullSerializer, CompanyProfileSerializer, CompanyUpdateSerializer, PickupSlotSerializer
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
    serializer_class = CompanyEquipmentSerializer

    def get_queryset(self):
        company_id = self.kwargs['pk']
        try:
            company_equipments = CompanyEquipment.objects.filter(company_id=company_id)
            return company_equipments
        except Company.DoesNotExist:
            return Equipment.objects.none()
        
class AddEquipmentToCompanyView(generics.UpdateAPIView):
    def update(self, request, *args, **kwargs):
        company_id = kwargs.get('company_pk')
        equipment_id = kwargs.get('equipment_pk')
        quantity = request.data.get('quantity', 1)

        try:
            company = Company.objects.get(pk=company_id)
            equipment = Equipment.objects.get(pk=equipment_id)

            company_equipment, created = CompanyEquipment.objects.get_or_create(
                company=company, equipment=equipment,
                defaults={'quantity': quantity}
            )
            if not created:
                company_equipment.quantity += quantity
                company_equipment.save()

            return Response({"detail": "Equipment added successfully"})
        except Company.DoesNotExist or Equipment.DoesNotExist:
            return Response({"error": "Company or Equipment not found"}, status=404)
        except Exception as e:
            print(f"Error during add equipment: {e}")
            return Response({"error": "Internal Server Error"}, status=500)
        
class RemoveEquipmentFromCompanyView(generics.DestroyAPIView):
    def destroy(self, request, *args, **kwargs):
        company_equipment_id = kwargs.get('equipment_pk') 
        quantity_to_remove = request.data.get('quantity', 1)

        try:
            company_equipment = CompanyEquipment.objects.get(pk=company_equipment_id)

            if company_equipment.quantity > quantity_to_remove:
                company_equipment.quantity -= quantity_to_remove
                company_equipment.save()
            else:
                company_equipment.delete()

            return Response({"detail": "Equipment removed successfully"})
        except (CompanyEquipment.DoesNotExist):
            return Response({"error": "CompanyEquipment not found"}, status=404)
        except Exception as e:
            print(f"Error during remove equipment: {e}")
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
    
class CompanyEquipmentViewSet(generics.ListCreateAPIView):
    queryset = CompanyEquipment.objects.all()
    serializer_class = CompanyEquipmentSerializer
