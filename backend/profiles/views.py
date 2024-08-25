from django.http import JsonResponse
from .serializers import UserRegisterSerializer, AdminRegisterSerializer, CompanyAdminRegisterSerializer, CompanyAdministratorSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework import generics
from profiles.permissions import IsSystemAdmin, IsEmailConfirmed


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
    
class CompanyAdminProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanyAdministratorSerializer

    def get_object(self):
        return self.request.user.companyadministrator
    
