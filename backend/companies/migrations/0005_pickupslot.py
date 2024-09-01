# Generated by Django 5.0.4 on 2024-08-25 12:34

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0004_company_equipment"),
        ("profiles", "0008_alter_companyadministrator_company"),
    ]

    operations = [
        migrations.CreateModel(
            name="PickupSlot",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField()),
                ("time", models.TimeField()),
                ("duration", models.DurationField()),
                ("is_reserved", models.BooleanField(default=False)),
                (
                    "administrator",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pickup_slots",
                        to="profiles.companyadministrator",
                    ),
                ),
            ],
        ),
    ]
