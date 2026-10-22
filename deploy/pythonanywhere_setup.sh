#!/usr/bin/env bash
# Installation / mise à jour du backend sur PythonAnywhere (console Bash).
# Usage, depuis le dossier du dépôt cloné :   bash deploy/pythonanywhere_setup.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${USER}.pythonanywhere.com"

step() { printf '\033[36m-> %s\033[0m\n' "$1"; }

# Version de Python la plus récente disponible (Django 5.2 : 3.10 à 3.13)
PYTHON_BIN=""
for version in 3.13 3.12 3.11 3.10; do
  if command -v "python$version" >/dev/null; then PYTHON_BIN="python$version"; break; fi
done
[ -n "$PYTHON_BIN" ] || { echo "Aucune version de Python 3.10+ trouvée."; exit 1; }

cd "$ROOT/backend"
if [ ! -x .venv/bin/python ]; then
  step "Création de l'environnement virtuel avec $PYTHON_BIN"
  "$PYTHON_BIN" -m venv .venv
fi
PY=".venv/bin/python"
step "Installation des dépendances Python"
"$PY" -m pip install --quiet --upgrade pip
"$PY" -m pip install --quiet -r requirements.txt

if [ ! -f .env ]; then
  step "Création de backend/.env (nouvelle clé secrète, domaine $DOMAIN)"
  "$PY" - "$DOMAIN" <<'EOF'
import re, sys
from django.core.management.utils import get_random_secret_key
content = open(".env.example", encoding="utf-8").read()
content = re.sub(r"(?m)^DJANGO_SECRET_KEY=.*$", lambda _: "DJANGO_SECRET_KEY=" + get_random_secret_key(), content)
content = re.sub(r"(?m)^DJANGO_ALLOWED_HOSTS=.*$", "DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1," + sys.argv[1], content)
open(".env", "w", encoding="utf-8").write(content)
EOF
elif ! grep -q "$DOMAIN" .env; then
  step "Ajout de $DOMAIN aux domaines autorisés"
  sed -i "s/^DJANGO_ALLOWED_HOSTS=\(.*\)$/DJANGO_ALLOWED_HOSTS=\1,$DOMAIN/" .env
fi

export DJANGO_SETTINGS_MODULE=config.settings.production
step "Application des migrations"
"$PY" manage.py migrate --noinput
step "Collecte des fichiers statiques de l'admin Django"
"$PY" manage.py collectstatic --noinput --verbosity 0

[ -f frontend_dist/index.html ] || echo "ATTENTION : backend/frontend_dist est absent (lancer 'npm run build:deploy' en local puis pousser)."

VERSION="${PYTHON_BIN#python}"
cat <<EOF

Installation terminée. Réglages à saisir dans l'onglet « Web » de PythonAnywhere :

  Python version    : $VERSION
  Source code       : $ROOT
  Working directory : $ROOT/backend
  Virtualenv        : $ROOT/backend/.venv

  Static files :
    URL /static/   ->  $ROOT/backend/staticfiles
    URL /assets/   ->  $ROOT/backend/frontend_dist/assets

  Contenu du fichier WSGI (lien « WSGI configuration file ») :
------------------------------------------------------------------
import os
import sys

path = '$ROOT/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.production'

from config.wsgi import application  # noqa: E402,F401
------------------------------------------------------------------

Puis cliquez sur « Reload » et ouvrez https://$DOMAIN/login
EOF
