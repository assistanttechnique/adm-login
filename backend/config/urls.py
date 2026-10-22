"""
Configuration des URLs du projet.
"""
from django.contrib import admin
from django.urls import include, path, re_path

from .spa import spa

urlpatterns = [
    # Admin Django sur /django-admin/ : /admin/… est réservé aux pages du frontend (/admin/dashboard…)
    path("django-admin/", admin.site.urls),
    # Authentification JWT (login / refresh / logout / me — voir accounts/urls.py)
    path("api/auth/", include("accounts.urls")),
    # Administration applicative (réservée au rôle admin) : utilisateurs et journal d'audit
    path("api/admin/", include("accounts.admin_urls")),
    path("api/admin/audit-logs/", include("audit.urls")),
    # Tout le reste (hors API et fichiers statiques) : frontend React compilé
    re_path(r"^(?!api/|django-admin/|static/)(?P<path>.*)$", spa),
]
