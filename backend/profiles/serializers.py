from rest_framework import serializers
from user.serializers import AccountSerializer
from user.models import Account
from user.managers import CustomUserManager
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from .models import CompanyAdministrator
from companies.models import Company

class UserRegisterSerializer(serializers.ModelSerializer):
    email = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=Account.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = Account
        fields = ('password', 
                  'email', 'name')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        #TODO: maby add validation logic later
        return attrs

    def create(self, validated_data):
        user = Account.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        user.save()

        return user
    

class AdminRegisterSerializer(serializers.ModelSerializer):
    email = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=Account.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = Account
        fields = ('password', 
                  'email', 'name')
    extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        #TODO: maby add validation logic later
        return attrs

    def create(self, validated_data):
        user = Account.objects.create_admin(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        user.save()

        return user
    
class CompanyAdminRegisterSerializer(serializers.ModelSerializer):
    email = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=Account.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all(), write_only=True)

    class Meta:
        model = Account
        fields = ('email', 'name', 'password', 'company')

    def create(self, validated_data):
        # Extract the company before creating the Account instance
        company = validated_data.pop('company')
        # Create the Account instance
        user = Account.objects.create_company_admin(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
        # Now create the CompanyAdministrator instance
        company_admin = CompanyAdministrator.objects.create(account=user, company=company)
        company_admin.save()
        return user

class CompanyAdministratorSerializer(serializers.ModelSerializer):
    account = AccountSerializer()
    class Meta:
        model = CompanyAdministrator
        fields = ['id', 'account', 'company']
        
    def update(self, instance, validated_data):
        account_data = validated_data.pop('account', None)
        account_serializer = self.fields['account']

        # Update the Account instance
        if account_data:
            account_serializer.update(instance.account, account_data)

        # Update the CompanyAdministrator instance
        return super().update(instance, validated_data)
