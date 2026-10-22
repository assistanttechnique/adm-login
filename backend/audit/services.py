from django.db import transaction

from .models import GENESIS_HASH, AuditLog


def client_ip(request):
    """Adresse IP du client (en tenant compte d'un éventuel proxy comme Nginx)."""
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


@transaction.atomic
def record_event(event, message, request=None, username=None):
    """Ajoute une entrée au journal d'audit, chaînée à la précédente."""
    if username is None:
        user = getattr(request, "user", None)
        username = user.username if user is not None and user.is_authenticated else "anonymousUser"

    # Verrouille la dernière entrée pour garder une chaîne cohérente en cas d'écritures simultanées
    last = AuditLog.objects.select_for_update().order_by("-timestamp", "-id").first()
    entry = AuditLog(
        event=event,
        message=message,
        username=username,
        ip_address=client_ip(request),
        previous_hash=last.hash if last else GENESIS_HASH,
    )
    entry.hash = entry.compute_hash()
    entry.save()
    return entry


def verify_entries(entries, previous_hash):
    """
    Vérifie l'intégrité d'une suite d'entrées consécutives.
    `previous_hash` est l'empreinte de l'entrée qui précède la première (ou GENESIS_HASH).
    """
    expected_previous = previous_hash
    for entry in entries:
        if entry.previous_hash != expected_previous or entry.compute_hash() != entry.hash:
            return False
        expected_previous = entry.hash
    return True
