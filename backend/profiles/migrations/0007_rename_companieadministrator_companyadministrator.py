# Generated by Django 5.0.7 on 2024-08-20 18:21

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("companies", "0004_company_equipment"),
        ("profiles", "0006_rename_companie_companieadministrator_company"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name="CompanieAdministrator",
            new_name="CompanyAdministrator",
        ),
    ]
