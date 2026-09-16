#!/bin/bash
# Mailala rollback script
# Usage: ./scripts/rollback.sh <commit-hash>

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/rollback.sh <commit-hash>"
  echo "Recent commits:"
  git log --oneline -10
  exit 1
fi

COMMIT=$1
echo "Rolling back to commit: $COMMIT"

git checkout $COMMIT -- WEBSITE/mailala/
git add WEBSITE/mailala/
git commit -m "rollback: revert WEBSITE/mailala to $COMMIT"
git push origin canon

echo "Rollback complete. Deployed to Cloudflare Pages."
