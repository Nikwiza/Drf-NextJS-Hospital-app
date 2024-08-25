from django.urls import path
from .views import CompanyListView, CompanyProfileView, CompanyUpdateView, EquipmentListView, AddEquipmentToCompanyView, RemoveEquipmentFromCompanyView, CreatePickupSlotView, PickupSlotReserveView, PickupSlotListView


urlpatterns = [
    path('', CompanyListView.as_view(), name='list-company'),
    path('profile/<int:pk>/', CompanyProfileView.as_view(), name='company-profile'),
    path('update/<int:pk>/', CompanyUpdateView.as_view(), name='update-company'),
    path('owned-equipment/<int:pk>/', EquipmentListView.as_view(), name='owned-equipment'),
    path('add-equipment/<int:company_pk>/<int:equipment_pk>/', AddEquipmentToCompanyView.as_view(), name='add-equipment'),
    path('remove-equipment/<int:company_pk>/<int:equipment_pk>/', RemoveEquipmentFromCompanyView.as_view(), name='remove-equipment'),
    path('pickup-slots/', PickupSlotListView.as_view(), name='pickup_slots'),
    path('pickup-slots/create/', CreatePickupSlotView.as_view(), name='pickup-slot-create'),
    path('pickup-slots/<int:pk>/reserve/', PickupSlotReserveView.as_view(), name='pickup-slot-reserve'),
]
