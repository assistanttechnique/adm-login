# Mise en ligne sur PythonAnywhere

Le site complet (frontend React + API Django + base SQLite) est servi sur une seule adresse :
`https://VOTRE_NOM.pythonanywhere.com`. Django renvoie le build du frontend (`backend/frontend_dist/`, versionné)
et l'API sous `/api/`. L'admin Django est sur `/django-admin/`.

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
git clone https://github.com/assistanttechnique/adm-login.git
cd adm-login
bash deploy/pythonanywhere_setup.sh
```

Lors du `git clone`, Git demande un *Username* (votre compte GitHub) et un *Password* : **collez le jeton**, pas votre mot de passe GitHub.

Le script crée l'environnement Python, génère `backend/.env` (clé secrète + domaine autorisé), applique les migrations,
collecte les fichiers statiques, puis **affiche les valeurs exactes à saisir à l'étape 4**.

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

## Mettre à jour le site

En local, après des modifications du frontend :

```bash
npm run build:deploy     # régénère backend/frontend_dist
git add -A && git commit -m "…" && git push
```

Puis sur PythonAnywhere (console Bash) :

```bash
cd ~/adm-login && git pull && bash deploy/pythonanywhere_setup.sh
```

et **Reload** dans l'onglet Web.

## À savoir

- **Compte gratuit** : l'application s'arrête si personne ne se connecte au tableau de bord PythonAnywhere pendant 3 mois.
  Cliquez sur **« Run until 3 months from today »** dans l'onglet Web pour la prolonger.
- **Base de données** : la base du serveur (`backend/db.sqlite3`) vit sa propre vie après le clonage. Évitez de committer depuis
  le serveur, et ne faites pas `git pull` d'une nouvelle version de `db.sqlite3` sans l'avoir sauvegardée : elle écraserait
  les comptes et le journal d'audit du serveur.
- **Mot de passe administrateur** : changez-le depuis la console Bash si besoin :
  `cd ~/adm-login/backend && DJANGO_SETTINGS_MODULE=config.settings.production .venv/bin/python manage.py changepassword admin26`
