from profiles.models import CompanyAdministrator
from equipment.serializers import EquipmentSerializer
from .models import Company, CompanyEquipment, PickupSlot
from rest_framework import serializers
from geopy.geocoders import Nominatim
from profiles.serializers import CompanyAdministratorSerializer



class CompanyFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class CompanyEquipmentSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer()
    
    class Meta:
        model = CompanyEquipment
        fields = ['id', 'equipment', 'quantity']

class CompanyProfileSerializer(serializers.ModelSerializer):
    equipment = CompanyEquipmentSerializer(source='company_equipments', many=True, read_only=True)
    pickup_slots = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    administrators = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = ['id', 'company_name', 'address', 'description', 'average_rating', 'latitude', 'longitude', 'equipment', 'pickup_slots', 'administrators']

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
        unreserved_slots = PickupSlot.objects.filter(company=obj, is_reserved=False, is_expired=False)
        return PickupSlotSerializer(unreserved_slots, many=True).data
    
    def get_administrators(self, obj):
        administrators = CompanyAdministrator.objects.filter(company=obj)
        return CompanyAdministratorSerializer(administrators, many=True).data
        
class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['company_name', 'description', 'address']

class PickupSlotSerializer(serializers.ModelSerializer):
    administrator_name = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = PickupSlot
        fields = ['id', 'administrator_name', 'company', 'date', 'time', 'duration', 'is_reserved', 'is_expired']
        read_only_fields = ['administrator_name', 'company']

    def get_administrator_name(self, obj):
        return obj.administrator.account.name
    
    def get_is_expired(self, obj):
        obj.update_expiration_status()
        return obj.is_expired
    

    

    