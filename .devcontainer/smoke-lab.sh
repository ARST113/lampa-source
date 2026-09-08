#!/usr/bin/env bash
set -euo pipefail

BASE="${LAMPA_TEST_LAMPAC_LOCAL_URL:-http://127.0.0.1:9118}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

get_ok() {
  local path="$1"
  local out="$2"
  curl -fsS --connect-timeout 5 --max-time 20 "$BASE$path" -o "$out"
  test -s "$out"
}

printf 'Lampac smoke: %s\n' "$BASE"

get_ok '/version?type=hash' "$TMP/version"
get_ok '/lampainit.js' "$TMP/lampainit.js"
get_ok '/online.js' "$TMP/online.js"
get_ok '/ts.js' "$TMP/ts.js"
get_ok '/ts/echo' "$TMP/ts-echo"

grep -Fq 'Lampa' "$TMP/lampainit.js" || grep -Fq 'lampac' "$TMP/lampainit.js"
grep -Eq 'Lampac|lampac|online' "$TMP/online.js"
grep -Fq 'torrserver_url' "$TMP/ts.js"
grep -Fq 'MatriX.' "$TMP/ts-echo"

curl -fsS --connect-timeout 5 --max-time 30 \
  -X POST \
  -H 'Content-Type: application/json' \
  --data '{"action":"get"}' \
  "$BASE/ts/settings" \
  -o "$TMP/ts-settings.json"

grep -Eq '^[[:space:]]*\{' "$TMP/ts-settings.json"
grep -Fq '"TrackTimecode":true' "$TMP/ts-settings.json"

hash='0123456789abcdef0123456789abcdef01234567'
curl -fsS --connect-timeout 5 --max-time 20 \
  -X POST -H 'Content-Type: application/json' \
  --data "{\"action\":\"rem\",\"hash\":\"$hash\",\"file_index\":1}" \
  "$BASE/ts/viewed" >/dev/null || true

curl -fsS --connect-timeout 5 --max-time 20 \
  -X POST -H 'Content-Type: application/json' \
  --data "{\"action\":\"set\",\"hash\":\"$hash\",\"file_index\":1,\"timecode\":17}" \
  "$BASE/ts/viewed" >/dev/null

curl -fsS --connect-timeout 5 --max-time 20 \
  -X POST -H 'Content-Type: application/json' \
  --data "{\"action\":\"list\",\"hash\":\"$hash\",\"file_index\":1}" \
  "$BASE/ts/viewed" -o "$TMP/ts-viewed.json"

grep -Fq '"timecode":17' "$TMP/ts-viewed.json"

curl -fsS --connect-timeout 5 --max-time 20 \
  -X POST -H 'Content-Type: application/json' \
  --data "{\"action\":\"rem\",\"hash\":\"$hash\",\"file_index\":1}" \
  "$BASE/ts/viewed" >/dev/null || true

parser_code="$(curl -sS --connect-timeout 5 --max-time 30 \
  -o "$TMP/parser.json" \
  -w '%{http_code}' \
  --get \
  --data-urlencode 'query=Matrix' \
  "$BASE/api/v2.0/indexers/all/results" || true)"

if [[ ! "$parser_code" =~ ^2 ]]; then
  echo "JacRed/parser transport failure: HTTP ${parser_code:-000}" >&2
  cat "$TMP/parser.json" >&2 2>/dev/null || true
  exit 1
fi

if ! grep -Eq '^[[:space:]]*[\[{]' "$TMP/parser.json"; then
  echo 'JacRed/parser returned non-JSON response' >&2
  cat "$TMP/parser.json" >&2 2>/dev/null || true
  exit 1
fi

printf 'version        OK\n'
printf 'lampainit.js   OK\n'
printf 'online.js      OK\n'
printf 'ts.js          OK\n'
printf 'TorrServer     OK (%s)\n' "$(cat "$TMP/ts-echo")"
printf 'TRACK_TIMECODE OK (set/list 17)\n'
printf 'parser         OK (HTTP %s; zero results allowed)\n' "$parser_code"
