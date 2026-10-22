#!/usr/bin/env bash
# Installation / mise à jour du backend sur PythonAnywhere (console Bash).
# Usage, depuis le dossier du dépôt cloné :   bash deploy/pythonanywhere_setup.sh
# (QUIET=1 masque le récapitulatif final : utilisé par les mises à jour automatiques)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${USER}.pythonanywhere.com"
# Base de données du serveur, hors du dépôt : `git pull` ne doit jamais l'écraser
DATA_DIR="$HOME/adm-data"
QUIET="${QUIET:-0}"

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

if ! grep -q '^DJANGO_DB_PATH=' .env; then
  step "Base de données du serveur placée dans $DATA_DIR (hors du dépôt Git)"
  mkdir -p "$DATA_DIR"
  # On part de la base actuelle (comptes déjà créés sur le serveur conservés), puis on rend
  # au dépôt sa version d'origine pour que les prochains `git pull` se passent sans conflit
  [ -f "$DATA_DIR/db.sqlite3" ] || cp db.sqlite3 "$DATA_DIR/db.sqlite3"
  git -C "$ROOT" checkout -- backend/db.sqlite3 2>/dev/null || true
  printf '\n# Base de données du serveur (hors dépôt)\nDJANGO_DB_PATH=%s\n' "$DATA_DIR/db.sqlite3" >> .env
fi

if ! grep -q '^GITHUB_WEBHOOK_SECRET=' .env; then
  step "Génération du secret du webhook GitHub (déploiement automatique)"
  SECRET="$("$PY" -c 'import secrets; print(secrets.token_hex(32))')"
  printf '\n# Secret partagé avec le webhook GitHub (Settings > Webhooks du dépôt)\nGITHUB_WEBHOOK_SECRET=%s\n' "$SECRET" >> .env
fi

export DJANGO_SETTINGS_MODULE=config.settings.production
step "Application des migrations"
"$PY" manage.py migrate --noinput
step "Collecte des fichiers statiques de l'admin Django"
"$PY" manage.py collectstatic --noinput --verbosity 0

[ -f frontend_dist/index.html ] || echo "ATTENTION : backend/frontend_dist est absent (lancer 'npm run build:deploy' en local puis pousser)."

[ "$QUIET" = "1" ] && exit 0

VERSION="$("$PY" -c 'import sys; print(f"{sys.version_info[0]}.{sys.version_info[1]}")')"
WEBHOOK_SECRET="$(sed -n 's/^GITHUB_WEBHOOK_SECRET=//p' .env)"
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

Déploiement automatique — sur GitHub : dépôt > Settings > Webhooks > Add webhook :
  Payload URL  : https://$DOMAIN/api/deploy/github/
  Content type : application/json
  Secret       : $WEBHOOK_SECRET
  Events       : Just the push event
(si la protection par mot de passe du site est activée, voir deploy/PYTHONANYWHERE.md)
EOF
