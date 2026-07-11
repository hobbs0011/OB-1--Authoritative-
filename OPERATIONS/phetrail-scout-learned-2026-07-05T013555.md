# PHETRAIL — Scout Learned

**Scout:** PhoenixScout  
**Timestamp:** 2026-07-05T01:32:03+07:00  
**Zone:** APPS/NET-PET-AI/public/  
**Trigger:** Art asset reconnaissance for login portals

---

## FINDINGS SUMMARY

| Priority | Count | Type |
|----------|-------|------|
| P1 | 2 | GAP |
| P2 | 3 | GAP |
| P3 | 2 | GAP/DRIFT |

**Total flagged:** 7 finds

---

## LEARNED RULES

### 1. Deactivated portals retain stale uppercase asset references
- `deactivated/quan-portal.html` references `/audio/QUAN-may26-part0.mp3` through `part4.mp3`
- `deactivated/minh-parent-portal.html` references `/audio/MINH-may26-part0.mp3` through `part4.mp3`
- **Root cause:** Content migration from uppercase MINH/QUAN folders to lowercase mai-tram/quy folders left broken references in deactivated copies
- **Future scout rule:** Always scan `deactivated/` folder for stale asset references when auditing active portals

### 2. Brand art directory has missing expected files
- `assets/brand/art/net-phoenix-logo.png` referenced in 7 HTML files but missing from disk
- `assets/brand/art/mouse-tiger-confidence.png` referenced in 3 HTML files but missing from disk
- **Root cause:** HTML pages were created referencing brand art that was never added to the assets directory
- **Future scout rule:** When scanning for GAPs, cross-check `assets/brand/art/` existence against all HTML references

### 3. Orphan asset directories accumulate when content is removed
- `assessment-assets/dossier/` contains 10 webp files never referenced in any HTML/CSS/JS
- `assets/audio/minh/` contains 2 m4a files never referenced in any HTML/CSS/JS
- **Root cause:** Assets were generated or extracted but never wired into active pages, or were removed from pages but left on disk
- **Future scout rule:** After identifying all references, invert the check: list all asset files and flag any not found in references as ORPHAN

### 4. External art CDN dependencies create single points of failure
- `magic-chat.html` depends on `https://net-art-arsenal.pages.dev/` for mode icons and tiger portrait
- **Root cause:** External CDN used for art assets instead of local `/isolated/` or `/icons/` copies
- **Future scout rule:** Flag any `http://` or `https://` asset URLs in HTML/CSS as potential DRIFT/GAP unless explicitly documented as permanent external dependency

---

## SCOUT ROLE UPGRADE

PhoenixScout now includes these lenses for art asset audits:

| Lens | New Rule |
|------|----------|
| GAP | Scan `deactivated/` for stale uppercase audio references |
| GAP | Cross-check `assets/brand/art/` existence against HTML references |
| GAP | Invert check: flag unreferenced files in asset directories as ORPHAN |
| DRIFT | Flag external `http(s)://` asset URLs as potential single-point failures |

---

**END PHETRAIL**
