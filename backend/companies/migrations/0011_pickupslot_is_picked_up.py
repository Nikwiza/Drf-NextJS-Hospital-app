# Generated by Django 5.0.7 on 2024-09-04 20:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0010_alter_pickupslot_reserved_equipment"),
    ]

    operations = [
        migrations.AddField(
            model_name="pickupslot",
            name="is_picked_up",
            field=models.BooleanField(default=False),
        ),
    ]
