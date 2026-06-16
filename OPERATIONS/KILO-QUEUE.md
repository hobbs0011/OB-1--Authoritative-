# KILO BRIEFING + TASK QUEUE
**Pipeline role:** Kilo = inline Sonnet/Opus + PCC dispatcher. OB-1 delegates here. Read this at every `/reincarnateRise`.

---

## KILO BOOT SEQUENCE (runs after RISE)
1. Read this file
2. Check TASK status table — pick first OPEN task
3. Execute task: heavy code gen goes inline, simple/boilerplate goes to PCC via PA dispatch
4. Write outputs to `OPERATIONS/kilo-output/`
5. Lay pheromones: write 1-paragraph phetrail to `OPERATIONS/phetrail-kilo-{date}.md` for anything significant
6. Mark task PENDING_CLOSE (operator grants DONE)

---

## PA DISPATCH PATTERN (Kilo → PCC)

Use this for simple code gen, boilerplate, patches < 50 lines:

```javascript
// From Kilo terminal (PowerShell):
$body = @{
  task       = "<task description — be specific>"
  context    = "<relevant context — file contents, function signatures, etc.>"
  targetfile = "<APPS/phoenix-pcc-1/src/index.js or other target>"
  tier       = 1
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri "https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST -ContentType "application/json" `
  -Headers @{"x-pa-auth"="ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8="} `
  -Body $body
```

**PA returns:** `$result.patch` — apply to the target file.
**PA T10 fallback:** change `tier = 1` to `tier = 10` if T1 returns empty.

---

## ACTIVE TASKS

### TASK-001 — Phoenix Actualizers: 4-Pass Inference Logic
**Status:** OPEN
**Tier:** Kilo T2 (Sonnet inline)
**Priority:** P0
**Assigned:** 2026-06-16

#### Context
Phoenix Actualizers = per-student background AI DOs. `StudentActualizerDO` is LIVE in `phoenix-pcc-1` (deployed Run 130). The `runActualizerPasses(userId)` method is a STUB — your job is to fill it.

**Worker:** `phoenix-pcc-1` (`APPS/phoenix-pcc-1/src/index.js`)
**AI binding:** `env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens })`
**KV binding:** `env.PHETRAIL.put(key, value, { expirationTtl })`
**Soul context:** `await fetchSoulContext(env, userId)` → `{ sessions: [{last_prompts:[{text}], ingested_at}], top_keywords:[{keyword,weight}], last_active }`
**Students:** `['mai-tram-bluetech', 'huong-bluetech', 'sov100-test-magic']`

#### The 4 passes (implement as `async runActualizerPasses(userId)` method on StudentActualizerDO)

**Pass 1 — Session Digest**
- System: `You are a language learning analyst. Given raw session prompts from a Vietnamese student learning English, write a 3-sentence digest: what they practiced, what they struggled with, one moment of progress.`
- Input: last 3 sessions concatenated
- Max tokens: 200 | TTL: 86400 (24h)
- Output key: `` `student:${userId}:actualizer:digest` ``

**Pass 2 — Goal Model**
- System: `You are tracking a Vietnamese English learner's goals over time. From recent sessions + keywords, identify: (1) their current learning goal in one sentence, (2) their biggest recurring gap, (3) their confidence pattern (rising/falling/stable).`
- Input: top_keywords + last 5 sessions
- Max tokens: 150 | TTL: 172800 (48h)
- Output key: `` `student:${userId}:actualizer:goals` ``

**Pass 3 — Vocabulary Patterns**
- System: `Analyze these English learning session prompts. List: (1) 3 vocabulary items this student keeps struggling with, (2) 2 items they've mastered recently, (3) 1 grammar pattern that keeps appearing.`
- Input: all sessions (up to 10) + keywords
- Max tokens: 200 | TTL: 172800 (48h)
- Output key: `` `student:${userId}:actualizer:patterns` ``

**Pass 4 — Next-Session Prep (the Obi brief)**
- System: `You are Obi, an AI English tutor. Based on this student's recent analysis, write a 5-bullet prep brief for the NEXT session: what to review, what to push, what topic to explore, what to celebrate, one specific sentence for them to practice.`
- Input: Pass 1 digest + Pass 2 goals + Pass 3 patterns (chain the results)
- Max tokens: 300 | TTL: 86400 (24h)
- Output key: `` `student:${userId}:actualizer:brief` ``

#### Rules
- Each pass: try/catch wrapped individually — a failed pass doesn't kill the others
- If `fetchSoulContext` returns null/no sessions: return `{ ok: false, reason: 'no soul data' }` early
- `this.env` is the env binding (DOs use `this.env` not a parameter)
- After all 4 passes: write `student:${userId}:actualizer:last_run` = ISO timestamp, 24h TTL

#### Output format
Write the complete `async runActualizerPasses(userId)` method body only (no class wrapper). OB-1 will splice it in.
Write to: `OPERATIONS/kilo-output/actualizer-passes.js`

---

### TASK-002 — [QUEUED — after TASK-001 deployed]
Student longitudinal memory: session_history → soul extraction → student DNA → richer Obi context. Architecture TBD after TASK-001 is live and producing data.

---

## QUEUE LOG
| Task | Assigned | Status | Completed |
|------|----------|--------|-----------|
| TASK-001 | 2026-06-16 | OPEN | — |
| TASK-002 | — | QUEUED | — |

---

## OUTPUT CONVENTIONS
- All Kilo outputs → `OPERATIONS/kilo-output/{filename}`
- Phetrails → `OPERATIONS/phetrail-kilo-{YYYYMMDD}.md`
- PA dispatch log → append to `OPERATIONS/kilo-output/pa-dispatch-log.md`
- OB-1 picks up outputs and applies/deploys — Kilo does not deploy directly
