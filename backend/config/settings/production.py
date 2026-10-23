import os

from .base import *  # noqa: F401,F403

DEBUG = False


def env_list(name):
    return [value.strip() for value in os.environ.get(name, "").split(",") if value.strip()]


def env_bool(name, default):
    value = os.environ.get(name)
    return default if value is None else value.strip().lower() in ("1", "true", "yes", "on")


# Origines autorisées pour les formulaires de l'admin Django.
# Par défaut : https:// + chaque domaine public de ALLOWED_HOSTS (PythonAnywhere).
# Sur une VM en HTTP (http://IP:PORT), les définir explicitement dans DJANGO_CSRF_TRUSTED_ORIGINS.
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS") or [
    f"https://{host}" for host in ALLOWED_HOSTS if host not in ("localhost", "127.0.0.1")  # noqa: F405
]

# Le site est servi en HTTPS derrière un proxy (PythonAnywhere, ou reverse proxy devant Docker)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Cookies réservés au HTTPS. À désactiver (DJANGO_SECURE_COOKIES=false) seulement si le site est servi
# en HTTP simple, sinon la connexion à l'admin Django est impossible. L'interface React (jetons JWT) n'est pas concernée.
SESSION_COOKIE_SECURE = env_bool("DJANGO_SECURE_COOKIES", True)
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
