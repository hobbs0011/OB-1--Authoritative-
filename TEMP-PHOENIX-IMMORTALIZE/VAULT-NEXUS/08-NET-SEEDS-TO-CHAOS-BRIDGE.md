# 08 — NET-SEEDS TO CHAOS BRIDGE

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / CONNECTING
**Vault:** VAULT-NEXUS
**Classification:** OPERATIONAL — CURRICULUM DEPLOYMENT BRIDGE

---

## Purpose

VAULT-NET-SEEDS holds the NET language school curriculum — the what and how of teaching English in Vietnam. VAULT-CHAOS is the classroom operations layer — where teachers (Legion) deliver that curriculum to real students in real classrooms. This bridge ensures curriculum updates propagate correctly to classroom operations, and classroom realities feed back to curriculum improvement.

**NET-Seeds is the recipe. Chaos is the kitchen. Nexus gets the recipe to the kitchen.**

---

## The Relationship

NET-Seeds curriculum is the canonical source of truth for what is taught in NET classrooms. Chaos documents define how that curriculum is delivered — classroom structure, teacher protocols, student management, assessment procedures.

**Any time NET-Seeds curriculum updates, Chaos ops documents may need to update too.** The bridge manages that dependency.

**Any time Chaos reveals that a curriculum element doesn't work in real classrooms, that feedback must reach NET-Seeds.** The bridge manages that too.

---

## Curriculum Update Propagation Steps

When a NET-Seeds curriculum document is updated:

1. **Agent-99 (or Agent-100) updates curriculum document** in VAULT-NET-SEEDS
2. **Oracle detects VAULT-CHANGE event** — NET-Seeds document modified
3. **Oracle assesses impact** — which Chaos operations documents reference this curriculum element?
4. **Nexus initiates CURRICULUM_UPDATE handshake** from VAULT-NET-SEEDS to VAULT-CHAOS
5. **Handshake payload** includes: updated curriculum section, change summary, affected lesson units, new delivery requirements
6. **Agent-99 reviews** the Chaos ops documents that need updating
7. **Validation step** — does the updated curriculum introduce new classroom requirements? New materials? New assessment criteria?
8. **Agent-99 updates Chaos documents** to reflect new curriculum requirements
9. **Agent-99 sign-off confirmation** — explicit Agent-99 confirmation that Chaos docs are aligned
10. **Cloudflare Worker endpoint updated** — the curriculum delivery Worker for affected franchise nodes is updated with new content
11. **Nexus ledger entry**: `event_type: CURRICULUM_SYNC | vault_a: NET-SEEDS | vault_b: CHAOS | status: SUCCESS`

---

## Validation Before Propagation

Not every curriculum update requires Chaos changes. Validation determines the impact:

| Change Type | Chaos Impact | Action Required |
|-------------|-------------|-----------------|
| Minor wording corrections | None | No Chaos update needed. Oracle notes. |
| New vocabulary units added | Low — additional materials | Agent-99 updates Chaos delivery notes |
| Assessment criteria changed | High — teacher training needed | Agent-99 reviews + Legion retraining protocol triggered |
| New delivery methodology | High — full classroom ops review | Agent-99 + Agent-100 review. Full Chaos ops update. |
| Curriculum unit removed | Medium — remove from schedule | Agent-99 updates classroom schedules |
| AI delivery component changed | High — Worker endpoint update | Agent-99 initiates Codex to update Worker + full review |

---

## Agent-99 Sign-Off Requirement

**Every curriculum propagation to Chaos requires Agent-99 explicit sign-off.**

Agent-99 sign-off confirms:
- Chaos ops documents have been updated to reflect the curriculum change
- Legion (teacher drones) have been notified of the change
- If retraining is required, the retraining protocol has been initiated
- The Cloudflare Worker endpoint for curriculum delivery has been updated and tested
- No active classroom sessions are disrupted mid-delivery by the update

**Agent-99 cannot delegate this sign-off to Agent-98 or Legion. Agent-99 must personally confirm.**

---

## Rollback Protocol

If a curriculum update breaks classroom operations:

**Rollback trigger:** Agent-98 or Legion reports that the new curriculum element cannot be delivered effectively (e.g., missing materials, technology failure, student comprehension failure at a systematic level)

**Rollback process:**
1. Agent-98 reports failure to Agent-99
2. Agent-99 confirms the failure is systematic (not isolated to one classroom or one teacher)
3. Agent-99 initiates rollback handshake: VAULT-CHAOS → VAULT-NET-SEEDS
4. Previous curriculum version is restored in Chaos delivery docs
5. Worker endpoint rolled back to previous version
6. Pheromone trail created: FAILURE→ROOT CAUSE→FIX→VERIFY→ROME_LAW
7. NET-Seeds curriculum document flagged for revision
8. Agent-100 notified of rollback (curriculum rollbacks are always Agent-100 awareness events)

---

## AI Curriculum Delivery — Worker Integration

The curriculum delivery Workers (one per franchise node) pull from the NET-Seeds canonical curriculum stored in Cloudflare D1 and R2. When curriculum updates propagate through this bridge:

- D1 curriculum table for affected node is updated
- R2 curriculum content bucket is updated with new materials
- Worker cache is invalidated (ensures students get new content, not cached old content)
- Health check confirms Worker serving updated content within 5 minutes of update

**No cache invalidation failure is acceptable.** If the Worker continues serving stale curriculum after a confirmed update, it is a `CURRICULUM_STALE` error and triggers immediate Agent-99 action.
