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
