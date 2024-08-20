from django.urls import path
from .views import AppointmentListCreateView, AppointmentDetailView

urlpatterns = [
    path('companies/<int:company_pk>/appointments/', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
]
