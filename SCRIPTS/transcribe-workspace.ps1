# Deepgram Transcription — Workspace Agnostic
# Usage: pwsh -File SCRIPTS/transcribe-workspace.ps1 -InputPath "path/to/file.m4a"
# Requires: DEEPGRAM_API_KEY environment variable

param(
    [Parameter(Mandatory=$true)]
    [string]$InputPath
)

if (-not $env:DEEPGRAM_API_KEY) {
    Write-Error "DEEPGRAM_API_KEY not set. Run: `$env:DEEPGRAM_API_KEY='your-key' ; pwsh -File SCRIPTS/transcribe-workspace.ps1 -InputPath 'file.m4a'"
    exit 1
}

if (-not (Test-Path $InputPath)) {
    Write-Error "Input file not found: $InputPath"
    exit 1
}

# Resolve to absolute path
$InputPath = (Resolve-Path $InputPath).Path
$filename = [System.IO.Path]::GetFileNameWithoutExtension($InputPath)
$outputDir = Join-Path (Get-Location) "ASSETS\TRANSCRIPTIONS"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$tempDir = Join-Path $env:TEMP "deepgram_$([System.Guid]::NewGuid().ToString())"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Input: $InputPath"
Write-Host "Converting to WAV (16kHz mono)..."

$wavPath = Join-Path $tempDir "input.wav"
& ffmpeg -i $InputPath -vn -acodec pcm_s16le -ar 16000 -ac 1 $wavPath -y 2>$null

$fileSizeMB = [math]::Round((Get-Item $wavPath).Length / 1MB, 2)
Write-Host "WAV size: $fileSizeMB MB"

$durationSec = 8
$allTranscripts = @()
$chunkNum = 0

Write-Host "Transcribing in 8-second chunks..."

for ($startSec = 0; $startSec -lt 3600; $startSec += $durationSec) {
    $chunkPath = Join-Path $tempDir "chunk_$chunkNum.wav"
    
    & ffmpeg -ss $startSec -i $wavPath -t $durationSec -vn -acodec pcm_s16le -ar 16000 -ac 1 $chunkPath -y 2>$null
    
    $chunkSize = (Get-Item $chunkPath).Length
    if ($chunkSize -lt 1000) { break }
    
    $audioBytes = [System.IO.File]::ReadAllBytes($chunkPath)
    $audioBase64 = [Convert]::ToBase64String($audioBytes)
    
    $jsonBody = "{`"audio`":`"$audioBase64`",`"model`":`"nova-2`",`"language`":`"vi`",`"smart_format`":true}"
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.deepgram.com/v1/listen" `
            -Method Post `
            -Headers @{
                "Authorization" = "Token $env:DEEPGRAM_API_KEY"
                "Content-Type" = "application/json"
            } `
            -Body $jsonBody
        
        $transcript = $response.results.channels[0].alternatives[0].transcript
        if ($transcript) {
            $allTranscripts += $transcript
            Write-Host "  [$startSec-$($startSec+$durationSec)s]: $($transcript.Substring(0, [Math]::Min(50, $transcript.Length)))..."
        }
    } catch {
        Write-Host "Error on chunk $startSec`: $_" -ForegroundColor Yellow
    }
    
    $chunkNum++
}

Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

$finalTranscript = ($allTranscripts -join " ")
$outputFile = Join-Path $outputDir "$filename-RAW.txt"
$finalTranscript | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "Saved: $outputFile"
Write-Host "Characters: $($finalTranscript.Length)"
Write-Host "---TRANSCRIPT PREVIEW---"
Write-Host $finalTranscript.Substring(0, [Math]::Min(1000, $finalTranscript.Length))
if ($finalTranscript.Length -gt 1000) { Write-Host "..." }