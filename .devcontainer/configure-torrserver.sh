#!/usr/bin/env bash
set -euo pipefail

BASE="${TORRSERVER_GATEWAY_LOCAL_URL:-http://127.0.0.1:9118/ts}"

for i in $(seq 1 60); do
  if curl -fsS --connect-timeout 2 --max-time 5 "$BASE/echo" >/dev/null 2>&1; then
    break
  fi
  if [[ "$i" == 60 ]]; then
    echo 'TorrServer did not become ready behind the /ts gateway' >&2
    exit 1
  fi
  sleep 1
done

settings="$(curl -fsS -H 'Content-Type: application/json' -d '{"action":"get"}' "$BASE/settings")"

if printf '%s' "$settings" | grep -q '"TrackTimecode":true'; then
  echo 'TorrServer TrackTimecode already enabled.'
  exit 0
fi

if ! printf '%s' "$settings" | grep -q '"TrackTimecode":false'; then
  echo 'TorrServer settings do not expose TrackTimecode' >&2
  printf '%s\n' "$settings" >&2
  exit 1
fi

enabled="$(printf '%s' "$settings" | sed 's/"TrackTimecode":false/"TrackTimecode":true/')"
payload="{\"action\":\"set\",\"sets\":$enabled}"

curl -fsS -H 'Content-Type: application/json' -d "$payload" "$BASE/settings" >/dev/null
sleep 1

verified="$(curl -fsS -H 'Content-Type: application/json' -d '{"action":"get"}' "$BASE/settings")"
if ! printf '%s' "$verified" | grep -q '"TrackTimecode":true'; then
  echo 'Failed to enable TorrServer TrackTimecode' >&2
  printf '%s\n' "$verified" >&2
  exit 1
fi

echo 'TorrServer TrackTimecode enabled.'
