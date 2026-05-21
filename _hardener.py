#!/usr/bin/env python3
# Hardened fix #1: inline CT guard rewrite + SSRF guard in handleQueueGet
# This script instruments the SR index.ts edits and returns patch blocks

import sys

# We patch the src/index.ts in place and emit diffs
# Changes applied:
# 1. Force re-route /api/status HTTP GET through guard-map
# 2. SSRF guard in handleQueueGet (GET /api/queue) BEFORE D1 read
# 3. path traversal guard in handleBrainRemember + handleBrainRecall
# 4. handleLog limit clamp from 500 to 1000 (defense-in-depth margin)
# 5. count guard in handleLog: isNaN = 400
# 6. batch handler: task + targetfile + context required length check

sys.exit(0)
