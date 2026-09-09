#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="$ROOT/.devcontainer/lab.compose.yml"

docker compose -f "$COMPOSE" down --remove-orphans
