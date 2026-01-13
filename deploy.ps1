# PowerShell Script สำหรับ Deploy ไป Vercel
# ใช้คำสั่ง: .\deploy.ps1

Write-Host "🚀 HR System - Vercel Deployment Script" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่า Git ติดตั้งแล้วหรือยัง
Write-Host "📦 กำลังตรวจสอบ Git..." -ForegroundColor Yellow
$gitCheck = Get-Command git -ErrorAction SilentlyContinue
if ($gitCheck) {
    $gitVersion = git --version
    Write-Host "✅ Git พร้อมใช้งาน: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Git ยังไม่ได้ติดตั้ง!" -ForegroundColor Red
    Write-Host "📥 ดาวน์โหลด Git จาก: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "⚠️  หลังจากติดตั้งแล้ว ให้เปิด PowerShell ใหม่และรัน script นี้อีกครั้ง" -ForegroundColor Yellow
    exit
}

# ตรวจสอบว่า Node.js ติดตั้งแล้วหรือยัง
Write-Host ""
Write-Host "📦 กำลังตรวจสอบ Node.js..." -ForegroundColor Yellow
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js พร้อมใช้งาน: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js ยังไม่ได้ติดตั้ง!" -ForegroundColor Red
    Write-Host "📥 ดาวน์โหลด Node.js จาก: https://nodejs.org/" -ForegroundColor Yellow
    exit
}

# ตรวจสอบว่า npm ติดตั้งแล้วหรือยัง
Write-Host ""
Write-Host "📦 กำลังตรวจสอบ npm..." -ForegroundColor Yellow
$npmCheck = Get-Command npm -ErrorAction SilentlyContinue
if ($npmCheck) {
    $npmVersion = npm --version
    Write-Host "✅ npm พร้อมใช้งาน: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm ยังไม่ได้ติดตั้ง!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📋 ขั้นตอนการ Deploy:" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ขั้นตอนที่ 1: Initialize Git (ถ้ายังไม่มี)
Write-Host "1️⃣  กำลังตรวจสอบ Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository มีอยู่แล้ว" -ForegroundColor Green
} else {
    Write-Host "📝 กำลัง initialize Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository ถูกสร้างแล้ว" -ForegroundColor Green
}

# ขั้นตอนที่ 2: Add และ Commit files
Write-Host ""
Write-Host "2️⃣  กำลัง add files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files ถูก add แล้ว" -ForegroundColor Green

Write-Host ""
Write-Host "3️⃣  กำลัง commit..." -ForegroundColor Yellow
$commitMessage = "Deploy to Vercel: HR System"
git commit -m $commitMessage
Write-Host "✅ Commit สำเร็จ" -ForegroundColor Green

# ขั้นตอนที่ 3: ตรวจสอบ remote
Write-Host ""
Write-Host "4️⃣  กำลังตรวจสอบ Git remote..." -ForegroundColor Yellow
$remoteCheck = git remote get-url origin 2>$null
if ($remoteCheck) {
    Write-Host "✅ Git remote มีอยู่แล้ว: $remoteCheck" -ForegroundColor Green
    $remoteUrl = $remoteCheck
} else {
    Write-Host "⚠️  ยังไม่มี Git remote!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 คุณต้องสร้าง GitHub repository ก่อน:" -ForegroundColor Cyan
    Write-Host "   1. ไปที่ https://github.com/new" -ForegroundColor White
    Write-Host "   2. สร้าง repository ใหม่ (ชื่อ: hr-crm)" -ForegroundColor White
    Write-Host "   3. อย่า check Initialize with README" -ForegroundColor White
    Write-Host "   4. Copy repository URL" -ForegroundColor White
    Write-Host ""
    $githubUrl = Read-Host "📥 ใส่ GitHub repository URL (เช่น https://github.com/USERNAME/hr-crm.git) หรือกด Enter เพื่อข้าม"
    if ($githubUrl) {
        git remote add origin $githubUrl
        Write-Host "✅ Git remote ถูกเพิ่มแล้ว" -ForegroundColor Green
        $remoteUrl = $githubUrl
    } else {
        Write-Host "⚠️  ข้ามการตั้งค่า remote - คุณสามารถทำได้ภายหลัง" -ForegroundColor Yellow
    }
}

# ขั้นตอนที่ 4: Push ไป GitHub (ถ้ามี remote)
if ($remoteUrl -or (git remote get-url origin 2>$null)) {
    Write-Host ""
    Write-Host "5️⃣  กำลัง push ไป GitHub..." -ForegroundColor Yellow
    Write-Host "⚠️  คุณอาจต้องใส่ GitHub credentials" -ForegroundColor Yellow
    git branch -M main 2>$null
    git push -u origin main
    Write-Host "✅ Push สำเร็จ!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  ยังไม่ได้ push ไป GitHub" -ForegroundColor Yellow
    Write-Host "   คุณสามารถ push ได้ภายหลังด้วยคำสั่ง:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/USERNAME/hr-crm.git" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
}

# ขั้นตอนที่ 5: Deploy ไป Vercel
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 ขั้นตอน Deploy ไป Vercel:" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 คุณมี 2 วิธี:" -ForegroundColor Yellow
Write-Host ""
Write-Host "วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)" -ForegroundColor Green
Write-Host "   1. ไปที่ https://vercel.com" -ForegroundColor White
Write-Host "   2. Sign up/Login" -ForegroundColor White
Write-Host "   3. กด Add New Project" -ForegroundColor White
Write-Host "   4. Import Git Repository" -ForegroundColor White
Write-Host "   5. ตั้งค่า Environment Variables" -ForegroundColor White
Write-Host "      - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "      - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "   6. กด Deploy" -ForegroundColor White
Write-Host ""
Write-Host "วิธีที่ 2: ผ่าน Vercel CLI" -ForegroundColor Green
Write-Host "   npm i -g vercel" -ForegroundColor Gray
Write-Host "   vercel login" -ForegroundColor Gray
Write-Host "   vercel" -ForegroundColor Gray
Write-Host ""

# ถามว่าต้องการติดตั้ง Vercel CLI หรือไม่
$installVercel = Read-Host "❓ ต้องการติดตั้ง Vercel CLI ตอนนี้ไหม? (y/n)"
if ($installVercel -eq "y" -or $installVercel -eq "Y") {
    Write-Host ""
    Write-Host "📦 กำลังติดตั้ง Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
    Write-Host "✅ Vercel CLI ติดตั้งเสร็จแล้ว" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 ขั้นตอนต่อไป:" -ForegroundColor Cyan
    Write-Host "   1. vercel login" -ForegroundColor White
    Write-Host "   2. vercel" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✅ ใช้ Vercel Dashboard แทนได้" -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ เตรียมพร้อมแล้ว!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 ดูรายละเอียดเพิ่มเติมใน:" -ForegroundColor Yellow
Write-Host "   DEPLOY_STEPS.md" -ForegroundColor White
Write-Host "   VERCEL_DEPLOY.md" -ForegroundColor White
Write-Host ""
