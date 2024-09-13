from rest_framework.permissions import BasePermission

class IsSystemAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_admin
class IsCompanyAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_company_admin

class IsEmailConfirmed(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_active
    
class OrPermission(BasePermission):
    """
    Permission class that allows access if the user has either one of the provided permissions.
    """

    def __init__(self, *perms):
        self.perms = perms

    def has_permission(self, request, view):
        return any(perm().has_permission(request, view) for perm in self.perms)
    
    def has_object_permission(self, request, view, obj):
        return any(perm().has_object_permission(request, view, obj) for perm in self.perms)