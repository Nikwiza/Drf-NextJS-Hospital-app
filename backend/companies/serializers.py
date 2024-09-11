from datetime import datetime, timedelta
from user.serializers import ReservedUsersSerializer
from profiles.models import CompanyAdministrator
from equipment.serializers import EquipmentSerializer
from .models import Company, CompanyEquipment, PickupSlot
from rest_framework import serializers
from geopy.geocoders import Nominatim
from profiles.serializers import CompanyAdministratorSerializer
from equipment.models import Equipment
from profiles.serializers import SimpleAccountSerializer, SimpleCompanyAdministratorSerializer

class SimplePickupSlotSerializer(serializers.ModelSerializer):
    administrator = SimpleCompanyAdministratorSerializer()  # Use the simple serializer for CompanyAdministrator
    reserved_by = SimpleAccountSerializer()  # Use the simple serializer for Account

    class Meta:
        model = PickupSlot
        fields = [
            'id',
            'administrator',
            'company',
            'date',
            'time',
            'duration',
            'reserved_by',
            'is_expired',
            'is_picked_up',
            'reserved_equipment'
        ]

class CompanyFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class CompanyEquipmentSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer()
    
    class Meta:
        model = CompanyEquipment
        fields = ['id', 'equipment', 'quantity']

class CompanySimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'company_name'] 

class EquipmentWithCompaniesListSerializer(serializers.ModelSerializer):
    """Serializer to display equipment along with the companies that own them."""
    companies = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = ['id', 'equipment_name', 'equipment_type', 'description', 'picture_url', 'price', 'companies']

    def get_companies(self, obj):
        # Fetch CompanyEquipment instances related to the current equipment
        company_equipments = CompanyEquipment.objects.filter(equipment=obj)
        # Use the CompanySimpleSerializer to serialize the companies
        return [
            {
                'company': CompanySimpleSerializer(company_equipment.company).data,
                'quantity': company_equipment.quantity
            } for company_equipment in company_equipments
        ]

class CompanyProfileSerializer(serializers.ModelSerializer):
    equipment = CompanyEquipmentSerializer(source='company_equipments', many=True, read_only=True)
    pickup_slots = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    administrators = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'company_name', 'address', 'description', 'average_rating', 'latitude', 'longitude', 'business_hours', 'equipment', 'pickup_slots', 'administrators']

    def get_latitude(self, obj):
        return self.get_lat_lng(obj.address)[0]

    def get_longitude(self, obj):
        return self.get_lat_lng(obj.address)[1]

    def get_lat_lng(self, address):
        geolocator = Nominatim(user_agent="dusaan.a.stojanovic@gmail.com")
        try:
            location = geolocator.geocode(f'{address}, Novi Sad, Serbia')
            if location:
                return location.latitude, location.longitude
            else:
                print(f"Geocoding failed for address: {address}")
                return None, None
        except Exception as e:
            print(f"Error during geocoding: {e}")
            return None, None
    
    def get_pickup_slots(self, obj):
        unreserved_slots = PickupSlot.objects.filter(company=obj, reserved_by=None, is_expired=False)
        return PickupSlotSerializer(unreserved_slots, many=True).data
    
    def get_administrators(self, obj):
        administrators = CompanyAdministrator.objects.filter(company=obj)
        return CompanyAdministratorSerializer(administrators, many=True).data
        
class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['company_name', 'description', 'address', 'business_hours']

class PickupSlotSerializer(serializers.ModelSerializer):
    administrator = CompanyAdministratorSerializer()
    is_expired = serializers.SerializerMethodField()
    reserved_by = ReservedUsersSerializer()
    end_time = serializers.SerializerMethodField()


    class Meta:
        model = PickupSlot
        fields = ['id', 'administrator', 'company', 'date', 'time', 'duration', 'end_time', 'reserved_by', 'is_expired', 'is_picked_up', 'reserved_equipment']
        read_only_fields = ['company']
    
    def get_is_expired(self, obj):
        obj.update_expiration_status()
        return obj.is_expired
    def get_end_time(self, obj):
        start_time = datetime.combine(obj.date, obj.time)
        duration = obj.duration
        duration_seconds = duration.total_seconds()
        end_time = start_time + timedelta(seconds=duration_seconds)
        return end_time.time()
    
class PickupSlotSerializerCreate(serializers.ModelSerializer):
    administrator = serializers.PrimaryKeyRelatedField(queryset=CompanyAdministrator.objects.all())
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = PickupSlot
        fields = ['id', 'administrator', 'company', 'date', 'time', 'duration', 'reserved_by', 'is_expired', 'is_picked_up', 'reserved_equipment']
        read_only_fields = ['company']
    
    def get_is_expired(self, obj):
        obj.update_expiration_status()
        return obj.is_expired
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['administrator'] = CompanyAdministratorSerializer(instance.administrator).data

        return representation

    

    