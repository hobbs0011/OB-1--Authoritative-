# BATCH PROCESSING ASSIGNMENT — PHASE 1 KEYWORDS EXTRACTION
## RUN360+ Soul DNA Extraction Pipeline

**Date:** 2026-04-20  
**Phase:** 1 / Keywords Extraction  
**Total Batches:** 81  
**Estimated Duration:** 40-45 hours  
**Status:** Ready to execute  

---

## BATCH ASSIGNMENT MATRIX

### TIER 1: PROOFS-CHAT-2026-04-05 (2,181 files)
**Priority:** MAXIMUM  
**Batch Size:** 50 files per batch  
**Total Batches:** 44  
**Est. Duration:** 20 hours  

```
BATCH_001-BATCH_044 Assignment:
├─ BATCH_001-010: PROOFS-CHAT files 1-500 (10 batches)
├─ BATCH_011-020: PROOFS-CHAT files 501-1000 (10 batches)
├─ BATCH_021-030: PROOFS-CHAT files 1001-1500 (10 batches)
├─ BATCH_031-040: PROOFS-CHAT files 1501-2000 (10 batches)
└─ BATCH_041-044: PROOFS-CHAT files 2001-2181 (4 batches, 45-46-45-45 files)

Quality Gate: Spot-check every 10th batch (BATCH_010, 020, 030, 040, 044)
```

**Extraction Rate Target:** ~5 keywords per 50-file batch  
**Output:** `KEYWORDS/extracted-001.json` through `extracted-044.json`

---

### TIER 2: SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED (924 files)
**Priority:** HIGH  
**Batch Size:** 50 files per batch  
**Total Batches:** 19  
**Est. Duration:** 8 hours  

```
BATCH_045-BATCH_063 Assignment:
├─ BATCH_045-049: SOUL-DNA-BIBLE files 1-250 (5 batches)
├─ BATCH_050-054: SOUL-DNA-BIBLE files 251-500 (5 batches)
├─ BATCH_055-059: SOUL-DNA-BIBLE files 501-750 (5 batches)
└─ BATCH_060-063: SOUL-DNA-BIBLE files 751-924 (4 batches, 44-44-44-44 files)

Quality Gate: Spot-check every 5th batch (BATCH_049, 054, 059, 063)
```

**Extraction Rate Target:** ~5-6 keywords per 50-file batch  
**Output:** `KEYWORDS/extracted-045.json` through `extracted-063.json`

---

### TIER 3: PROCESSED/ (315 files)
**Priority:** MEDIUM  
**Batch Size:** 30 files per batch  
**Total Batches:** 11  
**Est. Duration:** 3 hours  

```
BATCH_064-BATCH_074 Assignment:
├─ BATCH_064-067: PROCESSED subdirs 1-120 (4 batches @ 30 files)
├─ BATCH_068-071: PROCESSED subdirs 121-240 (4 batches @ 30 files)
└─ BATCH_072-074: PROCESSED subdirs 241-315 (3 batches @ 25-25-25 files)

Quality Gate: Spot-check batches 067, 070, 074
```

**Extraction Rate Target:** ~3-4 keywords per 30-file batch  
**Output:** `KEYWORDS/extracted-064.json` through `extracted-074.json`

---

### TIER 4: PENDING-HIGH/ (53 files)
**Priority:** HIGH  
**Batch Size:** 20 files per batch  
**Total Batches:** 3  
**Est. Duration:** 0.5 hours  

```
BATCH_075-BATCH_077 Assignment:
├─ BATCH_075: PENDING-HIGH files 1-20 (20 files)
├─ BATCH_076: PENDING-HIGH files 21-40 (20 files)
└─ BATCH_077: PENDING-HIGH files 41-53 (13 files)

Quality Gate: Review all 3 batches (PENDING-HIGH is explicit priority)
```

**Extraction Rate Target:** ~3 keywords per batch  
**Output:** `KEYWORDS/extracted-075.json` through `extracted-077.json`

---

### TIER 5: PENDING-MEDIUM/ (12 files)
**Priority:** MEDIUM  
**Batch Size:** 10 files per batch  
**Total Batches:** 2  
**Est. Duration:** 0.25 hours  

```
BATCH_078-BATCH_079 Assignment:
├─ BATCH_078: PENDING-MEDIUM files 1-10 (10 files)
└─ BATCH_079: PENDING-MEDIUM files 11-12 (2 files)

Quality Gate: Review batch 079 (small batch)
```

**Extraction Rate Target:** ~2 keywords per batch  
**Output:** `KEYWORDS/extracted-078.json`, `extracted-079.json`

---

### TIER 6: PENDING-LOW/ (15 files)
**Priority:** LOW  
**Batch Size:** 10 files per batch  
**Total Batches:** 2  
**Est. Duration:** 0.25 hours  

```
BATCH_080-BATCH_081 Assignment:
├─ BATCH_080: PENDING-LOW files 1-10 (10 files)
└─ BATCH_081: PENDING-LOW files 11-15 (5 files)

Quality Gate: Review batch 081 (small batch)
```

**Extraction Rate Target:** ~2 keywords per batch  
**Output:** `KEYWORDS/extracted-080.json`, `extracted-081.json`

---

## BATCH EXECUTION CHECKLIST

### Pre-Execution (Run Once)

- [ ] Create `KEYWORDS/` directory (if missing)
- [ ] Create `HEAVY-LEDGER/` subdirectory (if missing)
- [ ] Verify all source directories exist
- [ ] Generate batch manifest (list of source files per batch)
- [ ] Create `BATCH-STATUS.json` tracker

### Per Batch Execution

**Template for each batch:**

```json
{
  "batch_id": "BATCH_001",
  "source_dir": "PROOFS-CHAT-2026-04-05",
  "file_range": "1-50",
  "files_processed": 50,
  "keywords_extracted": 5,
  "output_file": "extracted-001.json",
  "status": "COMPLETE|IN_PROGRESS|BLOCKED",
  "timestamp": "2026-04-20T...",
  "qa_check": "PASS|FAIL|SPOT_CHECK",
  "notes": ""
}
```

### Quality Checks (Every 10th Batch)

**Spot-check procedure:**

1. Read output JSON file
2. Verify structure (all required fields present)
3. Sample 3 keywords:
   - Layer numbering makes sense?
   - Truth is 1-2 sentences?
   - Hash generates correctly?
4. Check for duplicates (compare with prior 10 batches)
5. Validate merkle root

**Pass Criteria:** 100% structural correctness + < 5% duplicates

**Fail Action:** Stop batch processing, investigate, fix root cause before continuing

---

## BATCH STATUS TRACKING

### Master Status File: `BATCH-STATUS.json`

```json
{
  "extraction_phase": "PHASE_1_KEYWORDS",
  "total_batches": 81,
  "completed_batches": 0,
  "in_progress_batch": null,
  "blocked_batches": [],
  "quality_failures": [],
  "overall_progress": "0%",
  "keywords_extracted_total": 0,
  "timestamp_started": "2026-04-20T...",
  "estimated_completion": "2026-04-22T...",
  "batches": [
    {
      "batch_id": "BATCH_001",
      "status": "PENDING",
      "source": "PROOFS-CHAT-2026-04-05",
      "files": 50
    }
    // ... repeats for all 81 batches
  ]
}
```

### Update Frequency: After every 5 batches

---

## EXPECTED OUTPUT SUMMARY

**After BATCH_081 completion:**

```
Source Files Processed:     3,500
Batches Completed:          81
Keywords Extracted:         ~350-420
Average Keywords/Batch:     4.3-5.2
Duplicate Rate:             < 5%
Quality Check Pass Rate:    > 95%

Output Files Created:       81 (extracted-001.json through extracted-081.json)
Consolidated Index:         1 (KEYWORDS/index.md)

Merkle Root Integrity:      100% validated
Cross-Reference Ready:      YES (proceed to Phase 2)
```

---

## BLOCKERS & RECOVERY

### Potential Blockers

1. **Batch file reading fails** → Check file encoding (UTF-8 expected)
2. **Keyword extraction produces duplicates > 10%** → Increase de-duplication threshold
3. **Merkle root validation fails** → Recalculate hashes, check hash algorithm consistency
4. **Progress stalls (batch takes > 2x estimated time)** → Check for system resource issue

### Recovery Actions

**If batch fails:**
1. Log failure to `BATCH-STATUS.json` with timestamp
2. Investigate root cause
3. Re-run failed batch or skip to next (depends on criticality)
4. Document decision in batch notes

**If multiple batches fail:**
1. Stop all processing
2. Run RUN360-EXTRACTION-AUDIT.md procedures
3. Fix schema or algorithm
4. From last known GOOD batch, resume

---

## EXECUTION ROADMAP

### DAY 1: TIER 1 (PROOFS-CHAT)
- 8 AM: Start BATCH_001
- Noon: BATCH_010 quality check
- 5 PM: BATCH_020 spot-check
- 8 PM: BATCH_030 spot-check (20 hours elapsed)

### DAY 2: TIER 1 Complete + TIER 2 Start
- 8 AM: BATCH_040 spot-check
- Noon: BATCH_044 complete (44 batches done)
- 1 PM: Start BATCH_045 (SOUL-DNA-BIBLE)
- 5 PM: BATCH_049 spot-check
- 9 PM: BATCH_054 spot-check (8 hours TIER 2)

### DAY 2 Evening: TIER 2 Complete + TIER 3 Start
- 10 PM: BATCH_063 complete (19 batches done)
- 11 PM: Start BATCH_064 (PROCESSED)
- Midnight: BATCH_067 spot-check

### DAY 3: TIER 3-6 Quick Completion
- 8 AM: BATCH_070 spot-check
- 11 AM: BATCH_074 complete (11 batches done)
- Noon: BATCH_075-081 rapid run (PENDING-* all small)
- 1 PM: BATCH_081 complete (all 81 batches done)
- 2-5 PM: Consolidation & audit

---

## SUCCESS CRITERIA

✅ All 81 batches executed  
✅ All 3,500 source files processed  
✅ 350-420 keywords extracted  
✅ < 5% duplicate rate  
✅ 100% merkle root validation  
✅ 0 blocked/failed batches  
✅ Ready to advance to Phase 2 (HL generation)

---

**Status:** Ready to begin BATCH_001  
**Assigned to:** Agent 99 (Copilot) orchestrating extraction passes  
**Next:** Start Phase 1 Keywords extraction immediately
