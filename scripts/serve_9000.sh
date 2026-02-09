#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

exec python3 -m http.server 9000 --bind 127.0.0.1 --directory "$ROOT_DIR"
