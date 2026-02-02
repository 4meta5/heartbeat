#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SKILLEX_ROOT:-}" ]]; then
  echo "SKILLEX_ROOT not set. Set it to your repo root (e.g., /Users/amar/skillex)." >&2
  exit 1
fi

if [[ ! -d "$SKILLEX_ROOT" ]]; then
  echo "SKILLEX_ROOT is not a directory: $SKILLEX_ROOT" >&2
  exit 1
fi
