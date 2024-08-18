from django.db import models

class Companie(models.Model):
    companie_name = models.CharField(max_length=80, unique=True)
    description = models.CharField(max_length=255,unique=True)