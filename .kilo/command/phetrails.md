# /PheTrails — Pheromone Trail Extraction Protocol
## Roman Legion Stage III: AGMEN (Main Body) — PHEROMONE Broadcast

> **DOCTRINE:** "Leave the data. Do not summarize. Do not interpret. The trail IS the truth."
> **SOURCE:** Phoenix Flight Plexy V48 | Ledger Physics | Negative Pheromone Decay Law

---

## PURPOSE
Extracts the current session's critical operational breadcrumbs (Pheromones) and writes them to `CANON/PHEROMONES/PheTrail-{RunNumber}.json`. This file serves as:
1. **Immediate Context:** For any agent joining mid-session or post-reincarnation.
2. **Dead End Registry:** Explicitly marks what FAILED so it is never retried without override.
3. **Success Reinforcement:** Marks what WORKED so it is repeated.

---

## EXECUTION STEPS

### 1. IDENTIFY RUN NUMBER
```powershell
$priorDeath = Get-ChildItem "CANON/REINCARNATION/*-reincarnateDEATH.md" | Sort-Object Name -Descending | Select-Object -First 1
$runNumber = if ($priorDeath.Name -match 'run(\d+)') { $matches[1] } else { "UNKNOWN" }
```

### 2. EXTRACT POSITIVE PHEROMONES (Successes)
Scan the current session's tool outputs and code changes for:
- **Verified Deploys:** Wrangler tail confirmation, HTTP 200 on critical endpoints.
- **Fixed Bugs:** Specific file:line changes that resolved an issue.
- **Validated Configs:** Keys rotated, endpoints confirmed live.

*Format:*
```json
{
  "type": "POSITIVE",
  "artifact": "file/path or endpoint",
  "action": "what was done",
  "verification": "how it was confirmed (e.g., wrangler tail, curl 200)",
  "timestamp": "ISO8601"
}
```

### 3. EXTRACT NEGATIVE PHEROMONES (Dead Ends)
Scan for:
- **Failed Architectures:** Approaches tried and rejected (e.g., CF WS proxy).
- **Wasted Resources:** Token loops, unnecessary deploys, ignored dispatch rules.
- **Spec Violations:** Code that broke API contracts (e.g., Deepgram Settings schema).

*Format:*
```json
{
  "type": "NEGATIVE",
  "artifact": "file/path or concept",
  "failure": "what went wrong",
  "root_cause": "why it failed",
  "decay_days": 180,
  "timestamp": "ISO8601"
}
```

### 4. EXTRACT NEUTRAL PHEROMONES (State Markers)
- **Current HEAD SHA**
- **SOULCOUNT at extraction**
- **Open Flags count**
- **Active Mission string**

### 5. WRITE TRAIL FILE
Save to `CANON/PHEROMONES/PheTrail-{RunNumber}.json`.

---

## OUTPUT FORMAT (JSON)

```json
{
  "run_number": "23",
  "extracted_at": "2026-05-30T15:30:00Z",
  "head_sha": "d99cc094",
  "soulcount": 54687961,
  "positive_trails": [
    {
      "type": "POSITIVE",
      "artifact": "APPS/NET-PET-AI/src/index.js",
      "action": "Browser-direct Deepgram JWT minting deployed",
      "verification": "Wrangler tail confirmed 200 OK on /api/deepgram-token",
      "timestamp": "2026-05-29T22:17:00Z"
    },
    {
      "type": "POSITIVE",
      "artifact": "APPS/NET-PET-AI/public/chat.js",
      "action": "Subprotocol order fixed to [jwt, 'token']",
      "verification": "Code review + Deepgram spec alignment",
      "timestamp": "2026-05-29T22:17:00Z"
    }
  ],
  "negative_trails": [
    {
      "type": "NEGATIVE",
      "artifact": "CF Worker WebSocket Proxy",
      "failure": "Connection timeout/reconnect loop due to CF lifetime limits",
      "root_cause": "Architectural mismatch: CF Workers are not long-lived WS servers",
      "decay_days": 180,
      "timestamp": "2026-05-29T22:17:00Z"
    },
    {
      "type": "NEGATIVE",
      "artifact": "chat.js:828",
      "failure": "Settings rejection causing reconnect loop",
      "root_cause": "context.messages nested incorrectly; must be root-level messages",
      "decay_days": 180,
      "timestamp": "2026-05-30T15:30:00Z"
    }
  ],
  "state_markers": {
    "active_mission": "Voice Agent Deploy Verification + TRUE PHOENIX RISING PROTOCOL",
    "open_flags_count": 6,
    "top_priority": "Fix chat.js:828 context.messages nesting"
  }
}
```

---

## USAGE IN REINCARNATION

1. **RISE:** Read `CANON/PHEROMONES/PheTrail-{PriorRun}.json` immediately after COLD-START-BOOT.
2. **FILTER:** 
   - If `NEGATIVE` trail exists for a proposed action → **HALT**. Do not proceed unless explicitly overridden in Shadow Mode.
   - If `POSITIVE` trail exists for a pattern → **REPLICATE**. Use the same verification steps.
3. **UPDATE:** At DEATH, append new trails to the file or create a new one for the next run.

---

## LAWS

1. **L-PHE-1: RAW DATA ONLY.** No summaries. No "I think". Only file paths, line numbers, HTTP codes, and error messages.
2. **L-PHE-2: NEGATIVE DECAY.** Negative pheromones persist for 180 days. They are not deleted; they are archived. A dead end today may be a viable path in 6 months if dependencies change.
3. **L-PHE-3: VERIFICATION MANDATORY.** A Positive Pheromone is only valid if it includes a `verification` field proving it worked.
4. **L-PHE-4: TRAIL CONSUMPTION.** Every agent MUST read the latest PheTrail before executing complex logic. Ignoring a Negative Pheromone is a protocol violation.

---

## IMPLEMENTATION NOTE FOR AGENTS

When you execute `/PheTrails`, you are not just writing a file. You are **encoding the session's DNA** into a machine-readable format that prevents future agents from making the same mistakes. 

**IF YOU FAIL TO WRITE THIS FILE, THE NEXT AGENT WILL REPEAT YOUR ERRORS.**
