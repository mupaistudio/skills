# use-browser scripts/stop.ps1
# Stop CDP Chrome only. Normal Chrome stays untouched by default.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File <skill>/scripts/stop.ps1
#   powershell -ExecutionPolicy Bypass -File <skill>/scripts/stop.ps1 -All
#
# Notes:
#   - Default: kill only the CDP Chrome of this port
#     (-Port, else env CDP_PORT, else 9333).
#   - -All: kill EVERY chrome.exe on the system. Requires explicit user request.

param(
    [switch]$All,
    [int]$Port = 0
)

function Resolve-CdpPort([int]$p) {
    if ($p -gt 0) { return $p }
    if ($env:CDP_PORT) { return [int]$env:CDP_PORT }
    return 9333   # default port
}
if (-not $All) { $Port = Resolve-CdpPort $Port }

if ($All) {
    Write-Host "[CDP] -All flag set - killing every chrome.exe (explicit request only)..."
    $procs = Get-CimInstance Win32_Process -Filter "Name='chrome.exe'"
    $count = ($procs | Measure-Object).Count
    $procs | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[CDP] Killed $count chrome.exe process(es)."
    exit 0
}

$killed = 0
Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
    Where-Object { $_.CommandLine -like "*--remote-debugging-port=$Port*" -or ($Port -eq 9222 -and $_.CommandLine -like "*.cdp-chrome*" -and $_.CommandLine -notlike "*.cdp-chrome-p*") } |
    ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        $killed++
    }

Write-Host "[CDP] Killed $killed CDP Chrome process(es). Normal Chrome untouched."
