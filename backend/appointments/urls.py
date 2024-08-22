from django.urls import path
from .views import AppointmentListCreateView, AppointmentDetailView

urlpatterns = [
    path('company/<int:company_pk>', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('<int:pk>', AppointmentDetailView.as_view(), name='appointment-detail'),
]
