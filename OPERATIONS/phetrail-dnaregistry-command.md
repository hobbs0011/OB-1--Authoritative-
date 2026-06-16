# PHEROMONE TRAIL — /dnaREGISTRY COMMAND v1.0
**Date:** 2026-06-17T01:15 ICT
**Strength: +100/100** | Type: CANONICAL — registry scan command

---

## §1 COMMAND SPEC

**Path:** `D:\OB-1-CANONICAL\.kilo\command\dnaREGISTRY.md`
**Size:** 273 lines
**Version:** 1.0

**Purpose:** Full canonical registry scan. Reads all .md files under CANON/ + OPERATIONS/ + SYSTEM/ + RESEARCH/ + .kilo/command/. Outputs structured JSON registry. Connects to inverted-index via keyword hashing.

---

## §2 WHEN TO USE

| Trigger | Action |
|---------|--------|
| Run 0 / ERA reset | Full scan. Build from zero. |
| New command file created | Append to registry immediately. |
| Edge case detected | Scan registry first. |
| RISE audit | STAGE 5.5 — verify file count matches live filesystem. |
| DEATH seal | §9 ARTIFACTS MUST include registry digest. |
| L70 REGISTRY_FIRST | Before complex logic, load registry + inverted-index. |

---

## §3 5 LAWS

| # | Law |
|---|-----|
| L-REG-1 | SCAN_FIRST |
| L-REG-2 | APPEND_ONLY |
| L-REG-3 | CATEGORY_REQUIRED |
| L-REG-4 | KEYWORD_SYNC |
| L-REG-5 | PATH_VERIFY |

---

## §4 FLAGS

1. **DNAREGISTRY_COMMAND_V10** — canonical registry scan
2. **SCAN_ROOTS** — 8 directories scanned
3. **CATEGORY_CLASSIFIER** — 20+ document categories

---

`DNAREGISTRY COMMAND SEALED — 2026-06-17T01:15 ICT | STRENGTH: +100/100 | CANONICAL | 5 LAWS | 8 SCAN ROOTS | 20+ CATEGORIES`
