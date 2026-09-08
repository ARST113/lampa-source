#!/usr/bin/env bash
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="$ROOT/.devcontainer/lab.compose.yml"
BASE='http://127.0.0.1:9118'
failed=0

printf '=== Docker ===\n'
docker ps --filter name=lampa-full-stack-lab --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true

check() {
  local name="$1"
  local method="$2"
  local path="$3"
  local code
  if [[ "$method" == 'POST' ]]; then
    code="$(curl -sS -o /tmp/lab-status-body -w '%{http_code}' --max-time 10 -X POST -H 'Content-Type: application/json' --data '{"action":"get"}' "$BASE$path" 2>/dev/null || true)"
  else
    code="$(curl -sS -o /tmp/lab-status-body -w '%{http_code}' --max-time 10 "$BASE$path" 2>/dev/null || true)"
  fi
  printf '%-14s %s\n' "$name" "${code:-000}"
  if [[ ! "$code" =~ ^2 ]]; then
    failed=1
  fi
}

printf '\n=== Endpoints ===\n'
check version GET '/version?type=hash'
check lampainit GET '/lampainit.js'
check online GET '/online.js'
check torrserver-js GET '/ts.js'
check torrserver POST '/ts/settings'

if (( failed )); then
  printf '\n=== Recent Lampac logs ===\n' >&2
  docker compose -f "$COMPOSE" logs --tail=120 lampac >&2 || true
  exit 1
fi
