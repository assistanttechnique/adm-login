from rest_framework.permissions import BasePermission

from .models import Role


class IsAdminRole(BasePermission):
    """Réservé aux utilisateurs dont le rôle applicatif est « admin »."""

    message = "Administrator role required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMIN)
