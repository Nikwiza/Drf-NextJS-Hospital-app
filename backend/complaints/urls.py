from django.urls import path
from .views import GetComplaintView, ComplaintGroupedByUserView, UpdateAdminAnswerView


urlpatterns = [
    path('', GetComplaintView.as_view(), name='complaints'),
    path('groupedComplaings/', ComplaintGroupedByUserView.as_view(), name='grouped-complaints'),
    path('answer/', UpdateAdminAnswerView.as_view(), name='answer_complaint')
]
