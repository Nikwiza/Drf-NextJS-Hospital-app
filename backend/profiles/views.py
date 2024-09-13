from django.http import JsonResponse
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import CompanyAdministrator
from .serializers import UserRegisterSerializer, AdminRegisterSerializer, CompanyAdminRegisterSerializer, CompanyAdministratorSerializer, SimpleSystemAdminSerializer, CompanyAdministratorSerializer, AccountSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework import generics
from user.models import Account
from .models import SystemAdmin, CompanyAdministrator
from rest_framework.response import Response
from rest_framework.views import APIView
from profiles.permissions import IsCompanyAdmin, IsSystemAdmin, IsEmailConfirmed
from django.utils.decorators import method_decorator
from django.contrib.auth.views import PasswordChangeView


#TODO: Make the registrations atomic

@api_view(['POST'])
@permission_classes([AllowAny])
def createUserAccount(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(status=status.HTTP_200_OK, data=serializer.data)
    else:
        return JsonResponse(status=status.HTTP_422_UNPROCESSABLE_ENTITY, data=serializer.errors)
    
@api_view(['POST'])
@permission_classes([IsSystemAdmin, IsEmailConfirmed])
def createAdminAccount(request):
    serializer = AdminRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(status=status.HTTP_200_OK, data=serializer.data)
    else:
        return JsonResponse(status=status.HTTP_422_UNPROCESSABLE_ENTITY, data=serializer.errors)

@api_view(['POST'])
@permission_classes([AllowAny])
def createCompanyAdminAccount(request):
    serializer = CompanyAdminRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(status=status.HTTP_200_OK, data=serializer.data)
    else:
        return JsonResponse(status=status.HTTP_422_UNPROCESSABLE_ENTITY, data=serializer.errors)
    

#List, Create and remove views for system admins and and Company admins
#TODO: Switch all of these to system admin persmissions
class GetSystemAdmins(generics.ListAPIView):
    permission_classes=[AllowAny]
    serializer_class = AccountSerializer
    queryset=Account.objects.filter(is_admin=True)

class GetCompanyAdmins(generics.ListAPIView):
    permission_classes=[AllowAny]
    serializer_class = CompanyAdministratorSerializer
    queryset=CompanyAdministrator.objects.all()
    

class CompanyAdminProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsCompanyAdmin]
    serializer_class = CompanyAdministratorSerializer
        
    def get_object(self):
        return self.request.user.companyadministrator

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        form = PasswordChangeForm(user=request.user, data=request.data)

        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            company_admin = user.companyadministrator
            company_admin.is_password_changed = True
            company_admin.save()
            return Response({'status': 'password_changed'}, status=status.HTTP_200_OK)
        else:
            return Response({'status': 'error', 'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        return Response({'status': 'invalid_request'}, status=status.HTTP_400_BAD_REQUEST)