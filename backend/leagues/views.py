# views.py
from rest_framework import generics
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import League
from .serializers import LeagueSerializer

class LeagueRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = League.objects.all()
    serializer_class = LeagueSerializer

    def get_object(self):
        """
        Override get_object to return the single instance of League.
        """

        league_instance = get_object_or_404(League)
        return league_instance
