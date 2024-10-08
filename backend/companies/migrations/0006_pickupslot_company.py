# Generated by Django 5.0.4 on 2024-08-25 12:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0005_pickupslot"),
    ]

    operations = [
        migrations.AddField(
            model_name="pickupslot",
            name="company",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="pickup_slots",
                to="companies.company",
            ),
        ),
    ]
