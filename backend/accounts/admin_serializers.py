from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Role, User


class ManagedUserSerializer(serializers.ModelSerializer):
    """Utilisateur géré depuis la page Admin > Manage Users."""

    full_name = serializers.SerializerMethodField()
    # Obligatoire à la création, facultatif en modification (vide = inchangé)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_active",
            "last_login",
            "date_joined",
            "password",
        )
        read_only_fields = ("id", "full_name", "last_login", "date_joined")

    def get_full_name(self, user):
        return user.get_full_name() or user.username

    def validate(self, attrs):
        password = attrs.get("password") or ""
        if self.instance is None and not password:
            raise serializers.ValidationError({"password": "A password is required for a new user."})
        if password:
            # Mêmes règles que createsuperuser (longueur, mots de passe courants…)
            candidate = self.instance or User(**{k: v for k, v in attrs.items() if k != "password"})
            validate_password(password, user=candidate)

        # Un administrateur ne peut pas se retirer ses propres droits (risque de se bloquer)
        request = self.context.get("request")
        if self.instance is not None and request is not None and self.instance.pk == request.user.pk:
            if attrs.get("role", self.instance.role) != Role.ADMIN:
                raise serializers.ValidationError({"role": "You cannot remove your own administrator role."})
            if attrs.get("is_active", True) is False:
                raise serializers.ValidationError({"is_active": "You cannot deactivate your own account."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", "")
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
