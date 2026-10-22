#!/usr/bin/env bash
# Mise à jour du site sur PythonAnywhere : récupère la dernière version de main et recharge le site.
# Lancé automatiquement par le webhook GitHub (config/deploy_hook.py), ou à la main :
#   bash deploy/pythonanywhere_update.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Serveur installé avant le déplacement de la base : on la sort d'abord du dépôt pour que `git pull` passe
if ! grep -q '^DJANGO_DB_PATH=' backend/.env 2>/dev/null; then
  QUIET=1 bash deploy/pythonanywhere_setup.sh
fi

echo "-> git pull (main)"
git pull --ff-only origin main

# Dépendances, migrations et fichiers statiques (sans le récapitulatif d'installation)
QUIET=1 bash deploy/pythonanywhere_setup.sh

# PythonAnywhere recharge l'application quand son fichier WSGI est modifié
WSGI_FILE="/var/www/$(echo "$USER" | tr '[:upper:].' '[:lower:]_')_pythonanywhere_com_wsgi.py"
if [ -f "$WSGI_FILE" ]; then
  touch "$WSGI_FILE"
  echo "-> Site rechargé ($(git rev-parse --short HEAD))"
else
  echo "ATTENTION : $WSGI_FILE introuvable, rechargez le site depuis l'onglet Web."
fi
