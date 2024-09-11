from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response

from profiles.models import CompanyAdministrator
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
from datetime import timedelta, datetime
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError



class CompanyListView(generics.ListCreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyFullSerializer

class CompanyProfileView(generics.RetrieveAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanyProfileSerializer
    lookup_field = 'pk'

class CompanyUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
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
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

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
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    @transaction.atomic       
    def destroy(self, request, *args, **kwargs):
        company_equipment_id = kwargs.get('equipment_pk') 
        quantity_to_remove = request.data.get('quantity', 1)

        try:
            company_equipment = CompanyEquipment.objects.select_for_update().get(pk=company_equipment_id)

            pickup_slots = PickupSlot.objects.filter(
                company=company_equipment.company,
                reserved_by__isnull=False,
                is_expired=False,
                is_picked_up=False
            )
            reserved_quantity = 0
            for slot in pickup_slots:
                if slot.reserved_equipment and isinstance(slot.reserved_equipment, list):
                    for item in slot.reserved_equipment:
                        if item.get('equipment_id') == company_equipment.equipment_id:
                            reserved_quantity += item.get('quantity')

            available_quantity = company_equipment.quantity - reserved_quantity

            if quantity_to_remove > available_quantity:
                return Response({
                    "error": f"You cannot remove {quantity_to_remove} units. Only {available_quantity} units are available for removal."
                }, status=400)

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
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    queryset = PickupSlot.objects.all()
    serializer_class = PickupSlotSerializerCreate

    @transaction.atomic
    def perform_create(self, serializer):
        instance_data = serializer.validated_data
        administrator = instance_data['administrator']
        date = instance_data['date']
        time = instance_data['time']
        duration = instance_data['duration']
        end_time = (datetime.combine(date, time) + duration).time()

        slots = administrator.company.pickup_slots.all()

        for slot in slots:
            if slot.date == date:
                existing_start_time = slot.time
                existing_end_time = (datetime.combine(slot.date, existing_start_time) + slot.duration).time()

                new_start_datetime = datetime.combine(date, time)
                new_end_datetime = datetime.combine(date, end_time)
                existing_start_datetime = datetime.combine(slot.date, existing_start_time)
                existing_end_datetime = datetime.combine(slot.date, existing_end_time)

                if (new_start_datetime < existing_end_datetime and new_end_datetime > existing_start_datetime):
                    raise ValidationError(
                        "A pickup slot conflict exists with another slot in the same company."
                    )

        # No conflicts, save the slot
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
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
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
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    def destroy(self, request, *args, **kwargs):
        company_id = kwargs.get('company_id')
        equipment_id = kwargs.get('equipment_id')
        quantity_to_remove = request.data.get('quantity', 1)

        try:
            company_equipment = CompanyEquipment.objects.get(
                company_id=company_id, equipment_id=equipment_id
            )

            pickup_slots = PickupSlot.objects.filter(
                company_id=company_id,
                reserved_by__isnull=False,
                is_expired=False,
                is_picked_up=False
            )

            reserved_quantity = 0
            for slot in pickup_slots:
                if slot.reserved_equipment and isinstance(slot.reserved_equipment, list):
                    for item in slot.reserved_equipment:
                        if item.get('equipment_id') == equipment_id:
                            reserved_quantity += item.get('quantity')

            available_quantity = company_equipment.quantity - reserved_quantity

            if quantity_to_remove > available_quantity:
                return Response({
                    "error": f"You cannot remove {quantity_to_remove} units. Only {available_quantity} units are available for removal."
                }, status=400)
            
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
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    queryset = PickupSlot.objects.all()
    serializer_class = PickupSlotSerializer 

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        slot_id = kwargs.get('pk')

        try:
            pickup_slot = PickupSlot.objects.select_for_update().get(id=slot_id)  # Lock the pickup slot row
            
            company = pickup_slot.company
            reserved_equipment = pickup_slot.reserved_equipment

            for equipment_item in reserved_equipment:
                equipment_id = equipment_item.get('equipment_id')
                quantity = equipment_item.get('quantity')

                if not isinstance(equipment_id, int) or not isinstance(quantity, int):
                    return Response({"error": "Invalid equipment data"}, status=400)

                try:
                    company_equipment = CompanyEquipment.objects.select_for_update().get(company=company, equipment_id=equipment_id)
                    
                    if company_equipment.quantity >= quantity:
                        company_equipment.quantity -= quantity
                        company_equipment.save() 
                    else:
                        return Response({"error": f"Not enough equipment (ID: {equipment_id}) to remove"}, status=400)
                except CompanyEquipment.DoesNotExist:
                    return Response({"error": f"CompanyEquipment with equipment_id {equipment_id} not found"}, status=404)

            pickup_slot.is_picked_up = True
            pickup_slot.save() 

            self.send_confirmation_email(pickup_slot, company)

            return Response({"detail": "Pickup confirmed and equipment updated"}, status=200)

        except PickupSlot.DoesNotExist:
            return Response({"error": "PickupSlot not found"}, status=404)
        except Exception as e:
            print(f"Error during confirming pickup: {e}")
            return Response({"error": "Internal Server Error"}, status=500)

    def send_confirmation_email(self, pickup_slot, company):
        user_email = pickup_slot.reserved_by.email
        subject = "Equipment Pickup Confirmation"
        message = f"Dear {pickup_slot.reserved_by.first_name},\n\nYou have successfully picked up the equipment. Thank you!\n\nBest regards,\nYour {company.company_name}."

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )

class CompanyAnalyticsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsCompanyAdmin]

    def list(self, request, *args, **kwargs):
        company_id = kwargs.get('pk')
        try:
            company = Company.objects.get(id=company_id)

            # 1. Average rating of the company
            average_rating = company.average_rating

            # Define date ranges for the last 6 months, 6 quarters, and 6 years
            now = datetime.now()
            periods = {
                'months': [(now - timedelta(days=30 * i)).date() for i in reversed(range(6))],
                'quarters': [(now - timedelta(days=90 * i)).date() for i in reversed(range(6))],
                'years': [(now - timedelta(days=365 * i)).date() for i in reversed(range(6))],
            }

            # Helper function to get counts over specific periods
            def get_counts(periods, period_type, reserved_only=False):
                counts = {period.isoformat(): 0 for period in periods[period_type]}
                
                for period_start in periods[period_type]:
                    if period_type == 'months':
                        end_date = period_start + timedelta(days=30)
                    elif period_type == 'quarters':
                        end_date = period_start + timedelta(days=90)
                    else:  # years
                        end_date = period_start + timedelta(days=365)
                    
                    query_filters = {
                        'company': company,
                        'date__gte': period_start,
                        'date__lt': end_date
                    }
                    
                    if reserved_only:
                        query_filters['reserved_by__isnull'] = False
                    
                    count = PickupSlot.objects.filter(**query_filters).count()
                    counts[period_start.isoformat()] = count
                
                return counts

            # Pickup Slots
            created_slots = {
                'months': get_counts(periods, 'months', reserved_only=False),
                'quarters': get_counts(periods, 'quarters', reserved_only=False),
                'years': get_counts(periods, 'years', reserved_only=False)
            }

            # Reserved Slots
            reserved_slots = {
                'months': get_counts(periods, 'months', reserved_only=True),
                'quarters': get_counts(periods, 'quarters', reserved_only=True),
                'years': get_counts(periods, 'years', reserved_only=True)
            }

            # Revenue calculation
            def calculate_revenue(period_type):
                revenues = {period.isoformat(): 0 for period in periods[period_type]}
                for period_start in periods[period_type]:
                    if period_type == 'months':
                        end_date = period_start + timedelta(days=30)
                    elif period_type == 'quarters':
                        end_date = period_start + timedelta(days=90)
                    else:  # years
                        end_date = period_start + timedelta(days=365)

                    # Fetch reserved pickup slots for the period
                    pickup_slots = PickupSlot.objects.filter(
                        company=company,
                        reserved_by__isnull=False,
                        is_picked_up=True,
                        date__gte=period_start,
                        date__lt=end_date
                    )
                    
                    # Calculate revenue for the period
                    total_revenue = 0
                    for slot in pickup_slots:
                        for equipment_data in slot.reserved_equipment:
                            try:
                                equipment = Equipment.objects.get(id=equipment_data['equipment_id'])
                                total_revenue += equipment.price * equipment_data['quantity']
                            except Equipment.DoesNotExist:
                                continue  # Handle cases where equipment is not found

                    revenues[period_start.isoformat()] = total_revenue
                return revenues

            revenue = {
                'months': calculate_revenue('months')
            }

            data = {
                'average_rating': average_rating,
                'created_slots': created_slots,
                'reserved_slots': reserved_slots,
                'revenue': revenue
            }

            return Response(data)
        except Company.DoesNotExist:
            return Response({"error": "Company not found"}, status=404)
        
class UsersReservedListView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsCompanyAdmin]  
      
    def get(self, request, *args, **kwargs):
        company_admin = CompanyAdministrator.objects.get(account=request.user)
        company = company_admin.company
        
        reserved_slots = PickupSlot.objects.filter(company=company, reserved_by__isnull=False)

        reserved_users = Account.objects.filter(reserved_slots__in=reserved_slots).distinct()

        users_data = [{'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name, 'email': user.email} for user in reserved_users]

        return Response(users_data)