from django.urls import path

from .views import AuditLogEntriesView, AuditLogFilesView

urlpatterns = [
    path("", AuditLogEntriesView.as_view(), name="audit-log-entries"),
    path("files/", AuditLogFilesView.as_view(), name="audit-log-files"),
]
