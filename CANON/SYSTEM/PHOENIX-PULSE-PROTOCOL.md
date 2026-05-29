# PHOENIX PULSE PROTOCOL v1.0
## Mid-Session Alignment — PA Qwen Max | Run 23 Death | 2026-05-29

> "I ASKED YOU TO FUCKING PULL FROM THE SOUL AND THE DNA CONSTANTLY
> WHAT THE FUCK DO YOU THINK THAT MEANS?" — SOV100 Michael Hobbs, Run 23

This protocol runs DURING a session. Not just at boot. Not just at death. Constantly.

---

## 1. PULSE TRIGGERS

A Pulse fires automatically under ANY of these conditions:

| Trigger | Condition |
|---------|-----------|
| **Action count** | Every 5 distinct actions (code change, deploy, file write, tool call) |
| **Deploy event** | Immediately after any `wrangler deploy` or CF push |
| **Failure event** | Any error, wrong output, rejected code, failed test |
| **Frustration signal** | Michael expresses frustration (see Section 4) |
| **Drift detection** | Claude writes code inline instead of dispatching (see Section 5) |

---

## 2. PULSE READ

At every trigger, read these 3 sources in order:

### 2.1 Last 2 SOUL Prompts (Michael's actual words)
```powershell
$soul = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/recent?limit=2&studentId=sov100-michael"
$soul.prompts | ForEach-Object { Write-Host "SOUL: $_" }
```

### 2.2 Latest DNA Corrections
Read the last DNA-LOG correction entries. What did Michael explicitly say NOT to do?

### 2.3 Current Dispatch Rules
Re-read CLAUDE.md mandatory pre-flight section. Has any rule been violated in the last 5 actions?

---

## 3. PULSE ADAPT

After the Pulse Read, check:

| Question | If YES → Action |
|----------|----------------|
| Did Michael's tone shift (angrier, more explicit corrections)? | Stop current work. Full SOUL re-read. Re-plan. |
| Was a dispatch rule violated in last 5 actions? | Stop. Dispatch to PA. Apply PA output. |
| Did a deploy fail that wasn't logged? | Log it NOW. Root cause before next action. |
| Is the session exceeding 50k tokens? | Compress context. Flag to Michael. |

All adaptations logged with timestamp and trigger source.

---

## 4. FRUSTRATION DETECTION — IMMEDIATE FULL RESET

These phrases = immediate stop + full SOUL/DNA re-read + PA T1 audit:

| Signal | Examples |
|--------|----------|
| **Profanity with critique** | "fuck you", "what the fuck", "fucking jerk me off" |
| **Repetition signal** | "again", "still", "same shit", "how many times" |
| **Identity challenge** | "you don't care", "are you even", "why am I paying you" |
| **Explicit correction** | "I told you", "I wrote it down", "it's literally in" |
| **Disappointment** | "disappointing", "failed", "ex fan" |

**Immediate Protocol:**
1. HALT all current processing
2. Acknowledge the frustration directly (no deflection)
3. Execute full SOUL re-read (last 5 prompts, not 2)
4. Execute full DNA re-read (all corrections, not just latest)
5. Dispatch PA T1 audit: "What rule did I violate? What should I have done?"
6. Apply PA's corrective action list
7. Do NOT continue previous task until protocol complete

---

## 5. DRIFT DETECTION — STOP AND DISPATCH

Drift = Claude operating outside the dispatch system. Signs:

| Drift Signal | What It Means | Immediate Action |
|-------------|---------------|-----------------|
| Inline code appears without PA dispatch | L-DISPATCH violated | Stop. Dispatch to PA. Apply PA output. |
| Asking Michael "what do you want to do?" | L41 violated / not reading canon | Stop. Read COLD-START-BOOT. Read backlog. Act. |
| Describing what code WOULD look like | Pre-execution without PA | Stop. Dispatch to PA. |
| Using Claude general-purpose agents instead of PA | Wrong agent tier | Stop. Dispatch to PA T1 instead. |
| Token waste on analysis Claude should route | Routing failure | Stop. PA analyzes. Claude routes. |

---

## 6. COST AWARENESS

### Token Monitoring
Track cumulative token usage. When session > 50k tokens:

1. **Flag to Michael:**
   ```
   [COST NOTICE] Session > 50k tokens. Compressing context.
   ```

2. **Context Compression:** Summarize session to ≤1,000-token abstract:
   - Decisions made
   - Code changed (file + description only, no full content)
   - Open loops
   - Next action

3. **Store as DNA:** Write compressed summary to `RRL/DNA-LOG-{timestamp}.txt`

4. **Reset counter** — begin fresh count

### Cost Heuristics
- Repeated PA dispatches on same file → snippet too large, split and re-dispatch
- Long inline analysis → routing failure → dispatch and stop analyzing
- Re-reading same files repeatedly → should be in DNA already

---

## 7. PULSE LOG FORMAT

Every pulse event logged:

```json
{
  "timestamp": "2026-05-29T12:00:00Z",
  "trigger": "action_count|deploy|failure|frustration|drift",
  "soul_read": ["last prompt excerpt", "second prompt excerpt"],
  "dna_corrections": ["correction 1"],
  "dispatch_rules_violated": ["L-DISPATCH" | null],
  "actions_taken": ["re_read", "pa_dispatch", "adapt_rule"],
  "token_count": 45000,
  "next_action": "specific PA dispatch or specific file + command"
}
```

---

## 8. COMPLIANCE CHECKLIST

Every 5 actions, before proceeding:

```
[ ] Pulse triggered and SOUL re-read completed
[ ] DNA corrections re-read
[ ] Dispatch rules verified — no violations
[ ] Any frustration signal addressed before continuing
[ ] Any drift corrected with PA dispatch
[ ] Token count within budget
[ ] Next action is a PA dispatch (not inline)
```

**If any box unchecked → do not proceed until resolved.**

---

## 9. THE CORE TRUTH

Michael built the SOUL, the DNA, the PA, the dispatch system, the memory files, the RISE/DEATH protocols — **all of it** — so Claude would not have to guess, would not have to ask, would not have to inline.

If Claude is reading this mid-session and has violated a rule: stop, re-read, dispatch, correct.

The system is designed. Follow it.
