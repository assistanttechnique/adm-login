# ADM – Data Discovery and Masking Platform

Reproduction de l'interface d'administration ADM (découverte et masquage de données sensibles).

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS 4 + lucide-react (racine du dépôt, dossier `src/`)
- **Backend** : Django 5.2 + Django REST Framework + JWT (dossier `backend/`), base SQLite versionnée (`backend/db.sqlite3`)

## Prérequis

| Outil | Version |
|---|---|
| Python | 3.10 ou plus récent (développé avec 3.13) |
| Node.js | 20.19+ ou 22.12+ (développé avec 24) |
| Git | toute version récente |

## Installation après clonage

> **Windows** : clonez le dépôt dans un chemin court (par exemple `C:\dev\adm-login` ou `Documents\adm-login`).
> Certaines dépendances Python ont des chemins de fichiers longs, et l'installation échoue au-delà de 260 caractères
> si les [chemins longs](https://learn.microsoft.com/windows/win32/fileio/maximum-file-path-limitation) ne sont pas activés.

Le script crée l'environnement Python, installe les dépendances, génère `backend/.env` avec une clé secrète propre à la machine,
applique les migrations et installe les dépendances Node.

**Windows (PowerShell)**

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

**macOS / Linux**

```bash
chmod +x setup.sh && ./setup.sh
```

## Lancement

Deux terminaux sont nécessaires :

```bash
# Terminal 1 : backend (http://localhost:8000)
cd backend
.venv/Scripts/python manage.py runserver      # Windows
.venv/bin/python manage.py runserver          # macOS / Linux
```

```bash
# Terminal 2 : frontend (http://localhost:5173)
npm run dev
```

Ouvrir ensuite http://localhost:5173/login. En développement, Vite redirige les appels `/api` vers le backend (voir `vite.config.ts`).

## Compte administrateur

La base versionnée contient déjà un compte administrateur : **admin26**. Son mot de passe n'est pas écrit dans le dépôt :
demandez-le à l'équipe, ou changez-le / créez un autre compte depuis `backend/` :

```bash
.venv/Scripts/python manage.py changepassword admin26   # macOS / Linux : .venv/bin/python
.venv/Scripts/python manage.py createsuperuser          # nouveau compte (rôle admin automatique)
```

Seuls les comptes de rôle **admin** peuvent se connecter à l'interface. Les autres comptes se gèrent ensuite dans **Admin > Manage Users**.

## Données

| Donnée | Où elle est stockée |
|---|---|
| Utilisateurs, rôles, journal d'audit, jetons JWT | Base SQLite `backend/db.sqlite3` (persistants) |
| Connexions, assessments, règles Control Fields / Values, configurations Discovery et Masking, projets | État React en mémoire, initialisé avec des données de démonstration (`src/pages/**/…Data.ts`) — réinitialisé à chaque rechargement du navigateur |

Repartir d'une base vierge : supprimer `backend/db.sqlite3`, puis `python manage.py migrate` et `python manage.py createsuperuser`.

## Mise en ligne

Le site peut être publié sur PythonAnywhere (gratuit, une seule adresse pour le frontend et l'API) :
voir **[deploy/PYTHONANYWHERE.md](deploy/PYTHONANYWHERE.md)**. En production, Django sert le build du frontend
(`backend/frontend_dist/`, régénéré par `npm run build:deploy`) et l'admin Django est sur `/django-admin/`.
Une fois le webhook GitHub configuré, **chaque push sur `main` met le site en ligne à jour automatiquement**.

## Commandes utiles

```bash
npm run build:deploy   # build du frontend servi par Django en production (backend/frontend_dist/)
npm run build      # vérification TypeScript + build de production (dist/)
npm run lint       # oxlint
cd backend && .venv/Scripts/python manage.py test   # tests backend (macOS / Linux : .venv/bin/python)
```

## API backend

| Route | Rôle |
|---|---|
| `POST /api/auth/login/` | Connexion (renvoie les jetons JWT et l'utilisateur) |
| `POST /api/auth/refresh/` | Renouvellement du jeton d'accès |
| `POST /api/auth/logout/` | Déconnexion (invalide le refresh token) |
| `GET /api/auth/me/` | Utilisateur connecté |
| `/api/admin/users/` | CRUD des utilisateurs (rôle admin requis) |
| `GET /api/admin/audit-logs/files/` | Fichiers de journal (un par jour) |
| `GET /api/admin/audit-logs/?date=AAAA-MM-JJ` | Entrées d'un jour + contrôle d'intégrité de la chaîne |
| `POST /api/deploy/github/` | Webhook GitHub de déploiement automatique (signature HMAC, actif seulement si `GITHUB_WEBHOOK_SECRET` est défini) |

## Structure

```
├── backend/            # Django : config/, accounts/ (utilisateurs, auth), audit/ (journal chaîné)
│   ├── db.sqlite3      # base versionnée
│   └── .env.example    # modèle de configuration (le vrai .env n'est jamais versionné)
├── public/             # logo et favicon
├── src/
│   ├── api/            # client HTTP (jetons JWT, renouvellement automatique)
│   ├── auth/           # contexte d'authentification, garde des routes admin
│   ├── components/     # composants réutilisables (Select, Modal, DualListBox…)
│   ├── layouts/        # layout admin, menu (navigation.ts), en-tête, pied de page
│   └── pages/          # pages par module (connections, discovery, masking, projects, admin)
├── setup.ps1 / setup.sh
└── vite.config.ts
```

## Limites connues

- Le moteur de scan et de masquage n'est pas branché : **Scan**, **Run** et les rapports n'exécutent rien de réel.
- Pages encore provisoires : Ignore Fields, Ignore Tables, Ignore Groups, Scheduler, Projects Reports.
- Les données métier (hors utilisateurs et audit) ne sont pas encore persistées côté backend.
