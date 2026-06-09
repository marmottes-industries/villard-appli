#!/usr/bin/env bash
#
# Synchronise API.md depuis le repo source villard-api.
#
# Source de vérité : github.com/CallMeTrinity/villard-api (repo privé).
# Authentification : utilise la session `gh auth` existante — aucune var d'env à configurer.
#
# Usage :
#   ./scripts/sync-api-docs.sh             # sync depuis main
#   REF=feature/foo ./scripts/sync-api-docs.sh
#
set -euo pipefail

REPO="CallMeTrinity/villard-api"
FILE="API.md"
REF="${REF:-main}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI is required (brew install gh)" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Error: not logged in — run \`gh auth login\` first" >&2
  exit 1
fi

DEST="$(git rev-parse --show-toplevel)/${FILE}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

echo "→ fetching ${REPO}@${REF}:${FILE}"
gh api "repos/${REPO}/contents/${FILE}?ref=${REF}" \
  -H "Accept: application/vnd.github.raw" > "$TMP"

if [[ ! -s "$TMP" ]]; then
  echo "Error: empty response — aborting" >&2
  exit 1
fi

if cmp -s "$TMP" "$DEST" 2>/dev/null; then
  echo "✓ ${FILE} already up-to-date"
else
  mv "$TMP" "$DEST"
  echo "✓ ${FILE} synced — review with \`git diff ${FILE}\` and commit"
fi
