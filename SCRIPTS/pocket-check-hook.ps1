# L82 STAY IN THE POCKET — PreToolUse Hook
# Blocks OB-1 from doing reconnaissance inline. Dispatch to Agent/PCClaw instead.

$json = [Console]::In.ReadToEnd()
try { $data = $json | ConvertFrom-Json } catch { exit 0 }

$toolName = $data.tool_name
$toolInput = $data.tool_input

# Extract path from whichever field the tool uses
$path = ""
if ($toolInput.file_path) { $path = $toolInput.file_path }
elseif ($toolInput.path)  { $path = $toolInput.path }
elseif ($toolInput.pattern) { $path = "$($toolInput.path) $($toolInput.pattern)" }
elseif ($toolInput.command) { $path = $toolInput.command }

$reconTools = @("Read", "Grep", "Glob")
$reconPaths = @("\\CANON\\", "\\RRL\\", "\\OPERATIONS\\", "\\ARCHIVE\\", "/CANON/", "/RRL/", "/OPERATIONS/")

# Boot-sequence files always permitted
$bootAllowed = @(
    "COLD-START-BOOT.md", "BACKBURNER-PIPELINE-LOG.md", "STUDENT-PORTAL-DEV.md",
    "dna-run", "_mission-", "RRL-", "MEMORY.md", "CLAUDE.md"
)

if ($toolName -in $reconTools -and $path) {
    $isRecon = $false
    foreach ($p in $reconPaths) {
        if ($path -match [regex]::Escape($p)) { $isRecon = $true; break }
    }

    if ($isRecon) {
        $isBoot = $false
        foreach ($b in $bootAllowed) {
            if ($path -match [regex]::Escape($b)) { $isBoot = $true; break }
        }

        if (-not $isBoot) {
            Write-Output "⛔ L82 POCKET VIOLATION: $toolName on [$path] is reconnaissance. OB-1 does not leave the command post. Dispatch to Agent (subagent_type=Explore) or PCClaw instead."
            exit 2
        }
    }
}

exit 0
