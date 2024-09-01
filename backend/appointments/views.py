from rest_framework import generics
from .models import Appointment
from .serializers import AppointmentSerializer
from companies.models import Company

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        company_id = self.kwargs['company_pk']
        return Appointment.objects.filter(company__id=company_id)

    def perform_create(self, serializer):
        company_id = self.kwargs['company_pk']
        company = Company.objects.get(pk=company_id)
        serializer.save(company=company)

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer