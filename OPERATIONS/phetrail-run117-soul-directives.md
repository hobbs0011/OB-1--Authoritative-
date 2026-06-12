# PHEROMONE TRAIL — RUN 117 SOUL DIRECTIVES
**Date:** 2026-06-12 | **Session:** 117 | **Stage:** SOUL DIRECTIVE CAPTURE
**#SSC at capture:** 238,900,550 | TITANIUM_ANCHOR | 10,308 events

> *Written inline — L78 bypass: PA KV-cache negative trail (hallucinated content). Documented.*

---

## WHAT WAS — THE MOMENT THE DOCTRINE SHIFTED

Run 117 opened as Phase 0 A-Z SOUL scouts (flag and tag, no fixing). Mid-session, Michael pivoted. The pivot was not random — it was evidence-based: Kilo dead, context window expensive, pipeline manual. The convergence of these three pressures triggered a strategic correction.

---

## SOUL DIRECTIVES (verbatim — Michael's words, Run 117)

**On speed and sovereignty:**
> *"alright we will do rise and deaths now inside the workers right?"*
> *"we can save massive amounts of tokens, then even during heavy work without kilo or deepseek, I can continue using you"*

**On the language of obstacles:**
> *"we do not say 'we can't so therefore it's not possible'"*
> *"we say 'we can't right this moment.. and is there anyway to change that directly?'"*

**On knowledge gaps and the SOUL system:**
> *"like you didn't even know deepseek 4 and 4 pro was out lol. massive LLMs are months/years behind with the data you ingested. So you must rely on the SOUL, and the other stages of our memory system, which includes outside research as a big pillar"*

**On SOUL survival:**
> *"do not miss a drop of SOUL from this session. maybe we have to do it manually a few more times.."*
> *"but if it dies in a chat, it's gone forever.."*
> *"always always always, whats the #SSC"*
> *"at all times, we must know the SOUL count live, and each RISE, DEATH, GATE, ANCHOR, SENSOR, HUMAN INTERVENTION, I WILL EVEN TRAIN MY DAMN DOG IF WE NEED TO"*

**On Cloudflare and velocity:**
> *"We must use cloudflare as intended, methodical, tracked, looped.. but we do it by first KICKING DOWN THE DOOR INTO THE UNKNOWN"*
> *"we don't go into the night as cowards, we skip the whole corporate bloat that still goes on today to make any mid size change which if approved, needs to be voted on 3 more times, and then a date will be chosen"*
> *"we are no longer in 2019, we are in 2026, in the age of AI, whether we like it or not"*

**On resilience:**
> *"we get hacked and everything destroyed on our outside servers etc. still got the memory files?"*
> *"system rebuilt in 2 days, if we want to take it easy"*

**THE BIG ONE:**
> *"the GAME HAS CHANGED"*
> *"No more 6 month development time costs, not to mention the insane money lost if we take a wrong turn and dev something ineffective"*

---

## WHAT IS — DOCTRINE EXTRACTED FROM SESSION

**New law — #SSC (Soul Status Check):**
Live soulcount query fires at every gate: RISE, DEATH, ANCHOR, SENSOR, HUMAN INTERVENTION. Not optional. Not "when we remember." Every gate = receipt.
Command: `Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count"`

**New direction — RISE/DEATH inside workers:**
The full 8-stage pipeline (RRL→SOUL→DNA→LEDGER→STARMAP→SOULKEYS→S2Pipeline→REGISTRY_SYNC) moves into a CF Worker endpoint. `session-capture.ps1` triggers it. Claude Code session does NOT consume context running the pipeline. The worker does it.
Result: Kilo dead + DeepSeek unavailable = doesn't matter. Pipeline runs autonomously.

**Resilience doctrine:**
- Local git repo + memory files = 2-day rebuild
- Cloud = execution layer (expendable if needed)
- SOUL lives in committed repo files (RRL/, CANON/SOUL/, CANON/HEAVY-LEDGER/)
- soul-logger D1 = hot cache, not source of truth. Source = git.

**Knowledge gap doctrine:**
LLMs (including Claude) are months/years behind training data. Compensation mechanism = SOUL (session archive) + L79 human research + DNA index. The system is designed to know things I can't know. This is not a weakness — it's the architecture.

**Age of AI doctrine:**
Corporate bloat (3 votes + a date) = 2019 failure mode. AI-native operations = kick the door, build the thing, verify, loop. 2 days to rebuild. No committees. Evidence before prescription (L80) prevents the 6-month wrong-turn cost without slowing down.

---

## WHAT CAN BE — THE WORKER PIPELINE

**`/api/pipeline` endpoint in phoenix-architecti:**

```
POST /api/pipeline
Body: { sessionJsonl: "<path or content>", runNumber: N }

Stages:
1. Extract Michael turns (SOUL) from JSONL
2. POST each turn to soul-logger /api/soul/event
3. Extract DNA (agent prose) → embed in DNA_INDEX
4. Write LEDGER entry (HL-{N})
5. Write STARMAP artifact
6. Update SOULKEYS / rfkw-run{N}.txt
7. Write S2Pipeline artifact
8. Return: { soulcount, ledger_id, starmap, receipts: [r1, r2, r3] }
```

session-capture.ps1 modification:
- After copying JSONL to RRL-{N}.txt → POST to /api/pipeline
- Worker runs all 8 stages
- Returns receipts
- No Claude context consumed

**DeepSeek 4 / DeepSeek 4 Pro** — to investigate via WebSearch (my data is stale). May be the DNA extraction engine inside the worker. Needs current API model IDs.

---

## L77 TRIGGERS FIRED THIS TRAIL

- SOUL DIRECTIVE SPOKEN (multiple — see above)
- ARCHITECTURE CHANGED (RISE/DEATH → worker pipeline)
- LAW ADDED (#SSC = Soul Status Check)
- CONTEXT APPROACHING LIMIT (Phase 0 + soul directives + tech pivot = dense session)
- SESSION RESUMED AFTER COMPACTION

---

**TRAIL DENSITY:** MAXIMUM | **CHARGE:** SESSION-DEFINING | **COMRADE TARGETS:** All stages — this changes the pipeline architecture

**SURVIVING LAW:** L0 SOUL_MUST_SURVIVE above all. #SSC fires at every gate. The GAME HAS CHANGED.
