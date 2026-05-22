#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-5555}"
LOG_DIR="/tmp/opencode"
LOG_FILE="$LOG_DIR/prisma-studio.log"
PID_FILE="$LOG_DIR/prisma-studio.pid"
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$WORKSPACE_ROOT/apps/api"
PRISMA_BIN="$API_DIR/node_modules/.bin/prisma"

mkdir -p "$LOG_DIR"

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE")"
  if kill -0 "$EXISTING_PID" >/dev/null 2>&1; then
    printf 'Prisma Studio is already running at http://localhost:%s\n' "$PORT"
    printf 'Log file: %s\n' "$LOG_FILE"
    exit 0
  fi

  kill "$EXISTING_PID" >/dev/null 2>&1 || true
  rm -f "$PID_FILE"
fi

sh -c "cd \"$API_DIR\" && env BROWSER=/bin/true \"$PRISMA_BIN\" studio --port \"$PORT\" >\"$LOG_FILE\" 2>&1 < /dev/null & echo \$! > \"$PID_FILE\""
STUDIO_PID="$(cat "$PID_FILE")"

sleep 2

if ! kill -0 "$STUDIO_PID" >/dev/null 2>&1; then
  printf 'Prisma Studio failed to start. Check log: %s\n' "$LOG_FILE"
  exit 1
fi

printf 'Prisma Studio started at http://localhost:%s\n' "$PORT"
printf 'Log file: %s\n' "$LOG_FILE"
