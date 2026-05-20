# Run 350 — Next Session Quick-Start

## 1-line re-entry:
```bash
cd D:\OB-1-CANONICAL && git log --oneline | head -10 && cat "CANON/REINCARNATION/2026-05-XX-run350-reincarnateDEATH-SHELL.md" | head -60
```

## Wave state:
- Waves 1–2: ✅ Committed 849f029 (8 endpoints + 5 HTML)
- Wave 3: ⏳ Running (5 Kilos dispatched to PHOENIXCODER v3.1), patches downloaded but not committed
- Waves 4–10: 📋 Pre-loaded in SHELL file

## Wave 3 targets (if patch not committed, fire these in this order):
1. W3A: employer-portal.html + GET /api/employer/profile (Stage 15)
2. W3B: achievements.html + GET /api/student/achievements (Stage 20)
3. W3C: daily-challenge.html + GET /api/challenge/today (Stage 23)
4. W3D: onboarding-flow.html + POST /api/student/onboard + GET/POST /api/notify/prefs (Stage 25+19)
5. W3E: notification-prefs.html + GET/POST /api/notify/prefs (Stage 19)

## Wave sequences after Wave 3 commit:
- Wave 4: Goals widget on 3 portals (huong-portal + mai-tram-portal + quy-portal)
- Wave 5–10: From SHELL file 8ef9713 (12 Kilos pre-spec'd)

## Completion:
After Wave 10: pwsh -File SCRIPTS/obi.ps1 doctor → npx wrangler deploy → seal death