from .base import *  # noqa: F401,F403

DEBUG = False

# Origines HTTPS autorisées pour les formulaires de l'admin Django (domaines publics de ALLOWED_HOSTS)
CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS if host not in ("localhost", "127.0.0.1")]  # noqa: F405

# Le site est servi en HTTPS derrière le proxy de l'hébergeur (PythonAnywhere)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
