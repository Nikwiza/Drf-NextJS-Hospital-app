from django.db import models
from user.models import Account
from companies.models import Company
from equipment.models import Equipment

class Appointment(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    admin = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)
    date = models.DateField()
    time = models.TimeField()
    duration = models.DurationField()
    equipment_list = models.ManyToManyField(Equipment, blank=True)

    def __str__(self):
        return f"{self.admin.name} - {self.date} {self.time}"
