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

grep -Fq 'Lampa' "$TMP/lampainit.js" || grep -Fq 'lampac' "$TMP/lampainit.js"
grep -Eq 'Lampac|lampac|online' "$TMP/online.js"
grep -Fq 'torrserver_url' "$TMP/ts.js"

curl -fsS --connect-timeout 5 --max-time 30 \
  -X POST \
  -H 'Content-Type: application/json' \
  --data '{"action":"get"}' \
  "$BASE/ts/settings" \
  -o "$TMP/ts-settings.json"

grep -Eq '^[[:space:]]*\{' "$TMP/ts-settings.json"

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

printf 'version      OK\n'
printf 'lampainit.js OK\n'
printf 'online.js    OK\n'
printf 'ts.js        OK\n'
printf 'TorrServer   OK\n'
printf 'parser       OK (HTTP %s; zero results allowed)\n' "$parser_code"
