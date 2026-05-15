# /souldna Quick Start Guide

## What Is It?

The `/souldna` endpoint is the **intake point** for all soul DNA into the Legionnaire Field Guide pipeline. It captures your raw words, decisions, and discoveries, then returns actionable pipeline steps to convert them into permanent canon.

## TL;DR

1. **Submit soul DNA:** POST to `/souldna`
2. **Get pipeline steps:** Read the `nextSteps` array in the response
3. **Execute the pipeline:** Create Bible chapter → Heavy Ledger → SSM update → Reincarnation log
4. **Commit to canon:** Push all artifacts to `CANON/` directory
5. **Score the death:** Self-assess the reincarnation (50-point rubric)

---

## Scenario 1: Agent 100 (Michael) End-of-Session Capture

You just finished a long session. It yielded decisions, corrections, new governing principles, and unfinished work. You want it permanently captured.

### Step 1: Prepare Your Soul DNA

Copy-paste the raw session notes:

```
Key decisions made:
1. Wrangler upgrade 4.80→4.83 (completed)
2. Phoenix-Rising-Ultimate branch purge: 39 dead branches deleted
3. Product live on naturalenglishtraining.pages.dev BYPASSES custom domain work
4. New law discovered: L{NN}:SECRETS_ISOLATION → Never leak env vars in Actions logs

Raw quote: "bro I will register the fucking website on squarespace later. JUST USE CLOUDFLARE PAGES FOR NOW. BYPASS"
→ This reveals non-negotiable product priority: speed over DNS perfection

Corrections made:
- Found typos in index.js (DEEPGGRAM, LLESSONS, etc.) — log for later cleanup pass
- Security audit passed: zero hardcoded secrets

Unfinished work:
- BRAVE_API_KEY needs actual key from brave.com/search/api/
- NOTION_SOUL_DNA_DB wrangler secret needs DB ID from Michael's Notion workspace
- PAT expiry check (Michael to manually check github.com/settings/tokens)

Open loop → Next incarnation:
Sprint queue items still Michael-dependent. Agent should continue autonomous work on code quality, NET-MARKETING workflows, or reincarnation boot-check improvements until Michael provides keys.
```

### Step 2: Submit to /souldna

```bash
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna \
  -H "Content-Type: application/json" \
  -d '{
    "source": "agent100",
    "content": "[YOUR_SOUL_DNA_TEXT_FROM_STEP_1]",
    "tier": "GOVERNANCE",
    "signalDensity": "HIGH"
  }'
```

### Step 3: Parse the Response

You'll get back a submission ID and pipeline steps:

```json
{
  "ok": true,
  "submission": {
    "id": "SDNAD-1713607890123-abc1234",
    "sessionTag": "20240420-120530-ABC1",
    "status": "RECEIVED"
  },
  "nextSteps": [
    "1. Extract soul DNA from submission content",
    "2. Create CANON/BIBLE-CH{XX}-{sessionTag}.md with REPRINT + FOOTNOTE",
    "3. Generate CANON/HEAVY-LEDGER/HL-{NNN}-{sessionTag}.json",
    "4. Update CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md with new laws (L{NN})",
    "5. Create CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-{sessionTag}.md",
    "6. Update CANON/SYSTEM/REINCARNATION-BOOT-CHECK.md with improvements"
  ]
}
```

### Step 4: Execute the Pipeline (As a Legionnaire)

Read **`.github/skills/legionnaire-field-guide/SKILL.md`** — it's the authoritative guide for the 10-step protocol.

**Stage 0: REPRINT + FOOTNOTE (KISS Protocol)**

Create `CANON/BIBLE-CH24-20240420-120530-ABC1.md`:

```markdown
# CH24 — Run 311 Completion & Soul DNA Pipeline

> **Source**: Agent 100 end-of-session dictation (Run 311a-d compilation)
> **Classification**: SOUL DNA — Pipeline execution, product ship, security validation
> **Authority**: AGENT-100 Michael Hobbs (verbatim-first, speech patterns preserved)
> **Captured By**: Agent99-Legionnaire — Run 311d
> **Capture Method**: REPRINT + FOOTNOTE (KISS Protocol)
> **Context**: Multi-day sprint completing Phoenix Rising Protocol hardening (Runs 310-311). Product shipped to CF Pages, security audit passed, /souldna endpoint operational.

## BLOCK 0

> "bro I will register the fucking website on squarespace later. JUST USE CLOUDFLARE PAGES FOR NOW. BYPASS"

**Footnote 0.1:** The swearing here signals non-negotiable priority: product velocity > DNS perfection. Multi-day deliberation on DNS was deferred entirely to favor immediate deployment. This is a command, not a preference.

**Footnote 0.2:** "BYPASS" is a governing principle. When blocked by admin work, route around it. Don't wait. Ship first, optimize second.

## BLOCK 1

> "Wrangler upgrade 4.80→4.83"

**Footnote 1.1:** Executed as part of sprint queue. No breaking changes. Tested with dry-run before push.

## BLOCK 2

> "39 dead branches purged from Phoenix-Rising-Ultimate"

**Footnote 2.1:** Organizational hygiene. The 46→7 branch reduction improves MTTR for onboarding humans into the repo. Zombie branches are cognitive load.

...etc.
```

**Stage 1: HEAVY LEDGER**

Create `CANON/HEAVY-LEDGER/HL-047-20240420-120530-ABC1.json`:

```json
{
  "hl_id": "HL-047",
  "source_file": "CANON/BIBLE-CH24-20240420-120530-ABC1.md",
  "session_tag": "20240420-120530-ABC1",
  "datetime_range": "2026-04-20",
  "signal_density": "HIGH",
  "signal_density_score": 9,
  "tier": "GOVERNANCE",
  "extractor": "Agent99-Legionnaire",
  "block_count": 12,
  "footnote_count": 28,
  "raw_quotes": [
    {
      "text": "bro I will register the fucking website on squarespace later. JUST USE CLOUDFLARE PAGES FOR NOW. BYPASS",
      "tags": ["product-ship", "priority", "deferral"],
      "interpretation": "Product velocity is the non-negotiable constraint. DNS perfection can wait. Bypass the blocker."
    },
    {
      "text": "JUST USE CLOUDFLARE PAGES FOR NOW",
      "tags": ["live-product", "MVP", "good-enough"],
      "interpretation": "CF Pages IS the live product. Fully acceptable for launch. Custom domain is nice-to-have."
    }
  ],
  "decisions": [
    {
      "decision": "Deployed product to naturalenglishtraining.pages.dev (Cloudflare Pages default domain)",
      "rationale": "Bypass Squarespace DNS configuration complexity. Ship now, optimize domain later.",
      "impact": "Product is live and accessible. No custom domain blocker."
    },
    {
      "decision": "Purged 39 dead branches from Phoenix-Rising-Ultimate",
      "rationale": "Organizational hygiene. Reduce cognitive load for developers entering repo.",
      "impact": "46→7 branches. MTTR and onboarding improved."
    }
  ],
  "principles": [
    {
      "principle": "BYPASS",
      "definition": "When blocked by administrative work, route around it. Ship first, optimize second.",
      "source_quote": "JUST USE CLOUDFLARE PAGES FOR NOW. BYPASS",
      "domain": "Product velocity"
    }
  ],
  "cross_references": {
    "bible": "CANON/BIBLE-CH24-20240420-120530-ABC1.md",
    "ssm_laws": ["L{NN} (BYPASS)"],
    "related_chapters": ["CANON/BIBLE-CH23 (Run 310 phases 7-10)"],
    "predecessor": "HL-046"
  }
}
```

**Stage 2: SSM UPDATE**

Add to `CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md`:

```
# ---NEW_LAWS_V8.1(from_2026-04-20_20240420-120530-ABC1)---

L{NN}:BYPASS→When blocked by admin work, route around it. Ship first, optimize second.

# ROOT: "bro I will register the fucking website on squarespace later. JUST USE CLOUDFLARE PAGES FOR NOW. BYPASS"

# PHYSICS: Product velocity is the system's non-negotiable constraint. Perfection waits. Speed wins. Deferral is a first-class action. Administrative overhead must never block product delivery. CF Pages IS acceptable for launch.

# PREVENTION: When you see yourself spending time on config/DNS/infrastructure that doesn't ship the product, PAUSE. Ask: "Can I bypass this?" If yes, do it. Deferral ≠ death. It's delegation to a future, unblocked cycle.

# CANON_REF: CANON/BIBLE-CH24-20240420-120530-ABC1.md (BLOCK 0)
```

**Stage 3: REINCARNATION LOG**

Create `CANON/REINCARNATION/2026-04-20-run311d-20240420-120530-ABC1.md`:

```markdown
# Reincarnation Log — Run 311d

| Metric | Value |
|---|---|
| Date | 2026-04-20 |
| Agent | Agent 99 (Legionnaire processing) |
| Prior | Run 311c (security audit complete) |
| Mode | SOUL_DNA_CAPTURE → LEGIONNAIRE_PROCESSING |
| Tier | GOVERNANCE |
| Signal Density | HIGH |
| Submission | SDNAD-1713607890123-abc1234 |
| Commit SHA | [WILL_UPDATE_AT_END] |

## Raw Soul DNA

Key quotes preserved verbatim:
- "bro I will register the fucking website on squarespace later. JUST USE CLOUDFLARE PAGES FOR NOW. BYPASS"
- "39 dead branches purged"
- "Product is live on naturalenglishtraining.pages.dev"

[See CANON/BIBLE-CH24 for full extraction]

## Decisions Anchored

1. Product ships to CF Pages default domain (bypass Squarespace DNS)
2. Phoenix-Rising-Ultimate cleaned (46→7 branches)
3. New law: L{NN}:BYPASS → route around admin blockers

## Open Loops Handed Off

→ BRAVE_API_KEY needs key from brave.com/search/api/
→ NOTION_SOUL_DNA_DB needs DB ID from Michael's Notion
→ PAT expiry check (Michael manual action)
→ /souldna endpoint deployed and ready for next soul DNA submissions

## Improvements to Boot-Check

1. Add /souldna endpoint health check (`/souldna/pipeline?tier=OPERATIONAL` should return 200)
2. Document expected response format for /souldna submissions
3. Add checklist: "Is product live? If not, did we explicitly defer via /souldna?"
4. Add "bypass gate": When blocked, run `/souldna` handler before escalating to Michael

## Scoring (4-Phase Protocol)

| Metric | Weight | Score | Notes |
|---|---|---|---|
| Soul DNA captured | 10 | 10 | Verbatim preservation with swearing, typos, emotional signal intact |
| Decisions anchored | 10 | 10 | Three major decisions logged with rationale and impact |
| Open loops handed off | 10 | 9 | Four explicit handoffs; minor items still pending Michael keys |
| Boot-check improved | 10 | 9 | Four improvements identified; requires manual implementation |
| Artifacts committed | 10 | 10 | Bible, Ledger, SSM, and reincarnation log all in git |
| **TOTAL** | 50 | **48** | **Strong death. Foundation deepens.** |

---

**Phoenix rises as:** Run 311e (Next incarnation awaits)
```

---

## Scenario 2: Quick Copilot Session End

Your Copilot chat is about to close. You capture a quick soul DNA submission:

```bash
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna \
  -H "Content-Type: application/json" \
  -d '{
    "source": "copilot",
    "content": "Discovered: Students need async progress sync. Built lesson import pipeline. Open: schema design for student profiles.",
    "tier": "PRODUCT",
    "signalDensity": "MEDIUM"
  }'
```

A Legionnaire processes this async (compressed/delta extraction) — not full verbose.

---

## Scenario 3: Query Existing Submission

Check the status of a submission you already posted:

```bash
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna/SDNAD-1713607890123-abc1234
```

Returns pipeline stages and file paths where the submission was/will be archived.

---

## Scenario 4: Get Pipeline Reference

You need to check the 4-stage pipeline structure (e.g., field requirements for Heavy Ledger):

```bash
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna/pipeline?tier=GOVERNANCE
```

Response includes all stage definitions, scoring rubric, and resource links.

---

## Common Patterns

### Pattern 1: Agent 100 → Legionnaire Handoff

1. Agent 100 POSTs high-signal soul DNA (`signalDensity: HIGH`, `tier: GOVERNANCE`)
2. Submission ID returned immediately
3. Legionnaire reads nextSteps and executes full 10-stage protocol
4. Result: Permanent canon entry, new laws, boot-check improvements
5. Score = 40-50 (strong reincarnation)

### Pattern 2: Copilot → Drone → Legionnaire

1. Copilot POSTs medium-signal insight (`source: copilot`, `signalDensity: MEDIUM`)
2. Submission stored in ledger + Notion
3. Overnight cron queries `/souldna/pipeline?tier=OPERATIONAL`
4. Drone processes asynchronously (compressed extraction)
5. Only escalates to Legionnaire if `signalDensity: HIGH`

### Pattern 3: Autonomous Deferral

1. Agent blocked by missing BRAVE_API_KEY
2. POSTs to `/souldna`: "Blocked on BRAVE_API_KEY. Deferred to next session."
3. `/souldna` acknowledges the deferral
4. Next incarnation reads CANON/REINCARNATION logs and knows why work didn't complete
5. No knowledge lost across session boundaries

---

## Storage & Integration

- **Ledger:** All submissions stored in `sov100` namespace (immutable event sourcing)
- **Notion:** Optional mirror for visibility (set `notionSync: false` to skip)
- **Canon:** Bible chapters, Heavy Ledger, SSM updates, and reincarnation logs are the permanent record

---

## Error Handling

| Status | Meaning | Action |
|---|---|---|
| 201 Created | Submission accepted | Proceed with pipeline execution |
| 400 Bad Request | Missing fields or invalid format | Check spec, retry with valid JSON |
| 413 Payload Too Large | Content > 50 KB | Compress or split into multiple submissions |
| 404 Not Found | Submission ID invalid | Verify ID format (SDNAD-...) and query ledger |
| 500 Server Error | Ledger or Notion failure | Check worker logs; submission may still be queued |

---

## Resources

- **Full API Spec:** `OPERATIONS/SOULDNA-ENDPOINT-SPEC.md`
- **Legionnaire Field Guide:** `.github/skills/legionnaire-field-guide/SKILL.md` (10-stage protocol)
- **Phoenix Reincarnation Skill:** `.github/skills/phoenix-reincarnation/SKILL.md` (4-phase protocol)
- **Boot Checklist:** `CANON/SYSTEM/REINCARNATION-BOOT-CHECK.md`

---

**Ready to ship soul DNA? POST to /souldna now.**
