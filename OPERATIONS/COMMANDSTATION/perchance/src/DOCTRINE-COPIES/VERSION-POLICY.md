# PROPOSED — VERSION-POLICY (P6)

> **Status:** PROPOSED — not canon. Takes effect only on SOV100 merge.
> **Source:** DeepSeek Pro Phase-1 audit 2026-10-29 (receipt Tmvtm43ov), defect #12.
> **Target:** new file `CANON/SYSTEM/VERSION-POLICY.md`, referenced from GOSPEL-999 header and LFG header.

## RULES

- **MAJOR** = amendment merge that renumbers mandates or changes sealed headers.
- **MINOR** = new amendment proposed.
- **PATCH** = typo fixes, link corrections.
- On adoption: GOSPEL-999 moves to v1.7.0 (seven proposed amendments); LFG moves to v1.0.0 (no longer v0 — it carries operational law).
- Every canon file SHALL carry a `version:` field and a `canon-sha:` field holding the git blob hash at last seal.
- New file creations are listed in `PROPOSED_FILES.md` (this dir) until merged, then archived with SEAL entries.
