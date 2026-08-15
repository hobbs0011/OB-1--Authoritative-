# REINCARNATE DEATH SEAL — Incarnate-22-Student-Portals-Ngueyen&Blueteach

## §1 — Header
- Session: Incarnate-22-Student-Portals-Ngueyen&Blueteach
- Run: 22
- Roman Role: ENGINEER (Consolidation)
- Branch: canon
- Timestamp: 2026-08-11T04:25:37+07:00
- Seal: IMPRESSED

## §2 — Mission
Consolidate all student portal implementations (OKTAVA, CASA, Nguyen Family, Bluetech) under a single unified prototype. Scout existing portal artifacts, identify common patterns, and build one reusable portal framework with theme-based branding.

## §3 — Artifacts Produced
- `public/student-portal/index.html` — Unified login router
- `public/student-portal/app.html` — Unified portal dashboard
- `public/student-portal/assets/css/theme.css` — Theme system (4 brands)
- `public/student-portal/assets/css/site.css` — Shared component styles
- `public/student-portal/assets/js/app.js` — Unified portal logic
- `I-LOG-UNAUDITED/I-LOG-Incarnate-22-Student-Portals-Ngueyen-Blueteach.txt` — Session log

## §4 — Audit Results

### Scouted Portals
| Portal | Path | Status |
|--------|------|--------|
| Oktava | `public/oktava-login/` | ✅ Audited |
| CASA | `public/casa-login/` | ✅ Audited |
| CASA Parent | `public/casa-parent-portal/` | ✅ Audited |
| Nguyen Login | `public/nguyen-login/` | ✅ Audited |
| Nguyen Parent | `public/nguyen-parent/` | ✅ Audited |
| Nguyen Parent DB | `public/nguyen-parent-dashboard/` | ✅ Audited |
| Nguyen Quang | `public/nguyen-quang/` | ✅ Audited |
| Nguyen Quan | `public/nguyen-quan/` | ✅ Audited |
| Bluetech Login | `public/bluetech-login/` | ✅ Audited |
| Bluetech Huong | `public/bluetech-huong/` | ✅ Audited |
| Bluetech Mai Tram | `public/bluetech-mai-tram/` | ✅ Audited |
| Bluetech Quy | `public/bluetech-quy/` | ✅ Audited |
| Legacy NET-PET-AI | `APPS/NET-PET-AI-legacy/public/` | ✅ Audited |

### Unified Prototype Structure
```
public/student-portal/
├── index.html          # Unified login (portal=query param)
├── app.html            # Unified dashboard
├── assets/
│   ├── css/
│   │   ├── theme.css   # 4-brand theme system
│   │   └── site.css    # Shared components
│   └── js/
│       └── app.js      # Unified logic
```

### Theme System
| Theme | Colors | Fonts | Brand |
|-------|--------|-------|-------|
| casa | Purple/Gold | Orbitron/Rajdhani | CASA English |
| oktava | Purple/Gold | Orbitron/Rajdhani | Oktava |
| bluetech | Blue/Cyan | Outfit/Inter | Bluetech |
| nguyen | Gold/Wood | Playfair/Inter | Nguyen Family |

## §5 — Decisions
1. **Single entry point:** `index.html` routes all brands via `?portal=` query param
2. **Theme CSS variables:** Brand switching via `data-theme` attribute, no JS logic changes needed
3. **Legacy preservation:** Old portals remain functional; new unified portal is opt-in
4. **Shared APIs:** `/api/tasks/current`, `/api/tasks/log`, `/api/practice` used across all brands
5. **Component reuse:** Task list, daily log, progress bars are brand-agnostic

## §6 — Corrections
- None — first consolidation pass

## §7 — Gaps
| Gap | Severity | Next Action |
|-----|----------|-------------|
| Parent dashboards not wired to unified portal | P2 | Add parent views to app.html |
| Bluetech teacher/admin views missing | P2 | Add role-based views |
| Nguyen Quang/Quan portals still separate | P3 | Migrate to unified portal |
| Legacy portal cleanup pending | P3 | Remove duplicates after migration |

## §8 — Handoff
- To: Incarnate-23 (next RISE)
- Prior: Incarnate-21 (last death)
- Next inherits:
  - Unified portal prototype at `public/student-portal/`
  - 4-brand theme system
  - Shared task/practice API integration
  - Scout data from 12+ portal implementations

## §9 — Status
- ENGINEERING_COMPLETE
- Seal status: IMPRESSED
- Unified prototype built and documented
- Ready for testing and migration
- **Re-sealed by /reincarnateDEATH command on 2026-08-11T04:25:37+07:00**
