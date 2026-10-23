# Déploiement sur une VM avec Docker

L'application tourne dans **un seul conteneur** : le frontend React compilé et l'API Django, servis par Gunicorn.
La base SQLite et la clé secrète sont conservées dans un **volume Docker** (`adm-data`), qui survit aux mises à jour.

Ce guide vise une VM **Ubuntu ou Debian**. Sous Windows ou macOS, installez **Docker Desktop**, puis suivez les mêmes
commandes à partir de l'étape 3.

| Prérequis VM | |
|---|---|
| Système | Ubuntu 22.04 / 24.04 ou Debian 12 (ou tout Linux avec Docker) |
| Mémoire | 2 Go minimum (la compilation du frontend en a besoin) |
| Réseau | Accès à Internet (GitHub, Docker Hub) ; port d'accès ouvert (8080 par défaut) |

## 1. Installer Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

**Déconnectez-vous puis reconnectez-vous** à la VM (pour que le groupe `docker` soit pris en compte), puis vérifiez :

```bash
docker run --rm hello-world
docker compose version
```

## 2. Donner à la VM l'accès au dépôt privé

Le plus adapté à un serveur est une **clé de déploiement** : une clé SSH en lecture seule, limitée à ce dépôt et sans expiration.

Sur la VM :

```bash
sudo apt-get install -y git
ssh-keygen -t ed25519 -C "vm-adm" -f ~/.ssh/adm_deploy -N ""
cat ~/.ssh/adm_deploy.pub
```

Sur GitHub : dépôt **adm-login > Settings > Deploy keys > Add deploy key** → collez la clé affichée, nommez-la `vm-adm`,
**ne cochez pas** « Allow write access ».

De retour sur la VM, indiquez à SSH d'utiliser cette clé pour GitHub :

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/adm_deploy
  IdentitiesOnly yes
EOF
ssh -T git@github.com     # répondre « yes » ; message attendu : « You've successfully authenticated »
```

> Autre possibilité : cloner en HTTPS avec un jeton GitHub en lecture seule, comme pour PythonAnywhere.

## 3. Récupérer et configurer l'application

```bash
git clone git@github.com:assistanttechnique/adm-login.git
cd adm-login
cp .env.docker.example .env
hostname -I               # affiche l'adresse IP de la VM
nano .env                 # remplacez 192.168.1.50 par cette IP (ou par votre nom de domaine)
```

| Variable | Rôle |
|---|---|
| `ADM_PORT` | Port d'accès sur la VM (8080 par défaut) |
| `DJANGO_ALLOWED_HOSTS` | Adresses autorisées : `localhost,127.0.0.1,IP_DE_LA_VM` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | Adresse complète du site, par exemple `http://IP_DE_LA_VM:8080` (nécessaire pour `/django-admin/`) |
| `DJANGO_SECURE_COOKIES` | `false` en HTTP simple ; `true` une fois le site en HTTPS |

## 4. Lancer

```bash
docker compose up -d --build
docker compose ps          # attendre l'état « healthy » (environ 30 secondes)
```

Ouvrez **`http://IP_DE_LA_VM:8080/login`** et connectez-vous avec le compte administrateur de la base livrée (`admin26`).

Si le pare-feu de la VM est actif : `sudo ufw allow 8080/tcp`. Sur une VM cloud (Azure, AWS, OVH…), ouvrez aussi le port
dans son groupe de sécurité / pare-feu réseau.

## Commandes utiles

| Action | Commande |
|---|---|
| Voir les journaux | `docker compose logs -f` |
| Redémarrer | `docker compose restart` |
| Arrêter | `docker compose down` (les données sont conservées) |
| Changer le mot de passe admin | `docker compose exec adm python manage.py changepassword admin26` |
| Créer un administrateur | `docker compose exec adm python manage.py createsuperuser` |
| Sauvegarder la base | `docker compose cp adm:/data/db.sqlite3 ./sauvegarde-$(date +%F).sqlite3` |

> ⚠️ `docker compose down -v` **supprime le volume**, donc la base et tous les comptes. Ne l'utilisez que pour repartir de zéro.

## Mettre à jour l'application

Après un push sur GitHub, sur la VM :

```bash
cd ~/adm-login
git pull
docker compose up -d --build
```

L'image est reconstruite (frontend recompilé depuis les sources), les migrations sont appliquées au démarrage,
et la base du volume est conservée.

## Passer en HTTPS (recommandé si le site est accessible depuis Internet)

Mettez un reverse proxy HTTPS devant le conteneur (par exemple **Caddy** ou **Nginx** avec Let's Encrypt, ou un
**Cloudflare Tunnel**), puis dans `.env` :

```
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,adm.votredomaine.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://adm.votredomaine.com
DJANGO_SECURE_COOKIES=true
```

et relancez avec `docker compose up -d`.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| « Bad Request (400) » | L'adresse utilisée n'est pas dans `DJANGO_ALLOWED_HOSTS` |
| « CSRF verification failed » sur `/django-admin/` | `DJANGO_CSRF_TRUSTED_ORIGINS` ne correspond pas exactement à l'adresse (schéma, IP, port), ou `DJANGO_SECURE_COOKIES=true` en HTTP |
| Le site ne répond pas depuis un autre poste | Port fermé (pare-feu de la VM ou du réseau) |
| `port is already allocated` | Le port est déjà pris : changez `ADM_PORT` dans `.env` |
| Échec de `npm ci` pendant le build | Mémoire insuffisante sur la VM (prévoir 2 Go) |
