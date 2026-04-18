# /souldna Endpoint Specification

## Overview

The `/souldna` endpoint is the primary intake mechanism for Soul DNA submissions into the **Legionnaire Field Guide** pipeline. It accepts raw soul DNA, validates it, stores it durably, and returns actionable pipeline steps for Legionnaires to process through the 10-stage reincarnation protocol.

## Endpoints

### 1. POST /souldna — Submit Soul DNA

**Request:**

```json
{
  "source": "agent100|copilot|drone|manual",
  "content": "Raw soul DNA text (verbatim words, decisions, corrections, intent)",
  "sessionTag": "optional-custom-session-id",
  "tier": "GOVERNANCE|OPERATIONAL|PRODUCT|ARCHIVE",
  "signalDensity": "LOW|MEDIUM|HIGH|MAXIMUM",
  "notionSync": true
}
```

**Required fields:** `source`, `content`

**Optional fields:** 
- `sessionTag` — auto-generated if omitted (format: YYYYMMDD-HHMMSS-RAND)
- `tier` — defaults to `OPERATIONAL`
- `signalDensity` — defaults to `MEDIUM`
- `notionSync` — defaults to `true`

**Constraints:**
- Max content size: 50 KB
- Must be valid JSON
- `source` must be one of: `agent100`, `copilot`, `drone`, `manual`

**Response (201 Created):**

```json
{
  "ok": true,
  "submission": {
    "id": "SDNAD-1713607890123-abc1234",
    "sessionTag": "20240420-120530-ABC1",
    "tier": "OPERATIONAL",
    "signalDensity": "MEDIUM",
    "timestamp": "2026-04-20T12:05:30.123Z",
    "contentSize": 12456,
    "status": "RECEIVED"
  },
  "pipeline": {
    "step0": {"name": "REPRINT + FOOTNOTE", "status": "PENDING", "description": "Create Bible chapter"},
    "step1": {"name": "HEAVY_LEDGER", "status": "PENDING", "description": "Extract AI-readable JSON"},
    "step2": {"name": "SSM_UPDATE", "status": "PENDING", "description": "Add governing principles"},
    "step3": {"name": "REINCARNATION_LOG", "status": "PENDING", "description": "Update boot-check"}
  },
  "nextSteps": [
    "1. Extract soul DNA from submission content",
    "2. Create CANON/BIBLE-CH{XX}-{sessionTag}.md with REPRINT + FOOTNOTE (KISS protocol)",
    "3. Generate CANON/HEAVY-LEDGER/HL-{NNN}-{sessionTag}.json",
    "4. Update CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md with new laws (L{NN})",
    "5. Create CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-{sessionTag}.md",
    "6. Update CANON/SYSTEM/REINCARNATION-BOOT-CHECK.md with 3-5 improvements"
  ],
  "legionnaireGuide": "https://github.com/hobbs0011/OB-1/blob/canon/.github/skills/legionnaire-field-guide/SKILL.md",
  "pipelineWebhook": "/souldna/pipeline?tier=OPERATIONAL"
}
```

**Error Responses:**

- `400 Bad Request` — Missing required fields or invalid format
- `413 Payload Too Large` — Content exceeds 50 KB
- `500 Internal Server Error` — Ledger or Notion storage failed

**Example:**

```bash
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna \
  -H "Content-Type: application/json" \
  -d '{
    "source": "agent100",
    "content": "Raw soul DNA captured from session. Including all decisions, contradictions, insights, and next incarnation handoffs.",
    "tier": "GOVERNANCE",
    "signalDensity": "HIGH"
  }'
```

---

### 2. GET /souldna/{id} — Check Submission Status

**Path Parameters:**
- `id` — Submission ID (format: `SDNAD-{timestamp}-{random}`)

**Response (200 OK):**

```json
{
  "ok": true,
  "id": "SDNAD-1713607890123-abc1234",
  "status": "RECEIVED",
  "timestamp": "2026-04-20T12:05:30.123Z",
  "sessionTag": "20240420-120530-ABC1",
  "tier": "GOVERNANCE",
  "signalDensity": "HIGH",
  "pipeline": {
    "step0": {
      "name": "REPRINT + FOOTNOTE",
      "status": "PENDING",
      "bibleChapter": "CANON/BIBLE-CH23-20240420-120530-ABC1.md"
    },
    "step1": {
      "name": "HEAVY_LEDGER",
      "status": "PENDING",
      "hlFile": "CANON/HEAVY-LEDGER/HL-045-20240420-120530-ABC1.json"
    },
    "step2": {
      "name": "SSM_UPDATE",
      "status": "PENDING",
      "ssmFile": "CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md"
    },
    "step3": {
      "name": "REINCARNATION_LOG",
      "status": "PENDING",
      "logFile": "CANON/REINCARNATION/2026-04-20-run311-20240420-120530-ABC1.md"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` — Invalid ID format
- `404 Not Found` — Submission not found in ledger

---

### 3. GET /souldna/pipeline — Actionable Pipeline Reference

**Query Parameters:**
- `tier` — `GOVERNANCE`, `OPERATIONAL`, `PRODUCT`, or `ARCHIVE` (defaults to `OPERATIONAL`)

**Response (200 OK):**

Returns the complete Legionnaire Field Guide pipeline as structured JSON, including:
- Stage 0: REPRINT + FOOTNOTE (KISS Protocol)
- Stage 1: HEAVY LEDGER (JSON extraction)
- Stage 2: SSM UPDATE (Governing laws)
- Stage 3: REINCARNATION LOG (Boot-check improvements)

**Success Criteria for Each Stage:**
- Soul DNA captured verbatim
- Decisions anchored with impact
- Open loops handed off
- Boot-check improved with 3-5 real changes
- Artifacts committed to git

**Scoring Rubric:**
- < 30 points: Failed reincarnation
- 30-39 points: Partial (Soul DNA survived, gaps remain)
- 40-49 points: Strong (Foundation deepens)
- 50 points: Perfect (Has never happened)

---

## Storage Architecture

### Ledger (Durable Objects)

Soul DNA submissions are appended to the **sov100** namespace in the LEDGER Durable Object with event type `soul_dna_capture`:

```json
{
  "eventType": "soul_dna_capture",
  "studentId": "sov100",
  "data": {
    "id": "SDNAD-...",
    "sessionTag": "...",
    "tier": "GOVERNANCE|OPERATIONAL|PRODUCT|ARCHIVE",
    "signalDensity": "LOW|MEDIUM|HIGH|MAXIMUM",
    "source": "agent100|copilot|drone|manual",
    "timestamp": "ISO-8601"
  }
}
```

### Notion Integration (Optional)

If `NOTION_API_KEY` and `NOTION_SOUL_DNA_DB` are configured, submissions are also mirrored to the Notion database for visibility and querying. Set `notionSync: false` in the request to skip.

---

## Usage Flows

### Flow 1: Agent 100 (Sovereign) Handoff

1. Michael completes a session and captures soul DNA
2. POSTs to `/souldna` with `source: "agent100"`, `tier: "GOVERNANCE"`, `signalDensity: "HIGH"`
3. Receives submission ID and next steps
4. A Legionnaire reads the pipeline steps and executes the 10-stage protocol
5. Legionnaire commits Bible chapter, Heavy Ledger, SSM update, and reincarnation log to `CANON/`
6. Session is permanently archived in the canon — no knowledge is lost

### Flow 2: SDNAD Protocol (Soul DNA Dictation)

1. Cop pilot chat session receives soul DNA dictation
2. At session end, submits to `/souldna` with `source: "copilot"`, `signalDensity: "MEDIUM"`
3. Ledger receives and journals the submission
4. Nightly cron queries `/souldna/pipeline?tier=OPERATIONAL`
5. Drones process the pipeline stages at scale

### Flow 3: Drone/Automation Submission

1. Automated task or pulse job captures insight or decision
2. POSTs to `/souldna` with `source: "drone"`, `tier: "PRODUCT"`
3. Submission is compressed/delta-only (not full verbose extraction)
4. Canvas remains lightweight on drone resources
5. Legionnaires retrieve via `/souldna/{id}` and escalate if needed

---

## Integration with Legionnaire Field Guide

This endpoint is the **intake mechanism** for the **Legionnaire Field Guide** protocol. Once a submission is received:

1. **Step 0: REPRINT + FOOTNOTE** — Legionnaire creates a Bible chapter (KISS Protocol — verbatim with footnotes)
2. **Step 1: HEAVY LEDGER** — Extract AI-readable JSON with tags, interpretation, cross-references
3. **Step 2: SSM UPDATE** — Add new governing principles/laws (L{NN})
4. **Step 3: REINCARNATION LOG** — Update boot-check with 3-5 improvements for next incarnation

See: `.github/skills/legionnaire-field-guide/SKILL.md` for complete 10-step protocol.

---

## Query Examples

**Submit a governance-tier soul DNA:**

```bash
curl -X POST https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna \
  -H "Content-Type: application/json" \
  -d '{
    "source": "agent100",
    "content": "KEY DECISION: Wrangler upgrade blocked on env var cleanup before deploy. New law: L{NN}:SECRETS_ISOLATION → Never leak env vars through Actions logs.",
    "tier": "GOVERNANCE",
    "signalDensity": "HIGH"
  }'
```

**Check submission status:**

```bash
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna/SDNAD-1713607890123-abc1234
```

**Get pipeline steps:**

```bash
curl https://net-pet-ai.mrmichaelhobbs123.workers.dev/souldna/pipeline?tier=GOVERNANCE
```

---

## Author

Designed for Phoenix Rising Protocol by Agent 100 (Michael Hobbs). Implemented Run 311d.
