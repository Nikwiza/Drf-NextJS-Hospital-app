from rest_framework import serializers
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'email', 'name', 'date_joined', 'last_login', 'is_admin', 'is_active', 'is_email_verified', 'is_company_admin']

class ReservedUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'name', 'email']