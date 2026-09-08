#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="$ROOT/.devcontainer/lab.compose.yml"

docker compose -f "$COMPOSE" up -d --remove-orphans

for i in $(seq 1 90); do
  if curl -fsS --max-time 5 'http://127.0.0.1:9118/version?type=hash' >/dev/null 2>&1; then
    exec bash "$ROOT/.devcontainer/smoke-lab.sh"
  fi
  sleep 2
done

echo 'Lampac did not become ready on port 9118' >&2
docker compose -f "$COMPOSE" logs --tail=150 lampac >&2 || true
exit 1
