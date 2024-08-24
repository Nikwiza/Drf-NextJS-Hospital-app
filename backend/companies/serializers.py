from equipment.serializers import EquipmentSerializer
from .models import Company
from rest_framework import serializers


class CompanyFullSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class CompanyProfileSerializer(serializers.ModelSerializer):
    equipment = EquipmentSerializer(read_only=True, many=True)
    class Meta:
        model = Company
        fields = ['company_name', 'description', 'address', 'average_rating', 'equipment']
        
class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['company_name', 'description', 'address',]
    