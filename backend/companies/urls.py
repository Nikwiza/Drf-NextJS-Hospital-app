from django.urls import path
from .views import WorkCalendarCompanyListView, CompanyAnalyticsView, CompanyListView, CompanyProfileView, CompanyUpdateView, ConfirmPickupView, EquipmentListView, AddEquipmentToCompanyView, RemoveEquipmentFromCompanyView, CreatePickupSlotView, PickupSlotReserveView, PickupSlotListView, ReservedPickupSlotsView, ReservedUsersListView, WorkCalendarListView, UsersReservedListView


urlpatterns = [
    path('', CompanyListView.as_view(), name='list-company'),
    path('profile/<int:pk>/', CompanyProfileView.as_view(), name='company-profile'),
    path('update/<int:pk>/', CompanyUpdateView.as_view(), name='update-company'),
    path('owned-equipment/<int:pk>/', EquipmentListView.as_view(), name='owned-equipment'),
    path('add-equipment/<int:company_pk>/<int:equipment_pk>/', AddEquipmentToCompanyView.as_view(), name='add-equipment'),
    path('remove-equipment/<int:equipment_pk>/', RemoveEquipmentFromCompanyView.as_view(), name='remove-equipment'),
    path('pickup-slots/', PickupSlotListView.as_view(), name='pickup_slots'),
    path('pickup-slots/create/', CreatePickupSlotView.as_view(), name='pickup-slot-create'),
    path('company-calendar/', WorkCalendarCompanyListView.as_view(), name='company-calendar'),
    path('pickup-slots/<int:pk>/reserve/', PickupSlotReserveView.as_view(), name='pickup-slot-reserve'),
    path('reservations/<int:pk>/', ReservedUsersListView.as_view(), name='reservations'),
    path('work-calendar/<int:pk>/', WorkCalendarListView.as_view(), name='work-calendar'),
    path('pickup-slots/reserved/', ReservedPickupSlotsView.as_view(), name='reserved-pickup-slots'),
    path('pickup-slots/<int:pk>/confirm-pickup/', ConfirmPickupView.as_view(), name='confirm-pickup'),
    path('analytics/<int:pk>/', CompanyAnalyticsView.as_view(), name='company-analytics'),
    path('reserved-users-list/', UsersReservedListView.as_view(), name='reserved-user-list'),
]
# WorkCalendarCompanyListView