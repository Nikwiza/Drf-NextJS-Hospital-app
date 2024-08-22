from django.db import models
from user.models import Account
from companies.models import Company

class CompanyAdministrator(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.DO_NOTHING, related_name="administrators")

class SystemAdmin(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE) 

