from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

class League(models.Model):
    first_league_points = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    second_league_points = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    third_league_points = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    first_league_discount = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    second_league_discount = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    third_league_discount = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    points_per_pick = models.IntegerField(default=1)
    points_per_penalty = models.IntegerField(default=1)

    # Ensures that only one instance of this model can exist
    def save(self, *args, **kwargs):
        if not self.pk and League.objects.exists():
            raise ValidationError('There can be only one League instance')
        super().save(*args, **kwargs)

    def __str__(self):
        return "League Settings"