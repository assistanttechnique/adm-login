from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from audit.services import record_event

from .serializers import LoginSerializer, LogoutSerializer, UserSerializer


class LoginView(TokenObtainPairView):
    """Connexion par nom d'utilisateur + mot de passe (succès et échecs tracés dans le journal d'audit)."""

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        username = str(request.data.get("username", ""))
        try:
            response = super().post(request, *args, **kwargs)
        except AuthenticationFailed:
            record_event("AUTHENTICATION_FAILURE", f"Failed login attempt for username '{username}'.", request, "anonymousUser")
            raise
        record_event("AUTHENTICATION_SUCCESS", f"User '{username}' logged in.", request, username)
        return response


class MeView(APIView):
    """Utilisateur courant (utilisé par le frontend au rechargement de la page)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    """Déconnexion : blackliste le refresh token pour l'invalider."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError:
            return Response({"detail": "Token invalide ou déjà expiré."}, status=status.HTTP_400_BAD_REQUEST)
        record_event("LOGOUT", f"User '{request.user.username}' logged out.", request)
        return Response(status=status.HTTP_205_RESET_CONTENT)
