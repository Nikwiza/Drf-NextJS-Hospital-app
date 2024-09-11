from django.db import models


class Equipment(models.Model):
    equipment_name = models.CharField(max_length=100)
    equipment_type = models.CharField(max_length=200)
    description = models.TextField()
    picture_url = models.CharField(max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.equipment_name