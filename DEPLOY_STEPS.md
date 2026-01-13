# 🚀 Step-by-Step: Deploy to Vercel

## ✅ ขั้นตอนที่ 1: ติดตั้ง Git (ถ้ายังไม่มี)

### Windows:
1. Download Git จาก: https://git-scm.com/download/win
2. ติดตั้ง (ใช้ default settings)
3. เปิด PowerShell ใหม่

### ตรวจสอบว่า Git ติดตั้งแล้ว:
```powershell
git --version
```

---

## ✅ ขั้นตอนที่ 2: Initialize Git Repository

เปิด PowerShell ในโฟลเดอร์ project:

```powershell
cd "C:\Users\Captain Windows\Desktop\hr_crm"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: HR System ready for deployment"
```

---

## ✅ ขั้นตอนที่ 3: สร้าง GitHub Repository

1. ไปที่ https://github.com/new
2. สร้าง repository ใหม่:
   - **Repository name**: `hr-crm` (หรือชื่อที่ต้องการ)
   - **Visibility**: Private (แนะนำ) หรือ Public
   - **อย่า** check "Initialize with README" (เพราะเรามี code อยู่แล้ว)
3. กด **Create repository**

---

## ✅ ขั้นตอนที่ 4: Push Code ไป GitHub

```powershell
# Add remote (แทน YOUR_USERNAME ด้วย GitHub username ของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/hr-crm.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

**หมายเหตุ:** GitHub จะถาม username และ password (ใช้ Personal Access Token แทน password)

---

## ✅ ขั้นตอนที่ 5: Deploy ไป Vercel

### วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)

1. **ไปที่ Vercel:**
   - เปิด https://vercel.com
   - Sign up/Login (ใช้ GitHub account ได้)

2. **Import Project:**
   - กด **Add New Project**
   - เลือก **Import Git Repository**
   - เลือก repository `hr-crm` ที่เพิ่งสร้าง
   - กด **Import**

3. **Configure Project:**
   - **Framework Preset**: Next.js (auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

4. **Environment Variables:**
   - กด **Environment Variables**
   - เพิ่ม:
     ```
     Name: NEXT_PUBLIC_SUPABASE_URL
     Value: (copy จาก .env.local หรือ Supabase Dashboard)
     ```
     ```
     Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
     Value: (copy จาก .env.local หรือ Supabase Dashboard)
     ```
   - **Environment**: เลือก Production, Preview, Development (ทั้ง 3)
   - กด **Add** สำหรับแต่ละตัว

5. **Deploy:**
   - กด **Deploy**
   - รอให้ build เสร็จ (ประมาณ 2-5 นาที)

6. **Copy Deployment URL:**
   - หลังจาก deploy สำเร็จ จะได้ URL แบบ:
     - `https://hr-crm.vercel.app` (หรือชื่อที่ Vercel สุ่มให้)
   - Copy URL นี้ไว้

### วิธีที่ 2: ผ่าน Vercel CLI

```powershell
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (เลือก account)
# - Link to existing project? No
# - Project name? hr-crm
# - Directory? ./
# - Override settings? No
```

---

## ✅ ขั้นตอนที่ 6: ตั้งค่า LINE LIFF

1. **ไปที่ LINE Developers Console:**
   - เปิด https://developers.line.biz/console/
   - เลือก Channel ของคุณ

2. **ตั้งค่า LIFF App:**
   - ไปที่ **LIFF** tab
   - สร้าง LIFF App ใหม่ หรือแก้ไขที่มีอยู่:
     - **LIFF app name**: HR System Employee App
     - **Size**: Full
     - **Endpoint URL**: `https://hr-crm.vercel.app/liff/onboarding`
       (ใช้ Vercel URL ที่ได้จากขั้นตอนที่ 5)
     - **Scope**: `profile`, `openid`
   - Copy **LIFF ID** ที่ได้

3. **ตั้งค่า Supabase LINE OAuth:**
   - ไปที่ Supabase Dashboard → Authentication → Providers
   - Enable **LINE** provider
   - ตั้งค่า:
     - **LINE Channel ID**: จาก LINE Developers Console
     - **LINE Channel Secret**: จาก LINE Developers Console
     - **Redirect URL**: `https://hr-crm.vercel.app/auth/callback`
       (ใช้ Vercel URL เดียวกัน)

---

## ✅ ขั้นตอนที่ 7: ทดสอบ LIFF

1. **เปิด LINE App** บนมือถือ
2. **ไปที่ Chat** กับ Bot ของคุณ
3. **ส่งข้อความ** หรือกดปุ่มที่เปิด LIFF App
4. **หรือใช้ LIFF URL โดยตรง:**
   - `https://liff.line.me/YOUR_LIFF_ID`

---

## 🔄 Auto-Deploy (Optional)

หลังจากตั้งค่าแล้ว ทุกครั้งที่ push code ใหม่:

```powershell
git add .
git commit -m "Update feature"
git push
```

Vercel จะ auto-deploy ให้อัตโนมัติ!

---

## 🐛 Troubleshooting

### Build Error
- ตรวจสอบ logs ใน Vercel Dashboard → Deployments
- ตรวจสอบว่า environment variables ตั้งค่าถูกต้อง

### LINE LIFF ไม่ทำงาน
- ตรวจสอบว่า Endpoint URL ใน LINE LIFF ตั้งค่าถูกต้อง (ต้องเป็น HTTPS)
- ตรวจสอบว่า Supabase Redirect URL ตรงกับ Vercel URL

### Environment Variables ไม่ทำงาน
- ตรวจสอบว่าใช้ `NEXT_PUBLIC_` prefix
- Redeploy project หลังจากเพิ่ม environment variables

---

## 📝 Checklist

- [ ] ติดตั้ง Git
- [ ] Initialize Git repository
- [ ] สร้าง GitHub repository
- [ ] Push code ไป GitHub
- [ ] Deploy ไป Vercel
- [ ] ตั้งค่า Environment Variables
- [ ] Copy Vercel URL
- [ ] ตั้งค่า LINE LIFF Endpoint URL
- [ ] ตั้งค่า Supabase LINE OAuth Redirect URL
- [ ] ทดสอบ LIFF App

---

## 🎯 Quick Commands

```powershell
# Initialize & Push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hr-crm.git
git branch -M main
git push -u origin main

# Deploy to Vercel (via CLI)
npm i -g vercel
vercel login
vercel
```

---

## 📚 Resources

- [Git Download](https://git-scm.com/download/win)
- [GitHub](https://github.com)
- [Vercel](https://vercel.com)
- [LINE Developers Console](https://developers.line.biz/console/)
