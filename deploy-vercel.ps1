# PowerShell Script สำหรับ Deploy ไป Vercel
# ใช้คำสั่ง: .\deploy-vercel.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Deploy HR System to Vercel" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Add npm to PATH
$env:Path += ";$env:APPDATA\npm"

# Check if vercel is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
}

# Check if logged in
Write-Host ""
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Starting login process..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "A browser window will open for authentication." -ForegroundColor Cyan
    Write-Host "Please complete the login process..." -ForegroundColor Cyan
    Write-Host ""
    vercel login
} else {
    Write-Host "Already logged in as: $whoami" -ForegroundColor Green
}

# Read environment variables from .env.local
Write-Host ""
Write-Host "Reading environment variables..." -ForegroundColor Yellow
$envFile = ".env.local"
$supabaseUrl = $null
$supabaseKey = $null

if (Test-Path $envFile) {
    $content = Get-Content $envFile
    foreach ($line in $content) {
        if ($line -match "^NEXT_PUBLIC_SUPABASE_URL=(.+)$") {
            $supabaseUrl = $matches[1].Trim()
        }
        if ($line -match "^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)$") {
            $supabaseKey = $matches[1].Trim()
        }
    }
    
    if ($supabaseUrl -and $supabaseKey) {
        Write-Host "Environment variables found in .env.local" -ForegroundColor Green
        Write-Host "  NEXT_PUBLIC_SUPABASE_URL: $($supabaseUrl.Substring(0, [Math]::Min(50, $supabaseUrl.Length)))..." -ForegroundColor Gray
        Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY: $($supabaseKey.Substring(0, [Math]::Min(30, $supabaseKey.Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "Warning: Could not find environment variables in .env.local" -ForegroundColor Yellow
        Write-Host "You will need to set them manually in Vercel Dashboard" -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: .env.local not found" -ForegroundColor Yellow
    Write-Host "You will need to set environment variables manually in Vercel Dashboard" -ForegroundColor Yellow
}

# Deploy
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting deployment..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if ($supabaseUrl -and $supabaseKey) {
    Write-Host "Deploying with environment variables..." -ForegroundColor Yellow
    $env:NEXT_PUBLIC_SUPABASE_URL = $supabaseUrl
    $env:NEXT_PUBLIC_SUPABASE_ANON_KEY = $supabaseKey
    vercel --yes --prod
} else {
    Write-Host "Deploying (environment variables will need to be set in Vercel Dashboard)..." -ForegroundColor Yellow
    vercel --yes --prod
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app should be available at:" -ForegroundColor Yellow
Write-Host "  https://hr-crm-*.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "Check your Vercel Dashboard for the exact URL:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
