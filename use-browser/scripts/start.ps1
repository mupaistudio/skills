# use-browser scripts/start.ps1
# CDP mode Chrome starter for Claude Code direct browser control.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File <skill>/scripts/start.ps1
#   powershell -ExecutionPolicy Bypass -File <skill>/scripts/start.ps1 -Force
#   powershell -ExecutionPolicy Bypass -File <skill>/scripts/start.ps1 -Url https://claude.ai
#   powershell -ExecutionPolicy Bypass -File <skill>/scripts/start.ps1 -Profile work
#
# Notes:
#   - Port: -Port <n>, else env CDP_PORT, else 9333.
#   - Each port has its own Chrome + profile %USERPROFILE%\.cdp-chrome-p<n>[-<name>];
#     -Force kills only that port's Chrome. Do not start or stop a port another program uses.
#   - To switch profile: stop.ps1 first, then start.ps1 -Profile <name>.
#   - -Force only kills CDP Chrome (matched by user-data-dir or port). Normal Chrome untouched.
#   - Legacy port 9222 keeps its old profile %USERPROFILE%\.cdp-chrome[-<name>].

param(
    [switch]$Force,
    [string]$Url = 'about:blank',
    [string]$Profile = '',
    [int]$Port = 0
)

$ErrorActionPreference = 'Stop'

function Resolve-CdpPort([int]$p) {
    if ($p -gt 0) { return $p }
    if ($env:CDP_PORT) { return [int]$env:CDP_PORT }
    return 9333   # default port
}
$Port = Resolve-CdpPort $Port

$Base = if ($Port -eq 9222) { Join-Path $env:USERPROFILE '.cdp-chrome' } else { Join-Path $env:USERPROFILE ".cdp-chrome-p$Port" }
if ($Profile -ne '') {
    $UserData = "$Base-$Profile"
} else {
    $UserData = $Base
}

$ChromeExe = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $ChromeExe)) {
    $ChromeExe = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
}
if (-not (Test-Path $ChromeExe)) {
    Write-Error "chrome.exe not found at standard paths"
    exit 1
}

# 1. Check if already up (DevTools endpoint ping)
function Test-CdpReady {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/json/version" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        return $r.StatusCode -eq 200
    } catch {
        return $false
    }
}

if (Test-CdpReady) {
    if ($Force) {
        Write-Host "[CDP] Force mode - killing existing CDP Chrome..."
        Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
            Where-Object { $_.CommandLine -like "*--remote-debugging-port=$Port*" -or ($Port -eq 9222 -and $_.CommandLine -like "*.cdp-chrome*" -and $_.CommandLine -notlike "*.cdp-chrome-p*") } |
            ForEach-Object {
                Write-Host "  killing PID $($_.ProcessId)"
                Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            }
        Start-Sleep -Seconds 2
    } else {
        $info = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/version"
        Write-Host "[CDP] Already running. $($info.Browser)"
        Write-Host "[CDP] Profile: (existing - to switch run stop.ps1 first)"
        Write-Host "[CDP] WebSocket: $($info.webSocketDebuggerUrl)"
        exit 0
    }
}

# 2. Prepare user-data-dir
if (-not (Test-Path $UserData)) {
    New-Item -ItemType Directory -Path $UserData -Force | Out-Null
    Write-Host "[CDP] Created profile dir: $UserData"
}

# 2b. Turn off the password manager in the profile Preferences (Chrome is not running here).
# --disable-features=PasswordLeakDetection alone did not stop a "change your password" dialog on a
# fresh -Port profile, and that
# dialog swallows CDP input. Merged into the existing file so other prefs are kept.
$PrefDir = Join-Path $UserData 'Default'
$PrefFile = Join-Path $PrefDir 'Preferences'
try {
    if (-not (Test-Path $PrefDir)) { New-Item -ItemType Directory -Path $PrefDir -Force | Out-Null }
    $prefs = if (Test-Path $PrefFile) { Get-Content $PrefFile -Raw -Encoding UTF8 | ConvertFrom-Json } else { New-Object PSObject }
    function Set-Pref($obj, [string]$name, $value) {
        if ($obj.PSObject.Properties[$name]) { $obj.$name = $value } else { $obj | Add-Member -NotePropertyName $name -NotePropertyValue $value }
    }
    if (-not $prefs.PSObject.Properties['profile']) { Set-Pref $prefs 'profile' (New-Object PSObject) }
    Set-Pref $prefs 'credentials_enable_service' $false
    Set-Pref $prefs.profile 'password_manager_enabled' $false
    Set-Pref $prefs.profile 'password_manager_leak_detection' $false
    $json = $prefs | ConvertTo-Json -Depth 100 -Compress
    [System.IO.File]::WriteAllText($PrefFile, $json, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "[CDP] Password manager off in $PrefFile"
} catch {
    Write-Host "[CDP] WARN: could not patch Preferences ($($_.Exception.Message)) - continuing"
}

# 3. Start Chrome
$chromeArgs = @(
    "--remote-debugging-port=$Port",
    "--user-data-dir=$UserData",
    "--no-first-run",
    "--no-default-browser-check",
    # PasswordLeakDetection: Chrome's "compromised password" tab-modal dialog (shown after
    # logging in with a leaked password such as 1234) swallows ALL CDP input while page JS keeps
    # running. Disabled.
    "--disable-features=ChromeWhatsNewUI,PasswordLeakDetection",
    "--restore-last-session=false",
    $Url
)

Write-Host "[CDP] Starting Chrome (port $Port, profile $UserData)..."
Start-Process -FilePath $ChromeExe -ArgumentList $chromeArgs | Out-Null

# 4. Wait for DevTools endpoint (max 60s - first run can be slow due to profile setup)
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    if (Test-CdpReady) { $ready = $true; break }
}

if (-not $ready) {
    Write-Error "[CDP] DevTools endpoint not ready after 60s"
    exit 1
}

$info = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/json/version"
Write-Host "[CDP] READY. Browser: $($info.Browser)"
Write-Host "[CDP] Endpoint: http://127.0.0.1:$Port"
Write-Host "[CDP] Profile: $UserData"
Write-Host "[CDP] Use: `$env:CDP_PORT=$Port; node $PSScriptRoot\remote.js <command>"
