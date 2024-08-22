from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_email_verified", False)
        if not email:
            raise ValueError(_("The email must be set"))
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_admin(self, email, password, **extra_fields):
        extra_fields.setdefault("is_admin", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_admin") is not True:
            raise ValueError(_("Admin must have is_admin=True."))
        return self.create_user(email, password, **extra_fields)
    
    def create_company_admin(self, email, password, **extra_fields):
        extra_fields.setdefault("is_company_admin", True)
        extra_fields.setdefault("is_email_verified", False)
        if extra_fields.get("is_company_admin") is not True:
            raise ValueError(_("Company admin must have is_company_admin=True."))
        return self.create_user(email, password, **extra_fields)

        