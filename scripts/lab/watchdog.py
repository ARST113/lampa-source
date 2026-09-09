#!/usr/bin/env python3
import json
import os
import re
import shlex
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API_VERSION = '2026-03-10'
DEFAULT_CODESPACE = 'lampa-full-stack-lab-r54vrp44jj4cx796'
DEFAULT_REF = 'feat/github-full-stack-lab'
DEFAULT_PORT = 9118


def decide(state, healthy):
    if state == 'Available':
        return 'keepalive' if healthy else 'repair'
    if state in ('Stopped', 'Shutdown'):
        return 'start'
    return 'wait'


def public_host(name, port=DEFAULT_PORT):
    if not re.fullmatch(r'[A-Za-z0-9-]+', str(name or '')):
        raise ValueError('Invalid Codespace name')
    return f'{name}-{port}.app.github.dev'


def backend_url(name, port=DEFAULT_PORT):
    return f'https://{public_host(name, port)}'


class CodespacesClient:
    def __init__(self, token, api_base='https://api.github.com'):
        self.token = token
        self.api_base = api_base.rstrip('/')

    @property
    def headers(self):
        return {
            'Accept': 'application/vnd.github+json',
            'Authorization': f'Bearer {self.token}',
            'X-GitHub-Api-Version': API_VERSION,
            'User-Agent': 'lampa-full-stack-lab-watchdog',
        }

    def call(self, method, path):
        request = urllib.request.Request(self.api_base + path, method=method, headers=self.headers)
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                body = response.read()
                return json.loads(body.decode('utf-8')) if body else {}
        except urllib.error.HTTPError as exc:
            body = exc.read().decode('utf-8', errors='replace')
            raise RuntimeError(f'GitHub API {exc.code}: {body[:800]}') from None
        except urllib.error.URLError as exc:
            raise RuntimeError(f'GitHub API transport error: {exc.reason}') from None

    def get(self, name):
        return self.call('GET', f'/user/codespaces/{urllib.parse.quote(name, safe="")}')

    def start(self, name):
        return self.call('POST', f'/user/codespaces/{urllib.parse.quote(name, safe="")}/start')


def wait_available(client, name, timeout=900, interval=5):
    deadline = time.monotonic() + timeout
    last_state = 'unknown'
    while time.monotonic() < deadline:
        item = client.get(name)
        last_state = item.get('state') or 'unknown'
        if last_state == 'Available':
            return item
        time.sleep(interval)
    raise RuntimeError(f'Codespace did not become Available; last state={last_state}')


def health(base):
    checks = [('/version?type=hash', 1), ('/lampainit.js', 16)]
    result = {}
    for path, min_bytes in checks:
        request = urllib.request.Request(base + path, headers={'User-Agent': 'lampa-full-stack-lab-watchdog'})
        try:
            with urllib.request.urlopen(request, timeout=20) as response:
                body = response.read(65536)
                ok = 200 <= response.status < 300 and len(body) >= min_bytes
                result[path] = {'ok': ok, 'status': response.status, 'bytes': len(body)}
        except urllib.error.HTTPError as exc:
            result[path] = {'ok': False, 'status': exc.code}
        except Exception as exc:
            result[path] = {'ok': False, 'error': str(exc)}
    result['ok'] = all(value.get('ok') for key, value in result.items() if key != 'ok')
    return result


def run_gh(args, token):
    env = os.environ.copy()
    env['GH_TOKEN'] = token
    proc = subprocess.run(args, env=env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
    if proc.returncode:
        raise RuntimeError(f"Command failed ({proc.returncode}): {' '.join(args[:5])}\n{(proc.stdout or '')[-3000:]}")
    return proc.stdout or ''


def make_public(name, token, port=DEFAULT_PORT):
    run_gh(['gh', 'codespace', 'ports', 'visibility', f'{port}:public', '-c', name], token)


def ssh(name, token, command):
    return run_gh(['gh', 'codespace', 'ssh', '-c', name, command], token)


def keepalive(name, token):
    # GitHub treats terminal input/output as activity, which resets the idle timeout.
    ssh(name, token, "printf 'Lampa watchdog keepalive %s\\n' \"$(date -Iseconds)\"")


def repair_runtime(name, token, ref, port=DEFAULT_PORT):
    host = public_host(name, port)
    command = (
        'cd /workspaces/lampa-source && '
        f'git fetch origin {shlex.quote(ref)} && '
        'git reset --hard FETCH_HEAD && '
        f'LAB_PUBLIC_HOST={shlex.quote(host)} bash .devcontainer/start-lab.sh'
    )
    ssh(name, token, command)


def write_summary(status):
    text = (
        '# Lampa Full Stack Lab Watchdog\n\n'
        f"- Codespace: `{status['name']}`\n"
        f"- Initial state: `{status['initial_state']}`\n"
        f"- Action: `{status['action']}`\n"
        f"- Final state: `{status['final_state']}`\n"
        f"- Backend: {status['backend']}\n"
        f"- Health: `{'OK' if status['health'].get('ok') else 'FAIL'}`\n"
    )
    print(text)
    step_summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if step_summary:
        with open(step_summary, 'a', encoding='utf-8') as handle:
            handle.write(text)


def run_watchdog(token, name=DEFAULT_CODESPACE, ref=DEFAULT_REF, port=DEFAULT_PORT):
    client = CodespacesClient(token)
    item = client.get(name)
    initial_state = item.get('state') or 'unknown'
    backend = backend_url(name, port)
    initial_health = health(backend) if initial_state == 'Available' else {'ok': False}
    action = decide(initial_state, bool(initial_health.get('ok')))

    if action == 'start':
        client.start(name)
        item = wait_available(client, name)
        make_public(name, token, port)
        repair_runtime(name, token, ref, port)
    elif action == 'wait':
        item = wait_available(client, name)
        make_public(name, token, port)
        after_wait = health(backend)
        if after_wait.get('ok'):
            keepalive(name, token)
            action = 'keepalive'
        else:
            repair_runtime(name, token, ref, port)
            action = 'repair'
    elif action == 'repair':
        make_public(name, token, port)
        repair_runtime(name, token, ref, port)
    else:
        make_public(name, token, port)
        keepalive(name, token)

    final_item = client.get(name)
    final_health = health(backend)
    if not final_health.get('ok'):
        make_public(name, token, port)
        repair_runtime(name, token, ref, port)
        final_health = health(backend)
        action = 'repair'
    if not final_health.get('ok'):
        raise RuntimeError(f'Backend health failed after watchdog action: {final_health}')

    status = {
        'name': name,
        'initial_state': initial_state,
        'action': action,
        'final_state': final_item.get('state') or 'unknown',
        'backend': backend,
        'health': final_health,
    }
    write_summary(status)
    return status


def main():
    token = os.environ.get('CODESPACES_PAT', '')
    if not token:
        print('CODESPACES_PAT is not configured', file=sys.stderr)
        return 2
    name = os.environ.get('LAB_CODESPACE_NAME', DEFAULT_CODESPACE)
    ref = os.environ.get('LAB_SOURCE_REF', DEFAULT_REF)
    try:
        run_watchdog(token, name=name, ref=ref)
        return 0
    except Exception as exc:
        message = str(exc).replace(token, '***')
        print(message, file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
