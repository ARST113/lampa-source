import json
import unittest

from scripts.lab.codespace_control import (
    CodespacesClient,
    backend_url,
    ensure_decision,
    pages_url,
    public_host,
    redact,
    remote_start_command,
    remote_ssh_args,
    select_codespace,
)


class FakeTransport:
    def __init__(self, responses=None):
        self.responses = list(responses or [])
        self.calls = []

    def __call__(self, method, url, data, headers):
        self.calls.append((method, url, data, headers))
        if self.responses:
            return self.responses.pop(0)
        return {}


class ControlTests(unittest.TestCase):
    def test_selects_newest_matching_display_name(self):
        items = [
            {'name': 'old', 'display_name': 'Lampa Full Stack Lab', 'created_at': '2026-09-01T00:00:00Z'},
            {'name': 'other', 'display_name': 'Other', 'created_at': '2026-09-08T00:00:00Z'},
            {'name': 'new', 'display_name': 'Lampa Full Stack Lab', 'created_at': '2026-09-08T10:00:00Z'},
        ]
        self.assertEqual(select_codespace(items, 'Lampa Full Stack Lab')['name'], 'new')

    def test_ensure_starts_shutdown_codespace(self):
        self.assertEqual(ensure_decision('Shutdown'), 'start')
        self.assertEqual(ensure_decision('Stopped'), 'start')

    def test_ensure_does_not_restart_available_codespace(self):
        self.assertEqual(ensure_decision('Available'), 'keep')

    def test_public_host_and_backend_url(self):
        self.assertEqual(
            public_host('silver-space-123', 9118),
            'silver-space-123-9118.app.github.dev',
        )
        self.assertEqual(
            backend_url('silver-space-123', 9118),
            'https://silver-space-123-9118.app.github.dev',
        )

    def test_remote_start_command_passes_explicit_public_host(self):
        command = remote_start_command('silver-space-123')
        self.assertIn(
            'LAB_PUBLIC_HOST=silver-space-123-9118.app.github.dev',
            command,
        )
        self.assertIn('bash .devcontainer/start-lab.sh', command)
        self.assertNotIn('CODESPACE_NAME=', command)

    def test_pages_url_urlencodes_backend(self):
        url = pages_url('https://silver-space-123-9118.app.github.dev')
        self.assertEqual(
            url,
            'https://arst113.github.io/lampa-source/test/?lampac=https%3A%2F%2Fsilver-space-123-9118.app.github.dev',
        )

    def test_redacts_token(self):
        self.assertEqual(redact('token=abc123 and abc123 again', ['abc123']), 'token=*** and *** again')

    def test_remote_ssh_passes_command_as_single_remote_argument(self):
        self.assertEqual(
            remote_ssh_args('silver-space', 'docker ps -a'),
            ['gh', 'codespace', 'ssh', '-c', 'silver-space', 'docker ps -a'],
        )
        self.assertNotIn('--', remote_ssh_args('silver-space', 'docker ps -a'))

    def test_client_lists_authenticated_user_codespaces(self):
        transport = FakeTransport([{'codespaces': []}])
        client = CodespacesClient('secret', 'ARST113/lampa-source', transport=transport)
        self.assertEqual(client.list_codespaces(), [])
        method, url, data, headers = transport.calls[0]
        self.assertEqual(method, 'GET')
        self.assertIn('/user/codespaces', url)
        self.assertIsNone(data)
        self.assertEqual(headers['Authorization'], 'Bearer secret')

    def test_client_creates_codespace_with_lab_defaults(self):
        transport = FakeTransport([{'name': 'created-space'}])
        client = CodespacesClient('secret', 'ARST113/lampa-source', transport=transport)
        result = client.create_codespace('feat/github-full-stack-lab')
        self.assertEqual(result['name'], 'created-space')
        method, url, data, _ = transport.calls[0]
        self.assertEqual(method, 'POST')
        self.assertTrue(url.endswith('/repos/ARST113/lampa-source/codespaces'))
        payload = json.loads(data.decode('utf-8'))
        self.assertEqual(payload['display_name'], 'Lampa Full Stack Lab')
        self.assertEqual(payload['ref'], 'feat/github-full-stack-lab')
        self.assertEqual(payload['idle_timeout_minutes'], 240)
        self.assertEqual(payload['retention_period_minutes'], 43200)
        self.assertEqual(payload['devcontainer_path'], '.devcontainer/devcontainer.json')

    def test_client_uses_lifecycle_start_and_stop_routes(self):
        transport = FakeTransport([{}, {}])
        client = CodespacesClient('secret', 'ARST113/lampa-source', transport=transport)
        client.start_codespace('silver-space')
        client.stop_codespace('silver-space')
        self.assertTrue(transport.calls[0][1].endswith('/user/codespaces/silver-space/start'))
        self.assertTrue(transport.calls[1][1].endswith('/user/codespaces/silver-space/stop'))


if __name__ == '__main__':
    unittest.main()
