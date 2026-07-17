$inputFile = $args[0]
if (-not $inputFile) { Write-Host "Usage: .\transcribe PATH\TO\file.m4a"; exit 1 }
if (-not (Test-Path $inputFile)) { Write-Host "File not found: $inputFile"; exit 1 }

$key = "910707f04834888ef19ad0011baebd792aa87dba"
$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $inputFile))
$name = [System.IO.Path]::GetFileNameWithoutExtension($inputFile)
$outDir = if ($args[2]) { $args[2] } else { "$PSScriptRoot\OPERATIONS\CLASS-INTEL" }
$outPath = "$outDir\$name-transcript.json"
$null = New-Item -ItemType Directory -Force -Path $outDir

$url = "https://api.deepgram.com/v1/listen?model=nova-3&punctuate=true&utterances=true&diarize=true&smart_format=true&paragraphs=true"
$ext = [System.IO.Path]::GetExtension($inputFile).ToLower()
$ct = @{".m4a"="audio/m4a"; ".mp3"="audio/mpeg"; ".wav"="audio/wav"; ".ogg"="audio/ogg"; ".webm"="audio/webm"}[$ext]
if (-not $ct) { $ct = "audio/m4a" }

Write-Host "Uploading $(([math]::Round($fileBytes.Length / 1MB, 1))) MB to Deepgram..."

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{
        "Authorization" = "Token $key"
        "Content-Type" = $ct
    } -Body $fileBytes -ContentType $ct -TimeoutSec 300
    
    $response | ConvertTo-Json -Depth 10 | Set-Content $outPath -Encoding UTF8
    
    $utterances = $response.results.utterances
    $transcript = $response.results.channels[0].alternatives[0].paragraphs.transcript
    $duration = $response.results.channels[0].duration_seconds
    
    Write-Host "`nDuration: $([math]::Round($duration/60, 1)) min"
    Write-Host "Utterances: $($utterances.Count)"
    Write-Host "Transcript chars: $($transcript.Length)"
    
    Write-Host "`n=== FULL TRANSCRIPT ==="
    Write-Host $transcript
    
    Write-Host "`nSaved: $outPath"
    
    return @{
        transcript = $transcript
        utterances = $utterances | ForEach-Object { @{ speaker = $_.speaker; start = $_.start; text = $_.transcript } }
    }
}
catch {
    Write-Host "ERROR: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Response: $body"
    }
    exit 1
}
