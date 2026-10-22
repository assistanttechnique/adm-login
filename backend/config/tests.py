import hashlib
import hmac
import json
from unittest import mock

from django.test import TestCase, override_settings
from django.urls import reverse

from audit.models import AuditLog

SECRET = "test-webhook-secret"


def signed_headers(body, event="push", secret=SECRET):
    signature = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return {"HTTP_X_HUB_SIGNATURE_256": signature, "HTTP_X_GITHUB_EVENT": event}


@override_settings(GITHUB_WEBHOOK_SECRET=SECRET)
class GithubDeployHookTests(TestCase):
    url = reverse("github-deploy")

    def post(self, payload, **headers):
        body = json.dumps(payload).encode()
        return self.client.post(self.url, body, content_type="application/json", **(headers or signed_headers(body)))

    @override_settings(GITHUB_WEBHOOK_SECRET="")
    def test_disabled_without_secret(self):
        self.assertEqual(self.post({"ref": "refs/heads/main"}).status_code, 404)

    def test_rejects_bad_signature(self):
        body = json.dumps({"ref": "refs/heads/main"}).encode()
        headers = signed_headers(body, secret="wrong-secret")
        with mock.patch("config.deploy_hook.run_deploy_script") as run:
            response = self.post({"ref": "refs/heads/main"}, **headers)
        self.assertEqual(response.status_code, 403)
        run.assert_not_called()

    def test_ping(self):
        body = json.dumps({"zen": "hello"}).encode()
        response = self.post({"zen": "hello"}, **signed_headers(body, event="ping"))
        self.assertEqual(response.json()["status"], "pong")

    def test_ignores_other_branches(self):
        with mock.patch("config.deploy_hook.run_deploy_script") as run:
            response = self.post({"ref": "refs/heads/feature"})
        self.assertEqual(response.json()["status"], "ignored")
        run.assert_not_called()

    @mock.patch("config.deploy_hook.LOG_FILE")
    def test_push_on_main_runs_deployment_and_is_audited(self, log_file):
        payload = {"ref": "refs/heads/main", "after": "abcdef1234567", "pusher": {"name": "dev"}}
        with mock.patch("config.deploy_hook.run_deploy_script", return_value=(True, "ok")) as run:
            response = self.post(payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "deployed", "commit": "abcdef1"})
        run.assert_called_once()
        self.assertTrue(AuditLog.objects.filter(event="DEPLOYMENT", username="github-webhook").exists())

    @mock.patch("config.deploy_hook.LOG_FILE")
    def test_failed_deployment_returns_500(self, log_file):
        with mock.patch("config.deploy_hook.run_deploy_script", return_value=(False, "git pull failed")):
            response = self.post({"ref": "refs/heads/main", "after": "abc"})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json()["status"], "failed")

    def test_get_is_not_allowed(self):
        self.assertEqual(self.client.get(self.url).status_code, 405)
