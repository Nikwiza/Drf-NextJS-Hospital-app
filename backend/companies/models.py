from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from equipment.models import Equipment
from profiles.models import CompanyAdministrator
from datetime import datetime
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.dateparse import parse_time
from django.db.models import JSONField

class Company(models.Model):
    company_name = models.CharField(max_length=100)
    address = models.CharField(max_length=200)
    description = models.TextField()
    working_hours = models.CharField(max_length = 15, default = 'unspecified')
    average_rating = models.FloatField(
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    # Think about this
    business_hours = models.JSONField(default=dict)

    def __str__(self):
        return self.company_name
    
class PickupSlot(models.Model):
    administrator = models.ForeignKey('profiles.CompanyAdministrator', on_delete=models.CASCADE, related_name="pickup_slots")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='pickup_slots', null=True)
    date = models.DateField()
    time = models.TimeField()
    duration = models.DurationField()
    reserved_by = models.ForeignKey('user.Account', on_delete=models.SET_NULL, null=True, blank=True, related_name='reserved_slots')
    is_expired = models.BooleanField(default=False)
    is_picked_up = models.BooleanField(default=False)
    #TODO: probably not, we should make this a list of equip
    reserved_equipment = JSONField(blank=True, null=True)

    def update_expiration_status(self):
        slot_datetime_naive = datetime.combine(self.date, self.time)
        slot_datetime_aware = timezone.make_aware(slot_datetime_naive, timezone.get_current_timezone())
        current_datetime = timezone.now()
        self.is_expired = slot_datetime_aware < current_datetime
        self.save()
    
    def clean(self):
        business_hours = self.company.business_hours
        day_of_week = self.date.strftime('%A')
        hours = business_hours.get(day_of_week)
        
        if hours:
            start_time = parse_time(hours['start'])
            end_time = parse_time(hours['end'])

            if not start_time or not end_time:
                raise ValidationError(f"{day_of_week} is not a working day.")
            
            if not (start_time <= self.time <= end_time):
                raise ValidationError("Pickup time is outside business hours.")
            
            slot_end_time = (datetime.combine(datetime.today(), self.time) + self.duration).time()
            if slot_end_time > end_time:
                raise ValidationError("Pickup duration extends beyond business hours.")
            
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.administrator.account.first_name} {self.administrator.account.last_name} - {self.date} at {self.time}"

class CompanyEquipment(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='company_equipments')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    class Meta:
        unique_together = ('company', 'equipment')

    def __str__(self):
        return f"{self.company.name} - {self.equipment.name} (Quantity: {self.quantity})"