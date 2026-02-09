#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-3000}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN || true)"
  if [[ -n "${PIDS}" ]]; then
    echo "Stopping process(es) listening on port ${PORT}: ${PIDS}" >&2
    kill ${PIDS} || true
    sleep 0.4

    # If the port is still in use, force kill.
    PIDS2="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN || true)"
    if [[ -n "${PIDS2}" ]]; then
      echo "Port ${PORT} still in use; force stopping: ${PIDS2}" >&2
      kill -9 ${PIDS2} || true
      sleep 0.2
    fi
  fi
fi

echo "Serving ${ROOT_DIR} at http://127.0.0.1:${PORT}/" >&2
exec python3 -m http.server "${PORT}" --bind 127.0.0.1 --directory "${ROOT_DIR}"

