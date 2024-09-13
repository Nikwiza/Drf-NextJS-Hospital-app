from django.urls import path
from .views import CompanyAdminProfileView, createAdminAccount, createUserAccount, createCompanyAdminAccount, GetCompanyAdmins, GetSystemAdmins

urlpatterns = [
    path('register', createUserAccount),
    path('register-admin', createAdminAccount),
    path('register-company-admin', createCompanyAdminAccount),
    path('update-company-admin/', CompanyAdminProfileView.as_view(), name='update-company-admin'), 
    path('authenticated-company-admin/', CompanyAdminProfileView.as_view(), name='get-company-admin'),
    path('system-admins/', GetSystemAdmins.as_view(), name='get-system-admins'),
    path('company-admins/', GetCompanyAdmins.as_view(), name='get-company-admins'),
]