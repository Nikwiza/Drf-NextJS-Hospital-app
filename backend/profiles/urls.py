from django.urls import path
from .views import ChangePasswordView, CompanyAdminProfileView, createAdminAccount, createUserAccount, createCompanyAdminAccount

urlpatterns = [
    path('register', createUserAccount),
    path('register-admin', createAdminAccount),
    path('register-company-admin', createCompanyAdminAccount),
    path('update-company-admin/', CompanyAdminProfileView.as_view(), name='update-company-admin'), 
    path('authenticated-company-admin/', CompanyAdminProfileView.as_view(), name='get-company-admin'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

]