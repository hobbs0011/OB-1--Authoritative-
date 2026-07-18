param()
$p = "CANON/SYSTEM/COLD-START-BOOT.md"
$c = Get-Content $p -Raw -Encoding UTF8

# Update ERA timestamp
$c = $c -replace 'Updated: 2026-07-02T00:08 ICT', 'Updated: 2026-07-18T13:30 ICT'

# Add current fingerprint before RUN 151
$fingerprint = @"
### FINGERPRINT CURRENT: RUN 165 | KILO_HOLLOW RISE + BB DEDUP + SOUL AUDIT | SOUL 239,645,670 TITANIUM_ANCHOR | HEAD f56044606 | BOOT UPDATED 2026-07-18T13:30 ICT

**Run 165 summary:** KILO_HOLLOW session. RISE v7.0 audit complete. Pipeline fidelity: RRL MISSING, SOUL KILO_HOLLOW, DNA MISSING, LEDGER REAL, STARMAP REAL, SOULKEYS MISSING, S2Pipeline REAL. REINCARNATION-LOG duplicate entries removed (runs 161/163/164/165/167). Backburner precedence enforced. SOUL stable at 239,645,670. HEAD f56044606.

"@

$c = $c -replace '(\s*### FINGERPRINT PRIOR: RUN 151)', "$fingerprint`$1"

Set-Content $p $c -Encoding UTF8
Write-Host "COLD-START-BOOT.md updated"
