# Image unique de l'application ADM : frontend React compilé + API Django servis par Gunicorn.

# --- Étape 1 : compilation du frontend React ---------------------------------
FROM node:24-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src
RUN npx tsc -b && npx vite build --outDir /app/frontend_dist --emptyOutDir

# --- Étape 2 : backend Django + Gunicorn --------------------------------------
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production \
    DJANGO_DB_PATH=/data/db.sqlite3 \
    DJANGO_SECRET_KEY_FILE=/data/secret_key

WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend /app/frontend_dist ./frontend_dist

# Base de départ (compte admin…) copiée dans le volume /data au premier démarrage, puis fichiers statiques de l'admin
RUN mv db.sqlite3 /app/seed.sqlite3 \
    && DJANGO_SECRET_KEY=build-only python manage.py collectstatic --noinput --verbosity 0

COPY docker/entrypoint.sh /entrypoint.sh

# L'application tourne sous un utilisateur sans privilèges, propriétaire du volume de données
# (« adm » est déjà un groupe système Debian, d'où le nom admapp)
RUN chmod +x /entrypoint.sh \
    && useradd --create-home --uid 1000 admapp \
    && mkdir -p /data \
    && chown -R admapp:admapp /data /app
USER admapp

EXPOSE 8000
VOLUME ["/data"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-"]
