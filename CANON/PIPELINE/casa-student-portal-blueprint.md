# Blueprint: CASA Student Login Portal — Sample for Anh Bảo

**Date:** 2026-08-09  
**Author:** Incarnate-17 (CASA portal development)  
**Status:** SAMPLE — ready for Anh Bảo review  
**Live preview:** `public/casa-login/index.html`

---

## What This Is

A **working demo** of the student-facing login portal for CASA English. Not the full production system — a polished, interactive sample Anh Bảo can open in a browser and interact with. Shows the look, flow, and brand before any backend is built.

---

## Files

| File | Purpose |
|------|---------|
| `public/casa-login/index.html` | Student login page — student code + password |
| `public/casa-login/dashboard.html` | Student dashboard — schedule, progress, materials |
| `CANON/PIPELINE/casa-student-portal-blueprint.md` | This document |

---

## Brand

- **Name:** CASA English  
- **Methodology:** Natural English Training (KISS, Two Brains, Active Listening)  
- **Palette:** void `#0f0f1a` | soul purple `#a855f7` | imperial gold `#f59e0b`  
- **Fonts:** Orbitron (headings) + Rajdhani (body)  
- **Rule:** ZERO BLUE. No blue anywhere in the system.

---

## Login Flow

1. Student opens `index.html`
2. Enters student code + password
3. Demo credentials pre-filled in hint box:
   - Code: `CASA-2026-001`
   - Password: `CASA2026`
4. On success → redirects to `dashboard.html?student=CASA-2026-001&name=Student`
5. Dashboard renders personalized welcome + schedule + progress + materials

---

## Dashboard Sections

| Section | Content |
|---------|---------|
| **Welcome Banner** | Personalized greeting, methodology tagline |
| **This Week** | Class schedule (Tue/Thu/Sat) with status chips |
| **Progress** | Course completion % + speaking confidence level |
| **Materials** | Sample lesson links (audio, worksheet, video) |

---

## How to Show Anh Bảo

1. Open `public/casa-login/index.html` in any browser
2. Enter demo credentials: `CASA-2026-001` / `CASA2026`
3. Walk through the dashboard with him
4. Collect his feedback on:
   - Schedule layout (current: Tue 7:00–8:45, Thu 7:00–8:45, Sat 9:15–11:00)
   - Progress tracking visuals
   - Material presentation
   - Any additional sections he wants

---

## Next Steps After Approval

| Step | Owner | Notes |
|------|-------|-------|
| Backend auth | Workhorse | Student codes + hashed passwords in D1/KV |
| Real schedule | Workhorse | Pull from CASA timetable, not hardcoded |
| Material upload | Workhorse | Admin panel for Hobbs to upload PDF/audio/video |
| Progress tracking | Workhorse | Real lesson completion + confidence scoring |
| Deploy | Workhorse | `npx wrangler pages project create casa-student-portal` |

---

## Design Constraints

- No blue anywhere
- Dark glass luxury aesthetic
- Purple neon edge glow + gold accents
- Big typography, minimal clutter
- Mobile responsive (tested at 375px)

---

Built per Incarnate-16 handoff: "Next session can focus on curriculum implementation."  
This is the curriculum-facing portal layer — students see NATURAL ENGLISH TRAINING, never Phoenix Rising.
