# QUAN & QUANG ACTION PLAN — Backend Pipeline

**Source:** Message to Nguyen Viet Thinh (2026-07-06)  
**Student IDs:** `quan-nguyen`, `quang-nguyen`  
**Target worker:** `net` (`https://net.mrmichaelhobbs123.workers.dev`)  
**Legacy worker:** `net-pet-ai` (untouched)

---

## 1. EXISTING BACKEND AUDIT

### 1.1 What's Already Built

**Data stores (KV namespaces already bound):**
- `student_profile_<id>` — name, level, goals, segment
- `session_history_<id>` — array of past sessions
- `streak:<id>` — streak data
- `vocab_list_<id>` + `srs_data_<id>` — spaced repetition

**Existing endpoints usable by the portal:**
- `GET /api/progress?studentId=<id>` — returns progress data
- `GET /api/daily?studentId=<id>` — returns daily task
- `POST /api/lesson` — teacher logs a lesson
- `POST /api/practice` — student logs practice
- `POST /api/feedback` — student submits feedback
- `POST /api/onboarding` — student profile creation
- `GET /api/vocab/list?studentId=<id>` — vocabulary list
- `POST /api/vocab/review` — SRS review
- `GET /api/drills/next?studentId=<id>` — next drill
- `POST /api/drills/result` — drill completion
- `GET /api/phonics/progress?studentId=<id>` — phonics progress
- `POST /api/parent/dashboard` — parent login with PIN, returns student data
- `POST /api/employer/dashboard` — employer login with company code + PIN
- `GET /api/admin/student-activity` — employer-facing practice frequency
- `POST /api/transcript` — append transcript to memory

**Auth mechanisms:**
- Parent PIN: hardcoded hash in `handleParentDashboard`
- Employer PIN: hardcoded hash in `handleEmployerDashboard`
- Admin key: `X-Admin-Key` header gated

### 1.2 What's Missing (Gaps)

| Feature | Status | Gap |
|---------|--------|-----|
| Weekly task assignment by teacher | MISSING | No task CRUD, no assignment system |
| Student daily logging | MISSING | No daily completion tracker |
| Parent task tracking view | MISSING | Parent dashboard returns profile/history/streak only, no tasks |
| Pronunciation practice tracking | MISSING | No audio logging, no daily pronunciation drill |
| Job prep progress (LinkedIn/CV/3D) | MISSING | No project/job-prep data model |
| Weekly report generation | MISSING | No aggregated report endpoint |
| Task completion notifications | MISSING | No notification system |
| Student self-service task view | MISSING | No student-facing task list endpoint |

---

## 2. PROPOSED PIPELINE

### 2.1 Data Model

**New KV schemas:**

```
# Weekly tasks assigned by teacher
task_assignments:<studentId>:<weekId> = [
  {
    "id": "uuid",
    "weekId": "2026-W27",
    "studentId": "quan-nguyen",
    "category": "pronunciation|english|job-prep|linkedin|cv|3d-modeling",
    "title": "Practice linkedIn profile setup",
    "description": "Complete LinkedIn profile sections: about, experience, skills",
    "dailyMinutes": 20,
    "totalMinutes": 140,
    "dueDate": "2026-07-10",
    "createdAt": "2026-07-04T10:00:00Z",
    "createdBy": "teacher",
    "status": "active|completed|cancelled"
  }
]

# Daily completion logs by student
task_logs:<studentId>:<date> = [
  {
    "taskId": "uuid",
    "date": "2026-07-04",
    "studentId": "quan-nguyen",
    "completed": true,
    "minutesSpent": 25,
    "notes": "Uploaded CV draft to drive",
    "audioUrl": "https://...", // optional pronunciation recording
    "submittedAt": "2026-07-04T18:30:00Z"
  }
]

# Weekly summary (cached)
task_summary:<studentId>:<weekId> = {
  "weekId": "2026-W27",
  "studentId": "quan-nguyen",
  "totalTasks": 7,
  "completedTasks": 5,
  "totalMinutesPlanned": 140,
  "totalMinutesLogged": 125,
  "categories": {
    "pronunciation": {"planned": 140, "logged": 120},
    "job-prep": {"planned": 0, "logged": 5}
  },
  "streak": 3,
  "generatedAt": "2026-07-04T23:59:00Z"
}
```

### 2.2 New API Routes

#### Teacher/Admin Routes

```
POST /api/admin/task/assign
  Body: {
    "studentId": "quan-nguyen",
    "weekId": "2026-W27",
    "category": "linkedin",
    "title": "Complete LinkedIn profile",
    "description": "Fill about, experience, skills sections",
    "dailyMinutes": 20,
    "dueDate": "2026-07-10"
  }
  Auth: X-Admin-Key
  Returns: { ok: true, taskId: "uuid" }

GET /api/admin/tasks?studentId=<id>&weekId=<week>
  Auth: X-Admin-Key
  Returns: { tasks: [...], summary: {...} }

PATCH /api/admin/task/:taskId
  Body: { "status": "cancelled" } | { "dailyMinutes": 30 }
  Auth: X-Admin-Key
  Returns: { ok: true, task: {...} }
```

#### Student Routes

```
GET /api/tasks/current?studentId=<id>
  Returns: {
    "weekId": "2026-W27",
    "tasks": [...],
    "today": {
      "tasks": [...],
      "totalMinutes": 45,
      "completedMinutes": 0
    }
  }

POST /api/tasks/log
  Body: {
    "taskId": "uuid",
    "date": "2026-07-04",
    "completed": true,
    "minutesSpent": 25,
    "notes": "Finished CV section",
    "audioUrl": "https://..." // optional
  }
  Returns: { ok: true, logId: "uuid" }

GET /api/tasks/history?studentId=<id>&weeks=4
  Returns: {
    "weeks": [
      {
        "weekId": "2026-W27",
        "summary": {...},
        "tasks": [...]
      }
    ]
  }
```

#### Parent Routes

```
GET /api/parent/tasks?studentId=<id>&weekId=<week>
  Auth: PIN via /api/parent/dashboard (extend existing)
  Returns: {
    "studentId": "quan-nguyen",
    "weekId": "2026-W27",
    "tasks": [...],
    "completionRate": 0.71,
    "totalMinutesLogged": 125,
    "streak": 3,
    "dailyLog": [
      {"date": "2026-07-04", "tasks": 2, "completed": 1, "minutes": 25},
      {"date": "2026-07-05", "tasks": 2, "completed": 2, "minutes": 45}
    ]
  }
```

### 2.3 Pipeline Flow

```
TEACHER                    STUDENT                    PARENT
   |                          |                          |
   | POST /task/assign        |                          |
   | ─── weekly tasks ──────> |                          |
   |                          | GET /tasks/current       |
   |                          | <── today's tasks ────── |
   |                          |                          |
   |                          | POST /tasks/log          |
   |                          | <── completion + notes ─ |
   |                          |                          |
   |                          |                          | GET /parent/tasks
   |                          |                          | <── progress view
   |                          |                          |
   |                          | POST /practice           |
   |                          | <── pronunciation audio ─|
   |                          |                          |
   | GET /admin/tasks          |                          |
   | <── review all ──────────|                          |
```

### 2.4 Frontend Pages Needed

**New portal pages under `APPS/NET-PET-AI/public/`:**

```
quan-quang-login/
  index.html          ← existing parent/student login

quan-portal/
  index.html          ← student task view + log form
  history.html        ← weekly history

quang-portal/
  index.html          ← student task view + log form
  history.html        ← weekly history

parent-quan-quang/
  index.html          ← parent tracking dashboard
```

**Existing pages to extend:**
- `public/quan-portal.html` — add task widget
- `public/quang-portal.html` — add task widget

### 2.5 Implementation Order

**Phase 1 — Data layer (this session)**
1. Add KV schemas for `task_assignments:*`, `task_logs:*`, `task_summary:*`
2. Add helper functions in `src/index.js`:
   - `getWeekId(date)` → "2026-W27"
   - `getTasks(studentId, weekId, env)`
   - `setTask(task, env)`
   - `logTaskCompletion(log, env)`
   - `getTaskSummary(studentId, weekId, env)`

**Phase 2 — API routes (next session)**
3. Add `POST /api/admin/task/assign`
4. Add `GET /api/tasks/current`
5. Add `POST /api/tasks/log`
6. Add `GET /api/tasks/history`
7. Extend `GET /api/parent/dashboard` to include tasks
8. Add `GET /api/parent/tasks`

**Phase 3 — Frontend (after backend verified)**
9. Build student task view (`quan-portal/`, `quang-portal/`)
10. Build parent dashboard (`parent-quan-quang/`)
11. Add pronunciation audio upload widget
12. Add job prep progress tracker

**Phase 4 — Integration**
13. Teacher creates weekly tasks via admin or new UI
14. Students see tasks on login, log completion
15. Parents see real-time progress
16. Weekly summary email/notification

---

## 3. WHAT THIS SOLVES

From the message to the father:

| Requirement | Backend Solution |
|-------------|------------------|
| "Put pressure on them daily to do homework" | Student task view shows today's assignments; streak tracks daily completion |
| "Website where we can assign tasks each week" | `POST /api/admin/task/assign` + weekly task CRUD |
| "You'll have logins, and so will they" | Existing parent PIN + student token auth |
| "They'll be responsible for logging in the work" | `POST /api/tasks/log` — daily completion + minutes |
| "You'll be able to track exactly what they're doing" | `GET /api/parent/tasks` — daily breakdown, completion rate, streak |
| "Quang needs pronunciation practice badly" | Category = `pronunciation`; audio upload in log; drill integration |
| "Quan: LinkedIn, Facebook, CV, 3D modeling" | Category = `job-prep`, `linkedin`, `cv`, `3d-modeling` |
| "1 hour a day in making their English competitive" | Total minutes tracking across all categories |
| "I worry about AI replacing their jobs" | Structured job-prep track with measurable milestones |
| "I don't want to force them, you be good cop" | Teacher assigns + coaches; parent enforces via dashboard |

---

**Next step:** Implement Phase 1 data layer in `src/index.js` (KV helpers + week ID logic). No frontend changes until backend is live and tested.
