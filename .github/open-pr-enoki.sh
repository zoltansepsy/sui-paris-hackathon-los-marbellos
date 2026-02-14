#!/usr/bin/env bash
# Open PR for feat/enoki-sponsored-transactions (Enoki sponsored transactions).
# Run from repo root. Requires: push access to origin, and optionally 'gh' CLI.

set -e
BRANCH="feat/enoki-sponsored-transactions"
BASE="main"
REPO="zoltansepsy/sui-paris-hackathon-los-marbellos"

echo "Pushing $BRANCH to origin..."
git push -u origin "$BRANCH"

if command -v gh &>/dev/null; then
  echo "Creating PR via GitHub CLI..."
  gh pr create --base "$BASE" --head "$BRANCH" \
    --title "Enoki sponsored transactions end-to-end" \
    --body-file .github/PR_ENOKI_SPONSORED_TRANSACTIONS.md
else
  echo "GitHub CLI (gh) not found. Open the PR in the browser:"
  echo "  https://github.com/$REPO/compare/$BASE...$BRANCH?expand=1"
  echo "Then paste the PR description from: .github/PR_ENOKI_SPONSORED_TRANSACTIONS.md"
fi
