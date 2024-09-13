from django.db import models
from user.models import Account

class CompanyAdministrator(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE)
    company = models.ForeignKey('companies.Company', on_delete=models.DO_NOTHING, related_name="administrators")
    is_password_changed = models.BooleanField(default=False)

class SystemAdmin(models.Model):
    account = models.OneToOneField(Account, on_delete=models.CASCADE) 
    is_password_changed = models.BooleanField(default=False)

