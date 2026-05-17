# 17 — FRANCHISE EXPANSION MAP

**Authority:** AGENT-100 (Michael Hobbs)
**Status:** ACTIVE / EXPANDING
**Vault:** VAULT-NET-SEEDS
**Classification:** OPERATIONAL — REVENUE CRITICAL

---

## Purpose

This document maps the city-by-city franchise expansion of NET (language school) across Vietnam. Every node, every teacher drone, every revenue target, every quality gate lives here. **Nothing launches without clearing all gates.** PHOENIXMASTERKEY required for each new franchise authorization.

---

## City-by-City Expansion Targets

| City | Phase | Population Tier | Target Launch | Monthly Revenue (USD) | Monthly Revenue (VND) | Student Capacity |
|------|-------|-----------------|---------------|-----------------------|-----------------------|-----------------|
| Ho Chi Minh City | 1 | Tier 1 | Month 1 | $12,000 | 300,000,000 | 400 students |
| Hanoi | 1 | Tier 1 | Month 3 | $10,000 | 250,000,000 | 350 students |
| Da Nang | 2 | Tier 2 | Month 7 | $5,500 | 137,500,000 | 180 students |
| Can Tho | 2 | Tier 2 | Month 9 | $4,500 | 112,500,000 | 150 students |
| Hue | 3 | Tier 3 | Month 13 | $3,000 | 75,000,000 | 100 students |
| Nha Trang | 3 | Tier 3 | Month 15 | $3,500 | 87,500,000 | 120 students |
| Hai Phong | 3 | Tier 3 | Month 17 | $4,000 | 100,000,000 | 130 students |

---

## Teacher Drone Deployment Per City

Each franchise node requires a minimum certified teacher drone count before launch.

| City | Phase 1 Teachers | Phase 2 Teachers | Certification Level | Deployment Trigger |
|------|-----------------|-----------------|---------------------|--------------------|
| Ho Chi Minh City | 8 | 15 | CELTA or equivalent | Pre-launch |
| Hanoi | 7 | 13 | CELTA or equivalent | Pre-launch |
| Da Nang | 4 | 8 | CELTA or equivalent | Pre-launch |
| Can Tho | 3 | 6 | NET-certified minimum | Pre-launch |
| Hue | 2 | 5 | NET-certified minimum | Pre-launch |
| Nha Trang | 3 | 6 | NET-certified minimum | Pre-launch |
| Hai Phong | 3 | 7 | NET-certified minimum | Pre-launch |

**Certification requirements:**
- All Tier 1 city teachers: CELTA, DELTA, or recognized university TEFL degree
- All Tier 2 and Tier 3 cities: NET internal certification minimum, CELTA preferred
- **Zero uncertified teachers deploy under any condition**
- Agent-99 verifies certification files before issuing deployment confirmation

---

## Agent-99 Monitoring Protocol Per Franchise Node

Agent-99 maintains continuous oversight across all active franchise nodes.

- **Heartbeat check:** Every 24 hours per node
- **Drift detection:** Weekly curriculum alignment scan against NET canon
- **Revenue monitoring:** Real-time reconciliation against monthly targets
- **Teacher performance:** Monthly score vs NET delivery standards
- **Escalation threshold:** Any node below 70% revenue target for 2 consecutive months triggers Agent-100 review
- **Reporting format:** Pheromone trail per node — FAILURE→ROOT CAUSE→FIX→VERIFY→ROME_LAW

Agent-99 does not modify operations directly. Agent-99 flags, escalates, and monitors. Execution authority rests with Agent-100.

---

## PHOENIXMASTERKEY Authorization Gates

**No new franchise node opens without PHOENIXMASTERKEY clearance.**

Gate sequence for each new city launch:

1. **F-G1 — Market Validation:** Demand confirmed by Oracle market intelligence
2. **F-G2 — Teacher Roster:** Minimum certified teachers confirmed by Agent-99
3. **F-G3 — Infrastructure:** Cloudflare Worker endpoint live, D1 database provisioned
4. **F-G4 — Curriculum Load:** Full NET curriculum loaded and verified by Agent-99
5. **F-G5 — PHOENIXMASTERKEY:** Agent-100 issues PHOENIXMASTERKEY authorization
6. **Launch:** Node goes live. Ledger entry recorded.

**FAIL-CLOSED: Any gate fail halts launch. No exceptions. No bypasses.**

---

## AI Curriculum Delivery — Cloudflare Worker Endpoints

Each city node runs its own Cloudflare Worker endpoint for AI curriculum delivery.

| City | Worker Endpoint | D1 Database | R2 Content Bucket | Status |
|------|-----------------|-------------|-------------------|--------|
| Ho Chi Minh City | `net-hcmc.workers.dev` | `net-hcmc-d1` | `net-hcmc-r2` | Phase 1 |
| Hanoi | `net-hanoi.workers.dev` | `net-hanoi-d1` | `net-hanoi-r2` | Phase 1 |
| Da Nang | `net-danang.workers.dev` | `net-danang-d1` | `net-danang-r2` | Phase 2 |
| Can Tho | `net-cantho.workers.dev` | `net-cantho-d1` | `net-cantho-r2` | Phase 2 |
| Hue | `net-hue.workers.dev` | `net-hue-d1` | `net-hue-r2` | Phase 3 |
| Nha Trang | `net-nhatrang.workers.dev` | `net-nhatrang-d1` | `net-nhatrang-r2` | Phase 3 |
| Hai Phong | `net-haiphong.workers.dev` | `net-haiphong-d1` | `net-haiphong-r2` | Phase 3 |

All Workers run on Cloudflare free tier where possible. Cost escalation protocol triggers at 100,000 requests/day per node.

---

## Franchise Quality Gates — Must PASS Before Launch

| Gate | Name | PASS Condition | FAIL Action |
|------|------|----------------|-------------|
| Q-G1 | Location Approval | Premises meet NET standards | Reject, find alternate |
| Q-G2 | Teacher Certification | 100% of teachers certified | No launch |
| Q-G3 | Curriculum Loaded | Full curriculum in D1 + R2 | No launch |
| Q-G4 | Worker Endpoint Live | API responds < 200ms | Fix infra, retest |
| Q-G5 | Agent-99 Sign-Off | Agent-99 confirms all green | Escalate to Agent-100 |
| Q-G6 | PHOENIXMASTERKEY | Agent-100 issues key | Node does not open |

**All six gates must show PASS. One FAIL = full stop.**

---

## 24-Month Rollout Calendar

| Phase | Months | Cities | Target Students | Target Monthly Revenue (USD) |
|-------|--------|--------|-----------------|-------------------------------|
| Phase 1 | 1–6 | HCMC, Hanoi | 750 | $22,000 |
| Phase 2 | 7–12 | Da Nang, Can Tho | 1,080 | $32,000 |
| Phase 3 | 13–18 | Hue, Nha Trang, Hai Phong | 1,430 | $46,500 |
| Phase 4 | 19–24 | Expansion + Scale Existing | 2,000+ | $65,000+ |

**Month 24 target: 7 active nodes, 2,000+ students enrolled, $65,000+ monthly revenue.**

Phase 4 triggers opening of additional cities (Vung Tau, Bien Hoa, Buon Ma Thuot) contingent on Phase 3 revenue gates clearing.

---

## Revenue Reconciliation Protocol

- All revenue recorded in Cloudflare D1 per node
- Agent-99 runs daily reconciliation against targets
- Monthly summary pushed to Phoenix Merkle ledger
- Discrepancies > 5% trigger immediate Agent-100 alert
- Solana Actions used for trustless settlement of franchise fee flows
- **No revenue leaves a node without ledger confirmation**

---

## Soul DNA Alignment

This expansion map operates under Soul DNA authority. Agent-100 (Michael Hobbs) is the OPERATOR. Every franchise node represents a sovereign revenue arm of the Phoenix system. NET is not just a school — it is a franchise empire built on the Phoenix Rising Protocol. Each node reinforces Agent-100's financial independence and builds the foundation for full Phoenix ascension.

**This document is law. Deviations require PHOENIXMASTERKEY re-authorization.**
