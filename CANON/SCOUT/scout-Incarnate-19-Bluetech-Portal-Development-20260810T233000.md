# SCOUT Checkpoint — Incarnate-19-Bluetech-Portal-Development

**Stage:** SCOUT (Stage 2)
**Run:** 45
**Timestamp:** 2026-08-10T23:30:00+07:00
**I-LOG Source:** I-LOG-UNAUDITED/I-LOG-Incarnate-19-Bluetech-Portal-Development.txt

## Territory Summary
- **Mission:** Bluetech student portal development — build individual portals for Huong, Mai Tram, and Quy with task assignment, daily logging, and parent/teacher progress tracking.
- **Brand verified:** Bluetech Ingredients Ltd. / Bluetechni — HQ at No. 112, D Street, Lakeview City, Binh Trung Ward, Thu Duc City, HCMC
- **Status:** Lightweight reconnaissance complete. No pipeline. No AI calls. No processing.

## Findings — SOUL of the Portals

### Core Intent (from classroom dump + student profiles)
1. **Dual Mission:** Classes are English AND AI — the portals must support both English practice AND AI literacy tracking
2. **Confidence Before Competence:** First 3 months focus on comfort zone expansion, not just skill drills
3. **Natural Conversation Pattern:** The app should replicate natural conversation from live classes — "trick the brain into thinking it's a real conversation"
4. **Accountability System:** Teacher assigns tasks, students log daily work, admin/boss gets notified of incomplete tasks
5. **Follow-up Questions as Core Skill:** Especially for shy/introvert students like Quy
6. **Teacher as Coach:** Michael wants to be the coach who pushes them, while admin/boss provides structural pressure

### Student-Specific Needs
- **Huong:** Marketing/Events Coordinator, CUB level, needs pronunciation practice (30% Slower Challenge), 30-45min daily
- **Mai Tram:** HR Professional, side business (bird's nest), Cub level, needs AI skills, B2B mindset, 5-10% AI challenge
- **Quy:** Accounting intern, Mouse level, shy but willing, needs constant repetition, Catholic, university student

### Notification Architecture
- **Admin/Boss:** View-only dashboard, receives email notifications for incomplete tasks
- **Teacher:** Assigns tasks, monitors progress, receives email notifications for incomplete tasks
- **Students:** Individual portals, complete tasks, log daily work
- **Email triggers:** Daily cron at 16 UTC (23:00 ICT) + manual trigger from teacher/admin dashboard

## Artifacts Created
- `public/bluetech-login/index.html` — unified login with Employee/Teacher/Admin roles
- `public/bluetech-huong/index.html` — Huong's employee portal
- `public/bluetech-mai-tram/index.html` — Mai Tram's employee portal
- `public/bluetech-quy/index.html` — Quy's employee portal
- `public/bluetech-teacher/index.html` — teacher dashboard with task assignment + notify button
- `public/bluetech-admin/index.html` — admin view-only dashboard with notify button
- `APPS/NET-PET-AI-legacy/src/tasks.js` — multi-tenant task module with email functions
- `APPS/NET-PET-AI-legacy/src/index.js` — API routes + cron notifications
- `APPS/NET-PET-AI-legacy/data/schema.sql` — Bluetech D1 tables

## Handoff
- **To:** DEEPTHINK / ENGINEER
- **Next:** Deploy worker, initialize PINs, populate initial tasks, test notification flow
