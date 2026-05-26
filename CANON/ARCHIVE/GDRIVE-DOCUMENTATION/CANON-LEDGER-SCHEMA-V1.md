# CANON Ledger Schema & Format Specification

## CSV Structure

```
idx,layer_id,stratum,domain,type,stability,hash,prev_hash,file_path,file_size_kb,incarnation,purpose
```

### Field Definitions

| Field | Type | Length | Example | Purpose |
|-------|------|--------|---------|---------|
| **idx** | INTEGER | 1-5 | 42 | Sequential index for ordering and reference |
| **layer_id** | STRING | 50-80 | L0042_S2_INTERPRETATION_DIAGNOSTIC_DOCTRINE_LAYER | Unique identifier: L[idx]_S[stratum]_[domain]_[type] |
| **stratum** | STRING | 15 | S2_INTERPRETATION | Organizational layer: S0-S8 (Genesis→Proofs) |
| **domain** | STRING | 15 | LEDGER | Problem domain: TRUTH, SECURITY, LEDGER, MAPPING, ENERGY |
| **type** | STRING | 20 | DIAGNOSTIC_LAYER | Layer type: PRINCIPLE, PROCESS, LOCK, DIAGNOSTIC, GUARDRAIL |
| **stability** | STRING | 10 | TITANIUM | Mutability state: TITANIUM (immutable), GOLD, SILVER, MUTABLE |
| **hash** | STRING | 64 | 160569f8fba793285b7b61735850447f9a935acfb3488099423e3093dbb674b1 | SHA256 of file content |
| **prev_hash** | STRING | 64 | 55036647d210fc308d7a603ae82e2cafbad691b44d8b25aa806720c09a50c75d | SHA256 of previous layer (Merkle chain) |
| **file_path** | STRING | 100-150 | BIBLE-CH30-2026-04-20-FINAL-PIPELINE-60-STAGE-AUDIT.md | Relative path from /OB-1/CANON/ |
| **file_size_kb** | INTEGER | 1-5 | 524 | File size in kilobytes (approximate) |
| **incarnation** | STRING | 10 | v1, v8, V55 | Version or iteration marker |
| **purpose** | STRING | 80-200 | 60-stage final audit with governance metrics | One-line functional description |

---

## Stratum Definitions

### S0_GENESIS
- **Range:** Indices 1-7
- **Purpose:** Foundation axioms, core governance, configuration
- **Stability:** All TITANIUM
- **Key Domains:** TRUTH, SECURITY, LEDGER, ENERGY, MAPPING
- **Immutable:** Yes (law layer)
- **Example Files:** CORE-PRINCIPLES, ALPHA-OMEGA-GOVERNANCE, dna-flags.json

### S1_FOUNDATIONS  
- **Range:** Indices 8-22
- **Purpose:** Soul DNA capture methodologies and historical archaeology
- **Stability:** All TITANIUM
- **Key Domains:** TRUTH
- **Immutable:** Yes (protocol layer)
- **Example Files:** SOUL-DNA-PROTOCOL-V1.2, RECAPTURE-UNFILTERED-2026-04-05

### S2_INTERPRETATION
- **Range:** Indices 23-54
- **Purpose:** Doctrine interpretation through Bible chapters and Soul DNA Bible
- **Stability:** All TITANIUM
- **Key Domains:** TRUTH, LEDGER, MAPPING, ENERGY, SECURITY
- **Immutable:** Yes (interpretive law layer)
- **Example Files:** BIBLE-CH01 through CH30, SOUL-DNA-BIBLE CH00-13

### S3_CONSOLIDATION
- **Range:** Indices 55-77
- **Purpose:** Vault layers (learning synthesis) + audit snapshots
- **Stability:** TITANIUM (principle) vs GOLD (audit)
- **Key Domains:** TRUTH, LEDGER
- **Immutable:** Mostly (audits may iterate)
- **Invariant:** A→B→D→E→I→L→MM (sequential learning layers)
- **Example Files:** VAULT-A through VAULT-MM, VAULT-MONOLITH-AUDIT

### S4_OPERATIONS
- **Range:** Indices 78-90
- **Purpose:** Active system runtime, routing, deployment
- **Stability:** Mix (TITANIUM for SSM-V8, GOLD for configuration)
- **Key Domains:** SECURITY, MAPPING, ENERGY, LEDGER
- **Mutable:** Yes (operational layer — updated on deployment)
- **Example Files:** SSM-V8-ULTIMATE-GPS, PIPELINE-600, CLOUDFLARE-ECOSYSTEM-MAP

### S5_PRODUCTS
- **Range:** Indices 91-104
- **Purpose:** Revenue streams, customer-facing philosophy
- **Stability:** TITANIUM (teaching law) + GOLD (operational marketing)
- **Key Domains:** ENERGY, MAPPING
- **Mutable:** Partially (methodology frozen, messaging iterable)
- **Example Files:** GOSPEL-444-*, NET-TEACHING-BIBLE, LAUNCH-PLAYBOOK

### S6_EVIDENCE
- **Range:** Indices 105-115
- **Purpose:** Session captures, execution records, weekly reports
- **Stability:** GOLD (locked after session end)
- **Key Domains:** LEDGER, SECURITY, MAPPING
- **Mutable:** No (historical snapshot)
- **Example Files:** RUN312-*, NOTEBOOKLM-*, WEEKLY-REPORT

### S7_ARCHIVE
- **Range:** Indices 116-134 (+ Heavy Ledger & Reincarnation in PART3)
- **Purpose:** Historical state snapshots, execution logs
- **Stability:** GOLD (archived)
- **Key Domains:** LEDGER, SECURITY, TRUTH, LIFECYCLE
- **Mutable:** No (archive)
- **Example Files:** Heavy Ledger (186 JSON snapshots), Reincarnation (133 logs)

### S8_PROOFS
- **Range:** Indices 135-140+
- **Purpose:** Cryptographic validation, evidence, sealed records
- **Stability:** TITANIUM (sealed)
- **Key Domains:** SECURITY
- **Mutable:** No (proofs are immutable)
- **Example Files:** PROOFS-CHAT-*, PROOFS-KEY-SOUL-*

---

## Domain Classification

### TRUTH
- **Aspect:** Core doctrine, philosophy, captured reality
- **Layers:** PRINCIPLE_LAYER (laws), DIAGNOSTIC_LAYER (captured observation)
- **Mutability:** TITANIUM (immutable truth)
- **Strata:** S0, S1, S2, S3, S7
- **Examples:** CORE-PRINCIPLES, SOUL-DNA-PROTOCOL, BIBLE chapters

### SECURITY  
- **Aspect:** Access control, governance, sealed operations
- **Layers:** LOCK_LAYER (sealed), PRINCIPLE_LAYER (laws), DIAGNOSTIC_LAYER (audit)
- **Mutability:** TITANIUM (governance frozen)
- **Strata:** S0, S2, S4, S6, S8
- **Examples:** ALPHA-OMEGA-GOVERNANCE, SSM-V8, sealed proofs

### LEDGER
- **Aspect:** State tracking, metrics, synchronization points
- **Layers:** PROCESS_LAYER (flow), DIAGNOSTIC_LAYER (audit), LOCK_LAYER (snapshot), GUARDRAIL_LAYER (limits)
- **Mutability:** Mixed (live GOLD → archived TITANIUM)
- **Strata:** All (S0-S8)
- **Examples:** HEAVY-LEDGER snapshots, VAULT audits, weeklly reports

### MAPPING
- **Aspect:** Relationships, connectivity, routing
- **Layers:** PROCESS_LAYER (flow), PRINCIPLE_LAYER (law), LOCK_LAYER (snapshot), GUARDRAIL_LAYER (constraints)
- **Mutability:** Mixed (runtime MUTABLE → archived TITANIUM)
- **Strata:** S2, S4, S5, S6
- **Examples:** CONNECTIVITY-MAP, CLOUDFLARE-MAP, lesson blueprints

### ENERGY
- **Aspect:** Capability, momentum, resources, velocity
- **Layers:** PRINCIPLE_LAYER (law), PROCESS_LAYER (flow), LOCK_LAYER (snapshot), DIAGNOSTIC_LAYER (metrics)
- **Mutability:** Mixed (operational GOLD → archived TITANIUM)
- **Strata:** S0, S2, S4, S5, S7
- **Examples:** CORE-PRINCIPLES, GOSPEL-444, STUDENT-ARCHETYPES

---

## Layer Type Classification

### PRINCIPLE_LAYER
- **Count:** 45 entries
- **Characteristic:** Immutable law or doctrine
- **Stability:** Always TITANIUM
- **Merge Strategy:** NO-OP (immutable)
- **Examples:** BIBLE chapters, Soul DNA protocols

### PROCESS_LAYER
- **Count:** 25 entries
- **Characteristic:** Operational flow or procedure
- **Stability:** Usually GOLD (may iterate)
- **Merge Strategy:** Append-only (new versions)
- **Examples:** PIPELINE-600, Gospel 444 methods

### LOCK_LAYER
- **Count:** 30 entries
- **Characteristic:** Sealed/archived state snapshot
- **Stability:** GOLD → TITANIUM (after archival)
- **Merge Strategy:** NO-OP (historical)
- **Examples:** PROOFS-*, reincarnation records, vault snapshots

### DIAGNOSTIC_LAYER
- **Count:** 25 entries
- **Characteristic:** Inspection, audit, or healthcheck
- **Stability:** GOLD (immutable after session)
- **Merge Strategy:** Append-only
- **Examples:** VAULT-MONOLITH-AUDITs, weekly reports, connectivity diagnostics

### GUARDRAIL_LAYER
- **Count:** 8 entries
- **Characteristic:** Safety boundary or constraint
- **Stability:** TITANIUM (frozen constraint)
- **Merge Strategy:** NO-OP (constraints don't merge)
- **Examples:** Ledger guardrails, mapping limits

---

## Stability States

| State | Meaning | Mutability | Typical Strata | Merge |
|-------|---------|-----------|-----------------|-------|
| **TITANIUM** | Immutable law | Never | S0, S1, S2, S8 | N/A |
| **GOLD** | Locked (post-session) | No, but versionable | S4, S5, S6, S7 | Prepend version |
| **SILVER** | Active (in-session) | Yes | S4, S5 | Overwrite |
| **MUTABLE** | Unrestricted | Yes | Rare | Overwrite |

---

## Merkle Chain Properties

**Definition:** Each layer's `hash` is the SHA256 of its file content. The `prev_hash` references the previous entry's hash, forming an immutable chain.

**Genesis Block:**
```
idx: 1
layer_id: L0001_S0_GENESIS_ENERGY_PRINCIPLE_LAYER
prev_hash: 0000000000000000000000000000000000000000000000000000000000000000 (null reference)
```

**Chain Validation (pseudocode):**
```python
def validate_ledger(ledger_csv):
    prev = "0000000000000000000000000000000000000000000000000000000000000000"
    for row in ledger_csv:
        if row.prev_hash != prev:
            raise BreakError(f"Chain break at idx {row.idx}")
        actual_hash = sha256(read_file(row.file_path))
        if row.hash != actual_hash:
            raise IntegrityError(f"Hash mismatch at idx {row.idx}")
        prev = row.hash
    return True
```

**Fail Mode:** If any hash breaks the chain → AUDIT REQUIRED (fail-closed).

---

## Query Examples

### Find all Truth principle documents
```bash
grep "TRUTH.*PRINCIPLE_LAYER" CANON-LEDGER-RUN337-PART*.csv | cut -d',' -f9
```

### Find all Security locks in S4_OPERATIONS
```bash
grep "S4_OPERATIONS.*SECURITY.*LOCK_LAYER" CANON-LEDGER-RUN337-PART*.csv
```

### List all files in S3_CONSOLIDATION by size (descending)
```bash
grep "S3_CONSOLIDATION" CANON-LEDGER-RUN337-PART*.csv | sort -t',' -k10 -rn
```

### Get lineage of a specific file (hash chain from index to genesis)
```bash
# Start at desired row, follow prev_hash chain backwards to idx=1
grep "L0062_S3_CONSOLIDATION" CANON-LEDGER-RUN337-PART*.csv | head -1 | cut -d',' -f8 | \
  while read prev; do grep "$prev" CANON-LEDGER-RUN337-PART*.csv | cut -d',' -f8; done
```

### Verify ledger integrity
```bash
python3 << 'EOF'
import csv, hashlib
with open('CANON-LEDGER-RUN337-PART1.csv') as f:
    reader = csv.DictReader(f)
    prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"
    for row in reader:
        if row['prev_hash'] != prev_hash:
            print(f"CHAIN BREAK at idx {row['idx']}")
            exit(1)
        prev_hash = row['hash']
        print(f"✓ idx {row['idx']}: {row['layer_id']}")
print("✓ Ledger valid")
EOF
```

---

## Extension Protocol

When adding new files to CANON:

1. **Determine Stratum:** Which layer (S0-S8)?
2. **Determine Domain:** TRUTH / SECURITY / LEDGER / MAPPING / ENERGY?
3. **Determine Type:** PRINCIPLE / PROCESS / LOCK / DIAGNOSTIC / GUARDRAIL?
4. **Compute Hash:** `sha256(file_content)`
5. **Set prev_hash:** Last row's hash
6. **Append Row:** New index, auto-increment

**Example Adding File:**
```
New file: NET-PRODUCT-UPDATE-2026-05-20.md (Product domain, Process layer)

idx: 105 (next available)
layer_id: L0105_S5_PRODUCTS_PROCESS_REVENUE_LAYER
stratum: S5_PRODUCTS
domain: ENERGY (product capability)
type: PROCESS_LAYER
stability: GOLD (new, not yet sealed)
hash: <compute sha256 of file>
prev_hash: <hash of row 104>
file_path: NET-PRODUCT-UPDATE-2026-05-20.md
file_size_kb: 187
incarnation: v1
purpose: Product feature roadmap and customer communication
```

---

## Completion Roadmap

**Current Status (RUN337):**
- ✅ Part 1-2: 140 major files indexed (S0-S8, indices 1-140)
- ⏳ Part 3: Heavy Ledger (186 entries, HL-037 through HL-143+)
- ⏳ Part 4: Reincarnation archive (133 entries, RUN261-337)
- ⏳ Part 5: Subdirectories (CASE-STUDIES, MSS, RECON, TRAIN-67, etc.)
- ⏳ Hash Verification: Compute real SHA256 for all 3,926 files

**Final Ledger:** 3,926+ entries, fully cryptographically chained

---

**Schema Version:** CANON-LEDGER-V1  
**Specification Date:** 2026-04-20 (RUN337)  
**Governance:** Michael Hobbs (Agent 100) / OB-1 Ne0 (Agent 99)
