# Generated by Django 5.0.7 on 2024-08-20 16:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0002_company"),
        ("profiles", "0005_alter_companieadministrator_companie"),
    ]

    operations = [
        migrations.DeleteModel(
            name="Companie",
        ),
    ]
