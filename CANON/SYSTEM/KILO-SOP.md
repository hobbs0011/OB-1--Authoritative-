# KILO STANDARD OPERATING PROCEDURE
**Version:** 1.0 | **Date:** 2026-05-20 | **Owner:** OB-1 / Michael Hobbs

This file is the canonical brief template used by BOTH:
- OB-1 when dispatching Kilo as a subagent
- Michael when briefing Kilo directly in chat

They are the same. One standard. Zero drift.

---

## THE GOLDEN RULE

**Every Kilo task must end with a GitHub commit SHA.**  
No SHA = task did not happen.

---

## STANDARD BRIEF TEMPLATE

Copy this block. Fill in the CAPS sections. Delete unused sections.

```
You are Kilo — senior fullstack engineer. Cloudflare Workers specialist.
OB-1 project. Windows dev environment (PowerShell 7+, not bash).

REPO: D:\OB-1-CANONICAL (master branch)
WORKER: https://net-pet-ai.mrmichaelhobbs123.workers.dev
WORKER SOURCE: APPS/NET-PET-AI/src/index.js
PUBLIC: APPS/NET-PET-AI/public/

TASK:
[DESCRIBE WHAT TO BUILD. BE SPECIFIC. INCLUDE FILE PATHS.]

DESIGN SYSTEM (non-negotiable — match exactly):
--void:#0a0a12  --card:rgba(22,22,35,0.85)  --purple:#a855f7
--gold:#f59e0b  --teal:#14b8a6  --text:#f8fafc  --dim:#94a3b8
--success:#22c55e  --border:rgba(255,255,255,0.08)
Fonts: Inter + Orbitron (Google Fonts only)
No jQuery. No external JS libs. No .html on internal hrefs.
Mobile responsive. 44px min-height touch targets.

[IF MODIFYING index.js:]
Read index.js before editing.
Insert new route BEFORE the 404 catch-all (last ~10 lines of the fetch handler).
Insert new handler BEFORE the anti-cheat section (~line 647).
Run: node --check APPS/NET-PET-AI/src/index.js

[IF NEW HTML PAGE:]
No .html on internal hrefs.
Use glassmorphism cards (backdrop-filter blur(20px), 1px solid var(--border)).
Fetch APIs after DOMContentLoaded. Graceful empty states — never crash on 404.

COMMIT REQUIREMENTS:
1. git pull origin master BEFORE any edit (prevents stale HEAD)
2. git add [specific files — never git add -A]
3. git commit -m "feat: [what was built] — [Run N]"
4. git push origin master
5. Output the commit SHA.

CONSTRAINTS:
- PowerShell syntax for any shell operations (not bash)
- CLOUDFLARE_API_TOKEN must be UNSET before npx wrangler deploy:
  Remove-Item Env:CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue
- Never deploy without explicit "deploy" instruction in the task
- No Notion (permanently blacklisted)
```

---

## DESIGN SYSTEM CONSTANTS (copy-paste ready)

```css
:root {
  --void: #0a0a12;
  --card: rgba(22, 22, 35, 0.85);
  --purple: #a855f7;
  --purple-glow: rgba(168, 85, 247, 0.25);
  --gold: #f59e0b;
  --gold-glow: rgba(245, 158, 11, 0.25);
  --teal: #14b8a6;
  --text: #f8fafc;
  --dim: #94a3b8;
  --success: #22c55e;
  --border: rgba(255, 255, 255, 0.08);
}
```

Fonts import (always include):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Standard glass card:
```css
.content-card {
  background: var(--card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
}
```

---

## INDEX.JS INSERTION MAP (current as of Run 353)

```
Line ~647  → anticheat routes block
Line ~655  → waitlist routes block
Line ~660  → end of route list (INSERT NEW ROUTES HERE — before 404)
Line ~665  → 404 catch-all return

Handler sections (INSERT NEW HANDLERS HERE — before anti-cheat):
Line ~720  → anti-cheat handlers
```

Route template (copy-paste):
```js
if (path === "/api/YOUR_PATH" && method === "GET") { return handleYourPath(url.searchParams.get("studentId") || "", env); }
if (path === "/api/YOUR_PATH" && method === "POST") { const body = await request.json(); return handleYourPath(body, env); }
```

---

## ACTIVE API ENDPOINTS (as of Run 353)

**Students:**
- GET /api/student/state?studentId=X → {tier, score, label}
- GET /api/student/streak?studentId=X → {currentStreak, longestStreak, totalDays, lastCheckin}
- GET /api/student/forecast?studentId=X → {masteredWords, velocity, projectedDays, graduationDate}
- GET /api/student/goals?studentId=X → {targetLevel, dailyMinutes, deadline, onTrack}
- POST /api/student/goals → save goals
- POST /api/student/checkin → {studentId}
- POST /api/student/saveface → face-saving streak recovery
- GET /api/student/achievements?studentId=X → {unlocked[], progress{}}
- POST /api/student/onboard → orchestrates first-session

**Vocab/SRS:**
- GET /api/vocab/due?studentId=X → due cards
- POST /api/vocab/review → SM-2 review
- GET /api/vocab/list?studentId=X → all cards
- POST /api/vocab/add → {studentId, word, translation, example}
- DELETE /api/vocab/delete?studentId=X&vocabId=Y

**Voice:**
- POST /api/voice/score → {studentId, word, audioBase64}

**Leaderboard/Social:**
- GET /api/leaderboard → top students
- POST /api/referral/register → {code, studentId}
- POST /api/referral/convert → {code}
- GET /api/referral/stats → {totalCodes, attributedSignups, topReferrers}

**Admin:**
- GET /api/admin/stats → platform metrics
- GET /api/admin/subscriptions → all payment records
- POST /api/admin/subscription/cancel → {txnId}

**Payments:**
- POST /api/payment/confirm → {studentId, plan, amountVND, txnId, confirmedBy}

**Employer:**
- GET /api/employer/profile?code=X&pinHash=Y → {companyName, students[]}
- POST /api/employer/create → {companyName, code, pin, students[]}

**Anti-cheat:**
- POST /api/anticheat/score → {studentId, tabHiddenRatio, interactionCount, seekCount}
- GET /api/anticheat/history/:studentId

**Waitlist:**
- POST /api/waitlist → {name, email, phone, jobCategory, level, referralSource}
- GET /api/waitlist/count → {count}
- GET /api/waitlist/list → last 50 entries

**Daily Challenge:**
- GET /api/challenge/today → {questionId, question, type, options, hint, level}
- POST /api/challenge/answer → {questionId, answer}

**Notifications:**
- GET/POST /api/notify/prefs → {studentId, zaloPhone, email, preferredTime, language}
- POST /api/notify/send → {to, subject, html, studentId}
- GET /api/notify/digest?studentId=X → compiled weekly digest HTML

**Magic Chat:**
- POST /api/magic-chat → {message, studentId} → Obi AI response

**Phoenix Coder proxy:**
- POST/GET /api/pc/queue → proxy to phoenix-coder worker

---

## STUDENT ROSTER (current)

| studentId | Portal | Name |
|-----------|--------|------|
| huong-bluetech | /huong-portal | Huong Nguyen |
| mai-tram-bluetech | /mai-tram-portal | Mai Tram |
| quy-bluetech | /quy-portal | Quy Nguyen |
| lam-bluetech | /lam-portal | Lam |
| quan-bluetech | /quan-portal | Quan |
| quang-bluetech | /quang-portal | Quang |
| minh-private | /minh-parent-portal | Minh (parent) |

Portal URL map for onboarding redirects:
```js
const PORTAL_MAP = {
  "huong-bluetech": "/huong-portal",
  "mai-tram-bluetech": "/mai-tram-portal",
  "quy-bluetech": "/quy-portal",
  "lam-bluetech": "/lam-portal",
  "quan-bluetech": "/quan-portal",
  "quang-bluetech": "/quang-portal",
};
```

---

## KV KEY REGISTRY (reserved — do not reuse)

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `goals:{studentId}` | Student goals | permanent |
| `notify:{studentId}` | Notification prefs | permanent |
| `anticheat:{studentId}:{date}` | Anti-cheat sessions | 30 days |
| `challenge:{YYYY-MM-DD}` | Daily challenge cache | 24h |
| `achievements:{studentId}` | Achievement cache | 1h |
| `onboard:{studentId}` | Onboarding complete flag | permanent |
| `employer:{code}` | Employer account | permanent |
| `employer:index` | Employer code list | permanent |
| `payment:{txnId}` | Payment record | 365 days |
| `payment:index` | Payment list | permanent |
| `waitlist:entry:{id}` | Waitlist entry | 365 days |
| `waitlist:index` | Waitlist list | permanent |
| `ref:{code}` | Referral code | permanent |
| `subscription:{studentId}` | Active subscription | permanent |
| `testimonial:pending:{ts}` | Pending testimonial | permanent |
| `testimonial:approved:index` | Approved testimonials | permanent |
| `notify:sent:{studentId}:{ts}` | Sent notification log | 7 days |

---

## COMMON FAILURE MODES (learn from these)

| Failure | Cause | Fix |
|---------|-------|-----|
| `cat <<'EOF'` fails | Bash syntax in PowerShell | Use `Set-Content` or `@'...'@` heredoc |
| Stale HEAD conflict | Didn't pull before editing | Always `git pull origin master` first |
| Wave 3 uncommitted | PC returned patch, Kilo never wrote to file | Verify file was written before committing |
| index.js full rewrite → garbled | PC returned 870 lines, context cut | Use `diffMode: true` in PC call for large files |
| `curl -d @-` fails | Pipe stdin in PowerShell doesn't work | Use `-d @"path\to\file.json"` |
| 404 on deployed route | Route inserted after catch-all | Always insert BEFORE the 404 return line |
| `.html` in href | Cloudflare strips extensions | Never use .html on internal links |

---

## PHOENIX CODER CALL TEMPLATE

```powershell
# Full file mode (new files or small files <200 lines)
$body = @{
  task    = "TASK DESCRIPTION"
  context = "FILE CONTENT OR RELEVANT EXCERPT"
  targetfile = "D:\OB-1-CANONICAL\APPS\NET-PET-AI\public\filename.html"
  maxTokens = 8192
  skipVerify = $false
} | ConvertTo-Json -Compress

$result = Invoke-RestMethod `
  -Uri "https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

$result.code_patch | Set-Content -Path "D:\OB-1-CANONICAL\APPS\NET-PET-AI\public\filename.html" -Encoding UTF8
Write-Host "D1: $($result.d1_row_id) | Mode: $($result.mode)"
```

```powershell
# Diff mode (existing large files — index.js, large portals)
$fileContent = Get-Content "D:\OB-1-CANONICAL\APPS\NET-PET-AI\src\index.js" -Raw
$body = @{
  task      = "DESCRIBE THE CHANGE — what route/handler to add"
  context   = $fileContent
  targetfile = "APPS/NET-PET-AI/src/index.js"
  diffMode  = $true
  maxTokens = 4096
} | ConvertTo-Json -Compress -Depth 5

$result = Invoke-RestMethod `
  -Uri "https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/code" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# result.code_patch contains <<<PATCH>>> blocks — apply manually or via script
Write-Host $result.code_patch
```

---

## DEPLOY SEQUENCE (always in this order)

```powershell
# 1. Unset token (hard rule — Run 308/312)
Remove-Item Env:CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue

# 2. Verify it's gone
Write-Host "TOKEN_UNSET: $($null -eq $env:CLOUDFLARE_API_TOKEN)"

# 3. Deploy
Set-Location D:\OB-1-CANONICAL\APPS\NET-PET-AI
npx wrangler deploy

# 4. Note the Version ID from output
```

---

## DEATH SEAL SEQUENCE (end of every run)

```
1. git log --oneline -3         ← get final commit SHAs
2. Write CANON/REINCARNATION/2026-MM-DD-runNNN-reincarnateDEATH.md
3. Update CANON/REINCARNATION/REINCARNATION-LOG.md (prepend new run entry)
4. Update CANON/SYSTEM/COLD-START-BOOT.md (Last Updated, HEAD, FINGERPRINT)
5. git add [3 files] && git commit && git push
6. Output final SHA
```

---

*This SOP is the source of truth. If your Kilo session or OB-1 subagent deviates from it, the SOP wins.*
