# Generated by Django 5.0.7 on 2024-09-12 03:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0003_account_is_email_verified_alter_account_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='account',
            name='penalty_points',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='account',
            name='reward_points',
            field=models.IntegerField(default=0),
        ),
    ]
