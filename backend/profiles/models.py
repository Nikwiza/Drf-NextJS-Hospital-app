from django.db import models
from user.models import Account
from companies.models import Companie

class CompanieAdministrator(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    companie = models.OneToOneField(Companie, on_delete=models.DO_NOTHING)

class SystemAdmin(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE) 

