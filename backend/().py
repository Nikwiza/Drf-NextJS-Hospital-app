# coding: utf-8
from profiles.models import Account
from profiles.models import CompanyAdministrator
CompanyAdministrator.objects.all(
)
CompanyAdministrator.objects(6)
CompanyAdministrator.get(pk=6)
CompanyAdministrator.objects.get(pk=6)
company_admin = CompanyAdministrator.objects.get(pk=6)
company_admin.name
company_admin.account.name
company_admin.account.email
company_admin.company
company_admin.company.company_name
company_admin.company.description
company_admin.account.password
company_admin.account.is_company_admin
company_admin.account.is_active
company_admin.account.is_email_verified
company_admins = CompanyAdministrator.objects.all()
company_admins.delete()
CompanyAdministrator.objects.all(
)
