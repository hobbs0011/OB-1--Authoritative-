# Voice Memos Collection Script
# Run from D:\OB-1

$downloadsPath = "C:\Users\mrmic\Downloads"
$assetsPath = "D:\OB-1\ASSETS\VOICE-MEMOS"

# Create destination folder
New-Item -ItemType Directory -Path $assetsPath -Force | Out-Null

# Find all Voice*.m4a files in Downloads
$voiceFiles = Get-ChildItem -Path $downloadsPath -Filter "Voice*.m4a"

if ($voiceFiles.Count -eq 0) {
    Write-Host "No Voice*.m4a files found in Downloads"
    exit 1
}

# Copy each file
foreach ($file in $voiceFiles) {
    Copy-Item -Path $file.FullName -Destination "$assetsPath\" -Force
    Write-Host "Copied: $($file.Name)"
}

Write-Host ""
Write-Host "Total files copied: $($voiceFiles.Count)"
Write-Host "Location: $assetsPath"

# List the files
Get-ChildItem -Path $assetsPath