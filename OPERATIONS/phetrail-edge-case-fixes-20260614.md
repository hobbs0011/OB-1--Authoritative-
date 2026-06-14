# PHETRAIL — Edge Case Fixes Session

## Session: 2026-06-14T15:47:18+07:00

### Fixes Applied:

1. **pcc-1:src/index.js:689** — Boundary condition `<=` instead of `<`
   - Risk: Mission overlap at exact budget boundary
   - Fix: Changed to `<=` to prevent concurrent scout missions

2. **pcc-1:src/index.js:67** — Idempotency check false positive
   - Risk: Different replacements with same first 60 chars would falsely match
   - Fix: Changed from `replace.trim().slice(0, 60)` to full `replace` string comparison

3. **pcc-2:src/index.js:170** — Missing run_id in pcc_metrics INSERT
   - Risk: Silent NOT NULL constraint failure
   - Fix: Added `'pcc2'` as first bind parameter (run_id)

4. **orchestrate.js:69-75** — Already has run_id='orchestrator', no change needed

### Remaining Issues (Doctrine vs Implementation):

- **pcc-1:src/index.js:744-746** — Searches D1 backburner instead of `CANON/SOUL/EXTRACT/` per scout doctrine (line 18 of ob1-scout-mission.md)
- **scout routing** — Path handling inconsistent between fetch() and main handler

### Verification:
- All files pass `node --check` syntax validation