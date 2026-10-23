"""
Settings de base — partagés entre les environnements.
Aucun secret en dur : tout passe par les variables d'environnement (voir .env.example).
"""

import os
from datetime import timedelta
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def read_secret_key():
    """Clé secrète : variable DJANGO_SECRET_KEY, sinon fichier DJANGO_SECRET_KEY_FILE (volume Docker)."""
    key = os.environ.get("DJANGO_SECRET_KEY")
    key_file = os.environ.get("DJANGO_SECRET_KEY_FILE")
    if not key and key_file and Path(key_file).is_file():
        key = Path(key_file).read_text(encoding="utf-8").strip()
    if not key:
        raise ImproperlyConfigured("DJANGO_SECRET_KEY is not set (see backend/.env.example).")
    return key


SECRET_KEY = read_secret_key()

ALLOWED_HOSTS = [host.strip() for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if host.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Tiers
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    # Apps du projet
    "accounts",
    "audit",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Sert STATIC_ROOT (admin Django) en production, sans serveur web séparé
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --- Base de données ---
# SQLite pour démarrer ; à remplacer par PostgreSQL via variables d'environnement plus tard.
# DJANGO_DB_PATH permet de placer la base hors du dépôt Git (sur le serveur : les mises à jour
# automatiques par `git pull` ne doivent jamais écraser les comptes ni le journal d'audit).
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.environ.get("DJANGO_DB_PATH") or BASE_DIR / "db.sqlite3",
    }
}

# --- Déploiement automatique (webhook GitHub, voir config/deploy_hook.py) ---
# Désactivé tant que le secret n'est pas défini dans .env
GITHUB_WEBHOOK_SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET", "")
DEPLOY_BRANCH = "refs/heads/main"
DEPLOY_SCRIPT = BASE_DIR.parent / "deploy" / "pythonanywhere_update.sh"

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
# Fichiers statiques de l'admin Django, rassemblés par `collectstatic` (servis par l'hébergeur)
STATIC_ROOT = BASE_DIR / "staticfiles"

# Build du frontend React servi par Django en production (`npm run build:deploy`)
FRONTEND_DIST = BASE_DIR / "frontend_dist"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Django REST Framework : JWT + authentification requise par défaut ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
