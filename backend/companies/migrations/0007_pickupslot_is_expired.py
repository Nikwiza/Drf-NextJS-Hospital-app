# Generated by Django 5.0.7 on 2024-08-29 18:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0006_pickupslot_company"),
    ]

    operations = [
        migrations.AddField(
            model_name="pickupslot",
            name="is_expired",
            field=models.BooleanField(default=False),
        ),
    ]
