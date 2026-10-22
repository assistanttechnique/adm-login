from datetime import date

from django.db.models import Q
from django.db.models.functions import TruncDate
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole

from .models import GENESIS_HASH, AuditLog
from .services import verify_entries

FILE_PREFIX = "system_audit_"


def file_name(day):
    return f"{FILE_PREFIX}{day.isoformat()}.log"


class AuditLogFilesView(APIView):
    """Liste des « fichiers » de journal : un par jour contenant au moins une entrée (le plus récent d'abord)."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        days = (
            AuditLog.objects.annotate(day=TruncDate("timestamp"))
            .values_list("day", flat=True)
            .distinct()
            .order_by("-day")
        )
        return Response([{"date": day.isoformat(), "name": file_name(day)} for day in days])


class AuditLogEntriesView(APIView):
    """Entrées d'un jour donné (?date=AAAA-MM-JJ) et résultat du contrôle d'intégrité de la chaîne."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        try:
            day = date.fromisoformat(request.query_params.get("date", ""))
        except ValueError:
            raise ValidationError({"date": "Expected format: YYYY-MM-DD."})

        entries = list(AuditLog.objects.annotate(day=TruncDate("timestamp")).filter(day=day))
        # Entrée qui précède la première du jour : son empreinte ouvre la chaîne à vérifier
        previous = None
        if entries:
            first = entries[0]
            previous = (
                AuditLog.objects.filter(Q(timestamp__lt=first.timestamp) | Q(timestamp=first.timestamp, id__lt=first.id))
                .order_by("-timestamp", "-id")
                .first()
            )

        return Response(
            {
                "file": file_name(day),
                "valid": verify_entries(entries, previous.hash if previous else GENESIS_HASH),
                "entries": [
                    {
                        "id": entry.id,
                        "timestamp": entry.timestamp.isoformat(),
                        "event": entry.event,
                        "message": entry.message,
                        "user": entry.username,
                        "ip_address": entry.ip_address,
                    }
                    for entry in entries
                ],
            }
        )
