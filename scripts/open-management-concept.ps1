$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$hostAddress = "127.0.0.1"
$port = 4174
$vitePath = Join-Path $projectRoot "node_modules\vite\bin\vite.js"
$stdoutPath = Join-Path $projectRoot "management-concept-dev.stdout.log"
$stderrPath = Join-Path $projectRoot "management-concept-dev.stderr.log"
$pageMarker = "management-concept/main\.tsx"

function Get-ManagementConceptPage {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PageUrl,
    [int]$TimeoutSeconds = 2
  )

  $responseLines = curl.exe -s --max-time $TimeoutSeconds $PageUrl
  $curlExitCode = $LASTEXITCODE
  $html = ($responseLines -join "`n")
  $isExpectedPage = [bool](
    $curlExitCode -eq 0 -and
    $html -match $pageMarker
  )

  return [pscustomobject]@{
    Html = $html
    CurlExitCode = $curlExitCode
    IsExpectedPage = $isExpectedPage
  }
}

if (-not (Test-Path -LiteralPath $vitePath)) {
  throw "Vite was not found. Install the project dependencies first."
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) {
  $nodeCommand.Source
} else {
  Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
}

if (-not (Test-Path -LiteralPath $nodePath)) {
  throw "Node.js was not found. Install Node.js or open the page from Codex."
}

$serverReady = $false
$selectedPort = $null
for ($candidatePort = 4174; $candidatePort -le 4194; $candidatePort += 1) {
  $candidateUrl = "http://${hostAddress}:${candidatePort}/ai-fpa-concept/management-concept.html"
  $listener = Get-NetTCPConnection -LocalPort $candidatePort -State Listen -ErrorAction SilentlyContinue

  if ($listener) {
    $candidatePage = Get-ManagementConceptPage -PageUrl $candidateUrl -TimeoutSeconds 1
    if ([bool]$candidatePage.IsExpectedPage) {
      $selectedPort = $candidatePort
      $serverReady = $true
      break
    }
    continue
  }

  $selectedPort = $candidatePort
  break
}

$port = $selectedPort
if ($null -eq $port) {
  throw "No available development server port was found between 4174 and 4194."
}

$url = "http://${hostAddress}:${port}/ai-fpa-concept/management-concept.html#ai"
$pageUrl = $url.Split("#")[0]

if (-not $serverReady) {
  $viteProcess = Start-Process `
    -FilePath $nodePath `
    -ArgumentList @($vitePath, "--host", $hostAddress, "--port", "$port", "--strictPort") `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -PassThru

  for ($attempt = 0; $attempt -lt 40; $attempt += 1) {
    Start-Sleep -Milliseconds 250
    if ($viteProcess.HasExited) {
      break
    }

    $startedPage = Get-ManagementConceptPage -PageUrl $pageUrl -TimeoutSeconds 1
    if ([bool]$startedPage.IsExpectedPage) {
      $serverReady = $true
      break
    }
  }
}

$page = Get-ManagementConceptPage -PageUrl $pageUrl -TimeoutSeconds 2
if (-not [bool]$page.IsExpectedPage) {
  throw "The expected management concept page could not be started."
}

Start-Process -FilePath $url
exit 0
