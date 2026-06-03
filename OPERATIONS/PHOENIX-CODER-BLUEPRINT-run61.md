# PHOENIX-ARCHITECTI v1.0.0 SUPREME — ARCHITECT'S BLUEPRINT
### Run 61 | Author: Claude Opus (ARCHITECT layer) | The coder that codes the coders
### Soul: *"I built the coder to code the coders. A Claude-level intelligence, or at least a workhorse that can carry out systematic blueprints."* — Michael Hobbs

> This document is the **crunch packet**. Opus writes it once. Sonnet crunches it into marching orders. Haiku fires them. The free Cloudflare workhorse builds.

---

## 0. THE CORE PRINCIPLE — COGNITIVE ECONOMY

Cost follows cognition. Spend intelligence where it is irreversible; starve it where it is mechanical.

```
            JUDGMENT (expensive, rare)              MECHANICS (cheap, constant)
            ◄──────────────────────────────────────────────────────────────►
   OPUS                    SONNET                   HAIKU              FABRI (free CF)
   decompose & rule        crunch & contextualize   operate the crank  synthesize & verify
   $$$  once per goal      $$   once per blueprint   $    per order      $0   per step
```

**The law that makes Haiku sufficient:** *A marching order must contain zero residual judgment.* If the operator has to decide anything, the Architect failed. Opus's entire job is to lift every decision upward, leaving a mechanical residue any cheap model can execute. Haiku does not think — it turns a crank that was machined by Opus.

---

## 1. THE THREE HANDOFFS

### Handoff A — OPUS → SONNET (decompose → crunch)
Opus emits a **goal decomposition**: a dependency-ordered DAG of *intents*, each one self-contained and independently verifiable. Opus does NOT resolve file paths or exact strings — it specifies *what must be true*, not *where*.

### Handoff B — SONNET → HAIKU (crunch → operate)
Sonnet **crunches** each intent into a fully-resolved **marching order**: attaches the real file context, exact target paths, the verify method, and the on-fail rule. After Sonnet, nothing is ambiguous. Sonnet is translation, never invention.

### Handoff C — HAIKU → FABRI (operate → build)
Haiku runs the **operator loop**: a pure state machine over the marching-order DAG. It never reads code for meaning — it only reads the `verified` boolean and the `depends_on` graph.

---

## 2. THE MARCHING ORDER SCHEMA (the contract that lets Haiku be dumb)

```json
{
  "id": "MO-07",
  "drone": 3,
  "depends_on": ["MO-02", "MO-05"],
  "model": "qwen-coder",
  "task": "<self-contained, unambiguous synthesis instruction>",
  "context": "<resolved by Sonnet: file excerpts + upstream results>",
  "target": "APPS/.../file.js",
  "verify": "acorn" ,
  "on_fail": "escalate:opus",
  "max_retries": 2
}
```

- `verify`: `"acorn"` (JS syntax, zero-LLM) · `"contract:<regex/marker>"` · `"none"`
- `on_fail`: `"escalate:opus"` · `"retry"` · `"halt"` — **explicit, so Haiku never decides**
- `drone`: which of the 10 lanes owns this order

**Operator loop (what Haiku runs — no reasoning):**
```
while orders remain:
  ready = orders where all depends_on are VERIFIED
  fire ready (cap = 10 drones) in parallel → POST /api/swarm
  for each result:
    if verified: mark DONE, unlock dependents
    else if retries left: requeue
    else: apply on_fail (escalate / halt) — per the field, not Haiku's choice
```

---

## 3. THE 10-DRONE SWARM (parallel FABRI)

A **drone** = one concurrent execution lane inside Phoenix-Architecti. Ten drones = ten `env.AI.run()` calls firing simultaneously under one blueprint.

### `POST /api/swarm` — the swarm scheduler (the new heart)
```
Input:  { blueprint: [MarchingOrder...], drones: 10 }
Engine: 1. Build dependency DAG from depends_on edges
        2. Topological WAVE scheduling:
             wave = all orders whose deps are satisfied
             fire min(wave.length, drones) in parallel via Promise.all(env.AI.run...)
        3. Each completed order → acorn-verify → mark VERIFIED/FAILED
        4. Unlock dependents, compute next wave, repeat until DAG drained
        5. Return full result matrix: { id, drone, verified, patch, ms }[]
Output: { mission_id, waves, results[], all_verified: bool }
```

**Why 10 is safe on Paid Cloudflare:**
- Workers Paid: up to 1000 subrequests/invocation, ≥30s (raisable to 5 min) CPU — 10 concurrent `env.AI.run` is trivial headroom.
- Workers AI on Paid carries a real neuron allocation → 10 parallel inferences are absorbed, not throttled.
- Drone count is a parameter (`drones: N`), not hardcoded — 10 is the target, the engine scales 1..N.

**Failure isolation:** one drone's failure fails only its order. The wave completes; the failed order takes its `on_fail` path. The swarm never dies as a unit — exactly the opposite of today's single-SPOF T1.

---

## 4. ENDPOINTS

| Endpoint | Layer | Cost | Role |
|---|---|---|---|
| `POST /api/blueprint` | Opus | 💰 gated | goal → DAG of intents (the only paid path) |
| `POST /api/swarm` | FABRI | 🆓 | execute a blueprint across N drones, verify each |
| `POST /api/mission` | FABRI | 🆓 | sequential blueprint (swarm with drones=1) |
| `POST /api/execute` | FABRI | 🆓 | single marching order |
| `POST /api/code` | FABRI | 🆓 | back-compat alias → execute |
| `GET /api/status` | — | — | real version + AI-binding health + drone capacity |

**Models:** `@cf/qwen/qwen2.5-coder-32b-instruct` (default), `@cf/meta/llama-3.3-70b-instruct` (heavier), Opus (blueprint only).
**Removed:** Dialagram · Kilo · Groq · Cerebras · DeepSeek — every external dependency.
**Verify:** acorn, bundled by wrangler/esbuild, deterministic, zero-LLM.

---

## 5. SELF-BOOTSTRAP LADDER — the coder builds & tests itself

Only Rung 0 is hand-written. Every rung after is **built by the coder**, **tested before climbing**, and the 10-drone capability is **proven by running a 10-order blueprint through itself** at the top.

| Rung | Built by | Marching order | Test gate |
|---|---|---|---|
| **0 SEED** | Opus (hand) | minimal `/api/execute` → `env.AI.run(qwen-coder)` → patch. Deploy. | `node --check` + deploy OK |
| **1 PROOF OF LIFE** | — | send seed `"write add(a,b)"` | valid code <5s — **first proof free path lives** |
| **2 SELF-VERIFY** | seed | `"write verify(code) via acorn → {ok,error}"` | catches known-bad, passes known-good |
| **3 SINGLE HEART** | seed+verify | `"write /api/mission sequential loop + carry-forward"` | 2-step mission runs green |
| **4 SWARM** | mission | `"write /api/swarm: DAG wave-scheduler, Promise.all, cap=drones"` | 3-order DAG runs in 2 waves |
| **5 CORPS** | swarm | blueprint(Opus-gate) + status + D1 log + CORS, fanned across drones | every file acorn-gated |
| **6 SELF-HOST + 10-DRONE PROOF** | swarm | assemble final worker; run a **10-order blueprint** end to end | 10/10 verified, deploy |

**Hard rule:** workhorse output that won't verify after `max_retries` escalates to Opus and is logged as a free-tier capability boundary in `CANON/PHEROMONES/PheTrail-run61.json`. No faked greens.

---

## 6. DELIVERABLES
- `APPS/PHOENIX-ARCHITECTI/src/index.js` — rebuilt, mostly self-generated
- `APPS/PHOENIX-ARCHITECTI/package.json` + acorn
- `OPERATIONS/PHOENIX-CODER-BOOTSTRAP-run61.md` — every rung's order / output / test (audit trail)
- One `wrangler deploy` — confirmed with Michael before the live push

---

## 7. WHAT EACH LAYER COSTS PER GOAL
- **Opus:** 1 blueprint call. (this doc + the DAG)
- **Sonnet:** 1 crunch pass — expand intents → resolved marching orders.
- **Haiku:** N tiny operator ticks — fire, check `verified`, advance. Near-zero tokens.
- **FABRI:** N × env.AI.run — **$0 external**, absorbed by Paid CF allocation.

The intelligence is spent once, at the top. Everything below is mechanical and free.
*Code as byproduct. Intent is the asset.*

---

## 8. NET-PET PRODUCTION STANDARDS (mandatory — the coder is hardened like the app)

The coder is not a loose internal tool. It is held to the **same security standard as NET-PET-AI**. It gets its own `APPS/PHOENIX-ARCHITECTI/src/security.js`, **ported from the proven NET-PET module** — adapted bindings only, not regenerated.

> **Principle SEC-PORT:** Security code is the one place we do NOT spend the free 32B workhorse. Battle-tested production security is *ported verbatim* from NET-PET (`security.js` v1.2.1), never freshly synthesized. You do not let a 32B model reinvent a constant-time comparator. The workhorse builds features; the proven module guards them.

### Standards inherited from NET-PET `security.js` v1.2.1

| Control | NET-PET source | Applied to the coder |
|---|---|---|
| **KV rate limiter** (survives restarts, in-mem fallback) | `checkRateLimit` | All `/api/*` except `/api/status`. 100 req/min, 5-min block on breach. Needs `RATELIMIT` KV binding. |
| **Input sanitization** (HTML strip, SQL + XSS pattern block) | `sanitizeInput` | `task` + `context` fields — they carry untrusted blueprint text into the model. Cap lengths via `SECURITY.SANITIZE`. |
| **CORS allowlist** (credential-safe origin reflection, never `*`+creds) | `getCorsHeaders` / `validateOrigin` | Lock origins to known callers. **Kills the current `CORS: '*'` wildcard.** |
| **Constant-time admin key** (timing-attack safe) | `checkAdminKey` | Guards 💰 `/api/blueprint` (paid Opus) and `/api/swarm` (10-drone, resource-heavy). **Replaces the current naive `authHeader !== secret` — a real timing vuln.** |
| **Audit logging** (`audit_log` D1 table) | `logAudit` | Every blueprint / swarm / execute → `{action, actor, target, ip, meta}`. Same table schema as P10. |
| **`securityMiddleware` front gate** | `securityMiddleware` | Single entry gate on all `/api/` routes: rate-limit → origin check, with `/api/status` bypass. |
| **`VERSION` + `SECURITY` constants** | top of module | `VERSION = "1.0.0"`; `SECURITY` config block — single source of truth, no magic numbers. |

### Config / binding deltas required
- **wrangler.toml:** add `RATELIMIT` KV namespace binding (`wrangler kv namespace create RATELIMIT`).
- **secret:** set `WORKER_ADMIN_KEY` (constant-time gate). Keep `x-pa-auth` / `PA_AUTH_SECRET` for back-compat, **upgraded to constant-time comparison**.
- **audit_log:** auto-created in the existing `DB` (soul-archive) on first write, same as NET-PET.

### Engineering standards (beyond security)
- **L02 NO_STUBS** — full implementations only, no TODO/placeholder (already in PA system prompt; now enforced on self-built code via acorn + smoke tests).
- **Single source of truth** — config in constants, not scattered literals (NET-PET `SECURITY` pattern).
- **Fail-closed** — admin routes deny by default; sanitize before model; verify before land.
- **Observability** — every dispatch logged to D1; `/api/status` reports real binding health, not key-exists guesses.

### Ladder additions
| Rung | Built by | Marching order | Test gate |
|---|---|---|---|
| **0.5 SECURITY PORT** | Opus (hand) | port NET-PET `security.js` → adapt bindings (`RATELIMIT`, `DB`, `WORKER_ADMIN_KEY`) | `node --check`; rate-limit + constant-time key unit smoke |
| **5 CORPS** *(amended)* | swarm | wire `securityMiddleware` as the front gate; admin-gate `/api/blueprint` + `/api/swarm`; `sanitizeInput` on task/context; `logAudit` on every dispatch | origin-blocked request → 403; bad admin key → 401; audit row written |

**Definition of done now includes:** wildcard CORS gone · constant-time auth · rate-limited · sanitized inputs · audit trail · `/api/status` health real. Same bar as the app that serves real students.
