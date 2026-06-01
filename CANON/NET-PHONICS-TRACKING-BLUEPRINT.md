# NET Phonics Tracking — Implementation Blueprint
**Run 38 | 2026-06-01 | Status: READY TO BUILD (Run 39)**

---

## Problem
OBI has no memory of where a student is in the phonics curriculum. Every session could repeat OYSTER drills even before SATNIP is done. No sequential progression, no error pattern history.

---

## KV Schema
**Namespace:** `NET_PET_KV`
**Key:** `phonics_progress_{studentId}`

```json
{
  "current_group": 1,
  "drills_completed": ["satnip-01", "satnip-02"],
  "dominant_errors": ["final_consonant_deletion", "vowel_confusion"],
  "groups_unlocked": [1, 0, 0, 0, 0, 0, 0],
  "last_drill_id": "satnip-02",
  "session_count_phonics": 3,
  "created_at": "ISO",
  "updated_at": "ISO"
}
```

**Unlock rule:** ≥4 of 5 drills in current group completed → advance to next group.

---

## API Endpoints (add to src/index.js)

### GET /api/phonics/progress?studentId=X
Returns current progress. If no KV entry, returns default (group 1, zero drills).
```json
{
  "current_group": 1,
  "group_name": "SATNIP",
  "drills_completed": ["satnip-01"],
  "dominant_errors": ["final_consonant_deletion"],
  "groups_unlocked": [1,0,0,0,0,0,0],
  "completion_pct": 20,
  "next_drill": { "id": "satnip-02", "sentence": "...", "tip": "..." },
  "last_drill_id": "satnip-01",
  "session_count_phonics": 1
}
```

### POST /api/phonics/progress
Body: `{ studentId, drill_id, error_type }`
- Append `drill_id` to `drills_completed` (dedupe)
- Push `error_type` to `dominant_errors` (dedupe, keep last 3)
- Update `last_drill_id`, `updated_at`
- Return updated progress object

### POST /api/phonics/advance
Body: `{ studentId }`
- Check if current group has ≥4/5 drills in `drills_completed`
- If yes: set `current_group++`, update `groups_unlocked`, return `{ advanced: true, new_group: N }`
- If no: return `{ advanced: false, drills_remaining: N }`

---

## OBI buildAgentPrompt Integration (phonics mode)

**Change in `src/index.js` → `buildAgentPrompt()`:**

```
// Phonics mode — fetch progress from KV before building prompt
const progress = await env.NET_PET_KV.get(`phonics_progress_${studentId}`, 'json') || defaultProgress;
const currentDrill = getNextDrill(progress); // sequential, not random

Inject into prompt:
"PHONICS SESSION:
Current Group: {group_name} (Group {N}/7).
Today's drill: '{drill.sentence}'
Articulation tip: '{drill.tip}'
Student's focus error: {dominant_errors[0] || 'clear pronunciation'}
After student attempts the sentence, call POST /api/phonics/progress with drill_id + observed error_type."
```

**Note:** `buildAgentPrompt` currently runs server-side at token-mint time — progress fetch is async-safe.

---

## Portal Card Spec

Add to student portal dashboards (Quy, Huong, Mai Tram) — phonics section card:

```
┌─────────────────────────────────┐
│  🔊 SATNIP  [Group 1 of 7]      │
│  ████░░░░░░  2/5 drills          │
│  Last: satnip-02 · 3 sessions   │
│  Focus: final_consonant_deletion │
│  Next: satnip-03 ready           │
└─────────────────────────────────┘
```

- Badge color follows group order (purple→blue→green→yellow→orange→red→gold)
- "Group complete! Advance →" button when ≥4/5 drills done, calls POST /api/phonics/advance
- Fetch from GET /api/phonics/progress?studentId=X on portal load

---

## Implementation Order (Run 39)

1. Add 3 endpoints to `src/index.js` (GET + 2 POSTs)
2. Update `buildAgentPrompt()` phonics mode to read KV + inject sequential drill
3. Add phonics card to Quy portal (priority — A1, phonics is her core track)
4. Add to Huong + Mai Tram portals
5. Deploy to `net-pet-ai-dev` → verify → promote to prod

**Deploy target: `net-pet-ai-dev` first (firewall rule).**
