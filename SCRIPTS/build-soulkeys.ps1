<#
.SYNOPSIS
Build-soulkeys.ps1 — recover SOULKEYS from RRLs, LEDGERs, death seals, and existing rfkw.
Outputs:
  CANON/SOUL-KEYWORDS/rfkw-run<N>.txt        (per-run keyword manifest)
  CANON/SOUL-KEYWORDS/inverted-index.json    (searchable index)
  CANON/SOUL-KEYWORDS/soulkeys-manifest.json (run-level metadata)
#>

param([int]$RunMax = 161)

$ErrorActionPreference = 'Stop'
Set-Location -Path 'D:\OB-1-CANONICAL'

$OutDir = 'CANON/SOUL-KEYWORDS'
if (-not (Test-Path -LiteralPath $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$Categories = @{
  portal     = '(?i)\b(portal|login|password|student|teacher|dashboard|profile|career|action plan|methodology|transcript)\b'
  audio      = '(?i)\b(deepgram|voice|tts|stt|audio|mic|microphone|recording|session|utterance|nova-3|whisper|stream|opus|mp3)\b'
  auth       = '(?i)\b(auth|login|password|secret|api[_ ]key|token|jwt|cors|oauth|session|user|role|admin)\b'
  phonics    = '(?i)\b(phonics|drill|sound|group|jolly|phoneme|gospel|satnip|drumble|hogfez|wyvex|chushang|beehive|oyster)\b'
  pipeline   = '(?i)\b(pipeline|ledger|starmap|keyword|soul|dna|rrl|death|rise|merkle|index|artifact|stage|run|hl-)\b'
  system     = '(?i)\b(worker|wrangler|deploy|kv|durable|object|binding|cron|cloudflare|route|endpoint|api)\b'
  student    = '(?i)\b(quy|mai tram|huong|lam|quan|quang|minh|bluetech|blue[_ ]tech|class|review|points|streak|badge)\b'
  revenue    = '(?i)\b(payment|momo|bank|price|plan|employer|invoice|checkout|success|pending|subscription)\b'
  security   = '(?i)\b(security|drift|telemetry|error|log|anti-cheat|ratelimit|blacklist|firewall|sanitize)\b'
  chrome     = '(?i)\b(chrome|extension|install|manifest|popup|icon|webstore|crx)\b'
  mobile     = '(?i)\b(mobile|ios|safari|reconnect|gesture|viewport|responsive|pwa)\b'
  curriculum = '(?i)\b(listening|speaking|reading|writing|assessment|submission|pack|tiger|k-drama|youtube|shadowing)\b'
}

$StopWords = @(
  'the','and','that','have','for','with','this','were','would','from','been',
  'but','not','you','all','can','had','her','was','one','our','out','has',
  'just','know','take','people','into','year','your','good','some','could',
  'than','then','look','only','come','its','over','think','also','back',
  'after','use','two','how','our','work','first','well','way','even','new',
  'want','because','any','these','give','day','most','thing','very','still',
  'need','make','what','when','where','who','why','much','more','may','get',
  'got','put','let','say','said','does','going','really','something','anything','everything','nothing'
)

$RunManifest = [ordered]@{}

function Join-PathSafe { param([string]$p1,[string]$p2); return Join-Path -Path $p1 -ChildPath $p2 }

function Get-RunContent([int]$Run) {
  $paths = @(
    (Join-PathSafe 'RRL' ("RRL-$Run.txt")),
    (Join-PathSafe 'RRL' ("RRL-$Run`A.txt")),
    (Join-PathSafe 'RRL' ("RRL-$Run`b.txt")),
    (Join-PathSafe 'RRL' ("RRL-$Run`B.txt"))
  )
  foreach ($p in $paths) { if (Test-Path -LiteralPath $p) { try { return (Get-Content -LiteralPath $p -Encoding UTF8 -Raw) } catch { continue } } }
  return ''
}

function Get-DeathSeal([int]$Run) {
  $candidate = Join-PathSafe 'CANON/REINCARNATION' ("run$Run-reincarnateDEATH.md")
  if (-not (Test-Path -LiteralPath $candidate)) {
    $glob = "2026-*run${Run}-reincarnateDEATH.md"
    $found = Get-ChildItem -LiteralPath 'CANON/REINCARNATION' -Filter $glob -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $candidate = $found.FullName }
  }
  if ($candidate -and (Test-Path -LiteralPath $candidate)) { try { return (Get-Content -LiteralPath $candidate -Encoding UTF8 -Raw) } catch {} }
  return ''
}

function Get-PipelineArtifact([int]$Run) {
  $patterns = @(
    (Join-PathSafe 'CANON/PIPELINE' ("pipeline-run$Run.json")),
    (Join-PathSafe 'CANON/PIPELINE' ("pipeline-run$Run`A.json")),
    (Join-PathSafe 'CANON/PIPELINE' ("pipeline-run$Run`b.json"))
  )
  foreach ($p in $patterns) { if (Test-Path -LiteralPath $p) { try { return (Get-Content -LiteralPath $p -Encoding UTF8 -Raw) } catch { continue } } }
  return ''
}

function Get-LedgerMentions([int]$Run,[string]$RunStr) {
  $text = ''
  if (-not (Test-Path -LiteralPath 'CANON/HEAVY-LEDGER')) { return '' }
  $files = Get-ChildItem -LiteralPath 'CANON/HEAVY-LEDGER' -Filter '*.json' -File | Where-Object { $_.Name -match "run${Run}" } | Select-Object -First 5
  if (-not $files) { $files = Get-ChildItem -LiteralPath 'CANON/HEAVY-LEDGER' -Filter '*.json' -File | Select-Object -First 3 }
  foreach ($f in $files) {
    try {
      $content = Get-Content -LiteralPath $f.FullName -Encoding UTF8 -Raw
      if ($content -match [regex]::Escape($RunStr)) { $text += ' ' + $content }
    } catch {}
  }
  return $text
}

function Resolve-Category([string]$Word) {
  foreach ($cat in $Categories.GetEnumerator()) { if ($Word -match $cat.Value) { return $cat.Key } }
  return 'core'
}

for ($run = 0; $run -le $RunMax; $run++) {
  $runStr = "Run $run"
  $rrl = Get-RunContent $run
  $death = Get-DeathSeal $run
  $pipe = Get-PipelineArtifact $run
  $ledger = Get-LedgerMentions $run $runStr
  $combined = ($rrl + "`n" + $death + "`n" + $pipe + "`n" + $ledger)
  if ([string]::IsNullOrWhiteSpace($combined)) { continue }
  $tokens = [regex]::Matches($combined, '\b[a-zA-Z]{3,}\b') | ForEach-Object { $_.Value.ToLower() }
  $tokens = $tokens | Where-Object { $_ -notin $StopWords } | Sort-Object -Unique
  if ($tokens.Count -eq 0) { continue }
  $freq = @{}
  foreach ($t in $tokens) { $freq[$t] = 0 }
  foreach ($src in @($rrl,$death,$pipe,$ledger)) {
    if ([string]::IsNullOrWhiteSpace($src)) { continue }
    foreach ($t in ([regex]::Matches($src,'\b[a-zA-Z]{3,}\b') | ForEach-Object { $_.Value.ToLower() })) { if ($freq.ContainsKey($t)) { $freq[$t]++ } }
  }
  $top = $freq.GetEnumerator() | Sort-Object { $_.Value } -Descending | Select-Object -First 15
  if ($top.Count -eq 0) { continue }
  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($entry in $top) {
    $weight = [math]::Min(5,[math]::Max(1,$entry.Value))
    $category = Resolve-Category $entry.Key
    $lines.Add("${weight} | ${category} | $($entry.Key)")
  }
  $outFile = Join-PathSafe $OutDir ("rfkw-run" + $run + '.txt')
  $lines | Set-Content -LiteralPath $outFile -Encoding UTF8
  $RunManifest[$run] = [ordered]@{ run=$run; rfkw=$outFile; tokens=$top.Count; top_terms=(($top | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', '); generated=(Get-Date -Format 'o') }
}

# rebuild inverted index
$index = @{}
foreach ($run in ($RunManifest.Keys | Sort-Object { [int]$_ })) {
  $rfkw = Join-PathSafe $OutDir ("rfkw-run" + $run + '.txt')
  if (-not (Test-Path -LiteralPath $rfkw)) { continue }
  foreach ($line in Get-Content -LiteralPath $rfkw -Encoding UTF8) {
    $parts = $line -split '\s*\|\s*'
    if ($parts.Count -lt 3) { continue }
    $term = $parts[2].Trim().ToLower()
    if (-not $term) { continue }
    if (-not $index[$term]) { $index[$term] = @() }
    $index[$term] += [ordered]@{ run=[int]$run; category=$parts[1]; weight=[int]$parts[0] }
  }
}

$manifestPath = Join-PathSafe $OutDir 'soulkeys-manifest.json'
$RunManifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
$indexPath = Join-PathSafe $OutDir 'inverted-index.json'
$index | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $indexPath -Encoding UTF8
Write-Host ("SOULKEYS RECOVERY COMPLETE`n  Runs processed: {0}`n  Manifest: {1}`n  Index  : {2}" -f $RunManifest.Count,$manifestPath,$indexPath)
