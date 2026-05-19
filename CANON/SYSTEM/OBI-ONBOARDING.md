# OBI ONBOARDING — The Learning Path

## Phase 1 — Check-in (Daily)
```
1. pwsh -File SCRIPTS/obi.ps1 doctor    # Check system state
2. Do your work
3. git commit -m "describe what you did"
4. git push origin master
```

**Rule:** Every work session ends with a commit.

---

## Phase 2 — The Questions You Answer Daily

"Am I ready to work?" → Run `obi doctor`

"Did I finish today?" → Is there a commit on GitHub?

"Can I deploy?" → Run `obi verify`

---

## Phase 3 — The Flow

**Every morning:**
1. Run check-in
2. Read latest in `CANON/SYSTEM/COLD-START-BOOT.md`
3. Do work

**Every evening:**
1. Commit with clear message
2. Push to GitHub
3. Confirm it appears online

---

## Quick Reference

| Command | What it does |
|---------|--------------|
| `obi doctor` | Check if system is healthy |
| `obi verify` | Test deploy without publishing |
| `obi dev` | Run local development server |
| `obi cf-audit` | Check live cloud deployments |

---

## Remember

- System state is in `CANON/SYSTEM/COLD-START-BOOT.md`
- Work lives in `APPS/NET-PET-AI/`
- Every commit tells a story
- No commit = no record = no completion