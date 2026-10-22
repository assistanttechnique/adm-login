from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from audit.services import record_event

from .admin_serializers import ManagedUserSerializer
from .models import User
from .permissions import IsAdminRole


def describe(user):
    return f"User(username={user.username}, role={user.role}, active={user.is_active})"


class ManagedUserViewSet(viewsets.ModelViewSet):
    """CRUD des utilisateurs (Admin > Manage Users), réservé aux administrateurs et tracé dans le journal d'audit."""

    serializer_class = ManagedUserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    queryset = User.objects.order_by("username")

    def perform_create(self, serializer):
        user = serializer.save()
        record_event("DATABASE OBJECT : CREATED", describe(user), self.request)

    def perform_update(self, serializer):
        user = serializer.save()
        record_event("DATABASE OBJECT : UPDATED", describe(user), self.request)

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError({"detail": "You cannot delete your own account."})
        description = describe(instance)
        instance.delete()
        record_event("DATABASE OBJECT : DELETED", description, self.request)
