#!/bin/sh
# Démarrage du conteneur : clé secrète, base de données persistante, migrations, puis serveur.
set -e

# Clé secrète : fournie par l'environnement, sinon générée une fois et conservée dans le volume.
# Django la relit dans ce fichier (DJANGO_SECRET_KEY_FILE), y compris pour `docker compose exec … manage.py`.
if [ -z "${DJANGO_SECRET_KEY:-}" ] && [ ! -s "$DJANGO_SECRET_KEY_FILE" ]; then
  python -c "from django.core.management.utils import get_random_secret_key as g; print(g())" > "$DJANGO_SECRET_KEY_FILE"
  chmod 600 "$DJANGO_SECRET_KEY_FILE"
  echo "-> Nouvelle clé secrète générée dans le volume de données"
fi

# Premier démarrage : on part de la base livrée avec le dépôt (compte administrateur…)
if [ ! -f "$DJANGO_DB_PATH" ]; then
  cp /app/seed.sqlite3 "$DJANGO_DB_PATH"
  echo "-> Base de données initialisée dans $DJANGO_DB_PATH"
fi

python manage.py migrate --noinput

exec "$@"
