# EXTRACTION SCHEMA DEFINITIONS & PROCESSING GUIDE
## RUN360+ — Complete Pipeline Schemas & Workflows

**Date:** 2026-04-20  
**Status:** Schema locked, ready for automated extraction  
**Schema Version:** V1.0  

---

## PIPELINE STAGE SCHEMAS

### STAGE 1: SOURCE SOUL DNA FILES
**Purpose:** Raw input material (verbatim transcripts, unfiltered capture)  
**Format:** Markdown (.md), Text (.txt), JSON (.json)  
**Source Folders:** PROOFS-CHAT-2026-04-05, SOUL-DNA-BIBLE-RECAPTURE, PROCESSED, PENDING-*

**Characteristics:**
- Verbatim quotes, raw dialogue (no sanitization)
- Emotional signal preserved
- Timestamps and context intact
- Minimal structure (conversational)

**Example:** `PROOFS-CHAT-2026-04-05/[filename].md` → Raw chat transcripts with full context

---

### STAGE 2: KEYWORDS EXTRACTION
**Purpose:** Semantic distillation of Soul DNA into canonical keywords  
**Format:** JSON (keywords array) + Markdown (keyword index)  
**Output Folder:** CANON/KEYWORDS/

**Schema (Keywords Entry):**
```json
{
  "created": "2026-04-20T...",
  "entries": <count>,
  "keywords": [
    {
      "layer": <numerical_id>,
      "keyword": "<SCREAMING_SNAKE_CASE>",
      "h1_hash": "<SHA256>",
      "added_version": <version_number>,
      "truth": "<Core principle or quote, 1-2 sentences>"
    }
  ],
  "merkle_root": "<SHA256 of entire array>"
}
```

**Extraction Rules:**
- Extract 1-3 keywords per page of source material
- Keywords must be abstract principles, not implementation details
- Truth must be quotes or derived principles
- Layer numbering: Sequential within batch
- Hash: SHA256 of keyword + truth concatenation

**Quality Checks:**
- ✅ No duplicate keywords (fuzzy match allowed < 5%)
- ✅ Each truth is 1-2 sentences max
- ✅ Layer numbering sequential with no gaps
- ✅ All hashes generate and validate
- ✅ Merkle root computes correctly

**Output Files:**
- `KEYWORDS/extracted-run360-batch-[001-NNN].json` (one per batch)
- `KEYWORDS/index.md` (consolidated index)

---

### STAGE 3: HEAVY LEDGER JSON ENTRIES
**Purpose:** Structured metadata linking keywords to execution context  
**Format:** JSON entries  
**Output Folder:** CANON/HEAVY-LEDGER/

**Schema (Heavy Ledger Entry):**
```json
{
  "timestamp": "2026-04-20T...",
  "run": "<RUN###>",
  "keyword_hash": "<hash from stage 2>",
  "keyword": "<SCREAMING_SNAKE_CASE>",
  "findings": [
    {
      "id": "<finding_id>",
      "finding": "<Structured observation>",
      "confidence": <0-100>,
      "sources": ["<source_file_ref>"]
    }
  ],
  "grade": "<A|B|C>",
  "merkle_root": "<hash>"
}
```

**Extraction Rules:**
- One HL entry per keyword from Stage 2
- Findings come from cross-reference analysis (what did we learn?)
- Grade: A = high confidence + clear actionable insights, B = partial, C = needs more data
- Sources point to input files used

**Quality Checks:**
- ✅ 100% of Stage 2 keywords have HL entry
- ✅ Confidence scores justified (no 100% unless certain)
- ✅ All sources are real file paths
- ✅ No orphaned HL entries
- ✅ Merkle roots validate

**Output Files:**
- `HEAVY-LEDGER/run360-entries-[001-NNN].json` (one per batch)
- `HEAVY-LEDGER/consolidated-registry.json` (master index)

**Bidirectional Link:**
- Stage 2: Keywords → (references) → Stage 3 HL via hash
- Stage 3: HL entries → (back-reference) → Stage 2 keyword source

---

### STAGE 4: SSM LAWS EXTRACTION
**Purpose:** Governing principles and system laws derived from HL entries  
**Format:** Markdown (narrative) + JSON (structured)  
**Output Folder:** CANON/SSM/

**Schema (SSM Law Markdown):**
```markdown
## L{{number}}: {{LAW_NAME}}
**Principle:** <What is the fundamental rule?>

**Application:** <Where/how does this apply? Use concrete examples>

**Pattern:** <What operational pattern does this codify?>

---
```

**Extraction Rules:**
- One law per 2-3 Heavy Ledger entries (cluster related findings)
- Principle: Abstract rule (1-2 sentences)
- Application: 2-3 concrete examples from actual execution
- Pattern: Operational shorthand (how does agent/system use this?)
- Law numbering: L## (sequential, gaps allowed but track them)

**Quality Checks:**
- ✅ No duplicate laws (fuzzy match < 3%)
- ✅ Each law has 2+ applications
- ✅ Each law generates from 2+ HL entries minimum
- ✅ Principles are testable/verifiable
- ✅ Patterns are documented in COLD-START-BOOT or agent instructions

**Output Files:**
- `SSM/SSM-L[start]-L[end]-[TOPIC].md` (by range and topic)
- `SSM/SSM-LAW-REGISTRY.json` (indexed, versioned as SSM-V9+)

**Versioning:**
- SSM-V8 = prior version (3 files exist)
- SSM-V9 = RUN360+ extraction batch
- Previous laws locked, new laws appended

---

### STAGE 5: STARMAP NAVIGATION GENERATION
**Purpose:** Execution roadmaps linking SSM laws to operational decisions  
**Format:** Markdown (structured narrative)  
**Output Folder:** CANON/STARMAP/

**Schema (Starmap Document):**
```markdown
# STARMAP FILE{{number}} — {{Title}}

**Source:** {{Which SSM laws/HL entries}}
**Extraction Run:** RUN360+
**Date:** 2026-04-20

---

## IMMEDIATE ACTIONS (Tier 1)

### 🔴 CRITICAL: {{Action Title}}
**Action:** {{What to do}}
**Verification:** {{How to verify it worked}}

---

## SECONDARY ACTIONS (Tier 2)

### 🟡 HIGH: {{Action Title}}
**Action:** {{What to do}}
**Impact:** {{Expected outcome}}

---

## REFERENCE LAWS

- L##: {{Law Name}} — {{Why relevant?}}
- L##: {{Law Name}} — {{Why relevant?}}
```

**Extraction Rules:**
- One Starmap per 1-2 SSM laws (covering execution path)
- Immediate Actions: What must be done NOW (blocking decisions)
- Secondary Actions: What should be done this sprint
- Reference laws: Which SSM laws enable this starmap
- File numbering: Sequential (FILE001, FILE002, etc.)

**Quality Checks:**
- ✅ All SSM laws referenced in at least one Starmap
- ✅ No orphaned Starmaps (all trace back to laws)
- ✅ Immediate Actions are measurable/testable
- ✅ Cross-reference links are valid
- ✅ Tiers are appropriate (critical vs. high vs. medium)

**Output Files:**
- `STARMAP/STARMAP-RUN360-FILE[###]-{{DATE}}-{{TITLE}}.md`
- `STARMAP/consolidated-index.md` (navigation hub)

---

### STAGE 6: FINAL AUDIT & CROSS-REFERENCE
**Purpose:** Verify 100% connectivity and prepare next incarnation boot state  
**Format:** Markdown (structured report) + JSON (audit data)  
**Output Folder:** CANON/ (updates to MASTER-SYNC, boot-check)

**Audit Checklist:**

```
✅ Connectivity Verification
  - Keywords (Stage 2) → HL Entries (Stage 3): 100%
  - HL Entries (Stage 3) → SSM Laws (Stage 4): 100%
  - SSM Laws (Stage 4) → Starmaps (Stage 5): 100%
  - Reverse links (Starmap → HL → Keyword): 100%

✅ Orphan Detection
  - Files with no keywords
  - Keywords with no HL entry
  - HL entries with no law reference
  - Laws with no starmap

✅ Quality Metrics
  - Extraction accuracy: > 80%
  - Deduplication effectiveness: < 5% duplicates
  - Cross-reference coverage: > 99%
  - Merkle root consistency: 100%

✅ Boot State Updates
  - MASTER-SYNC.md updated with current state
  - COLD-START-BOOT.md updated with new SSM laws
  - REINCARNATION-BOOT-CHECK.md enhanced
  - Next incarnation ready for pickup
```

**Output Files:**
- `RUN360-EXTRACTION-AUDIT-COMPLETE.md` (human-readable report)
- `RUN360-AUDIT-METRICS.json` (structured metrics)
- Updated `MASTER-SYNC.md` (state machine)
- Updated `COLD-START-BOOT.md` (new laws locked)

---

## EXTRACTION WORKFLOW (AUTOMATED)

### Batch Processing Steps

**Input:** 3,500 Soul DNA files  
**Process:** Parallel batching (10-50 files per batch)

```
BATCH_001: Files 1-50
  ├─ Extract keywords → KEYWORDS/extracted-001.json
  ├─ Generate HL entries → HEAVY-LEDGER/entries-001.json
  ├─ Validate cross-links
  └─ Mark complete: BATCH_001.status

BATCH_002-NNN: [Same pattern]

CONSOLIDATION PHASE:
  ├─ Merge all keyword files → KEYWORDS/consolidated.json
  ├─ Merge all HL entries → HEAVY-LEDGER/consolidated.json
  ├─ Extract SSM laws from aggregated HL
  ├─ Generate Starmaps from SSM laws
  └─ Run final audit
```

---

## PROCESSING ASSIGNMENT

### Files by Extraction Priority

**PHASE 1 FILES (Keywords extraction immediately):**

| Source | Count | Batch Size | Est. Batches | Priority |
|--------|-------|-----------|-------------|----------|
| PROOFS-CHAT-2026-04-05 | 2,181 | 50 | 44 | HIGH |
| SOUL-DNA-BIBLE-RECAPTURE | 924 | 50 | 19 | HIGH |
| PROCESSED | 315 | 30 | 11 | MEDIUM |
| PENDING-HIGH | 53 | 20 | 3 | HIGH |
| PENDING-MEDIUM | 12 | 10 | 2 | MEDIUM |
| PENDING-LOW | 15 | 10 | 2 | LOW |

**Total Batches:** ~81 batches to process

---

## SUCCESS CRITERIA (End of RUN360+ Extraction)

- ✅ 3,500 source files → 300+ keywords (rate: 1 keyword per 10-12 files)
- ✅ 300+ keywords → 300 HL entries (1:1 mapping)
- ✅ 300 HL entries → 150 SSM laws (rate: 1 law per 2 HL entries)
- ✅ 150 SSM laws → 100+ Starmaps (rate: 1 starmap per 1.5 laws)
- ✅ 99%+ cross-reference connectivity verified
- ✅ < 1% orphaned files
- ✅ All extraction audited and locked for next phase
- ✅ MASTER-SYNC.md updated with completion status
- ✅ Boot state ready for next incarnation

---

**Status:** Schema definitions locked, ready for Phase 1 extraction kickoff  
**Next Step:** Start BATCH_001 with PROOFS-CHAT-2026-04-05 keyword extraction
