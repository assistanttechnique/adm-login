from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from audit.models import AuditLog

from .models import Role, User

PASSWORD = "Test-Passw0rd!"


class UserModelTests(APITestCase):
    def test_default_role_is_user(self):
        user = User.objects.create_user(username="alice", password=PASSWORD)
        self.assertEqual(user.role, Role.USER)
        self.assertFalse(user.is_admin)

    def test_superuser_is_admin(self):
        admin = User.objects.create_superuser(username="root", password=PASSWORD)
        self.assertEqual(admin.role, Role.ADMIN)
        self.assertTrue(admin.is_admin)


class AuthApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="admin1", password=PASSWORD, role=Role.ADMIN)

    def login(self, password=PASSWORD):
        return self.client.post(reverse("login"), {"username": "admin1", "password": password}, format="json")

    def test_login_returns_tokens_and_user(self):
        response = self.login()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "admin1")
        self.assertEqual(response.data["user"]["role"], Role.ADMIN)

    def test_login_with_wrong_password_fails(self):
        response = self.login(password="wrong")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        access = self.login().data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["role"], Role.ADMIN)

    def test_logout_blacklists_refresh_token(self):
        tokens = self.login().data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = self.client.post(reverse("logout"), {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        response = self.client.post(reverse("token_refresh"), {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ManagedUsersApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin1", password=PASSWORD, role=Role.ADMIN)
        self.client.force_authenticate(self.admin)
        self.list_url = reverse("managed-user-list")

    def detail_url(self, user):
        return reverse("managed-user-detail", args=[user.pk])

    def test_admin_can_list_users(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["username"], "admin1")
        self.assertNotIn("password", response.data[0])

    def test_non_admin_is_forbidden(self):
        user = User.objects.create_user(username="user1", password=PASSWORD)
        self.client.force_authenticate(user)
        self.assertEqual(self.client.get(self.list_url).status_code, status.HTTP_403_FORBIDDEN)

    def test_create_user_hashes_password_and_is_audited(self):
        payload = {"username": "bob", "email": "bob@example.com", "role": Role.USER, "password": PASSWORD}
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        bob = User.objects.get(username="bob")
        self.assertTrue(bob.check_password(PASSWORD))
        self.assertTrue(AuditLog.objects.filter(event="DATABASE OBJECT : CREATED", username="admin1").exists())

    def test_create_requires_password_and_validates_it(self):
        response = self.client.post(self.list_url, {"username": "bob"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.post(self.list_url, {"username": "bob", "password": "123"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_without_password_keeps_it(self):
        bob = User.objects.create_user(username="bob", password=PASSWORD)
        response = self.client.patch(self.detail_url(bob), {"first_name": "Bob", "password": ""}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        bob.refresh_from_db()
        self.assertEqual(bob.first_name, "Bob")
        self.assertTrue(bob.check_password(PASSWORD))

    def test_admin_cannot_remove_own_role_or_delete_self(self):
        response = self.client.patch(self.detail_url(self.admin), {"role": Role.USER}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.delete(self.detail_url(self.admin))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(pk=self.admin.pk).exists())

    def test_delete_user(self):
        bob = User.objects.create_user(username="bob", password=PASSWORD)
        response = self.client.delete(self.detail_url(bob))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username="bob").exists())
