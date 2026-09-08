#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="$ROOT/.devcontainer/lab.compose.yml"
RUNTIME_CONF="${LAB_INIT_CONF:-/tmp/lampa-full-stack-lab.init.conf}"
CONTAINER_NAME='lampa-full-stack-lab'

before_hash=''
if [[ -f "$RUNTIME_CONF" ]]; then
  before_hash="$(sha256sum "$RUNTIME_CONF" | awk '{print $1}')"
fi

container_id_before="$(docker ps -a --filter "name=^/${CONTAINER_NAME}$" --format '{{.ID}}' | head -1)"

bash "$ROOT/.devcontainer/render-lab-init.sh" \
  --input "$ROOT/.devcontainer/lab.init.conf" \
  --output "$RUNTIME_CONF"
export LAB_INIT_CONF="$RUNTIME_CONF"

after_hash="$(sha256sum "$RUNTIME_CONF" | awk '{print $1}')"
config_changed=false
if [[ "$before_hash" != "$after_hash" ]]; then
  config_changed=true
fi

docker compose -f "$COMPOSE" up -d --remove-orphans

container_id_after="$(docker ps -a --filter "name=^/${CONTAINER_NAME}$" --format '{{.ID}}' | head -1)"

if [[ -n "$container_id_before" && -n "$container_id_after" ]]; then
  container_conf="$(mktemp)"
  trap 'rm -f "$container_conf"' EXIT

  if docker exec "$CONTAINER_NAME" cat /lampac/init.conf > "$container_conf" 2>/dev/null; then
    if ! cmp -s "$RUNTIME_CONF" "$container_conf"; then
      echo 'Lampac init.conf bind mount is stale; recreating container.'
      docker compose -f "$COMPOSE" up -d --remove-orphans --force-recreate lampac
    elif [[ "$config_changed" == true && "$container_id_before" == "$container_id_after" ]]; then
      echo 'Lampac runtime config changed; restarting service.'
      docker compose -f "$COMPOSE" restart lampac
    fi
  else
    echo 'Unable to read Lampac container init.conf; recreating container.'
    docker compose -f "$COMPOSE" up -d --remove-orphans --force-recreate lampac
  fi

  rm -f "$container_conf"
  trap - EXIT
fi

for i in $(seq 1 90); do
  if curl -fsS --max-time 5 'http://127.0.0.1:9118/version?type=hash' >/dev/null 2>&1; then
    bash "$ROOT/.devcontainer/configure-torrserver.sh"
    exec bash "$ROOT/.devcontainer/smoke-lab.sh"
  fi
  sleep 2
done

echo 'Lampac did not become ready through gateway on port 9118' >&2
docker compose -f "$COMPOSE" ps >&2 || true
docker compose -f "$COMPOSE" logs --tail=150 gateway lampac torrserver >&2 || true
exit 1
