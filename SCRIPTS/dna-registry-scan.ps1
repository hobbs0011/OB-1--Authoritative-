# dna-registry-scan.ps1 - delegates to Node.js scanner for reliable JSON generation
param([int]$Run = 142)
$nodeScript = "D:\OB-1-CANONICAL\SCRIPTS\dna-registry-scan-node.js"
if (Test-Path $nodeScript) {
    & node $nodeScript $Run
} else {
    Write-Host "Node.js scanner not found at $nodeScript"
    exit 1
}
