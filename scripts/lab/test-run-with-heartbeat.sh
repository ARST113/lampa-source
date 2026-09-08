#!/usr/bin/env bash
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WRAPPER="$ROOT/scripts/lab/run-with-heartbeat.sh"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

set +e
LAB_HEARTBEAT_SECONDS=1 bash "$WRAPPER" bash -lc 'sleep 2; exit 7' >"$TMP" 2>&1
status=$?
set -e

if ! grep -Fq '[lab heartbeat]' "$TMP"; then
  echo 'heartbeat line was not emitted' >&2
  cat "$TMP" >&2
  exit 1
fi

if [[ "$status" -ne 7 ]]; then
  echo "expected child exit code 7, got $status" >&2
  cat "$TMP" >&2
  exit 1
fi

echo 'heartbeat wrapper test passed'
