# views.py
from rest_framework import generics
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import League
from .serializers import LeagueSerializer
from django.db import transaction

class LeagueRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = League.objects.all()
    serializer_class = LeagueSerializer

    def get_object(self):

        league_instance = get_object_or_404(League)
        return league_instance
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        with transaction.atomic():
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

        return Response(serializer.data)
