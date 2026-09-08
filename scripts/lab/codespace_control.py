#!/usr/bin/env python3
import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API_VERSION = '2026-03-10'
DEFAULT_REPOSITORY = 'ARST113/lampa-source'
DEFAULT_REF = 'feat/github-full-stack-lab'
DEFAULT_DISPLAY_NAME = 'Lampa Full Stack Lab'
DEFAULT_PORT = 9118
ARTIFACT_DIR = Path('lab-artifacts')


def select_codespace(items, display_name):
    matches = [item for item in items if item.get('display_name') == display_name]
    if not matches:
        return None
    return max(matches, key=lambda item: item.get('created_at') or '')


def ensure_decision(state):
    if state in ('Shutdown', 'Stopped'):
        return 'start'
    if state == 'Available':
        return 'keep'
    return 'wait'


def backend_url(name, port=DEFAULT_PORT):
    return f'https://{name}-{port}.app.github.dev'


def pages_url(backend):
    encoded = urllib.parse.quote(backend, safe='')
    return f'https://arst113.github.io/lampa-source/test/?lampac={encoded}'


def redact(text, secrets):
    result = str(text)
    for secret in secrets:
        if secret:
            result = result.replace(secret, '***')
    return result


class CodespacesClient:
    def __init__(self, token, repository, api_base='https://api.github.com', transport=None):
        self.token = token
        self.repository = repository
        self.api_base = api_base.rstrip('/')
        self.transport = transport or self._request

    @property
    def headers(self):
        return {
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {self.token}',
            'X-GitHub-Api-Version': API_VERSION,
            'User-Agent': 'lampa-full-stack-lab',
        }

    def _request(self, method, url, data, headers):
        request = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                body = response.read()
                if not body:
                    return {}
                return json.loads(body.decode('utf-8'))
        except urllib.error.HTTPError as exc:
            body = exc.read().decode('utf-8', errors='replace')
            raise RuntimeError(f'GitHub API {exc.code}: {body[:1000]}') from None
        except urllib.error.URLError as exc:
            raise RuntimeError(f'GitHub API transport error: {exc.reason}') from None

    def _call(self, method, path, payload=None):
        data = None if payload is None else json.dumps(payload).encode('utf-8')
        return self.transport(method, self.api_base + path, data, self.headers)

    def list_codespaces(self):
        result = self._call('GET', '/user/codespaces?per_page=100')
        return result.get('codespaces', [])

    def create_codespace(self, ref=DEFAULT_REF):
        owner, repo = self.repository.split('/', 1)
        payload = {
            'ref': ref,
            'devcontainer_path': '.devcontainer/devcontainer.json',
            'display_name': DEFAULT_DISPLAY_NAME,
            'idle_timeout_minutes': 240,
            'retention_period_minutes': 43200,
        }
        return self._call('POST', f'/repos/{owner}/{repo}/codespaces', payload)

    def get_codespace(self, name):
        return self._call('GET', f'/user/codespaces/{urllib.parse.quote(name, safe="")}')

    def start_codespace(self, name):
        return self._call('POST', f'/user/codespaces/{urllib.parse.quote(name, safe="")}/start')

    def stop_codespace(self, name):
        return self._call('POST', f'/user/codespaces/{urllib.parse.quote(name, safe="")}/stop')


def find_lab(client, display_name=DEFAULT_DISPLAY_NAME):
    items = client.list_codespaces()
    repo_items = []
    for item in items:
        repo = item.get('repository') or {}
        full_name = repo.get('full_name')
        if full_name and full_name != client.repository:
            continue
        repo_items.append(item)
    return select_codespace(repo_items, display_name)


def wait_for_state(client, name, target, timeout=900, interval=5):
    deadline = time.monotonic() + timeout
    last = None
    while time.monotonic() < deadline:
        last = client.get_codespace(name)
        if last.get('state') == target:
            return last
        time.sleep(interval)
    state = (last or {}).get('state', 'unknown')
    raise RuntimeError(f'Codespace {name} did not reach {target}; last state={state}')


def gh_env(token):
    env = os.environ.copy()
    env['GH_TOKEN'] = token
    return env


def run_checked(args, token, capture=False):
    result = subprocess.run(
        args,
        env=gh_env(token),
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
        check=False,
    )
    if result.returncode:
        output = result.stdout or ''
        raise RuntimeError(f'Command failed ({result.returncode}): {" ".join(args[:4])}\n{output[-4000:]}')
    return result.stdout or ''


def make_port_public(name, token, port=DEFAULT_PORT):
    run_checked(['gh', 'codespace', 'ports', 'visibility', f'{port}:public', '-c', name], token)


def remote_command(name, token, command, capture=False):
    return run_checked(['gh', 'codespace', 'ssh', '-c', name, '--', 'bash', '-lc', command], token, capture=capture)


def ensure_available(client, token, item=None, ref=DEFAULT_REF):
    item = item or find_lab(client)
    if item is None:
        item = client.create_codespace(ref)
        name = item['name']
        item = wait_for_state(client, name, 'Available')
    else:
        name = item['name']
        decision = ensure_decision(item.get('state'))
        if decision == 'start':
            client.start_codespace(name)
            item = wait_for_state(client, name, 'Available')
        elif decision == 'wait':
            item = wait_for_state(client, name, 'Available')
    make_port_public(item['name'], token)
    return item


def http_health(base):
    request = urllib.request.Request(base + '/version?type=hash', headers={'User-Agent': 'lampa-full-stack-lab'})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            response.read(4096)
            return {'ok': 200 <= response.status < 300, 'status': response.status}
    except urllib.error.HTTPError as exc:
        return {'ok': False, 'status': exc.code}
    except Exception as exc:
        return {'ok': False, 'error': str(exc)}


def write_artifacts(status):
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    (ARTIFACT_DIR / 'status.json').write_text(json.dumps(status, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    lines = [
        '# Lampa Full Stack Lab',
        '',
        f"- Action: `{status.get('action', '')}`",
        f"- Result: `{'OK' if status.get('success') else 'FAIL'}`",
        f"- Codespace: `{status.get('name') or 'missing'}`",
        f"- State: `{status.get('state') or 'missing'}`",
    ]
    if status.get('backend'):
        lines.append(f"- Backend: {status['backend']}")
    if status.get('pages'):
        lines.append(f"- Pages: {status['pages']}")
    health = status.get('health')
    if health:
        lines.append(f"- Health: `{json.dumps(health, ensure_ascii=False)}`")
    if status.get('error'):
        lines.append(f"- Error: `{status['error']}`")
    summary = '\n'.join(lines) + '\n'
    (ARTIFACT_DIR / 'summary.md').write_text(summary, encoding='utf-8')

    step_summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if step_summary:
        with open(step_summary, 'a', encoding='utf-8') as handle:
            handle.write(summary)
    print(summary)


def control(action, token, repository, ref):
    client = CodespacesClient(token, repository)
    item = find_lab(client)

    if action == 'status':
        if item is None:
            return {'action': action, 'success': True, 'name': None, 'state': 'Missing'}
        backend = backend_url(item['name'])
        return {
            'action': action,
            'success': True,
            'name': item['name'],
            'state': item.get('state'),
            'backend': backend,
            'pages': pages_url(backend),
        }

    if action == 'stop':
        if item is None:
            return {'action': action, 'success': True, 'name': None, 'state': 'Missing'}
        if item.get('state') not in ('Shutdown', 'Stopped'):
            client.stop_codespace(item['name'])
            item = wait_for_state(client, item['name'], 'Shutdown')
        return {'action': action, 'success': True, 'name': item['name'], 'state': item.get('state')}

    if action == 'restart':
        if item is not None and item.get('state') not in ('Shutdown', 'Stopped'):
            client.stop_codespace(item['name'])
            wait_for_state(client, item['name'], 'Shutdown')
            client.start_codespace(item['name'])
            item = wait_for_state(client, item['name'], 'Available')
            make_port_public(item['name'], token)
        else:
            item = ensure_available(client, token, item=item, ref=ref)
    else:
        item = ensure_available(client, token, item=item, ref=ref)

    name = item['name']
    backend = backend_url(name)
    result = {
        'action': action,
        'success': True,
        'name': name,
        'state': item.get('state'),
        'backend': backend,
        'pages': pages_url(backend),
    }

    if action in ('ensure', 'start', 'restart'):
        health = http_health(backend)
        result['health'] = health
        if not health.get('ok'):
            raise RuntimeError(f'Lampac public health check failed: {health}')
    elif action == 'smoke':
        remote_command(name, token, 'cd "${CODESPACE_VSCODE_FOLDER:-/workspaces/lampa-source}" && bash .devcontainer/smoke-lab.sh')
    elif action == 'full':
        remote_command(name, token, 'cd "${CODESPACE_VSCODE_FOLDER:-/workspaces/lampa-source}" && bash .devcontainer/smoke-lab.sh')
    elif action == 'logs':
        output = remote_command(
            name,
            token,
            'cd "${CODESPACE_VSCODE_FOLDER:-/workspaces/lampa-source}" && docker compose -f .devcontainer/lab.compose.yml logs --tail=250 lampac',
            capture=True,
        )
        print(output)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description='Control the Lampa Full Stack Lab Codespace')
    parser.add_argument('action', choices=['status', 'ensure', 'start', 'stop', 'restart', 'smoke', 'full', 'logs'])
    parser.add_argument('--repository', default=os.environ.get('GITHUB_REPOSITORY', DEFAULT_REPOSITORY))
    parser.add_argument('--ref', default=os.environ.get('LAB_CODESPACE_REF', DEFAULT_REF))
    args = parser.parse_args(argv)

    token = os.environ.get('CODESPACES_PAT', '')
    status = {'action': args.action, 'success': False}
    if not token:
        status['error'] = 'CODESPACES_PAT is not configured'
        write_artifacts(status)
        return 2

    try:
        status = control(args.action, token, args.repository, args.ref)
        write_artifacts(status)
        return 0
    except Exception as exc:
        message = redact(str(exc), [token])
        status.update({'success': False, 'error': message})
        write_artifacts(status)
        print(message, file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
