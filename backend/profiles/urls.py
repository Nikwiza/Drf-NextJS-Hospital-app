from django.urls import path
from .views import CompanyAdminProfileView, createAdminAccount, createUserAccount, createCompanyAdminAccount

urlpatterns = [
    path('register', createUserAccount),
    path('register-admin', createAdminAccount),
    path('register-company-admin', createCompanyAdminAccount),
    path('update-company-admin/', CompanyAdminProfileView.as_view(), name='update-company-admin'), 
]