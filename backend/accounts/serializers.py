from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "full_name", "role")
        read_only_fields = fields

    def get_full_name(self, user):
        return user.get_full_name() or user.username


class LoginSerializer(TokenObtainPairSerializer):
    """Renvoie les tokens JWT + l'utilisateur connecté (le frontend redirige selon le rôle)."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
