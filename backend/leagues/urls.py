# urls.py
from django.urls import path
from .views import LeagueRetrieveUpdateView

urlpatterns = [
    path('', LeagueRetrieveUpdateView.as_view(), name='league-detail-update'),
]
