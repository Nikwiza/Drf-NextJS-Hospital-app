from django.urls import path
from .views import verify_email, verify_email_confirm


urlpatterns = [
    path('verify/', verify_email),
    path('verify-email-confirm/<uidb64>/<token>/', verify_email_confirm, name='verify-email-confirm')
]