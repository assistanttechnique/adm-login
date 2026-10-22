"""
Webhook GitHub de déploiement automatique (PythonAnywhere).

À chaque push sur la branche main, GitHub appelle POST /api/deploy/github/. La requête est authentifiée
par la signature HMAC-SHA256 (en-tête X-Hub-Signature-256) calculée avec le secret partagé
GITHUB_WEBHOOK_SECRET. Le script fixe deploy/pythonanywhere_update.sh est alors lancé
(git pull, dépendances, migrations, fichiers statiques, rechargement du site).
Aucune donnée de la requête n'est transmise au script.
"""
import hashlib
import hmac
import json
import subprocess
from pathlib import Path

from django.conf import settings
from django.http import Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from audit.services import record_event

DEPLOY_TIMEOUT_SECONDS = 240
LOG_FILE = Path.home() / "adm-deploy.log"


def signature_is_valid(body, header):
    secret = settings.GITHUB_WEBHOOK_SECRET.encode("utf-8")
    expected = "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header or "")


def run_deploy_script():
    """Lance le script de mise à jour ; renvoie (succès, sortie)."""
    try:
        result = subprocess.run(
            ["bash", str(settings.DEPLOY_SCRIPT)],
            cwd=settings.DEPLOY_SCRIPT.parent.parent,
            capture_output=True,
            text=True,
            timeout=DEPLOY_TIMEOUT_SECONDS,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        return False, str(error)
    return result.returncode == 0, result.stdout + result.stderr


@csrf_exempt
@require_POST
def github_deploy(request):
    # Webhook inexistant tant que le secret n'est pas configuré sur le serveur
    if not settings.GITHUB_WEBHOOK_SECRET:
        raise Http404()

    if not signature_is_valid(request.body, request.headers.get("X-Hub-Signature-256")):
        return JsonResponse({"detail": "Invalid signature."}, status=403)

    event = request.headers.get("X-GitHub-Event", "")
    if event == "ping":
        return JsonResponse({"status": "pong"})
    if event != "push":
        return JsonResponse({"status": "ignored", "reason": f"event '{event}'"})

    try:
        payload = json.loads(request.body)
    except ValueError:
        return JsonResponse({"detail": "Invalid JSON payload."}, status=400)
    if payload.get("ref") != settings.DEPLOY_BRANCH:
        return JsonResponse({"status": "ignored", "reason": f"ref '{payload.get('ref')}'"})

    commit = str(payload.get("after", ""))[:7]
    pusher = str((payload.get("pusher") or {}).get("name", "unknown"))
    success, output = run_deploy_script()

    # Trace complète du déploiement dans un fichier du serveur, résumé dans le journal d'audit
    with LOG_FILE.open("a", encoding="utf-8") as log:
        log.write(f"\n=== Déploiement {commit} ({pusher}) : {'OK' if success else 'ÉCHEC'}\n{output}\n")
    record_event(
        "DEPLOYMENT",
        f"Push {commit} by {pusher}: {'deployed' if success else 'failed (see ~/adm-deploy.log)'}",
        request,
        username="github-webhook",
    )

    if not success:
        return JsonResponse({"status": "failed", "commit": commit, "output": output[-2000:]}, status=500)
    return JsonResponse({"status": "deployed", "commit": commit})
