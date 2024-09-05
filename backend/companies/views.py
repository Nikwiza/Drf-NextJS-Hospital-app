from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .models import Company, CompanyEquipment, PickupSlot
from .serializers import CompanyEquipmentSerializer, CompanyFullSerializer, CompanyProfileSerializer, CompanyUpdateSerializer, PickupSlotSerializer, PickupSlotSerializerCreate
from equipment.serializers import EquipmentSerializer
from equipment.models import Equipment
from user.models import Account
from user.serializers import ReservedUsersSerializer
from rest_framework.permissions import IsAuthenticated
from profiles.permissions import IsCompanyAdmin
from django.core.mail import send_mail
from django.conf import settings


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
    serializer_class = PickupSlotSerializerCreate

    def perform_create(self, serializer):
        administrator = self.request.user.companyadministrator
        serializer.save(administrator=administrator, company=administrator.company)

        return Response(serializer.data)

class PickupSlotReserveView(generics.UpdateAPIView):
    queryset = PickupSlot.objects.all()
    serializer_class = PickupSlotSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.reserved_by is not None:
            return Response({"error": "Slot already reserved"}, status=400)

        instance.reserved_by = request.user
        reserved_equipment = request.data.get('reserved_equipment', [])
        instance.reserved_equipment = reserved_equipment
        instance.save()
        return Response({"detail": "Slot reserved successfully"})
    
class ReservedUsersListView(generics.ListAPIView):
    serializer_class = ReservedUsersSerializer

    def get_queryset(self):
        company_id = self.kwargs['pk']     
        try:
            company = Company.objects.get(id=company_id)
            pickup_slots = PickupSlot.objects.filter(company=company, reserved_by__isnull=False)
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

class ReservedPickupSlotsView(generics.ListAPIView):
    serializer_class = PickupSlotSerializer
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def get_queryset(self):
        return PickupSlot.objects.filter(
            administrator=self.request.user.companyadministrator,
            reserved_by__isnull=False,
            is_expired=False,
            is_picked_up=False
        )
        
class RemoveCompanyEquipmentByQuantityView(generics.DestroyAPIView):
    def destroy(self, request, *args, **kwargs):
        company_id = kwargs.get('company_id')
        equipment_id = kwargs.get('equipment_id')
        quantity_to_remove = request.data.get('quantity', 1)

        try:
            company_equipment = CompanyEquipment.objects.get(
                company_id=company_id, equipment_id=equipment_id
            )

            if company_equipment.quantity > quantity_to_remove:
                company_equipment.quantity -= quantity_to_remove
                company_equipment.save()
            else:
                company_equipment.delete()

            return Response({"detail": "Equipment removed successfully"})
        except CompanyEquipment.DoesNotExist:
            return Response({"error": "CompanyEquipment not found"}, status=404)
        except Exception as e:
            print(f"Error during removing equipment: {e}")
            return Response({"error": "Internal Server Error"}, status=500)
        
class ConfirmPickupView(generics.UpdateAPIView):
    queryset = PickupSlot.objects.all()
    serializer_class = PickupSlotSerializer 

    def patch(self, request, *args, **kwargs):
        slot_id = kwargs.get('pk')
        
        try:
            pickup_slot = PickupSlot.objects.get(id=slot_id)

            company = pickup_slot.company
            reserved_equipment = pickup_slot.reserved_equipment
            
            for equipment_item in reserved_equipment:
                equipment_id = equipment_item.get('equipment_id')
                quantity = equipment_item.get('quantity')

                if not isinstance(equipment_id, int) or not isinstance(quantity, int):
                    return Response({"error": "Invalid equipment data"}, status=400)

                try:
                    company_equipment = CompanyEquipment.objects.get(company=company, equipment_id=equipment_id)
                    
                    if company_equipment.quantity >= quantity:
                        company_equipment.quantity -= quantity
                        company_equipment.save()
                    else:
                        return Response({"error": f"Not enough equipment (ID: {equipment_id}) to remove"}, status=400)
            
            
                except CompanyEquipment.DoesNotExist:
                    return Response({"error": f"CompanyEquipment with equipment_id {equipment_id} not found"}, status=404)
                
            pickup_slot.is_picked_up = True
            pickup_slot.save()

            
            #self.send_confirmation_email(pickup_slot)

            return Response({"detail": "Pickup confirmed and equipment updated"}, status=200)
        except PickupSlot.DoesNotExist:
            return Response({"error": "PickupSlot not found"}, status=404)
        except Exception as e:
            print(f"Error during confirming pickup: {e}")
            return Response({"error": "Internal Server Error"}, status=500)


    def send_confirmation_email(self, pickup_slot):
        user_email = pickup_slot.reserved_by.email
        subject = "Equipment Pickup Confirmation"
        message = f"Dear {pickup_slot.reserved_by.name},\n\nYou have successfully picked up the following equipment: {pickup_slot.reserved_equipment}. Thank you!\n\nBest regards,\nYour Company."

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )