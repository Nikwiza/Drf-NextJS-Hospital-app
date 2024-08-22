from django.urls import path
from .views import createAdminAccount, createUserAccount, createCompanyAdminAccount

urlpatterns = [
    path('register', createUserAccount),
    path('register-admin', createAdminAccount),
    path('register-company-admin', createCompanyAdminAccount),
]