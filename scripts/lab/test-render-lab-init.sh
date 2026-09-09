#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cat > "$TMP/input.conf" <<'JSON'
{
  "listen": {
    "port": 9118
  }
}
JSON

# Reproduce the stale bind-mount failure seen after a Codespace stop/start:
# the intended runtime config path exists as a directory instead of a file.
mkdir -p "$TMP/runtime.conf"

LAB_PUBLIC_HOST='example-9118.app.github.dev' \
  bash "$ROOT/.devcontainer/render-lab-init.sh" \
  --input "$TMP/input.conf" \
  --output "$TMP/runtime.conf"

test -f "$TMP/runtime.conf"
grep -Fq '"host": "example-9118.app.github.dev"' "$TMP/runtime.conf"
grep -Fq '"scheme": "https"' "$TMP/runtime.conf"
echo 'RENDER_DIRECTORY_RECOVERY_OK'

# The default runtime config must live under the writable workspace, not /tmp.
# A Docker-created directory under /tmp is root-owned and protected by the sticky bit,
# which prevented the vscode user from repairing the path after a restart.
grep -Fq 'RUNTIME_DIR="${LAB_RUNTIME_DIR:-$ROOT/.devcontainer/.runtime}"' "$ROOT/.devcontainer/start-lab.sh"
grep -Fq 'RUNTIME_CONF="${LAB_INIT_CONF:-$RUNTIME_DIR/lab.init.conf}"' "$ROOT/.devcontainer/start-lab.sh"
if grep -Fq '/tmp/lampa-full-stack-lab.init.conf' "$ROOT/.devcontainer/start-lab.sh"; then
  echo 'start-lab.sh still defaults runtime config to /tmp' >&2
  exit 1
fi

echo 'WORKSPACE_RUNTIME_PATH_OK'
