# FILE MOVEMENT SCRIPT & GUIDE
## Organize 140+ Files by Processing Status

**Created:** 2026-04-20  
**Target:** Complete reorganization of CANON/ directory by pipeline stage

---

## QUICK START: PowerShell Script

Run this to automatically organize all files:

```powershell
# Execute from d:\OB-1 directory
$canon = ".\CANON"

# Ensure folders exist
@("PROCESSED", "PENDING-HIGH", "PENDING-MEDIUM", "PENDING-LOW", "ARCHIVE") | ForEach-Object {
    if (-not (Test-Path "$canon\$_")) {
        New-Item -ItemType Directory -Path "$canon\$_" -Force | Out-Null
    }
}

# 1. MOVE PROCESSED FILES (38 files) → PROCESSED/
Get-ChildItem -Path "$canon\SOUL-SEGMENTS" -File | Move-Item -Destination "$canon\PROCESSED\" -Force
Get-ChildItem -Path "$canon\SOUL-DNA" -Filter "*RUN352*" -File | Move-Item -Destination "$canon\PROCESSED\" -Force
Get-ChildItem -Path "$canon\SOUL-DNA" -Filter "*RUN353*" -File | Move-Item -Destination "$canon\PROCESSED\" -Force
Get-ChildItem -Path "$canon" -Filter "*RUN359*" -File | Move-Item -Destination "$canon\PROCESSED\" -Force
Get-ChildItem -Path "$canon" -Filter "*RUN345*" -File | Move-Item -Destination "$canon\PROCESSED\" -Force
Get-ChildItem -Path "$canon\KEYWORDS" -Filter "*FILE00*" -File | Move-Item -Destination "$canon\PROCESSED\" -Force
Get-ChildItem -Path "$canon\STARMAP" -Filter "*FILE00*" -File | Move-Item -Destination "$canon\PROCESSED\" -Force

# 2. MOVE PENDING-HIGH FILES (45 files) → PENDING-HIGH/
# SOUL DNA BIBLE CHAPTERS
@(1..32) | ForEach-Object {
    $num = $_ -as [string]
    if ($num.Length -eq 1) { $num = "0$num" }
    Get-ChildItem -Path "$canon\SOUL-DNA-BIBLE" -Filter "*${num}_*.md" -File | Move-Item -Destination "$canon\PENDING-HIGH\" -Force
}
# Additional BIBLE files
Get-ChildItem -Path "$canon\SOUL-DNA-BIBLE" -Filter "APPENDIX*" -File | Move-Item -Destination "$canon\PENDING-HIGH\" -Force
Get-ChildItem -Path "$canon\SOUL-DNA-BIBLE" -Filter "THE_SEAL*" -File | Move-Item -Destination "$canon\PENDING-HIGH\" -Force

# NotebookLM Dumps
Get-ChildItem -Path "$canon" -Filter "*NOTEBOOKLM*" -File | Move-Item -Destination "$canon\PENDING-HIGH\" -Force

# VAULT-A & VAULT-B
Get-ChildItem -Path "$canon" -Filter "*VAULT-A*" -File | Move-Item -Destination "$canon\PENDING-HIGH\" -Force
Get-ChildItem -Path "$canon" -Filter "*VAULT-B*" -File | Move-Item -Destination "$canon\PENDING-HIGH\" -Force

# 3. MOVE PENDING-MEDIUM FILES (24 files) → PENDING-MEDIUM/
# VAULT-D, E, I, L (first batch)
Get-ChildItem -Path "$canon" -Filter "*VAULT-D*" -File | Move-Item -Destination "$canon\PENDING-MEDIUM\" -Force
Get-ChildItem -Path "$canon" -Filter "*VAULT-E*" -File | Move-Item -Destination "$canon\PENDING-MEDIUM\" -Force
Get-ChildItem -Path "$canon" -Filter "*GOSPEL-444*" -File | Move-Item -Destination "$canon\PENDING-MEDIUM\" -Force

# Architecture & System Docs
@(
    "CORE-PRINCIPLES-AND-PHYSICS.md",
    "NET-WEB-ARCHITECTURE-2026.md",
    "NET-TEACHING-BIBLE-MONOLITH-V1-UNIQUE-SIGNAL.md",
    "A5-RAW-SOUL-DNA-DICTATION-GEMINI-SESSIONS.md",
    "ALPHA-OMEGA-SOUL-DNA-GOVERNANCE-CANON.md",
    "PHOENIX-SOUL-DNA-COMPREHENSIVE-VERBATIM.md"
) | ForEach-Object {
    Move-Item -Path "$canon\$_" -Destination "$canon\PENDING-MEDIUM\" -Force -ErrorAction SilentlyContinue
}

# NET Teaching
@(
    "NET-MARKET-BIBLE-V1.md",
    "NET-EPIC-LESSON-BLUEPRINT-V3.md",
    "NET-TEACHING-METHODOLOGY.md",
    "NET-STAGE-4-TEACHING-METHODOLOGY-RAW-DUMP.md",
    "STUDENT-ARCHETYPES-TEACHING-DATABASE.md"
) | ForEach-Object {
    Move-Item -Path "$canon\$_" -Destination "$canon\PENDING-MEDIUM\" -Force -ErrorAction SilentlyContinue
}

# 4. MOVE PENDING-LOW FILES (29 files) → PENDING-LOW/
# Remaining VAULT files
Get-ChildItem -Path "$canon" -Filter "*VAULT-I*" -File | Move-Item -Destination "$canon\PENDING-LOW\" -Force
Get-ChildItem -Path "$canon" -Filter "*VAULT-L*" -File | Move-Item -Destination "$canon\PENDING-LOW\" -Force
Get-ChildItem -Path "$canon" -Filter "*VAULT-MM*" -File | Move-Item -Destination "$canon\PENDING-LOW\" -Force

# BlueTech Training
@(
    "DEC-6-2025-BLUETECH-BEGINNER-CLASS-RAW-TRANSCRIPT.md",
    "NOV-8-2025-BLUETECH-MEETING-NOTES-EXTRACTION.md",
    "SOUL-DNA-BIBLE-A4-RAW-CLASSROOM-MAI-TRAM-2026-03-24.md",
    "BLUETECH-NETWORKING-DINNER-TEAM-BUILDING-EXTRACTION.md",
    "RAW-GEMINI-DENNY-PHONICS-ANCHOR-PRINCIPLE-ORIGIN.md"
) | ForEach-Object {
    Move-Item -Path "$canon\$_" -Destination "$canon\PENDING-LOW\" -Force -ErrorAction SilentlyContinue
}

# Cloudflare
@(
    "CLOUDFLARE-ECOSYSTEM-MAP-2026.md",
    "CLOUDFLARE-VS-FIREBASE-VERDICT-2026.md"
) | ForEach-Object {
    Move-Item -Path "$canon\$_" -Destination "$canon\PENDING-LOW\" -Force -ErrorAction SilentlyContinue
}

# Misc references
@(
    "CONSOLIDATED-TRIGGER-DAY0-TASKS.md",
    "CONSOLIDATION-OPERATIONAL-FRAMEWORK.md",
    "CONNECTIVITY-MAP-DYNAMIC.md",
    "CONNECTIVITY-MAP-WHAT-FIRST.md",
    "FIREBASE-CHROME-EXTENSION-CONSOLIDATION.md",
    "INTEGRATION-QUICKSTART-RUN352.md",
    "LAUNCH-PLAYBOOK-MASTER.md",
    "MAGIC-CHAT-CONSOLIDATED.md",
    "MAGIC-CHAT-SOUL-DNA-VERBATIM.md",
    "NET-MARKETING-CANON-DUMP-2026-03-30.md",
    "NET-PET-AI-INTELLIGENCE-BRIEF.md",
    "MMS-MICHAEL-MERKLE-SWAG-MARKETING-V1.md",
    "DRONE-14-CLOUDFLARE-ECOSYSTEM-MAP.md",
    "CHROME-TOOLSTACK-OBI-MAGIC-CHAT-FREE-PLAN.md",
    "THE-TRANSLATION-LAYER-MASTER-PASSAGE-RUN352.md",
    "TOOL-STACK-ARSENAL-2026.md",
    "OBI-CHROME-EXTENSION-TURNKEY-DEV-REFERENCE.md"
) | ForEach-Object {
    Move-Item -Path "$canon\$_" -Destination "$canon\PENDING-LOW\" -Force -ErrorAction SilentlyContinue
}

# 5. MOVE ARCHIVE FILES (70+ files) → ARCHIVE/
# Completion certificates & reports
Get-ChildItem -Path "$canon\COMPLETION-CERTIFICATES" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force

# Session records
Get-ChildItem -Path "$canon\SESSION-RECORDS" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "$canon\EXECUTION" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "$canon\REINCARNATION" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force -ErrorAction SilentlyContinue

# Heavy ledger indexes
Get-ChildItem -Path "$canon\HEAVY-LEDGER" -Filter "BIBLE*" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force
Get-ChildItem -Path "$canon\HEAVY-LEDGER" -Filter "*UNIVERSAL-LEDGER*" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force

# Keyword registry archive
Get-ChildItem -Path "$canon\HEAVY-LEDGER\KEYWORD_REGISTRY_ARCHIVE" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force

# Vault audit dumps
Get-ChildItem -Path "$canon" -Filter "*VAULT-MONOLITH*" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force
Get-ChildItem -Path "$canon" -Filter "*VAULT-VAULT*" -File | Move-Item -Destination "$canon\ARCHIVE\" -Force

# Print completion summary
Write-Host "`n✅ FILE MOVEMENT COMPLETE"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

@("PROCESSED", "PENDING-HIGH", "PENDING-MEDIUM", "PENDING-LOW", "ARCHIVE") | ForEach-Object {
    $count = (Get-ChildItem -Path "$canon\$_" -File).Count
    Write-Host "$_ : $count files"
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n"
```

---

## MANUAL VERIFICATION CHECKLIST

After running the script, verify each folder:

### ✅ PROCESSED/ (Should contain 38 files)
```
☐ SOUL-SEGMENTS/ (20 files: SEGMENT-01 through SEGMENT-20)
☐ RUN359-SOULDNA-SEGMENTS-01-20-KEYWORDS.md
☐ HEAVY-LEDGER-RUN359-SOUL-SEGMENTS-01-20.json
☐ STARMAP-RUN359-SOUL-SEGMENTS-01-20.md
☐ RUN359-CROSS-REFERENCE-AUDIT.md
☐ RUN359-EXECUTION-STATE.json
☐ RUN359-STAGE5-SSM-LAWS-EXTRACTED.md
☐ RUN359-STAGE6-AUDIT-DEVIL-ADVOCATE.md
☐ RUN359-STAGE7-PHEROMONE-TRAILS.md
☐ RUN359-STAGE8-MACHINE-VERIFICATION.md
☐ RUN359-STAGE9-FINALIZATION.md
☐ RUN352 Artifacts (3 files)
☐ RUN353 Artifacts (3 files)
☐ RUN345 Keywords (15 files)
☐ RUN345 Starmaps (14 files)
```

### 🔴 PENDING-HIGH/ (Should contain 45 files)
```
☐ SOUL DNA BIBLE CHAPTERS Ch01-32 (32 files + 3 reference)
☐ NotebookLM Dumps (6 files)
☐ VAULT-A Consolidations (2 files)
☐ VAULT-B Consolidations (2 files)
```

### 🟡 PENDING-MEDIUM/ (Should contain 24 files)
```
☐ VAULT-D Prelaunch (3 files)
☐ VAULT-E Soul DNA (2 files)
☐ VAULT-I Immortalize (1 file)
☐ VAULT-L Live Classes (initial 2 files)
☐ Gospel 444 References (3 files)
☐ Architecture & System Docs (6 files)
☐ NET Teaching & Product (5 files)
```

### 🟢 PENDING-LOW/ (Should contain 29 files)
```
☐ Remaining VAULT files (6 files: I, L, MM)
☐ BlueTech Training Sessions (5 files)
☐ Cloudflare & Infrastructure (2 files)
☐ Miscellaneous References (16+ files)
```

### 📦 ARCHIVE/ (Should contain 70+ files)
```
☐ Completion Records (12 files)
☐ Session & Execution Records (10+ files)
☐ Bible Indexes (15+ files)
☐ Keyword Registry Archive (8+ files)
☐ Vault Audit Dumps (25+ files)
```

---

## FILE DISTRIBUTION BY SECTION

| Folder | Source Sections | File Count | Execution Time |
|--------|-----------------|-----------|-----------------|
| **PROCESSED** | SOUL-SEGMENTS, RUN352-353, RUN345, RUN359 | 38 | ✅ Complete |
| **PENDING-HIGH** | SOUL DNA BIBLE 01-32, NotebookLM 1/2/6, VAULT-A/B | 45 | 🔴 Priority Batch 1 |
| **PENDING-MEDIUM** | VAULT-D/E/I/L, Gospel 444, Arch, NET Teaching | 24 | 🟡 Priority Batch 2 |
| **PENDING-LOW** | VAULT remaining, BlueTech, Cloudflare, Misc | 29 | 🟢 Priority Batch 3 |
| **ARCHIVE** | Completion, Session, Indexes, Registry, Audits | 70+ | 📦 Reference |

---

## NEXT EXECUTION STEPS

**Immediately after moving files:**

1. **Verify directory structure:**
   ```powershell
   cd d:\OB-1\CANON
   ls -Directory | select Name, @{n='Files';e={(ls $_ -File).Count}}
   ```

2. **Generate pipeline report:**
   - Create RUN360-FILE-ORGANIZATION-COMPLETE.md
   - Log file movements (source → destination, timestamp)
   - Verify all 38 processed files landed correctly

3. **Begin Phase 1 processing:**
   - Extract Keywords from PENDING-HIGH batch (21 files: BIBLE 01-14, NOTEBOOKLM 1/2/6, VAULT-A/B)
   - Generate Heavy Ledger findings
   - Extract SSM Laws
   - Create Starmaps

4. **Update master state:**
   - Append to COLD-START-BOOT.md: File organization completed, timestamp
   - Create progress tracker for Phase 1

---

## TROUBLESHOOTING

**If files don't move:**
- Check path separators (use `\` not `/`)
- Verify source directories exist before moving
- Check file locks (close any open in editors)
- Run PowerShell as Administrator

**If file count doesn't match:**
- Search for missed files: `Get-ChildItem -Recurse -Filter "*.md"`
- Check for hidden files: `ls -File -Hidden`
- Verify against MASTER-PIPELINE-INVENTORY-COMPLETE.md

**Partial move recovery:**
```powershell
# If interrupted, restart from last known state
# Check which folders are complete
ls -Directory | % { "$($_.Name): $(((ls $_ -File).Count)) files" }
```

---

**Status:** Script ready. Execute when ready.
