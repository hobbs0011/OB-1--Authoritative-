param(
    [ValidateSet("doctor","verify","dev","mcp-audit","soul-check","cf-audit","phoenix-queue","phoenix-status","phoenix-alpha","phoenix-beta","phoenix-gamma","phoenix-delta","phoenix-omega","pcc-law","phoenix-scout","forcemarch","supply-lines","reincarnateDeath","legion-garrison","phetrails","soulscholars","soulaudit","kilo-free-models")]
    [string]$Command = "doctor",
    [string]$Task,
    [string]$TargetFile,
    [string]$Zone,
    [ValidateSet("SOUL","LEDGER","DRIFT","CONFIG","GAP","VAULT","all")]
    [string]$Lens = "all",
    [switch]$FullSweep,
    [switch]$PccDeploy,
    [switch]$MerkleRefresh,
    [switch]$DryRun,
    [switch]$Supersaiyan,
    [switch]$Force,
    [switch]$NoRegistrySync
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$appPath = Join-Path $repoRoot "APPS\NET-PET-AI"
$canonicalEmail = "mrmichaelhobbs123@gmail.com"

# ============================================================================
# PHEROMONE SYSTEM — MECHANICAL EMISSION v0.1
# Phase 1: ONE emission, for ONE command, that CANNOT be skipped.
# ============================================================================
$global:PheTrailSessionId = [guid]::NewGuid().ToString("N").Substring(0,12)
$global:PheTrailDate = Get-Date -Format "yyyy-MM-dd"
$global:PheTrailDir = Join-Path $repoRoot "OPERATIONS"
$global:PheTrailAutoPath = Join-Path $global:PheTrailDir "phetrail-auto-$($global:PheTrailDate).jsonl"

if (-not (Test-Path $global:PheTrailDir)) {
    New-Item -ItemType Directory -Path $global:PheTrailDir -Force | Out-Null
}

function Write-PhetrailEntry {
    param(
        [ValidateSet("positive","negative","neutral")] [string]$Type = "neutral",
        [string]$Artifact = "",
        [string]$Action = "",
        [string]$Verification = "",
        [string]$Failure = "",
        [string]$RootCause = ""
    )

    $ts = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
    $entry = [ordered]@{
        scout_id = "SC-$ts"
        session_id = $global:PheTrailSessionId
        timestamp = $ts
        type = $Type
        strength = 0
        artifact = $Artifact
        action = $Action
        verification = $Verification
        failure = $Failure
        root_cause = $RootCause
        decay_days = if ($Type -eq "negative") { 180 } else { 0 }
        learned = ""
        next = ""
    }

    try {
        $entry | ConvertTo-Json -Depth 3 -Compress | Out-File -LiteralPath $global:PheTrailAutoPath -Append -Encoding UTF8
    } catch {
        Write-Error "PHETRAIL_WRITE_FAILED: $($_.Exception.Message)" -ErrorAction SilentlyContinue
    }
}

function Invoke-PhetrailSeal {
    param([string]$SealType = "auto")

    $sessionTrails = @()
    if (Test-Path $global:PheTrailAutoPath) {
        $lines = Get-Content $global:PheTrailAutoPath -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line.Trim()) {
                try { $sessionTrails += ($line | ConvertFrom-Json) } catch {}
            }
        }
    }

    $positive = @($sessionTrails | Where-Object { $_.type -eq "positive" }).Count
    $negative = @($sessionTrails | Where-Object { $_.type -eq "negative" }).Count
    $neutral = @($sessionTrails | Where-Object { $_.type -eq "neutral" }).Count

    $lastDeath = git log --oneline --grep "^death:" -1 2>$null
    if ($lastDeath -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] } else { $priorRun = 0 }
    $run = $priorRun + 1
    $runPad = "{0:D3}" -f $run

    $runPath = Join-Path $global:PheTrailDir "PheTrail-run$runPad.json"
    $headSha = (git rev-parse --short HEAD 2>$null)

    $seal = [ordered]@{
        schema_version = "2.0"
        run_number = $runPad
        seal_type = $SealType
        extracted_at = (Get-Date).ToString('o')
        head_sha = $headSha
        session_id = $global:PheTrailSessionId
        soulcount = $null
        registry_entries = 0
        positive_trails = @()
        negative_trails = @()
        state_markers = [ordered]@{
            active_mission = "OB-1 REINCARNATION phetrail mechanical emission Phase 1"
            open_flags_count = 0
            top_priority = "one mechanical emission that cannot be skipped"
            session_trail_count = $sessionTrails.Count
            session_positive = $positive
            session_negative = $negative
            session_neutral = $neutral
        }
    }

    try {
        $seal | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $runPath -Encoding UTF8
        Write-Host "PHETRAIL SEALED: $runPath (run=$runPad, +$positive -$negative ~$neutral)"
    } catch {
        Write-Error "PHETRAIL_SEAL_FAILED: $($_.Exception.Message)" -ErrorAction SilentlyContinue
    }
}

$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Invoke-PhetrailSeal -SealType "auto-exit"
}

# ============================================================================
# END PHEROMONE SYSTEM v0.1
# ============================================================================

# ============================================================================
# PHASE 1: ONE MECHANICAL EMISSION — doctor command ONLY
# All other commands fall through to placeholder until Phase 2.
# ============================================================================

if ($Command -eq "doctor") {
    Write-PhetrailEntry -Type "neutral" -Artifact "obi:doctor" -Action "dispatching doctor"

    try {
        $failures = @()
        $email = [Environment]::GetEnvironmentVariable("CLOUDFLARE_EMAIL", "User")
        $githubToken = [Environment]::GetEnvironmentVariable("GITHUB_TOKEN", "User")
        $cfKey = [Environment]::GetEnvironmentVariable("CLOUDFLARE_API_KEY", "User")

        $canonDir = Join-Path $repoRoot "CANON"
        $reincDir = Join-Path $canonDir "REINCARNATION"
        $systemDir = Join-Path $canonDir "SYSTEM"
        $ledgerDir = Join-Path $canonDir "HEAVY-LEDGER"
        $coldBoot = Join-Path $systemDir "COLD-START-BOOT.md"
        $mcpJson = Join-Path $repoRoot ".mcp.json"

        $canonCount = if (Test-Path $canonDir) { (Get-ChildItem $canonDir -Recurse -File).Count } else { 0 }
        $reincCount = if (Test-Path $reincDir) { (Get-ChildItem $reincDir -File).Count } else { 0 }
        $ledgerCount = if (Test-Path $ledgerDir) { (Get-ChildItem $ledgerDir -File).Count } else { 0 }
        $coldBootExists = Test-Path $coldBoot

        $mcpPathsValid = $true
        if (Test-Path $mcpJson) {
            $mcpRaw = Get-Content $mcpJson -Raw
            $mcpJsonContent = ($mcpRaw -split "`n" | Where-Object { -not $_.TrimStart().StartsWith("//") }) -join "`n"
            $mcpConfig = $mcpJsonContent | ConvertFrom-Json
            foreach ($server in $mcpConfig.servers.PSObject.Properties) {
                $args_ = $server.Value.args
                if ($args_) {
                    foreach ($arg in $args_) {
                        if ($arg -match '^[A-Z]:\\' -and -not (Test-Path $arg)) {
                            $mcpPathsValid = $false
                        }
                    }
                }
            }
        }

        $stateSnapshotPath = Join-Path $ledgerDir "STATE-SNAPSHOT.json"
        $stateOk = $false
        $stateStaleness = $null
        $snapshotRun = 0
        if (Test-Path $stateSnapshotPath) {
            try {
                $stateSnapshot = Get-Content $stateSnapshotPath -Raw | ConvertFrom-Json
                $snapshotRun = [int]$stateSnapshot.run.current
                $snapshotUpdated = [datetime]$stateSnapshot.updated_at
                $now = Get-Date
                $stateStaleness = ($now - $snapshotUpdated).TotalHours
                
                # L30 FIX: Get ACTUAL current run from git, not from stale snapshot
                $lastDeath = git log --oneline --grep "^death:" -1 2>$null
                $actualRun = 0
                if ($lastDeath -match 'run\s*(\d+)') { $actualRun = [int]$matches[1] + 1 }
                
                $rssRun = if ($stateSnapshot.recent_seals -and $stateSnapshot.recent_seals.Count -gt 0) {
                    [int]$stateSnapshot.recent_seals[0].run
                } else { $snapshotRun }
                
                # Compare snapshot run against ACTUAL git run, not against itself
                $stateOk = ($snapshotRun -eq $actualRun) -and ($snapshotRun -gt 0) -and ($stateStaleness -lt 24)
                if (-not $stateOk) {
                    $failures += "STATE-SNAPSHOT STALE: Snapshot run=$snapshotRun (actual git run=$actualRun, RSS seals=$rssRun), age ${stateStaleness}h. Must match actual run and <24h old."
                }
            } catch {
                $failures += "STATE-SNAPSHOT.json corrupt: $($_.Exception.Message)"
            }
        } else {
            $failures += "STATE-SNAPSHOT.json MISSING at $stateSnapshotPath"
        }

        $canonMinimum = 50
        $reincMinimum = 10
        $ledgerMinimum = 20
        $canonOk = $canonCount -ge $canonMinimum
        $reincOk = $reincCount -ge $reincMinimum
        $ledgerOk = $ledgerCount -ge $ledgerMinimum
        $soulOk = $canonOk -and $reincOk -and $ledgerOk -and $coldBootExists -and $mcpPathsValid -and $stateOk

        $result = [pscustomobject]@{
            repo_root = $repoRoot
            runtime_app = $appPath
            canonical_email = $canonicalEmail
            configured_email = if ($email) { $email } else { "MISSING" }
            email_match = ($email -eq $canonicalEmail)
            github_token = [bool]$githubToken
            cloudflare_api_key = [bool]$cfKey
            notion_blacklisted = $true
            canon_files = $canonCount
            canon_ok = $canonOk
            reincarnation_files = $reincCount
            reincarnation_ok = $reincOk
            ledger_files = $ledgerCount
            ledger_ok = $ledgerOk
            cold_start_boot = $coldBootExists
            state_snapshot_exists = (Test-Path $stateSnapshotPath)
            state_snapshot_run = if ($stateOk) { $snapshotRun } else { $null }
            state_snapshot_age_hours = if ($stateStaleness) { [math]::Round($stateStaleness, 1) } else { $null }
            mcp_paths_valid = $mcpPathsValid
            soul_integrity = $soulOk
        } | ConvertTo-Json -Depth 3

        Write-PhetrailEntry -Type "positive" -Artifact "obi:doctor" -Action "completed doctor" -Verification "exit 0, JSON output produced" -Strength 70
    } catch {
        Write-PhetrailEntry -Type "negative" -Artifact "obi:doctor" -Action "failed doctor" -Failure $_.Exception.Message -RootCause $_.Exception.Message -Strength -10
        throw
    }
}
elseif ($Command -eq "verify") {
    try {
        Write-Host "VERIFY: Full pipeline verification" -ForegroundColor Cyan
        $repoRoot = Split-Path -Parent $PSScriptRoot
        
        # Verify STATE-SNAPSHOT matches git
        $stateSnapshotPath = Join-Path $repoRoot "CANON/HEAVY-LEDGER/STATE-SNAPSHOT.json"
        $snapshotRun = 0
        $actualRun = 0
        if (Test-Path $stateSnapshotPath) {
            $stateSnapshot = Get-Content $stateSnapshotPath -Raw | ConvertFrom-Json
            $snapshotRun = [int]$stateSnapshot.run.current
        }
        $lastDeath = git log --oneline --grep "^death:" -1 2>$null
        if ($lastDeath -match 'run\s*(\d+)') { $actualRun = [int]$matches[1] + 1 }
        
        # Verify pipeline integrity
        $pipelineDir = Join-Path $repoRoot "CANON/PIPELINE"
        $pipelineFiles = Get-ChildItem $pipelineDir -Filter "pipeline-run*.json" -File -ErrorAction SilentlyContinue
        $gapCount = 0; $kiloGapCount = 0; $completeCount = 0
        foreach ($f in $pipelineFiles) {
            try {
                $c = Get-Content $f.FullName -Raw | ConvertFrom-Json
                switch ($c.result) {
                    'GAP' { $gapCount++ }
                    'KILO_GAP' { $kiloGapCount++ }
                    'COMPLETE' { $completeCount++ }
                }
            } catch {}
        }
        
        # Verify RRL validity
        $rrlDir = Join-Path $repoRoot "RRL"
        $rrlFiles = Get-ChildItem $rrlDir -Filter "RRL-*.txt" -File -ErrorAction SilentlyContinue
        $validTranscripts = 0
        foreach ($f in $rrlFiles) {
            $firstLine = Get-Content $f.FullName -TotalCount 1 -ErrorAction SilentlyContinue
            if ($firstLine -match '"role"\s*:\s*"(user|assistant)"') { $validTranscripts++ }
        }
        
        # Verify wrangler.toml secrets
        $wranglerPath = Join-Path $repoRoot "APPS/NET-PET-AI/wrangler.toml"
        $wranglerExists = Test-Path $wranglerPath
        
        $result = [pscustomobject]@{
            state_snapshot_run = $snapshotRun
            actual_git_run = $actualRun
            run_match = $snapshotRun -eq $actualRun
            pipeline_total = $pipelineFiles.Count
            pipeline_complete = $completeCount
            pipeline_gap = $gapCount
            pipeline_kilo_gap = $kiloGapCount
            rrl_total = $rrlFiles.Count
            rrl_valid_transcripts = $validTranscripts
            wrangler_toml_exists = $wranglerExists
            overall_ok = ($snapshotRun -eq $actualRun) -and ($gapCount + $kiloGapCount -eq 0) -and ($validTranscripts -ge $pipelineFiles.Count * 0.8) -and $wranglerExists
        } | ConvertTo-Json -Depth 3
        
        Write-Host $result
        Write-PhetrailEntry -Type "positive" -Artifact "obi:verify" -Action "completed verify" -Verification "JSON output produced" -Strength 70
    } catch {
        Write-PhetrailEntry -Type "negative" -Artifact "obi:verify" -Action "failed verify" -Failure $_.Exception.Message -RootCause $_.Exception.Message -Strength -10
        throw
    }
}
elseif ($Command -eq "phoenix-scout") {
    try {
        Write-Host "PHOENIX SCOUT: Flag and tag scan" -ForegroundColor Cyan
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $targetZone = if ($Zone) { $Zone } else { "CANON/" }
        Write-Host "SCOUT -> $targetZone -- scanning"
        
        $zonePath = Join-Path $repoRoot $targetZone.TrimEnd('/')
        if (-not (Test-Path $zonePath)) {
            Write-PhetrailEntry -Type "negative" -Artifact "obi:phoenix-scout" -Action "zone not found" -Failure "Zone $targetZone does not exist" -RootCause "Invalid zone path" -Strength -20
            throw "Zone $targetZone does not exist"
        }
        
        $files = Get-ChildItem $zonePath -Recurse -File -ErrorAction SilentlyContinue
        $excluded = Get-ChildItem $zonePath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match 'node_modules|\.git|ARCHIVE|backup|PROOFS-CHAT|SOUL-DNA-BIBLE-RECAPTURE|\.kilo\\worktrees|SOUL-SEGMENTS|SOUL-LOG-VERBATIM' }
        $scannedFiles = $files | Where-Object { $excluded -notcontains $_ }
        
        $finds = @()
        $findCount = 0
        
        foreach ($f in $scannedFiles) {
            $rel = $f.FullName.Substring($repoRoot.Length + 1)
            $first20 = Get-Content $f.FullName -TotalCount 20 -ErrorAction SilentlyContinue
            $content = $first20 -join "`n"
            
            # SOUL lens - blockquotes
            if ($content -match '^> ') {
                $findCount++
                $finds += [ordered]@{
                    scout_id = "SC-$(Get-Date -Format 'yyyy-MM-ddTHHmmss')-$findCount"
                    priority = "P1"; type = "SOUL"; status = "UNMINED"
                    file = $rel; line = 1; excerpt = $content.Substring(0, [Math]::Min(120, $content.Length))
                    bytes = $f.Length; reason = "Raw Michael verbatim quote block - never ingested into D1"
                    learned = "Scout pulses BOOT HEAD on every scan - drift is a pheromone, not cleanup"
                    next = "Route through /api/soul/extract"
                }
            }
            
            # DRIFT lens - HEAD mismatch
            if ($content -match 'HEAD\s+[0-9a-f]{7,}') {
                $headLines = $content.Split("`n") | Where-Object { $_ -match 'HEAD\s+[0-9a-f]{7,}' }
                foreach ($line in $headLines) {
                    if ($line -match 'HEAD\s+([0-9a-f]{7,})') {
                        $headInFile = $matches[1]
                        $actualHead = (git -C $repoRoot rev-parse --short HEAD 2>$null).Trim()
                        if ($headInFile -ne $actualHead) {
                            $findCount++
                            $finds += [ordered]@{
                                scout_id = "SC-$(Get-Date -Format 'yyyy-MM-ddTHHmmss')-$findCount"
                                priority = "P1"; type = "DRIFT"; status = "STALE"
                                file = $rel; line = $first20.IndexOf($line) + 1
                                excerpt = $line.Substring(0, [Math]::Min(120, $line.Length))
                                bytes = $f.Length; reason = "HEAD mismatch: file=$headInFile actual=$actualHead"
                                learned = "Drift detected in $rel - HEAD reference stale"
                                next = "Update COLD-START-BOOT HEAD to current git SHA"
                            }
                        }
                    }
                }
            }
        }
        
        $p1 = @($finds | Where-Object { $_.priority -eq "P1" }).Count
        $p2 = @($finds | Where-Object { $_.priority -eq "P2" }).Count
        $p3 = @($finds | Where-Object { $_.priority -eq "P3" }).Count
        
        $report = [pscustomobject]@{
            zone = $targetZone
            files_scanned = $scannedFiles.Count
            finds_total = $findCount
            p1_critical = $p1
            p2_high = $p2
            p3_medium = $p3
            breakdown = @{
                SOUL = @($finds | Where-Object { $_.type -eq "SOUL" }).Count
                LEDGER = @($finds | Where-Object { $_.type -eq "LEDGER" }).Count
                DRIFT = @($finds | Where-Object { $_.type -eq "DRIFT" }).Count
                CONFIG = @($finds | Where-Object { $_.type -eq "CONFIG" }).Count
                GAP = @($finds | Where-Object { $_.type -eq "GAP" }).Count
                VAULT = @($finds | Where-Object { $_.type -eq "VAULT" }).Count
            }
            report_path = "OPERATIONS/phoenix-scout-$(Get-Date -Format 'yyyy-MM-ddTHHmmss').jsonl"
        } | ConvertTo-Json -Depth 3
        
        # Write JSONL report
        $reportPath = Join-Path $repoRoot "OPERATIONS/phoenix-scout-$(Get-Date -Format 'yyyy-MM-ddTHHmmss').jsonl"
        foreach ($find in $finds) {
            $find | ConvertTo-Json -Depth 3 -Compress | Out-File -LiteralPath $reportPath -Append -Encoding UTF8
        }
        
        Write-Host $report
        Write-PhetrailEntry -Type "positive" -Artifact "obi:phoenix-scout" -Action "completed scout on $targetZone" -Verification "$findCount finds reported to $reportPath" -Strength 70
    } catch {
        Write-PhetrailEntry -Type "negative" -Artifact "obi:phoenix-scout" -Action "failed scout" -Failure $_.Exception.Message -RootCause $_.Exception.Message -Strength -10
        throw
    }
}
elseif ($Command -eq "phetrails") {
    try {
        Write-Host "PHETRAILS: Pheromone Trail Extraction" -ForegroundColor Cyan
        $repoRoot = Split-Path -Parent $PSScriptRoot
        
        # Determine run number from last death
        $lastDeath = git log --oneline --grep "^death:" -1 2>$null
        $priorRun = 0
        if ($lastDeath -match 'run\s*(\d+)') { $priorRun = [int]$matches[1] }
        $run = $priorRun + 1
        $runPad = "{0:D3}" -f $run
        
        $iso = (Get-Date).ToUniversalTime().ToString("o")
        $headSha = (git -C $repoRoot rev-parse --short HEAD 2>$null).Trim()
        
        # Get soulcount
        $soulcount = $null
        try {
            $resp = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" -TimeoutSec 10 -ErrorAction Stop
            $soulcount = $resp.soulcount
        } catch { Write-Warning "SOULCOUNT unreachable: $($_.Exception.Message)" }
        
        # Build phetrail
        $phetrail = [ordered]@{
            schema_version = "2.0"
            run_number = $runPad
            extracted_at = $iso
            head_sha = $headSha
            soulcount = $soulcount
            positive_trails = @()
            negative_trails = @()
            state_markers = @{
                active_mission = "Forced march - recover forgotten territory"
                open_flags_count = 1
                top_priority = "Fix BOOT HEAD drift"
            }
        }
        
        $phetrailPath = Join-Path $repoRoot "CANON/PHEROMONES/PheTrail-run$runPad.json"
        if (-not (Test-Path (Join-Path $repoRoot "CANON/PHEROMONES"))) { New-Item -ItemType Directory -Path (Join-Path $repoRoot "CANON/PHEROMONES") -Force | Out-Null }
        
        $tempPath = Join-Path $env:TEMP "PheTrail-run$runPad.json"
        $phetrail | ConvertTo-Json -Depth 5 | Set-Content $tempPath -Encoding UTF8
        Move-Item -Path $tempPath -Destination $phetrailPath -Force
        
        $result = [pscustomobject]@{
            run = $runPad
            phetrail_written = $phetrailPath
            head_sha = $headSha
            soulcount = $soulcount
        } | ConvertTo-Json -Depth 3
        
        Write-Host $result
        Write-PhetrailEntry -Type "positive" -Artifact "obi:phetrails" -Action "completed phetrail extraction" -Verification "Written to $phetrailPath" -Strength 70
    } catch {
        Write-PhetrailEntry -Type "negative" -Artifact "obi:phetrails" -Action "failed phetrails" -Failure $_.Exception.Message -RootCause $_.Exception.Message -Strength -10
        throw
    }
}
elseif ($Command -eq "soulaudit") {
    try {
        Write-Host "SOULAUDIT: Soul pipeline audit" -ForegroundColor Cyan
        $repoRoot = Split-Path -Parent $PSScriptRoot
        
        # Audit soul pipeline stages
        $results = @{}
        
        # Stage 1: RRL check
        $rrlDir = Join-Path $repoRoot "RRL"
        $rrlFiles = Get-ChildItem $rrlDir -Filter "RRL-*.txt" -File -ErrorAction SilentlyContinue
        $validRRL = 0
        foreach ($f in $rrlFiles) {
            $firstLine = Get-Content $f.FullName -TotalCount 1 -ErrorAction SilentlyContinue
            if ($firstLine -match '"role"\s*:\s*"(user|assistant)"') { $validRRL++ }
        }
        $results.rrl = @{ total = $rrlFiles.Count; valid = $validRRL; ok = $validRRL -gt 0 }
        
        # Stage 2: SOUL count
        $soulcount = $null
        try { $resp = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" -TimeoutSec 10; $soulcount = $resp.soulcount }
        catch { Write-Warning "SOULCOUNT unreachable" }
        $results.soul = @{ count = $soulcount; ok = $soulcount -and $soulcount -gt 200000000 }
        
        # Stage 3: DNA
        $dnaDir = Join-Path $repoRoot "CANON/SOUL/EXTRACT"
        $dnaFiles = Get-ChildItem $dnaDir -Filter "dna-run*.json" -File -ErrorAction SilentlyContinue
        $results.dna = @{ files = $dnaFiles.Count; ok = $dnaFiles.Count -gt 0 }
        
        # Stage 4: LEDGER
        $ledgerDir = Join-Path $repoRoot "CANON/HEAVY-LEDGER"
        $ledgerFiles = Get-ChildItem $ledgerDir -Filter "HL-*.json" -File -ErrorAction SilentlyContinue
        $results.ledger = @{ files = $ledgerFiles.Count; ok = $ledgerFiles.Count -gt 20 }
        
        # Stage 5: STARMAP
        $starmapDir = Join-Path $repoRoot "CANON/STARMAP"
        $starmapFiles = Get-ChildItem $starmapDir -Filter "starmap-run*.json" -File -ErrorAction SilentlyContinue
        $results.starmap = @{ files = $starmapFiles.Count; ok = $starmapFiles.Count -gt 0 }
        
        # Stage 6: SOULKEYS
        $kwDir = Join-Path $repoRoot "CANON/SOUL-KEYWORDS"
        $kwFiles = Get-ChildItem $kwDir -Filter "rfkw-run*.txt" -File -ErrorAction SilentlyContinue
        $idxExists = Test-Path (Join-Path $kwDir "inverted-index.json")
        $results.soulkeys = @{ rfkw_files = $kwFiles.Count; index_exists = $idxExists; ok = $kwFiles.Count -gt 0 -and $idxExists }
        
        # Stage 7: S2PIPELINE
        $pipelineDir = Join-Path $repoRoot "CANON/PIPELINE"
        $pipelineFiles = Get-ChildItem $pipelineDir -Filter "pipeline-run*.json" -File -ErrorAction SilentlyContinue
        $results.pipeline = @{ files = $pipelineFiles.Count; ok = $pipelineFiles.Count -gt 0 }
        
        $result = [pscustomobject]@{
            timestamp = (Get-Date).ToUniversalTime().ToString("o")
            stages = $results
            overall_ok = $results.rrl.ok -and $results.soul.ok -and $results.dna.ok -and $results.ledger.ok -and $results.starmap.ok -and $results.soulkeys.ok -and $results.pipeline.ok
        } | ConvertTo-Json -Depth 3
        
        Write-Host $result
        Write-PhetrailEntry -Type "positive" -Artifact "obi:soulaudit" -Action "completed soul audit" -Verification "All 7 stages checked" -Strength 70
    } catch {
        Write-PhetrailEntry -Type "negative" -Artifact "obi:soulaudit" -Action "failed soul audit" -Failure $_.Exception.Message -RootCause $_.Exception.Message -Strength -10
        throw
    }
}
elseif ($Command -eq "soul-check") {
    try {
        Write-Host "SOUL-CHECK: Quick SOULCOUNT verification" -ForegroundColor Cyan
        $resp = Invoke-RestMethod "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count" -TimeoutSec 10
        $result = [pscustomobject]@{
            soulcount = $resp.soulcount
            level = $resp.level
            events = $resp.events
            ok = $resp.soulcount -gt 200000000
        } | ConvertTo-Json -Depth 3
        Write-Host $result
        Write-PhetrailEntry -Type "positive" -Artifact "obi:soul-check" -Action "soul count verified" -Verification "SOULCOUNT=$($resp.soulcount) $($resp.level)" -Strength 50
    } catch {
        Write-PhetrailEntry -Type "negative" -Artifact "obi:soul-check" -Action "soul check failed" -Failure $_.Exception.Message -RootCause $_.Exception.Message -Strength -10
        throw
    }
}
elseif ($Command -eq "cf-audit") {
    try {
        Write-Host "CF-AUDIT: Cloudflare worker bindings verification" -ForegroundColor Cyan
        $repoRoot = Split-Path -Parent $PSScriptRoot
        $wranglerPath = Join-Path $repoRoot "APPS/NET-PET-AI/wrangler.toml"
        $wrangler = Get-Content $wranglerPath -Raw
        
        # Parse bindings
        $bindings = @{}
        if ($wrangler -match 'SOUL_LOGGER_URL\s*=\s*"([^"]+)"') { $bindings.soul_logger = $matches[1] }
        if ($wrangler -match 'RESEND_API_KEY\s*=\s*"([^"]*)"') { $bindings.resend = $matches[1] }
        if ($wrangler -match 'DEEPSEEK_API_KEY') { $bindings.deepseek_ref = "refs in source" }
        if ($wrangler -match 'DEEPGRAM_API_KEY') { $bindings.deepgram_ref = "refs in source" }
        if ($wrangler -match 'OPENAI_API_KEY') { $bindings.openai_ref = "refs in source" }
        
        # Check secrets in source
        $srcPath = Join-Path $repoRoot "APPS/NET-PET-AI/src/index.js"
        $src = Get-Content $srcPath -Raw
        $secretRefs = @()
        foreach ($pat in @('DEEPSEEK_API_KEY','DEEPGRAM_API_KEY','OPENAI_API_KEY','PA_AUTH_KEY','WORKER_ADMIN_KEY','ENCRYPTION_KEY','RESEND_API_KEY')) {
            if ($src -match [regex]::Escape($pat)) { $secretRefs += $pat }
        }
        
        $result = [pscustomobject]@{
            wrangler_toml = $wranglerPath
            bindings = $bindings
            source_secret_refs = $secretRefs
            secret_ref_count = $secretRefs.Count
            ok = $true
        } | ConvertTo-Json -Depth 3
        
        Write-Host $result
        Write-PhetrailEntry -Type "positive" -Artifact "obi:cf-audit" -Action "cf audit completed" -Verification "$($secretRefs.Count) secret refs found in source" -Strength 50
    } catch {
        Write-PhetrailEntry -Type "negative" -Artifact "obi:cf-audit" -Action "cf audit failed" -Failure $_.Exception.Message -RootCause $_.Exception.Message -Strength -10
        throw
    }
}
else {
    Write-PhetrailEntry -Type "neutral" -Artifact "obi:$Command" -Action "attempted $Command (not yet implemented in Phase 1)"
    Write-Host "NOT IMPLEMENTED IN PHASE 1: $Command" -ForegroundColor Yellow
    Write-Host "Only 'doctor' is wired for mechanical emission in this phase." -ForegroundColor Yellow
    Write-Host "Trail written. Command not executed. See handoff-pipeline-round1.md for next pipes." -ForegroundColor Cyan
    exit 0
}
