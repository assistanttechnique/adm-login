#!/usr/bin/env bash
# Installation du projet ADM sous macOS / Linux (backend Django + frontend React).
# Usage : ./setup.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

step() { printf '\033[36m-> %s\033[0m\n' "$1"; }

PYTHON_BIN="$(command -v python3 || command -v python || true)"
[ -n "$PYTHON_BIN" ] || { echo "Python introuvable. Installez Python 3.10 ou plus récent."; exit 1; }
command -v npm >/dev/null || { echo "npm introuvable. Installez Node.js 20.19+ ou 22.12+."; exit 1; }

# --- Backend -------------------------------------------------------------
cd "$ROOT/backend"
if [ ! -x .venv/bin/python ]; then
  step "Création de l'environnement Python (.venv)"
  "$PYTHON_BIN" -m venv .venv
fi
PY=".venv/bin/python"
step "Mise à jour de pip"
"$PY" -m pip install --quiet --upgrade pip
step "Installation des dépendances Python"
"$PY" -m pip install --quiet -r requirements.txt

if [ ! -f .env ]; then
  # Nouvelle clé secrète propre à cette machine (jamais versionnée)
  KEY="$("$PY" -c 'from django.core.management.utils import get_random_secret_key as g; print(g())')"
  "$PY" - "$KEY" <<'EOF'
import re, sys
content = open(".env.example", encoding="utf-8").read()
content = re.sub(r"(?m)^DJANGO_SECRET_KEY=.*$", lambda _: "DJANGO_SECRET_KEY=" + sys.argv[1], content)
open(".env", "w", encoding="utf-8").write(content)
EOF
  step "backend/.env créé avec une nouvelle clé secrète"
fi

step "Application des migrations"
"$PY" manage.py migrate

# --- Frontend ------------------------------------------------------------
cd "$ROOT"
step "Installation des dépendances Node (npm ci)"
npm ci

echo
echo "Installation terminée."
echo "Pour lancer le projet, ouvrez deux terminaux :"
echo "  1) cd backend && .venv/bin/python manage.py runserver"
echo "  2) npm run dev"
echo "Puis ouvrez http://localhost:5173/login"
