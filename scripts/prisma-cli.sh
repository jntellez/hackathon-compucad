#!/usr/bin/env bash
set -euo pipefail

workspace_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

docker run --rm --network host \
  -v "$workspace_root:/workspace" \
  -w /workspace/apps/api \
  node:24 \
  bash -lc 'corepack enable >/dev/null 2>&1 && pnpm prisma "$@"' bash "$@"
