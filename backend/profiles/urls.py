from django.urls import path
from .views import createAdminAccount, createUserAccount

urlpatterns = [
    path('register', createUserAccount),
    path('register-admin', createAdminAccount)
]