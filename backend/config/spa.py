"""
Service du frontend React (application monopage) par Django, pour un hébergement sur une seule adresse.
Les fichiers existants du build sont renvoyés tels quels ; toute autre URL renvoie index.html
afin que React Router gère la navigation (/login, /admin/dashboard…).
"""
import mimetypes

from django.conf import settings
from django.http import FileResponse, Http404

# Types MIME explicites : sous Windows, le registre peut associer .js à text/plain
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")


def spa(request, path=""):
    dist = settings.FRONTEND_DIST.resolve()
    candidate = (dist / path).resolve()

    # Fichier du build (assets, logo, favicon…) — en refusant toute sortie du dossier
    if path and candidate.is_file() and dist in candidate.parents:
        response = FileResponse(candidate.open("rb"))
        if candidate.parent.name == "assets":
            # Noms de fichiers versionnés par Vite : mise en cache longue durée sans risque
            response["Cache-Control"] = "public, max-age=31536000, immutable"
        return response

    index = dist / "index.html"
    if not index.is_file():
        raise Http404("Frontend build not found: run `npm run build:deploy`.")
    response = FileResponse(index.open("rb"), content_type="text/html; charset=utf-8")
    response["Cache-Control"] = "no-cache"
    return response
