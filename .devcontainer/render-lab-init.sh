#!/usr/bin/env bash
set -euo pipefail

input=''
output=''

while (($#)); do
  case "$1" in
    --input)
      input="${2:-}"
      shift 2
      ;;
    --output)
      output="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$input" || -z "$output" ]]; then
  echo 'Usage: render-lab-init.sh --input <file> --output <file>' >&2
  exit 2
fi

explicit_host="${LAB_PUBLIC_HOST:-}"
codespace_name="${CODESPACE_NAME:-}"
domain="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
domain="${domain#.}"
domain="${domain%.}"

mkdir -p "$(dirname "$output")"

if [[ -n "$explicit_host" ]]; then
  if [[ ! "$explicit_host" =~ ^[A-Za-z0-9.-]+$ ]]; then
    echo 'LAB_PUBLIC_HOST contains unsupported characters' >&2
    exit 2
  fi
  public_host="$explicit_host"
elif [[ -n "$codespace_name" ]]; then
  if [[ ! "$codespace_name" =~ ^[A-Za-z0-9-]+$ ]]; then
    echo 'CODESPACE_NAME contains unsupported characters' >&2
    exit 2
  fi
  if [[ ! "$domain" =~ ^[A-Za-z0-9.-]+$ ]]; then
    echo 'Codespaces forwarding domain contains unsupported characters' >&2
    exit 2
  fi
  public_host="${codespace_name}-9118.${domain}"
else
  cp "$input" "$output"
  exit 0
fi

tmp="${output}.tmp.$$"
trap 'rm -f "$tmp"' EXIT

awk -v host="$public_host" '
  BEGIN { inserted = 0 }
  {
    print $0
    if (!inserted && $0 ~ /^[[:space:]]*"listen"[[:space:]]*:[[:space:]]*\{[[:space:]]*$/) {
      print "    \"host\": \"" host "\","
      print "    \"scheme\": \"https\","
      inserted = 1
    }
  }
  END {
    if (!inserted) exit 3
  }
' "$input" > "$tmp"

mv "$tmp" "$output"
trap - EXIT
