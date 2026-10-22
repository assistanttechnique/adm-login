import hashlib

from django.db import models
from django.utils import timezone

GENESIS_HASH = "0" * 64


class AuditLog(models.Model):
    """
    Entrée du journal d'audit. Chaque entrée est chaînée à la précédente
    (previous_hash) : modifier ou supprimer une ligne casse la chaîne et rend le journal « Invalid ».
    """

    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    event = models.CharField(max_length=64)
    message = models.TextField()
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    previous_hash = models.CharField(max_length=64)
    hash = models.CharField(max_length=64)

    class Meta:
        ordering = ["timestamp", "id"]
        verbose_name = "Entrée du journal d'audit"
        verbose_name_plural = "Journal d'audit"

    def compute_hash(self):
        content = "|".join(
            [self.previous_hash, self.timestamp.isoformat(), self.event, self.message, self.username, self.ip_address or ""]
        )
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def __str__(self):
        return f"{self.timestamp:%Y-%m-%d %H:%M:%S} {self.event}"
