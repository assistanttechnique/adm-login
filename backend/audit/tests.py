from datetime import timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Role, User

from .models import AuditLog
from .services import record_event

PASSWORD = "Test-Passw0rd!"


class AuditChainTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin1", password=PASSWORD, role=Role.ADMIN)
        self.client.force_authenticate(self.admin)
        self.today = timezone.now().date().isoformat()

    def entries(self):
        return self.client.get(reverse("audit-log-entries"), {"date": self.today})

    def test_events_are_chained_and_valid(self):
        first = record_event("TEST", "first", username="system-process")
        second = record_event("TEST", "second", username="system-process")
        self.assertEqual(second.previous_hash, first.hash)

        response = self.entries()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["valid"])
        self.assertEqual([e["message"] for e in response.data["entries"]], ["first", "second"])

    def test_tampered_entry_makes_log_invalid(self):
        record_event("TEST", "first", username="system-process")
        entry = record_event("TEST", "second", username="system-process")
        AuditLog.objects.filter(pk=entry.pk).update(message="forged")
        self.assertFalse(self.entries().data["valid"])

    def test_deleted_entry_makes_log_invalid(self):
        record_event("TEST", "first", username="system-process")
        middle = record_event("TEST", "second", username="system-process")
        record_event("TEST", "third", username="system-process")
        middle.delete()
        self.assertFalse(self.entries().data["valid"])

    def test_previous_day_entry_opens_the_chain(self):
        old = record_event("TEST", "yesterday", username="system-process")
        AuditLog.objects.filter(pk=old.pk).update(timestamp=old.timestamp - timedelta(days=1))
        # La date fait partie de l'empreinte : on recalcule pour simuler une entrée réellement écrite la veille
        old.refresh_from_db()
        AuditLog.objects.filter(pk=old.pk).update(hash=old.compute_hash())
        record_event("TEST", "today", username="system-process")
        self.assertTrue(self.entries().data["valid"])

    def test_files_list_one_entry_per_day(self):
        record_event("TEST", "first", username="system-process")
        response = self.client.get(reverse("audit-log-files"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["name"], f"system_audit_{self.today}.log")

    def test_invalid_date_is_rejected(self):
        response = self.client.get(reverse("audit-log-entries"), {"date": "nope"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_requires_admin_role(self):
        user = User.objects.create_user(username="user1", password=PASSWORD)
        self.client.force_authenticate(user)
        self.assertEqual(self.client.get(reverse("audit-log-files")).status_code, status.HTTP_403_FORBIDDEN)


class AuthenticationAuditTests(APITestCase):
    def setUp(self):
        User.objects.create_user(username="admin1", password=PASSWORD, role=Role.ADMIN)

    def test_login_success_and_failure_are_logged(self):
        self.client.post(reverse("login"), {"username": "admin1", "password": "wrong"}, format="json")
        self.client.post(reverse("login"), {"username": "admin1", "password": PASSWORD}, format="json")
        events = list(AuditLog.objects.values_list("event", "username"))
        self.assertEqual(events, [("AUTHENTICATION_FAILURE", "anonymousUser"), ("AUTHENTICATION_SUCCESS", "admin1")])
