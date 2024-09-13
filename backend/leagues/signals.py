from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import League

@receiver(post_migrate)
def create_league_instance(sender, **kwargs):

    if League.objects.count() == 0:  # If no League instance exists
        League.objects.create(
            first_league_points=5,
            second_league_points=10,
            third_league_points=20,
            first_league_discount=10.0,
            second_league_discount=15.0,
            third_league_discount=25.0,
            points_per_pick = 1,
            points_per_penalty = 1
        )
