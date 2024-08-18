from rest_framework.permissions import BasePermission

class IsSystemAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_admin

#TODO: check if it's user
class IsCompanyAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_company_admin