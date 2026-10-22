from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    # Lecture seule : modifier une entrée casserait la chaîne d'intégrité
    list_display = ("timestamp", "event", "username", "ip_address")
    list_filter = ("event",)
    search_fields = ("message", "username")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
