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

node --check "$OUT"
grep -Fq "Lampac Resume v0.2.3" "$OUT"
grep -Fq "var VERSION = '0.2.3'" "$OUT"
grep -Fq "Lampa.Torserver.viewedSet" "$OUT"
grep -Fq "episodeIdentity" "$OUT"

printf 'Built %s (%s bytes)\n' "$OUT" "$(wc -c < "$OUT")"
