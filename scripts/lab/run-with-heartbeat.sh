#!/usr/bin/env bash
set -uo pipefail

if [[ "$#" -eq 0 ]]; then
  echo 'usage: run-with-heartbeat.sh <command> [args...]' >&2
  exit 64
fi

interval="${LAB_HEARTBEAT_SECONDS:-60}"

"$@" &
child=$!

terminate_child() {
  kill -TERM "$child" 2>/dev/null || true
}
trap terminate_child TERM INT

while kill -0 "$child" 2>/dev/null; do
  printf '[lab heartbeat] %s pid=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$child"
  sleep "$interval" &
  sleeper=$!
  wait "$sleeper" 2>/dev/null || true
done

wait "$child"
status=$?
exit "$status"
