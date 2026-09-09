# GitHub Full Stack Lab Control Plane Design

## Goal

Add a small GitHub-native control plane for the experimental Full Stack Lab described in `docs/superpowers/specs/2026-09-08-github-full-stack-lab-design.md`.

The control plane must make the lab easy to start, stop, restart, inspect, and test from GitHub Actions and from ChatGPT through GitHub issue comments, while preserving normal Codespaces idle shutdown behavior.

## Lifecycle policy

The lab is not kept permanently alive.

- New lab Codespaces use `idle_timeout_minutes = 240`.
- A running test may emit a one-minute terminal heartbeat while the test process is alive so a legitimate long-running test is not interrupted by inactivity timeout.
- When no test or interactive work is running, the Codespace is allowed to stop normally.
- A scheduled watchdog runs every four hours and starts the lab only when it is stopped.
- If the lab is already running, the watchdog performs health checks and does not restart it.
- Explicit restart happens only via a manual/control command.

This uses Codespaces' normal lifecycle rather than a permanent keep-alive loop.

## Codespace identity

The control plane manages one Codespace for `ARST113/lampa-source` with:

```text
display_name: Lampa Full Stack Lab
branch/ref: feat/github-full-stack-lab during development, then main after merge
idle_timeout_minutes: 240
retention_period_minutes: 43200
```

Discovery is deterministic:

1. list the authenticated user's Codespaces for `ARST113/lampa-source`;
2. prefer a Codespace whose `display_name` equals `Lampa Full Stack Lab`;
3. if more than one matches, select the newest and report the duplicates;
4. manual `start` may create a Codespace if none exists;
5. scheduled `ensure` may also create one if none exists, so deletion does not permanently break the lab.

## Authentication

The repository Actions secret is:

```text
CODESPACES_PAT
```

It is never printed.

The fine-grained token requires the repository permissions needed by GitHub's Codespaces REST API:

- Codespaces: read/write;
- Codespaces lifecycle admin: write;
- Codespaces metadata: read where required by GitHub.

Normal repository issue comments and workflow summaries use `GITHUB_TOKEN` with minimal Actions permissions.

## Control interface

### Manual workflow

`.github/workflows/lab-control.yml` exposes `workflow_dispatch` with an `action` choice:

```text
status
ensure
start
stop
restart
smoke
full
logs
```

### Scheduled watchdog

The same workflow uses:

```yaml
schedule:
  - cron: '17 */4 * * *'
```

The off-minute value avoids the common top-of-hour scheduling peak.

Scheduled workflows only execute once the workflow exists on the default branch. Until merge, feature-branch development is tested through unit tests and direct/manual script execution rather than relying on cron.

Scheduled runs always map to action `ensure`.

### Control issue

A dedicated issue is titled exactly:

```text
Lampa Full Stack Lab Control
```

The workflow listens to new issue comments and accepts only comments on that issue whose trimmed body begins with `/lab `.

Supported commands:

```text
/lab status
/lab ensure
/lab start
/lab stop
/lab restart
/lab smoke
/lab full
/lab logs
```

Unknown commands return usage information and do not mutate Codespaces state.

## Controller implementation

Use a focused Python controller:

```text
scripts/lab/codespace_control.py
```

The script uses Python standard library HTTP calls for Codespaces REST operations and invokes GitHub CLI only for operations where GitHub documents CLI as the supported path, specifically forwarded-port visibility and remote shell execution.

CLI contract:

```text
python3 scripts/lab/codespace_control.py status
python3 scripts/lab/codespace_control.py ensure
python3 scripts/lab/codespace_control.py start
python3 scripts/lab/codespace_control.py stop
python3 scripts/lab/codespace_control.py restart
python3 scripts/lab/codespace_control.py smoke
python3 scripts/lab/codespace_control.py full
python3 scripts/lab/codespace_control.py logs
```

Environment:

```text
CODESPACES_PAT       required for lifecycle operations
LAB_REPOSITORY       default ARST113/lampa-source
LAB_REF              default feat/github-full-stack-lab until merge
LAB_DISPLAY_NAME     default Lampa Full Stack Lab
LAB_PORT             default 9118
LAB_IDLE_MINUTES     default 240
LAB_RETENTION_MINUTES default 43200
```

The controller writes a machine-readable state file to:

```text
lab-artifacts/status.json
```

and a concise Markdown summary to:

```text
lab-artifacts/summary.md
```

## Codespaces REST operations

The controller uses GitHub's authenticated-user Codespaces API.

Primary operations:

```text
GET  /repos/{owner}/{repo}/codespaces
POST /repos/{owner}/{repo}/codespaces
GET  /user/codespaces/{name}
POST /user/codespaces/{name}/start
POST /user/codespaces/{name}/stop
PATCH /user/codespaces/{name}
```

Creation specifies:

```json
{
  "ref": "feat/github-full-stack-lab",
  "devcontainer_path": ".devcontainer/devcontainer.json",
  "idle_timeout_minutes": 240,
  "retention_period_minutes": 43200,
  "display_name": "Lampa Full Stack Lab"
}
```

The controller polls the Codespace until its state becomes `Available` before attempting remote commands or public-port setup.

## Port forwarding and public URL

`.devcontainer/devcontainer.json` includes:

```json
"forwardPorts": [9118]
```

with a label `Lampac Full Stack Lab`.

GitHub Codespaces forwarded ports are private by default, and public visibility can revert to private after a Codespace restart. Therefore every successful `start`, `restart`, or `ensure` transition to `Available` runs:

```text
gh codespace ports visibility 9118:public -c <codespace-name>
```

using `GH_TOKEN=$CODESPACES_PAT`.

The public backend URL is derived deterministically as:

```text
https://<codespace-name>-9118.app.github.dev
```

The generated Pages URL is:

```text
https://arst113.github.io/lampa-source/test/?lampac=<URL-ENCODED-BACKEND>
```

## Codespace startup behavior

The devcontainer must automatically run the idempotent lab startup script on every Codespace start:

```text
.devcontainer/start-lab.sh
```

This guarantees that starting the Codespace through REST is sufficient to restore Lampac without an interactive VS Code session.

`start-lab.sh` starts the Lampac container, waits for port 9118, and verifies core endpoints before returning success.

The lifecycle controller then performs external health verification through the public Codespaces URL.

## Actions-to-Codespace remote execution

Actions uses GitHub CLI remote execution:

```text
gh codespace ssh -c <codespace-name> -- bash -lc '<command>'
```

for:

- `smoke`: run the server-side lab smoke script;
- `full`: run server smoke plus backend-aware browser/integration tests available in the Codespace;
- `logs`: collect compact diagnostics.

The remote scripts are committed in the repository, so commands do not transmit executable source through workflow inputs.

## Long-test heartbeat

Add:

```text
scripts/lab/run-with-heartbeat.sh
```

Usage:

```text
scripts/lab/run-with-heartbeat.sh <command> [args...]
```

Behavior:

1. start the real test command as a child process;
2. every 60 seconds while that child is running, print one line containing UTC time and child PID;
3. stop the heartbeat immediately when the child exits;
4. return the child's exact exit code;
5. forward TERM/INT to the child.

Only explicit long-running tests use this wrapper. The Codespace does not run an idle heartbeat daemon when no test is active.

## Watchdog action semantics

`ensure` implements:

```text
no Codespace
  -> create
  -> wait Available
  -> make 9118 public
  -> external health check

Codespace stopped/shutdown
  -> start
  -> wait Available
  -> make 9118 public
  -> external health check

Codespace already Available
  -> do not restart
  -> ensure port 9118 public
  -> external health check
```

If health checks fail on an already Available Codespace, `ensure` first attempts remote `start-lab.sh` once. It does not restart the whole Codespace automatically during a potentially active test. A complete restart remains an explicit operation.

## Health model

The compact lab status contains:

```text
Codespace
Lampac
lampainit.js
Online
TMDB proxy bootstrap
JacRed/parser
TorrServer ts.js
TorrServer /ts proxy
Pages backend URL
last control action
```

Each subsystem is one of:

```text
OK
FAIL
SKIP
UNKNOWN
```

Provider-specific Online failures are not treated as Lampac startup failure.

## Workflow output

Every control run writes the summary to `$GITHUB_STEP_SUMMARY`.

For issue-command runs, the workflow also posts the same compact summary back to the control issue using `GITHUB_TOKEN` with `issues: write`.

Secrets and authorization headers are redacted before any logs or issue comments are emitted.

## Permissions

Workflow permissions remain minimal:

```yaml
permissions:
  contents: read
  issues: write
```

Codespaces access comes only from `secrets.CODESPACES_PAT` and is passed as `CODESPACES_PAT`/`GH_TOKEN` only to the controller step that needs it.

## Failure behavior

The controller differentiates:

1. token/auth failure;
2. Codespace discovery/create failure;
3. lifecycle transition timeout;
4. port-publication failure;
5. Lampac process/startup failure;
6. backend endpoint health failure;
7. remote smoke/full test failure.

A failure produces nonzero exit status for explicit `start`, `restart`, `smoke`, and `full` operations.

`status` remains read-only and exits successfully when the Codespace is simply stopped, while reporting that state.

## Testability

Pure controller behavior is separated from network/CLI side effects so unit tests can cover:

- command parsing;
- Codespace selection;
- state-to-action decisions;
- public URL generation;
- Pages URL generation;
- redaction;
- REST response handling using fake responses.

Workflow syntax and shell helpers are validated in CI before merge.

## Success criteria

The control plane is complete when:

- a lab Codespace can be created or discovered deterministically;
- `start`, `stop`, `restart`, and `status` work through the controller;
- after start/restart the Codespace reaches `Available` and port 9118 is made public;
- an idle-stopped Codespace can be restored by `ensure`;
- scheduled `ensure` is configured for every four hours and is documented as active only on default branch;
- long-running explicit tests can use the heartbeat wrapper without a permanent keep-alive process;
- `/lab ...` issue commands map to the same controller operations;
- Actions summaries provide backend and Pages URLs plus subsystem status;
- no Codespaces token or provider secret appears in repository content, Actions logs, artifacts, or issue comments.
