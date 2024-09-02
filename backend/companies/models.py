from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from equipment.models import Equipment
from profiles.models import CompanyAdministrator
from datetime import datetime
from django.utils import timezone

class Company(models.Model):
    company_name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    description = models.TextField()
    working_hours = models.CharField(max_length = 15, default = 'unspecified')
    average_rating = models.FloatField(
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )

    def __str__(self):
        return self.company_name
    
class PickupSlot(models.Model):
    administrator = models.ForeignKey('profiles.CompanyAdministrator', on_delete=models.CASCADE, related_name="pickup_slots")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='pickup_slots', null=True)
    date = models.DateField()
    time = models.TimeField()
    duration = models.DurationField()
    is_reserved = models.BooleanField(default=False)
    is_expired = models.BooleanField(default=False)

    def update_expiration_status(self):
        slot_datetime_naive = datetime.combine(self.date, self.time)
        slot_datetime_aware = timezone.make_aware(slot_datetime_naive, timezone.get_current_timezone())
        current_datetime = timezone.now()
        self.is_expired = slot_datetime_aware < current_datetime
        self.save()

    def __str__(self):
        return f"{self.administrator.account.name} - {self.date} at {self.time}"

class CompanyEquipment(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='company_equipments')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    class Meta:
        unique_together = ('company', 'equipment')

    def __str__(self):
        return f"{self.company.name} - {self.equipment.name} (Quantity: {self.quantity})"