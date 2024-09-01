from rest_framework import serializers
from .models import Appointment
from equipment.models import Equipment

class AppointmentSerializer(serializers.ModelSerializer):
    equipment_list = serializers.PrimaryKeyRelatedField(queryset=Equipment.objects.all(), many=True)

    class Meta:
        model = Appointment
        fields = ['id', 'company', 'admin', 'date', 'time', 'duration', 'equipment_list']