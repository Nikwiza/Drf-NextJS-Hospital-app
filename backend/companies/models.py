from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from equipment.models import Equipment

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
        return self.name