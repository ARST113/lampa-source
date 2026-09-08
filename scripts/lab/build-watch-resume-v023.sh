#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="${1:-$ROOT/plugins/watch_resume/watch_resume.js}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$(dirname "$OUT")"
cat "$ROOT"/spike/lampac-resume-fixture.part{1,2,3,4,5} \
  | base64 -d \
  | gzip -dc > "$TMP/watch_resume_v0.2.2.js"

cp "$TMP/watch_resume_v0.2.2.js" "$OUT"
patch --silent "$OUT" < "$ROOT/spike/watch_resume_v023.patch"

# The original core helper asInt() lives inside the factory closure and is intentionally
# not exposed to the browser runtime. Keep the generated runtime self-contained.
sed -i \
  -e 's/asInt(play\.season, 0)/(parseInt(play.season, 10) || 0)/g' \
  -e 's/asInt(play\.episode, 0)/(parseInt(play.episode, 10) || 0)/g' \
  "$OUT"

node --check "$OUT"
grep -Fq "Lampac Resume v0.2.3" "$OUT"
grep -Fq "var VERSION = '0.2.3'" "$OUT"
grep -Fq "Lampa.Torserver.viewedSet" "$OUT"
grep -Fq "episodeIdentity" "$OUT"
# Regression guard: createTorrentRecipe must not reference the factory-private helper.
if sed -n '/function createTorrentRecipe/,/function originFromUrl/p' "$OUT" | grep -Fq 'asInt('; then
  echo 'createTorrentRecipe still references private asInt()' >&2
  exit 1
fi

printf 'Built %s (%s bytes)\n' "$OUT" "$(wc -c < "$OUT")"
