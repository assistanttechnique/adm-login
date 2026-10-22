"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
from pathlib import Path

from django.core.wsgi import get_wsgi_application
from dotenv import load_dotenv

# Charge backend/.env (clé secrète, domaines autorisés), comme manage.py
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# En production, l'hébergeur définit DJANGO_SETTINGS_MODULE=config.settings.production
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

application = get_wsgi_application()
