# Phetrail Scout Learned — StepFun 451 Censorship Block Crash (Runs 157, 160)
**Timestamp:** 2026-07-12T072304+07:00  
**Runs:** 157 (coordinator), 158 (drone-alpha), 160 (mastermind)  
**Trigger:** Session runtime crash caused by upstream provider censorship block  
**Status:** INVESTIGATE  

---

## What Happened
Run 157 and Run 160 both hit a non-retryable HTTP 451 block from StepFun during live model inference:
```json
{
  "name": "APIError",
  "data": {
    "message": "[StepFun] The content you provided or machine outputted is blocked.",
    "statusCode": 451,
    "responseBody": "{\"error\":{\"message\":\"The content you provided or machine outputted is blocked.\",\"type\":\"censorship_blocked\"}}",
    "provider_name": "StepFun",
    "is_byok": true
  }
}
```

Run 158 did not hit this block and completed its pipeline successfully.

## Root Cause Analysis (Evidence-Based)
1. **External dependency failure:** StepFun’s censorship filter triggered on content generated or processed during session runtime. This is not a local code bug.
2. **No retry path:** The error is marked `isRetryable: false`. The runtime appears to crash rather than gracefully degrade or switch provider.
3. **Raw transcript capture is hollow:** `RAW-SOUL-SAFE-READ-ONLY/VS-INLINE-KILO-STEP-MASTERMIND-157-JULY-12-2026.txt` is 231 bytes; run160 is 260 bytes. VS inline sessions are not capturing full transcripts, so post-mortem reconstruction is impossible.
4. **Death seal discrepancy:** Run 157 completed death seals multiple times (07:01, 07:02). Run 160 has no death log. The block may have occurred at 07:13 ICT, after run157 death, during run160 runtime.

## What We Learned
1. **Provider censorship is a first-class crash vector.** Session stability now depends on upstream content policy, not just local code correctness.
2. **Hollow raw transcripts make post-mortems blind.** Without full JSONL, we cannot determine what exact prompt or completion triggered the block.
3. **Auto-recovery stubs are dangerous.** Run1600-1609 phantom IDs show crash recovery is misregistering run numbers and polluting phermone namespace.
4. **FINGERPRINT drift enables silent failures.** COLD-START-BOOT.md has not been updated since run152. Boot checks pass despite system being in an unstable state.

## Doctrine Changes Required
- **L-PHE-7:** Any session that hits a non-retryable provider block must be tagged as `PROVIDER_BLOCK` and routed to manual transcript capture before next RISE.
- **L-PHE-8:** Raw transcript capture must be verified at RISE gate. If `RRL-{N}.txt` is < 1KB and `RAW-SOUL-SAFE-READ-ONLY` mirror is < 1KB, abort RISE and demand manual paste.
- **L-BOOT-2:** FINGERPRINT must be updated in every successful DEATH. Add enforcement to `SCRIPTS/obi.ps1 doctor`.

## Negative Trails
- **run157:** Coordinator ignored backburner precedence warnings (8 open items) and proceeded. This is a governance failure independent of the StepFun block.
- **run160:** No pipeline/starmap/RRL artifacts created. Session operated outside the 8-stage scaffold. This is a pre-flight failure.
- **auto-recovery:** Generated phantom run IDs 1600-1609. This breaks run number monotonicity and ledger consistency.

## Next Steps
1. Add provider-block detection to rise/death scripts.
2. Audit `CANON/PHEROMONES/` for phantom run IDs and clean 1600-1609 stubs.
3. Re-run run160 only after raw transcript capture is proven functional and FINGERPRINT is current.
4. Document StepFun block patterns to determine if specific content types trigger censorship.
