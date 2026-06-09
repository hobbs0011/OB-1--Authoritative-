# RUN 106 — P10 ERASURE HARDENING: FIX BLUEPRINT (post-audit, truth-grounded)
# OB-1 blueprint (Opus). Kilo executes on branch run106-p10-erasure-hardening. OB-1 verifies by reading.
# Audited HEAD on branch run106-p10-erasure-hardening, 2026-06-09. node --check confirmed clean (Kilo receipt).

## AUDIT VERDICT — Kilo's FINAL STATUS table vs reality
| # | Kilo claim | Audit (read against source) |
|---|------------|------------------------------|
| 1 | paren fix ✅ | ✅ VERIFIED — index.js:1948 + :2000 both `addCors(json({...}, 500), request)`, balanced |
| 2 | prod v1.5.0 ✅ | ✅ STRUCTURALLY SAFE — P10 code isolated on this branch; master/prod has no encrypt handlers. Class runs on clean prod |
| 3 | class-preflight.mjs ✅ | ⚠️ EXISTS + covers quy+mai-tram×3 modes, but SHALLOW — asserts only 200 + token + settings-truthy |
| 4 | P10 WIP staged ✅ | ⚠️ on branch but UNCOMMITTED (still `M`); + HL-660–663 show DELETED |

## TWO FINDINGS THE STATUS TABLE MISSED
**(M1) class-preflight is shallow — it will show GO on a broken voice session.** It checks the endpoint
answers (200 + token + settings exists), NOT that voice WORKS. A robot-voice regression returns 200 with a
truthy `settings` → false GO. The worst class failure (robot voice / dead mic) slips through. Tonight's
safety net is Michael's ear-check; harden the script before ever trusting it unattended. HARDEN: assert
`settings.agent.think.provider` ~ `gpt-4o-mini`, listen ~ `nova-3`, speak ~ `aura-2-zeus-en`, `ws_url`
present, phonics → `phonicsHint` present, and a `mode=banana` → 400 negative.

**(M2) HL-660 through HL-663 are DELETED on this branch.** The Heavy Ledger is APPEND-ONLY law
(never delete; backburner rule line 9). Deleting chain entries breaks the Merkle continuity. VERIFY: was
this intentional pruning or branch/working-tree drift? If unintentional → `git checkout master -- CANON/
HEAVY-LEDGER/HL-660.json HL-661 HL-662 HL-663` to restore. Do NOT commit the branch with them deleted.

## P10 DEFECT STATUS (the forward work — A–D)
| Defect | State | Fix + receipt |
|--------|-------|---------------|
| **A — DO /purge missing** | ✅ ADDED (`durable_objects.js:46` Ledger, `:68` Pet, `:136` Memory) | Needs PROOF: behavioral test (vitest-pool-workers) seeds DO state → erase → assert storage empty |
| **B — colon-key purge guard** | ⚠️ VERIFY | Confirm `lang:`/`goals:`/`subscription:`/`streak:`/`chat_memory:` actually delete. Receipt: seed those keys for sov100-test-magic → erase → KV list shows 0 |
| **C — audit_log migration** | ⚠️ VERIFY + HARDEN | schema.js/security.js renamed actor→performed_by; index.js query updated. Confirm a REAL migration (ALTER/versioned), not `CREATE TABLE IF NOT EXISTS`. Add `audit-integrity.test.mjs` locking the column set. Receipt: erase writes an audit row that `/api/admin/audit` returns |
| **D — duplicate crypto** | ❌ OPEN — 3 copies | `encryption.js` (hex key) + `deletion.js:6/26` (UTF-8 key) + NEW inline in `index.js` /api/encrypt. CONSOLIDATE to one (`encryption.js`). Delete the deletion.js copies; have /api/encrypt import it. Receipt: grep shows ONE definition; roundtrip test encrypt→decrypt matches |

## FORWARD SEQUENCE (Run 106, blueprint only — Kilo executes, pastes receipts)
1. **Restore HL-660–663** (M2) — ledger integrity first; never advance over a broken chain (Rome garrison).
2. **Close D** — consolidate crypto to encryption.js. The 3-copy split is a correctness landmine (keys
   derived differently won't roundtrip). One source of truth.
3. **Prove A** — behavioral test that the new /purge handlers actually empty DO storage.
4. **Verify B + C** — seed → erase → assert; add audit-integrity lock.
5. **Full erasure test against `sov100-test-magic` ONLY** (never a real student id): seed every key class
   (KV colon + underscore, D1 rows, all 3 DOs, STUDENT_MEMORY mem:) → `DELETE /api/student/sov100-test-magic/erase`
   → assert: D1 0 rows, KV 0 keys (all prefixes), 3 DOs purged, 1 audit row written. THIS is the receipt
   that closes P10. "Erase that doesn't erase" is the cardinal compliance failure — prove it erases.
6. **Commit the branch** (no-lost-work — it's currently uncommitted WIP) with the receipts in the message.
7. **Pipeline artifacts** — RRL → SOUL → DNA → SOULKEYS → LEDGER (new HL entry, do not delete old ones) →
   STARMAP → KEYWORD for Run 106. Seal per the Rome supply-line (phetrail + soulcount checkpoint).

## GATE BEFORE MERGE TO MASTER (rear guard — never skip)
- `npm run test:lock` 15/15 + `node --check` clean + the new behavioral/erasure tests GREEN.
- 6-AI TRUTH (`/code-review ultra`) — Michael-triggered — on the branch before merge.
- Verified rollback target (current master tag) before any prod promotion. 2 RED canary ticks → retreat.
- NOTHING merges/deploys the day of a class. Master/prod stays the clean v1.5.0 the class runs on.
