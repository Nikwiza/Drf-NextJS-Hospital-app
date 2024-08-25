from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from equipment.models import Equipment
from profiles.models import CompanyAdministrator

class Company(models.Model):
    company_name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    description = models.TextField()
    working_hours = models.CharField(max_length = 15, default = 'unspecified')
    average_rating = models.FloatField(
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    equipment = models.ManyToManyField(Equipment, related_name='equipment_list', blank=True)

    def __str__(self):
        return self.company_name
    
class PickupSlot(models.Model):
    administrator = models.ForeignKey('profiles.CompanyAdministrator', on_delete=models.CASCADE, related_name="pickup_slots")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='pickup_slots', null=True)
    date = models.DateField()
    time = models.TimeField()
    duration = models.DurationField()
    is_reserved = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.administrator.account.name} - {self.date} at {self.time}"