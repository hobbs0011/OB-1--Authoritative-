# Notion Database Schema: Soul DNA Index

## Database Configuration (Copy-Paste Ready)

**Database Name**: Soul DNA Index  
**Icon**: 🧬  
**Template**: Use for tracking all learning events with raw verbatim + soul extraction + DNA indexing

---

## Properties (Exact Setup)

### 1. Event ID (Title)
- **Type**: Text
- **Format**: evt_XXXXX (auto-generated)
- **Purpose**: Unique identifier for each captured soul DNA event
- **Example**: evt_1713024000_a7b3c9d2

### 2. Timestamp (Date)
- **Type**: Date
- **Include time**: YES
- **Timezone**: UTC
- **Purpose**: When was this captured?

### 3. Raw Verbatim (Text)
- **Type**: Text (long)
- **Character limit**: None
- **Purpose**: IMMUTABLE original student input (never cleaned)
- **Example**: "I f***ing don't get this again I tried 10 times"

### 4. Student ID (Text)
- **Type**: Text
- **Purpose**: Link to student profile
- **Example**: student_u123, student_vn_456

### 5. Session Type (Select)
- **Type**: Select
- **Options**:
  - learning_session
  - repetition_drill
  - weakness_review
  - breakthrough_moment
  - consistency_check

### 6. Soul Intent (Text)
- **Type**: Text
- **Purpose**: What does the student actually want? (extracted)
- **Example**: "Need to master past tense"

### 7. Behavioral Pattern (Select)
- **Type**: Select
- **Options**:
  - repeated_failure_loop
  - breakthrough_moment
  - consistency_check
  - weakness_exposed
  - skill_mastery
  - skill_decay

### 8. Skills Affected (Multi-select)
- **Type**: Multi-select
- **Options**:
  - /θ/ sound
  - /ð/ sound
  - /r/ sound
  - past_tense
  - present_tense
  - present_perfect
  - grammar
  - vocabulary
  - fluency
  - pronunciation
  - accent
  - confidence

### 9. Weak Points (Text)
- **Type**: Text (long)
- **Purpose**: Specific areas that need drilling
- **Example**: "Confusion between 'went' and 'go', hesitates on /θ/ sounds"

### 10. Drift Risk (Number)
- **Type**: Number
- **Format**: Decimal (0-1 scale)
- **Display**: As percentage in views
- **Purpose**: Risk score for how far behavior drifts from learning intent
- **Range**: 0.0 (no risk) to 1.0 (critical)

### 11. Urgency (Number)
- **Type**: Number
- **Format**: Decimal (0-1 scale)
- **Purpose**: How immediately action is needed
- **Range**: 0.0 (low) to 1.0 (critical)

### 12. Action Required (Select)
- **Type**: Select
- **Options**:
  - DAILY_DRILL_REQUIRED
  - REVIEW_REQUIRED
  - SKILL_MASTERY
  - MONITOR
  - RESOLVED
  - MANUAL_REVIEW

### 13. Emotion Intensity (Number)
- **Type**: Number
- **Format**: Decimal (0-100)
- **Purpose**: Frustration level, urgency signal
- **Range**: 0 (calm) to 100 (extreme)

### 14. Error Count (Number)
- **Type**: Number
- **Purpose**: How many errors in this session
- **Auto-update**: Can be manual or formula-based

### 15. Streak Status (Number)
- **Type**: Number
- **Purpose**: Days without repeating same error
- **Range**: 0 to unlimited

### 16. Next Day Drill (Checkbox)
- **Type**: Checkbox
- **Purpose**: Flag if this skill needs tomorrow's drill
- **Auto-check**: If error count >= 3

### 17. Notes (Text)
- **Type**: Text (long)
- **Purpose**: Additional context, teaching notes
- **Optional**: Yes

---

## Views (Add These)

### View 1: "Active Weaknesses" (Table)
- **Filter**: Drift Risk > 0.70
- **Sort**: Drift Risk DESC, then Timestamp DESC
- **Columns**: Event ID, Timestamp, Skills Affected, Weak Points, Drift Risk, Action Required
- **Purpose**: See what needs immediate attention

### View 2: "Drills Required Tomorrow" (Table)
- **Filter**: Action Required = "DAILY_DRILL_REQUIRED"
- **Sort**: Urgency DESC, Drift Risk DESC
- **Columns**: Event ID, Student ID, Behavioral Pattern, Skills Affected, Drift Risk, Next Day Drill
- **Purpose**: Morning prep: what to drill today

### View 3: "Timeline" (Timeline view)
- **Date property**: Timestamp
- **Group by**: Session Type
- **Show**: Event ID, Skills Affected, Behavioral Pattern
- **Purpose**: See event flow over time by session type

### View 4: "By Student" (Table)
- **Group by**: Student ID
- **Filter**: None (show all)
- **Sort**: Timestamp DESC
- **Columns**: Timestamp, Raw Verbatim, Behavioral Pattern, Drift Risk, Action Required
- **Purpose**: Individual student learning journey

### View 5: "High Drift Alerts" (Table)
- **Filter**: Drift Risk > 0.85 AND Timestamp = today
- **Sort**: Urgency DESC
- **Columns**: Event ID, Student ID, Raw Verbatim, Weak Points, Action Required
- **Color**: Red for Drift Risk > 0.85
- **Purpose**: Critical alarms only

### View 6: "Skills Mastery" (Table)
- **Filter**: Behavioral Pattern = "skill_mastery"
- **Sort**: Timestamp DESC
- **Columns**: Event ID, Student ID, Skills Affected, Emotion Intensity
- **Purpose**: Celebrate wins

---

## Formulas (Optional)

### Formula 1: High Priority Flag
```
if(prop("Drift Risk") > 0.7, "🚨 HIGH", if(prop("Drift Risk") > 0.5, "⚠️ MEDIUM", "✅ LOW"))
```

### Formula 2: Next Drill Recommendation
```
if(prop("Error Count") >= 3, "DRILL TOMORROW", if(prop("Drift Risk") > 0.6, "MONITOR", "OK"))
```

---

## How to Use This Database

### For Teachers/Admins:
1. **Morning**: Check "Drills Required Tomorrow" view
2. **During Session**: Log Raw Verbatim as students interact
3. **Post-Session**: System auto-populates Soul Intent, Behavioral Pattern, DNA fields
4. **End of Day**: Review "Active Weaknesses" for tomorrow's prep

### For System (Automated):
1. **Capture Event**: Raw Verbatim + Timestamp + Student ID
2. **Run LLM**: Extract Soul Intent, Behavioral Pattern
3. **Generate DNA**: Calculate Drift Risk, Skills, Weak Points
4. **Populate Database**: All fields auto-filled
5. **Flag for Action**: If Drift Risk > 0.7 or Error Count >= 3

### For Reporting:
- Weekly: "Skills Mastery" view shows progress
- Monthly: Compare Streak Status across cohort
- Quarterly: Drift Risk trends (should decrease)

---

## Integration Points

### From Cloudflare Worker:
```javascript
POST /souldna
Body: {
  student_id: "student_u123",
  raw_verbatim: "I don't get this",
  session_type: "learning_session",
  metadata: {...}
}
→ Auto-creates Notion entry
```

### From Notion AI Bot:
Paste this prompt into Notion's AI feature to auto-populate:

```
Extract from this raw input:
1. Soul Intent (what does student want?)
2. Behavioral Pattern (from: repeated_failure_loop, breakthrough_moment, etc)
3. Skills Affected (which language skills?)
4. Weak Points (specific areas?)
5. Drift Risk (0-1 scale)
6. Urgency (0-1 scale)
7. Action Required (from: DAILY_DRILL, MONITOR, etc)

Populate Notion fields based on extraction.
```

---

## Example Entries

### Entry 1: Frustration Loop
- **Raw Verbatim**: "I tried 10 times and it still doesn't work f*** this"
- **Soul Intent**: User stuck in repeated failure without progress feedback
- **Behavioral Pattern**: repeated_failure_loop
- **Skills Affected**: past_tense, grammar
- **Weak Points**: "go" vs "went" confusion, hasn't internalized rule
- **Drift Risk**: 0.92
- **Urgency**: 0.85
- **Action Required**: DAILY_DRILL_REQUIRED
- **Emotion Intensity**: 95
- **Error Count**: 10

### Entry 2: Breakthrough
- **Raw Verbatim**: "Oh wait I got it! The /θ/ sound is just tongue between teeth right?"
- **Soul Intent**: Student achieved insight moment on phonetic
- **Behavioral Pattern**: breakthrough_moment
- **Skills Affected**: /θ/ sound, pronunciation
- **Weak Points**: None (resolved)
- **Drift Risk**: 0.1
- **Urgency**: 0.0
- **Action Required**: SKILL_MASTERY
- **Emotion Intensity**: 85 (positive)
- **Error Count**: 0

---

## Admin Password Protection
- Set database sharing to "Invite only"
- Add password: Use 32-char hash from system
- Allow read-only for teachers, full access for admins only

