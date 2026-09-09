# GitHub Full Stack Lab Control Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Actions/Codespaces control plane that can create, start, stop, restart, inspect, and test one temporary Lampac Full Stack Lab Codespace.

**Architecture:** A Codespace runs a Dev Container with Docker-in-Docker and one Lampac container on port 9118; Lampac's own TorrServer module owns the internal TorrServer process. A Python controller uses the authenticated-user Codespaces REST API for lifecycle state and GitHub CLI for port visibility and remote execution. One Actions workflow exposes scheduled `ensure`, manual dispatch, and `/lab ...` issue commands.

**Tech Stack:** GitHub Codespaces, GitHub Actions, Python 3 standard library, GitHub CLI, Docker Compose, Lampac NextGen container image.

**Spec:** `docs/superpowers/specs/2026-09-08-github-full-stack-lab-control-plane-design.md`

## Global Constraints

- Manage exactly one lab identified by display name `Lampa Full Stack Lab`.
- Default repository is `ARST113/lampa-source`.
- Development ref is `feat/github-full-stack-lab`; switch the controller default to `main` only when the feature is merged.
- Codespace idle timeout is `240` minutes; retention is `43200` minutes.
- Only port `9118` is public; raw TorrServer port `8090` is never exposed.
- `CODESPACES_PAT` is never printed or committed.
- The watchdog does not restart an already-running Codespace.
- Long-test heartbeat exists only while an explicit child test process is running.
- Scheduled Actions become operational only after `.github/workflows/lab-control.yml` is present on the default branch.

---

### Task 1: Codespace runtime and idempotent Lampac startup

**Files:**
- Create: `.devcontainer/devcontainer.json`
- Create: `.devcontainer/lab.compose.yml`
- Create: `.devcontainer/lab.init.conf`
- Create: `.devcontainer/start-lab.sh`
- Create: `.devcontainer/stop-lab.sh`
- Create: `.devcontainer/status-lab.sh`
- Create: `.devcontainer/smoke-lab.sh`
- Test: `spec/lab_runtime.spec.js`

**Interfaces:**
- Produces: `start-lab.sh`, `stop-lab.sh`, `status-lab.sh`, `smoke-lab.sh` callable from an interactive Codespace or `gh codespace ssh`.
- Produces: HTTP Lampac listener on `127.0.0.1:9118`/forwarded port `9118`.

- [ ] **Step 1: Write the failing runtime configuration test**

Create `spec/lab_runtime.spec.js`:

```js
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

describe('Codespaces full-stack lab runtime', () => {
  it('forwards only Lampac port 9118 and starts the lab on Codespace start', () => {
    const config = JSON.parse(read('.devcontainer/devcontainer.json'));
    expect(config.forwardPorts).toEqual([9118]);
    expect(config.portsAttributes['9118'].label).toBe('Lampac Full Stack Lab');
    expect(config.postStartCommand).toContain('.devcontainer/start-lab.sh');
  });

  it('runs one Lampac service using the published NextGen image', () => {
    const compose = read('.devcontainer/lab.compose.yml');
    expect(compose).toContain('ghcr.io/lampac-nextgen/lampac');
    expect(compose).toContain('9118:9118');
    expect(compose).not.toContain('8090:8090');
  });

  it('enables the required Lampac modules without access DB or WAF', () => {
    const conf = read('.devcontainer/lab.init.conf');
    for (const key of ['"jacred": true', '"tmdbProxy": true', '"online": true', '"torrserver": true']) {
      expect(conf).toContain(key);
    }
    expect(conf).toContain('"accsdb"');
    expect(conf).toContain('"enable": false');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm test -- --run spec/lab_runtime.spec.js
```

Expected: FAIL because `.devcontainer/*` files do not exist.

- [ ] **Step 3: Add the Dev Container configuration**

Create `.devcontainer/devcontainer.json` as valid JSON (not JSONC) so Vitest can parse it:

```json
{
  "name": "Lampa Full Stack Lab",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu-24.04",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  },
  "forwardPorts": [9118],
  "portsAttributes": {
    "9118": {
      "label": "Lampac Full Stack Lab",
      "onAutoForward": "silent"
    }
  },
  "postCreateCommand": "chmod +x .devcontainer/*.sh scripts/lab/*.sh 2>/dev/null || true",
  "postStartCommand": ".devcontainer/start-lab.sh",
  "remoteUser": "vscode"
}
```

- [ ] **Step 4: Add the lab Compose file and safe test config**

Create `.devcontainer/lab.compose.yml` with one service:

```yaml
name: lampa-full-stack-lab
services:
  lampac:
    image: ghcr.io/lampac-nextgen/lampac:latest
    container_name: lampa-full-stack-lab
    ports:
      - "9118:9118"
    shm_size: 1024mb
    restart: unless-stopped
    volumes:
      - ./lab.init.conf:/lampac/init.conf:ro
      - lampac-lab-data:/lampac/data
      - lampac-lab-cache:/lampac/cache
volumes:
  lampac-lab-data:
  lampac-lab-cache:
```

Create `.devcontainer/lab.init.conf` from Lampac's low-memory base settings with `LampaWeb.initPlugins.jacred`, `tmdbProxy`, `online`, and `torrserver` true; keep `accsdb.enable` and `WAF.enable` false. Do not include production addresses or secrets.

- [ ] **Step 5: Add start/stop/status/smoke scripts**

`start-lab.sh` must:

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="$ROOT/.devcontainer/lab.compose.yml"
docker compose -f "$COMPOSE" up -d --remove-orphans
for i in $(seq 1 90); do
  if curl -fsS --max-time 5 http://127.0.0.1:9118/version >/dev/null 2>&1; then
    exec "$ROOT/.devcontainer/smoke-lab.sh"
  fi
  sleep 2
done
echo 'Lampac did not become ready on port 9118' >&2
docker compose -f "$COMPOSE" logs --tail=150 lampac >&2 || true
exit 1
```

`stop-lab.sh` runs `docker compose -f ... down` without deleting named volumes.

`status-lab.sh` prints `docker ps`, the four core endpoint statuses, and recent Lampac logs only on failure.

`smoke-lab.sh` checks:

```text
/version
/lampainit.js
/online.js
/ts.js
```

and POSTs `{"action":"get"}` to `/ts/settings`; the script also performs a deterministic JacRed-compatible parser request and distinguishes transport failure from a valid zero-result response.

- [ ] **Step 6: Run the runtime test GREEN**

Run:

```bash
npm test -- --run spec/lab_runtime.spec.js
```

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add .devcontainer spec/lab_runtime.spec.js
git commit -m "feat: add Codespaces Lampac lab runtime"
```

---

### Task 2: Long-test heartbeat wrapper

**Files:**
- Create: `scripts/lab/run-with-heartbeat.sh`
- Create: `scripts/lab/test-run-with-heartbeat.sh`

**Interfaces:**
- Produces: `scripts/lab/run-with-heartbeat.sh <command> [args...]` returning the child exit code exactly.
- Environment: `LAB_HEARTBEAT_SECONDS`, default `60`, test override `1`.

- [ ] **Step 1: Write a failing shell test**

Create `scripts/lab/test-run-with-heartbeat.sh` that executes:

```bash
LAB_HEARTBEAT_SECONDS=1 scripts/lab/run-with-heartbeat.sh bash -lc 'sleep 2; exit 7'
```

Capture output and status. Assert at least one `[lab heartbeat]` line appears and final status equals `7`.

- [ ] **Step 2: Verify RED**

Run:

```bash
bash scripts/lab/test-run-with-heartbeat.sh
```

Expected: FAIL because the wrapper does not exist.

- [ ] **Step 3: Implement the wrapper**

Core behavior:

```bash
#!/usr/bin/env bash
set -uo pipefail
interval="${LAB_HEARTBEAT_SECONDS:-60}"
"$@" & child=$!
trap 'kill -TERM "$child" 2>/dev/null || true' TERM INT
while kill -0 "$child" 2>/dev/null; do
  printf '[lab heartbeat] %s pid=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$child"
  sleep "$interval" & wait $! || true
done
wait "$child"
exit $?
```

Ensure the final implementation preserves the child's exit code even with `set -e` disabled.

- [ ] **Step 4: Run GREEN**

Run:

```bash
bash scripts/lab/test-run-with-heartbeat.sh
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add scripts/lab/run-with-heartbeat.sh scripts/lab/test-run-with-heartbeat.sh
git commit -m "feat: add long-test Codespaces heartbeat"
```

---

### Task 3: Codespaces lifecycle controller

**Files:**
- Create: `scripts/lab/codespace_control.py`
- Create: `scripts/lab/test_codespace_control.py`
- Create at runtime: `lab-artifacts/status.json`
- Create at runtime: `lab-artifacts/summary.md`

**Interfaces:**
- CLI actions: `status|ensure|start|stop|restart|smoke|full|logs`.
- Pure functions: `select_codespace(items, display_name)`, `ensure_decision(state)`, `backend_url(name, port)`, `pages_url(backend)`, `redact(text, secrets)`.
- Controller class: `CodespacesClient(token, repository, api_base='https://api.github.com')`.

- [ ] **Step 1: Write pure-function and fake-API tests first**

Create `scripts/lab/test_codespace_control.py` using `unittest`. Required cases:

```python
class ControlTests(unittest.TestCase):
    def test_selects_newest_matching_display_name(self): ...
    def test_ensure_starts_shutdown_codespace(self): ...
    def test_ensure_does_not_restart_available_codespace(self): ...
    def test_backend_url(self):
        self.assertEqual(
            backend_url('silver-space-123', 9118),
            'https://silver-space-123-9118.app.github.dev',
        )
    def test_pages_url_urlencodes_backend(self): ...
    def test_redacts_token(self): ...
```

Use a fake transport to assert the client calls repository list/create and `/user/codespaces/{name}/start|stop` endpoints without sending real network requests.

- [ ] **Step 2: Verify RED**

Run:

```bash
python3 -m unittest scripts.lab.test_codespace_control -v
```

Expected: import/function failures.

- [ ] **Step 3: Implement API transport and selection logic**

Use `urllib.request` with headers:

```text
Accept: application/vnd.github+json
Authorization: Bearer <token>
X-GitHub-Api-Version: 2026-03-10
User-Agent: lampa-full-stack-lab
```

Never include the token in raised exception text.

Creation payload must include exactly the defaults from the spec and `.devcontainer/devcontainer.json`.

- [ ] **Step 4: Implement lifecycle polling and public-port repair**

After start/create, poll `GET /user/codespaces/{name}` until `state == 'Available'` with a bounded timeout. Then run:

```bash
GH_TOKEN="$CODESPACES_PAT" gh codespace ports visibility 9118:public -c "$CODESPACE_NAME"
```

Do this after `start`, `restart`, and `ensure`, including when the Codespace was already Available because public visibility can revert after a restart.

- [ ] **Step 5: Implement health and remote commands**

External health checks hit the derived public backend. `smoke`, `full`, and `logs` run committed scripts remotely with:

```bash
gh codespace ssh -c "$name" -- bash -lc 'cd "$CODESPACE_VSCODE_FOLDER" && .devcontainer/smoke-lab.sh'
```

For `full`, wrap the long command with `scripts/lab/run-with-heartbeat.sh` inside the Codespace.

- [ ] **Step 6: Implement summaries and exit semantics**

Always write `lab-artifacts/status.json` and `lab-artifacts/summary.md`. `status` on a stopped Codespace is a successful read-only operation; explicit lifecycle/test failures return nonzero.

- [ ] **Step 7: Run controller tests GREEN**

Run:

```bash
python3 -m unittest scripts.lab.test_codespace_control -v
```

Expected: PASS.

- [ ] **Step 8: Commit Task 3**

```bash
git add scripts/lab/codespace_control.py scripts/lab/test_codespace_control.py
git commit -m "feat: add Codespaces lab lifecycle controller"
```

---

### Task 4: GitHub Actions control workflow

**Files:**
- Create: `.github/workflows/lab-control.yml`
- Modify: `.github/workflows/lampa-test-stand.yml`
- Test: `spec/lab_workflow.spec.js`

**Interfaces:**
- Workflow inputs: `action` choice with `status, ensure, start, stop, restart, smoke, full, logs`.
- Schedule: `17 */4 * * *` maps to `ensure`.
- Issue commands: `/lab <action>` only on issue title `Lampa Full Stack Lab Control`.

- [ ] **Step 1: Write workflow structure tests**

`spec/lab_workflow.spec.js` reads `.github/workflows/lab-control.yml` as text and asserts:

```text
workflow_dispatch
issue_comment
cron: '17 */4 * * *'
CODESPACES_PAT
contents: read
issues: write
scripts/lab/codespace_control.py
```

It also asserts the existing `lampa-test-stand.yml` runs the Python controller unit tests and heartbeat shell test without invoking lifecycle operations.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- --run spec/lab_workflow.spec.js
```

Expected: FAIL because workflow is missing.

- [ ] **Step 3: Implement `.github/workflows/lab-control.yml`**

Use:

```yaml
name: Lampa Full Stack Lab Control
on:
  workflow_dispatch:
    inputs:
      action:
        type: choice
        required: true
        default: status
        options: [status, ensure, start, stop, restart, smoke, full, logs]
  schedule:
    - cron: '17 */4 * * *'
  issue_comment:
    types: [created]
permissions:
  contents: read
  issues: write
concurrency:
  group: lampa-full-stack-lab-control
  cancel-in-progress: false
```

Resolve action in a shell/Python step:

- schedule -> `ensure`;
- workflow_dispatch -> input value;
- issue_comment -> only exact control-issue title and body matching `^/lab +(status|ensure|start|stop|restart|smoke|full|logs)\s*$`;
- all other comments -> skip cleanly.

Run the controller with `CODESPACES_PAT: ${{ secrets.CODESPACES_PAT }}` and `GH_TOKEN` set to the same secret only for Codespaces CLI operations. Post `lab-artifacts/summary.md` to `$GITHUB_STEP_SUMMARY`; on issue commands, comment the summary using `github.token` rather than the PAT.

- [ ] **Step 4: Extend normal CI with non-secret tests**

In `.github/workflows/lampa-test-stand.yml`, before Playwright, add:

```bash
python3 -m unittest scripts.lab.test_codespace_control -v
bash scripts/lab/test-run-with-heartbeat.sh
```

These tests must not access `secrets.CODESPACES_PAT`.

- [ ] **Step 5: Run GREEN locally/Actions**

Run:

```bash
npm test -- --run spec/lab_workflow.spec.js
python3 -m unittest scripts.lab.test_codespace_control -v
bash scripts/lab/test-run-with-heartbeat.sh
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

```bash
git add .github/workflows/lab-control.yml .github/workflows/lampa-test-stand.yml spec/lab_workflow.spec.js
git commit -m "ci: add Codespaces lab control workflow"
```

---

### Task 5: Control issue and pre-merge verification

**Files:**
- Modify: `docs/superpowers/specs/2026-09-08-github-full-stack-lab-control-plane-design.md` only if implementation revealed a factual mismatch.
- No source file required for the issue itself.

**Interfaces:**
- Produces GitHub issue titled `Lampa Full Stack Lab Control` with command reference.

- [ ] **Step 1: Create the control issue**

Create one open issue with exact title `Lampa Full Stack Lab Control` and body listing all `/lab` commands plus the note that cron/issue control becomes active after workflow merge to default branch.

- [ ] **Step 2: Run all non-secret verification**

Run:

```bash
npm test -- --run
python3 -m unittest scripts.lab.test_codespace_control -v
bash scripts/lab/test-run-with-heartbeat.sh
npm run test:e2e
```

Expected: existing 54+ unit tests plus new specs PASS; existing Playwright static tests PASS.

- [ ] **Step 3: Review diff for secret leakage**

Search committed diff for `CODESPACES_PAT=`, bearer values, tokens, account emails, and production server addresses. Only the literal secret *name* `CODESPACES_PAT` is allowed.

- [ ] **Step 4: Verify scheduled-workflow limitation is documented**

Confirm README/spec/control issue states that `schedule` and issue-command workflow behavior is operational after merge to the default branch.

- [ ] **Step 5: Commit any documentation correction**

```bash
git add docs/superpowers/specs/2026-09-08-github-full-stack-lab-control-plane-design.md
git commit -m "docs: finalize Codespaces lab controls"
```

Skip the commit if no document changed.
