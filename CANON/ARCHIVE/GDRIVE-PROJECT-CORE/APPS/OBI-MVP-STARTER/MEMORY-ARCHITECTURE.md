# 🧠 OBI Memory Architecture (How It Remembers)

## The Loop (What Happens Every Message)

```
User message arrives
        ↓
Load Student profile (level, streaks, weak points)
        ↓
Send to AI with context:
  "Student has been failing /th/ sound 3 times"
  "Student last spoke 2 days ago"
        ↓
AI corrects + generates drill
        ↓
Store Session record:
  - What they said
  - What they should say
  - Error category
        ↓
Update Mistake tracking:
  - /th/ sound: frequency = 4 (was 3)
        ↓
Update Student profile:
  - weakPhonemes: ["/θ/", "/r/", ...] ← sorted by frequency
  - streakDays: 1 (reset if wrong) or +1 (if right)
        ↓
Append to immutable LedgerEntry (PERMANENT RECORD)
        ↓
Send response back to user
```

**Total process: 800ms**

---

## Three Tiers of Memory

### Tier 1: Recent Session (FAST)
**What:** Last 5 sessions  
**Where:** SessionDO (Durable Object in Cloudflare)  
**Speed:** < 50ms  
**Purpose:** Context for next message  

Example:
```json
{
  "earlier_input": "I go yesterday",
  "topic": "past tense",
  "correction_applied": true
}
```

### Tier 2: Student Profile (MEDIUM-TERM)
**What:** 6+ month learner identity  
**Where:** Supabase Student table  
**Speed:** < 100ms  
**Survives:** 6+ months across all sessions  

Example:
```json
{
  "level": "B1",
  "streakDays": 5,
  "weakPhonemes": ["/θ/" (8x), "/r/" (5x), "/l/" (3x)],
  "weakGrammar": ["past tense" (12x), "articles" (4x)]
}
```

### Tier 3: Immutable Ledger (FOREVER)
**What:** Every correction + decision  
**Where:** LedgerEntry table (append-only)  
**Speed:** < 50ms (write-optimized)  
**Never:** Deleted or modified  

Example:
```json
{
  "action": "session_created",
  "studentId": "user-123",
  "metadata": {
    "correction_made": true,
    "categories": ["grammar"],
    "timestamp": "2026-04-19T10:30:00Z"
  }
}
```

---

## How This Becomes Your Moat

**Week 1-2:** "This AI corrects me"  
**Week 3-4:** "This AI remembers my /th/ sound mistake"  
**Week 8+:** "This AI only drills MY mistakes, not generic ones"  
**Month 6+:** "This system knows my exact weakness pattern"  

After 26 weeks with 100 students:
- 10,000+ error patterns mapped
- Vietnamese speaker phonology captured
- Personalized drill sequences that scale to 95% relevance

This is what competitors cannot copy in < 6 months.

---

## Adding More Memory Later (Not in MVP)

### Add: Teacher Memory
Track what teacher said corrections were:
```
Student error: "I go"
OBI correction: "I went"
Teacher says: "Actually, that's also okay in some contexts"
→ Adjust OBI's strictness for this student
```

### Add: Parent/Boss Pressure Memory
```
Parent sees: student skipped 3 days
Parent sends: message
OBI adjusts: more motivational language
```

### Add: Circadian Rhythm Memory
```
Student always speaks at 6pm
OBI learns: harder drills at 6pm (when they're alert)
OBI learns: easier tasks at 8am (when they're tired)
```

---

## Why This Won't Break at Scale

**Potential failure:** Too much data = slow queries  
**Fix:** Weak points capped at 5 per student + 10 per session  

**Potential failure:** Memory gets corrupted  
**Fix:** Immutable ledger verification (weekly hash chain check)  

**Potential failure:** Old data crowds out new signals  
**Fix:** Decay weight on mistakes older than 90 days (they learned it)  

---

## Testing Memory (How to Verify It Works)

```bash
# Test 1: Create user, send message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I go yesterday", "studentId": "test-001"}'

# Response should include:
# "streak": 0 (first message)
# "weakPoints": ["past tense"]

# Test 2: Send same error again (within 24h)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "She go market", "studentId": "test-001"}'

# Response should show:
# "weakPoints": ["past tense", "/another/", ...]
# Past tense should rank higher (frequency = 2)

# Test 3: Verify database
psql -c "SELECT * FROM \"Mistake\" WHERE \"studentId\"='test-001';"
# Should see 2 records, both "past tense"
```

---

## API to Query Memory (Future Feature)

```typescript
// GET /api/student/[id]/progress
// Response:
{
  "level": "B1",
  "strengthAreas": [
    { "skill": "vocabulary", "score": 0.85 },
    { "skill": "listening", "score": 0.72 }
  ],
  "weakAreas": [
    { "skill": "/th/ pronunciation", "frequency": 8 },
    { "skill": "past tense", "frequency": 12 }
  ],
  "streak": 5,
  "totalSessions": 23,
  "progressTrend": "+15% this week"
}
```

---

**Bottom line:** Every correction teaches the system about this student. After 26 sessions, OBI knows them better than a generic app ever will.**
