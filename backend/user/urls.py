from django.urls import path
from .views import AccountUpdateView, verify_email, verify_email_confirm, getUserAccount



urlpatterns = [
    path('verify/', verify_email),
    path('verify-email-confirm/<uidb64>/<token>/', verify_email_confirm, name='verify-email-confirm'),
    path('', getUserAccount, name='account-detail'),
    path('update/', AccountUpdateView.as_view(), name='update-account'),
]