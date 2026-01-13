# Simple PowerShell Script สำหรับ Deploy ไป Vercel
# ใช้คำสั่ง: .\deploy-simple.ps1

# Add Git to PATH if not already there
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $gitPath = "C:\Program Files\Git\cmd"
    if (Test-Path $gitPath) {
        $env:Path += ";$gitPath"
    }
}

Write-Host "HR System - Vercel Deployment Script" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบ Git
Write-Host "Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git is NOT installed! Download from: https://git-scm.com/download/win" -ForegroundColor Red
    Write-Host "After installing, please restart PowerShell and run this script again" -ForegroundColor Yellow
    exit
}

# ตรวจสอบ Node.js
Write-Host ""
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is NOT installed! Download from: https://nodejs.org/" -ForegroundColor Red
    exit
}

# Initialize Git
Write-Host ""
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Git repository created" -ForegroundColor Green
} else {
    Write-Host "Git repository already exists" -ForegroundColor Green
}

# Add and Commit
Write-Host ""
Write-Host "Adding files..." -ForegroundColor Yellow
git add .
Write-Host "Files added" -ForegroundColor Green

Write-Host ""
Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "Deploy to Vercel: HR System"
Write-Host "Committed" -ForegroundColor Green

# Check remote
Write-Host ""
Write-Host "Checking Git remote..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "Remote exists: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "No remote found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create GitHub repository first:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create new repository (name: hr-crm)" -ForegroundColor White
    Write-Host "3. Do NOT check Initialize with README" -ForegroundColor White
    Write-Host "4. Copy repository URL" -ForegroundColor White
    Write-Host ""
    $githubUrl = Read-Host "Enter GitHub repository URL (or press Enter to skip)"
    if ($githubUrl) {
        git remote add origin $githubUrl
        Write-Host "Remote added" -ForegroundColor Green
        $remoteUrl = $githubUrl
    }
}

# Push to GitHub
if ($remoteUrl) {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    Write-Host "You may need to enter GitHub credentials" -ForegroundColor Yellow
    git branch -M main 2>$null
    git push -u origin main
    Write-Host "Pushed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Skipping push - you can do it later with:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/USERNAME/hr-crm.git" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

# Deploy instructions
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Deploy to Vercel:" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Method 1: Via Vercel Dashboard (Recommended)" -ForegroundColor Green
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Sign up/Login" -ForegroundColor White
Write-Host "3. Click Add New Project" -ForegroundColor White
Write-Host "4. Import Git Repository (select hr-crm)" -ForegroundColor White
Write-Host "5. Set Environment Variables:" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "6. Click Deploy" -ForegroundColor White
Write-Host ""
Write-Host "Method 2: Via Vercel CLI" -ForegroundColor Green
Write-Host "   npm i -g vercel" -ForegroundColor Gray
Write-Host "   vercel login" -ForegroundColor Gray
Write-Host "   vercel" -ForegroundColor Gray
Write-Host ""

$installVercel = Read-Host "Install Vercel CLI now? (y/n)"
if ($installVercel -eq "y" -or $installVercel -eq "Y") {
    Write-Host ""
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
    Write-Host "Vercel CLI installed" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. vercel login" -ForegroundColor White
    Write-Host "2. vercel" -ForegroundColor White
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Ready!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "See details in:" -ForegroundColor Yellow
Write-Host "   DEPLOY_STEPS.md" -ForegroundColor White
Write-Host "   VERCEL_DEPLOY.md" -ForegroundColor White
Write-Host ""
