from rest_framework import serializers

from profiles.models import CompanyAdministrator
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    is_password_changed = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'email', 'first_name','last_name', 'phone_number', 'date_joined', 'last_login', 'is_admin', 'is_active', 'is_email_verified', 'is_company_admin', 'is_password_changed']

    def get_is_password_changed(self, obj):
        if obj.is_company_admin:
            try:
                company_admin = CompanyAdministrator.objects.get(account=obj)
                return company_admin.is_password_changed
            except CompanyAdministrator.DoesNotExist:
                return False
        return False

class ReservedUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'first_name', 'last_name', 'phone_number', 'email']