from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Companie


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Companie
        fields = ('__all__')