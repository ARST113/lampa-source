#!/usr/bin/env bash
set -euo pipefail

CONTAINER='lampa-full-stack-torrserver'
IMAGE='ghcr.io/yourok/torrserver:latest'
BASE='http://127.0.0.1:8090'
HASH='0123456789abcdef0123456789abcdef01234567'

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
docker pull "$IMAGE"
docker run -d --name "$CONTAINER" --restart unless-stopped -p 8090:8090 "$IMAGE"

for i in $(seq 1 30); do
  if version="$(curl -fsS "$BASE/echo" 2>/dev/null)"; then
    echo "TORRSERVER_VERSION=$version"
    break
  fi
  sleep 1
done

test -n "${version:-}"

settings="$(curl -fsS -H 'Content-Type: application/json' -d '{"action":"get"}' "$BASE/settings")"
echo '=== TrackTimecode before ==='
printf '%s\n' "$settings" | grep -o '"TrackTimecode":[a-z]*' || true

if printf '%s' "$settings" | grep -q '"TrackTimecode":false'; then
  enabled="$(printf '%s' "$settings" | sed 's/"TrackTimecode":false/"TrackTimecode":true/')"
elif printf '%s' "$settings" | grep -q '"TrackTimecode":true'; then
  enabled="$settings"
else
  echo 'TrackTimecode field missing from current TorrServer settings' >&2
  exit 2
fi

payload="{\"action\":\"set\",\"sets\":$enabled}"
curl -fsS -H 'Content-Type: application/json' -d "$payload" "$BASE/settings" >/dev/null
sleep 2

settings_after="$(curl -fsS -H 'Content-Type: application/json' -d '{"action":"get"}' "$BASE/settings")"
echo '=== TrackTimecode after ==='
printf '%s\n' "$settings_after" | grep -o '"TrackTimecode":[a-z]*'
printf '%s' "$settings_after" | grep -q '"TrackTimecode":true'

# Remove any stale mark for a deterministic roundtrip.
curl -fsS -H 'Content-Type: application/json' \
  -d "{\"action\":\"rem\",\"hash\":\"$HASH\",\"file_index\":1}" \
  "$BASE/viewed" >/dev/null || true

echo '=== viewed set ==='
curl -fsS -H 'Content-Type: application/json' \
  -d "{\"action\":\"set\",\"hash\":\"$HASH\",\"file_index\":1,\"timecode\":65}" \
  "$BASE/viewed"
echo

echo '=== viewed list ==='
viewed="$(curl -fsS -H 'Content-Type: application/json' \
  -d "{\"action\":\"list\",\"hash\":\"$HASH\",\"file_index\":1}" \
  "$BASE/viewed")"
printf '%s\n' "$viewed"
printf '%s' "$viewed" | grep -q '"timecode":65'

echo 'TRACK_TIMECODE_ROUNDTRIP_OK'
