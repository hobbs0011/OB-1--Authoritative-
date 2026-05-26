# Google Drive Mirror Sync Plan
**User:** mrmichaelhobbs123@gmail.com  
**Source:** D:\OB-1 (19,577 files, 6.69 GB)  
**Target:** Google Drive / OB-1-Mirror/  
**Date:** 2026-04-20

---

## DIRECTORY STRUCTURE (Google Drive)

```
OB-1-Mirror/
├── PROJECT-CORE/
│   ├── CANON/              (Soul DNA Bible, records, proofs)
│   ├── APPS/               (NET-PET-AI production)
│   ├── OPERATIONS/         (Operational docs)
│   ├── SCRIPTS/            (Automation)
│   └── .github/            (CI/CD configs)
│
├── DOCUMENTATION/
│   └── [All .md files - 4,470 files]
│
├── SOURCE-CODE/
│   ├── .js files
│   ├── .ts files
│   ├── .py files
│   ├── .json configs
│   └── .toml configs
│
├── HIGH-VALUE-BACKUPS/
│   ├── PDF reports
│   ├── SQLite databases
│   └── Roblox projects
│
└── PERSONAL-MEDIA/ (Optional)
    ├── Vietnamese-Audios/
    └── Images/
```

---

## FILES TO MIRROR (Priority Order)

### CRITICAL (Sync First)
- **HIGH-VALUE-BACKUPS:** 27 files (.pdf, .sqlite, .rbxl)
- **PROJECT-CORE/CANON:** ~1,500 files (Soul DNA Bible, system records)
- **APPS/NET-PET-AI:** ~800 files (production code)

### HIGH PRIORITY
- **DOCUMENTATION:** 4,470 .md files
- **SOURCE-CODE:** 580 code files (.js/.ts/.py)

### OPTIONAL
- **PERSONAL-MEDIA:** 848 audio/image files (separate personal backup)

---

## FILES TO EXCLUDE

- `.git/` — 7,805 files (can clone from repo)
- `node_modules/` — 5,000+ files (npm install recreates)
- `.venv/` — 2,000+ files (pip recreates)
- `__pycache__/` — 400+ files (cache, not needed)
- `.map` files — 402 files (debug artifacts)
- `.pyc` files — 263 files (compiled cache)

**Total Excluded:** 13,500+ files (DO NOT MIRROR)

---

## SECURE FILES (LOCAL ONLY)

⚠️ **DO NOT UPLOAD TO DRIVE:**
- `d:\OB-1\.env` (API keys, secrets)
- `d:\OB-1\.env.keys` (credential backup)

**Action:** Keep these on D: only, encrypted if possible.

---

## SYNC INSTRUCTIONS

### Method 1: Manual Sync via Rclone (Recommended if installed)
```powershell
# Install rclone (if not present)
choco install rclone

# Configure Google Drive
rclone config create gdrive google

# Sync (exclude dependencies)
rclone sync d:\OB-1 gdrive:OB-1-Mirror `
  --exclude "node_modules/**" `
  --exclude ".venv/**" `
  --exclude ".git/**" `
  --exclude "**/__pycache__/**" `
  --exclude "*.map" `
  --exclude ".env" `
  --exclude ".env.keys"
```

### Method 2: Manual Backup via Robocopy (Windows Native)
```powershell
# Stage 1: Project Core
robocopy d:\OB-1\CANON "D:\TEMP-GDRIVE\OB-1-Mirror\PROJECT-CORE\CANON" /S /E /R:3

# Stage 2: Docs
robocopy d:\OB-1 "D:\TEMP-GDRIVE\OB-1-Mirror\DOCUMENTATION" /S /E /INCLUDE:*.md /R:3

# Stage 3: Code
robocopy d:\OB-1\APPS "D:\TEMP-GDRIVE\OB-1-Mirror\SOURCE-CODE" /S /E /R:3

# Then upload D:\TEMP-GDRIVE to Google Drive manually
```

### Method 3: Google Drive API Batch Upload
```python
# For larger scale automation (use gdrive-cli or gsutil)
gsutil -m cp -r d:\OB-1\CANON gs://personal-drive/OB-1-Mirror/PROJECT-CORE/
```

---

## SYNC FREQUENCY

- **CRITICAL files:** Daily backup
- **PROJECT-CORE:** Weekly backup
- **Full sync:** Monthly or as-needed

---

## VERIFICATION CHECKLIST

- [ ] All .md files in DOCUMENTATION/
- [ ] All source code in SOURCE-CODE/
- [ ] Soul DNA Bible (CANON/) complete
- [ ] High-value files (.pdf, .sqlite, .rbxl) backed up
- [ ] .env files NOT uploaded
- [ ] node_modules/ NOT uploaded
- [ ] .git/ NOT uploaded locally (clone if needed)
- [ ] Total size < 5 GB (should be ~3 GB)

---

## PERSONAL MEDIA BACKUP STRATEGY

**Vietnamese Audios & Media:** 848 files (~2 GB .aac/.m4a)

**Options:**
1. **Google Drive:** Include in same backup (easiest)
2. **Separate Folder:** Create `OB-1-Personal` folder on Drive
3. **Separate Cloud:** Use Dropbox/OneDrive for personal media only
4. **Local Archive:** Keep on external SSD only

**Current Recommendation:** Store in separate `OB-1-Personal/media` folder on Drive.

---

## AUTOMATED DAILY SYNC SETUP (Optional)

Create scheduled PowerShell task to run daily:

```powershell
# Save as d:\SCRIPTS\sync-to-gdrive-daily.ps1
$LogPath = "d:\SYNC-LOGS\gdrive-sync-$(Get-Date -Format 'yyyy-MM-dd').log"

# Use rclone or robocopy command above
rclone sync d:\OB-1 gdrive:OB-1-Mirror `
  --exclude "node_modules/**" `
  --exclude ".venv/**" `
  --exclude ".git/**" | Tee-Object $LogPath

Write-Host "Sync complete. Log: $LogPath"
```

Then schedule via Task Scheduler:
- Trigger: Daily at 02:00 AM
- Action: `powershell.exe -File d:\SCRIPTS\sync-to-gdrive-daily.ps1`
- Run with highest privileges
- Condition: Only run if plugged in

---

## STATUS

✅ **Inventory Complete:** 19,577 files scanned and categorized
✅ **Mirror Plan Ready:** 5,077 files (~3 GB) ready for sync
⏳ **Next Steps:**
  1. Choose sync method (Rclone, Robocopy, or manual)
  2. Create GDrive folder structure
  3. Execute initial sync
  4. Verify file count & integrity
  5. Set up automated daily backup

---

**Owner:** Michael Hobbs (mrmichaelhobbs123@gmail.com)  
**Created:** 2026-04-20  
**Status:** READY FOR EXECUTION
