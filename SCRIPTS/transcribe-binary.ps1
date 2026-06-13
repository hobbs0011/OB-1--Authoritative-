# Deepgram Transcription — Raw Binary Upload (FIXED)
# Deepgram /v1/listen now requires raw binary or URL, not base64 JSON
# Run: pwsh -File SCRIPTS/transcribe-binary.ps1 -InputPath "file.m4a"

param(
    [Parameter(Mandatory=$true)]
    [string]$InputPath
)

if (-not $env:DEEPGRAM_API_KEY) {
    Write-Error "DEEPGRAM_API_KEY not set. Abort."
    exit 1
}

$resolvedPath = (Resolve-Path $InputPath).Path
if (-not (Test-Path $resolvedPath)) {
    Write-Error "File not found: $resolvedPath"
    exit 1
}

$filename = [System.IO.Path]::GetFileNameWithoutExtension($resolvedPath)
$outputDir = Join-Path (Get-Location) "ASSETS\TRANSCRIPTIONS"
$outputFile = Join-Path $outputDir "$filename-RAW.txt"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

Write-Host "Input: $resolvedPath"
Write-Host "Output: $outputFile"

# Convert to proper WAV for Deepgram
$tempDir = Join-Path $env:TEMP "dg_$([System.Guid]::NewGuid().ToString())"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$wavPath = Join-Path $tempDir "audio.wav"
& ffmpeg -i $resolvedPath -vn -acodec pcm_s16le -ar 16000 -ac 1 $wavPath -y 2>$null
Write-Host "Converted WAV: $([math]::Round((Get-Item $wavPath).Length/1MB, 2)) MB"

$allText = @()
$chunkSec = 120  # 2-minute chunks
$duration = & ffprobe -v quiet -show_entries format=duration -of csv=p=0 $resolvedPath
$duration = [int]([double]$duration)

for ($start = 0; $start -lt $duration; $start += $chunkSec) {
    $chunkWav = Join-Path $tempDir "chunk.wav"
    & ffmpeg -ss $start -i $resolvedPath -t $chunkSec -vn -acodec pcm_s16le -ar 16000 -ac 1 $chunkWav -y 2>$null
    
    $bytes = [System.IO.File]::ReadAllBytes($chunkWav)
    if ($bytes.Length -lt 1000) { break }
    
    Write-Host "Chunk $start-$($start+$chunkSec)s..."
    
    $response = Invoke-RestMethod -Uri "https://api.deepgram.com/v1/listen?model=nova-2&language=vi" `
        -Method Post `
        -Headers @{
            "Authorization" = "Token $env:DEEPGRAM_API_KEY"
            "Content-Type" = "audio/wav"
        } `
        -Body $bytes
    
    $trans = $response.results.channels[0].alternatives[0].transcript
    if ($trans) { $allText += $trans }
}

Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

$final = ($allText -join " ").Trim()
$final | Out-File -FilePath $outputFile -Encoding utf8

Write-Host "=== COMPLETE ==="
Write-Host "Characters: $($final.Length)"
Write-Host "Saved: $outputFile"