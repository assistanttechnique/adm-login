# Mise en ligne sur PythonAnywhere

Le site complet (frontend React + API Django + base SQLite) est servi sur une seule adresse :
`https://VOTRE_NOM.pythonanywhere.com`. Django renvoie le build du frontend (`backend/frontend_dist/`, versionné)
et l'API sous `/api/`. L'admin Django est sur `/django-admin/`. Une fois le webhook configuré (étape 6),
**chaque push sur `main` met le site à jour automatiquement**.

> Dans ce guide, remplacez `VOTRE_NOM` par votre nom d'utilisateur PythonAnywhere.

## 1. Créer le compte

1. Créez un compte gratuit (« Beginner ») sur https://www.pythonanywhere.com.
   Le nom d'utilisateur choisi devient l'adresse du site : `VOTRE_NOM.pythonanywhere.com`.

## 2. Autoriser PythonAnywhere à lire le dépôt privé

Le dépôt GitHub est privé : il faut un jeton d'accès en lecture seule.

1. Sur GitHub : **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**.
2. *Repository access* : **Only select repositories** → `assistanttechnique/adm-login`.
3. *Permissions* : **Contents → Read-only** (rien d'autre).
4. Copiez le jeton (il ne sera plus affiché).

## 3. Cloner le projet et l'installer

Sur PythonAnywhere, ouvrez **Consoles > Bash**, puis :

```bash
git config --global credential.helper store
git clone https://github.com/assistanttechnique/adm-login.git
cd adm-login
bash deploy/pythonanywhere_setup.sh
```

Lors du `git clone`, Git demande un *Username* (votre compte GitHub) et un *Password* : **collez le jeton**, pas votre mot de passe GitHub.
La première ligne enregistre le jeton sur le serveur (`~/.git-credentials`) : **indispensable pour les mises à jour automatiques**,
qui font un `git pull` sans pouvoir saisir de mot de passe.

Le script crée l'environnement Python, génère `backend/.env` (clé secrète, domaine autorisé, secret du webhook),
place la base de données dans `~/adm-data/` (hors du dépôt), applique les migrations, collecte les fichiers statiques,
puis **affiche les valeurs exactes à saisir aux étapes 4 et 6**.

## 4. Configurer l'application web

Onglet **Web** > **Add a new web app** > *Next* > **Manual configuration** (pas « Django ») > choisissez **la version de Python
affichée par le script**. Puis, sur la page de l'application :

| Section | Valeur |
|---|---|
| Code > Source code | `/home/VOTRE_NOM/adm-login` |
| Code > Working directory | `/home/VOTRE_NOM/adm-login/backend` |
| Virtualenv | `/home/VOTRE_NOM/adm-login/backend/.venv` |
| Static files : URL `/static/` | `/home/VOTRE_NOM/adm-login/backend/staticfiles` |
| Static files : URL `/assets/` | `/home/VOTRE_NOM/adm-login/backend/frontend_dist/assets` |
| Security > Force HTTPS | **Enabled** |
| Security > Password protection | **Recommandé** tant que l'usage de la marque Accutive n'est pas validé |

Cliquez sur le lien **WSGI configuration file**, **remplacez tout son contenu** par le bloc affiché par le script, enregistrez.

Cliquez enfin sur **Reload** (bouton vert en haut de l'onglet Web).

## 5. Tester

Ouvrez `https://VOTRE_NOM.pythonanywhere.com/login` et connectez-vous avec un compte administrateur
(le compte `admin26` de la base versionnée, ou un compte créé avec `createsuperuser`).

En cas de problème, consultez l'**error log** (lien en bas de l'onglet Web).

## 6. Activer la mise à jour automatique

À chaque push sur `main`, GitHub prévient le site, qui récupère le code (`git pull`), applique les migrations et se recharge seul.

Sur GitHub : dépôt **adm-login > Settings > Webhooks > Add webhook**, avec les valeurs affichées par le script :

| Champ | Valeur |
|---|---|
| Payload URL | `https://VOTRE_NOM.pythonanywhere.com/api/deploy/github/` |
| Content type | `application/json` |
| Secret | la valeur `GITHUB_WEBHOOK_SECRET` affichée par le script (aussi dans `backend/.env` sur le serveur) |
| Which events…? | **Just the push event** |

Enregistrez : GitHub envoie aussitôt un test (« ping »). Dans l'onglet **Recent Deliveries** du webhook, il doit apparaître
avec une coche verte et la réponse `{"status": "pong"}`.

> **Protection par mot de passe activée sur le site ?** Elle bloque aussi GitHub (réponse 401). Mettez alors
> l'identifiant et le mot de passe de la protection dans l'URL : `https://IDENTIFIANT:MOT_DE_PASSE@VOTRE_NOM.pythonanywhere.com/api/deploy/github/`.

Chaque déploiement est inscrit dans **Admin > Audit Logs** (événement `DEPLOYMENT`) et détaillé dans `~/adm-deploy.log` sur le serveur.

## Publier une modification

En local :

```bash
npm run build:deploy     # seulement si le frontend a changé : régénère backend/frontend_dist
git add -A && git commit -m "…" && git push
```

Le site se met à jour tout seul en quelques secondes. Sans webhook, ou en cas d'échec, mettez-le à jour à la main
depuis une console Bash de PythonAnywhere :

```bash
cd ~/adm-login && bash deploy/pythonanywhere_update.sh
```

## À savoir

- **Compte gratuit** : l'application s'arrête si personne ne se connecte au tableau de bord PythonAnywhere pendant 3 mois.
  Cliquez sur **« Run until 3 months from today »** dans l'onglet Web pour la prolonger.
- **Base de données** : la base du serveur est `~/adm-data/db.sqlite3`, copiée depuis le dépôt à la première installation.
  Elle n'est plus jamais touchée par les mises à jour : les comptes et le journal d'audit du serveur sont conservés, même si
  `backend/db.sqlite3` change dans le dépôt. Pour la sauvegarder, copiez simplement ce fichier.
- **Jeton GitHub** : à son expiration, les mises à jour automatiques échouent (`git pull` refusé). Générez un nouveau jeton,
  lancez `rm ~/.git-credentials`, puis `cd ~/adm-login && git pull` et saisissez le nouveau jeton.
- **Mot de passe administrateur** : changez-le depuis la console Bash si besoin :
  `cd ~/adm-login/backend && DJANGO_SETTINGS_MODULE=config.settings.production .venv/bin/python manage.py changepassword admin26`
