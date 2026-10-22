"""
Configuration des URLs du projet.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    # Authentification JWT (login / refresh / logout / me — voir accounts/urls.py)
    path("api/auth/", include("accounts.urls")),
    # Administration applicative (réservée au rôle admin) : utilisateurs et journal d'audit
    path("api/admin/", include("accounts.admin_urls")),
    path("api/admin/audit-logs/", include("audit.urls")),
]
