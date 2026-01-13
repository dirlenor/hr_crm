# Deploy to Vercel for LINE LIFF Testing

## 🚀 วิธี Deploy ไป Vercel (แนะนำสำหรับทดสอบ LIFF)

### ข้อดีของ Vercel
- ✅ HTTPS ฟรี (LINE LIFF ต้องการ HTTPS)
- ✅ URL คงที่ (ไม่เปลี่ยนเหมือน ngrok)
- ✅ Deploy ง่าย แค่ push ไป Git
- ✅ Auto-deploy เมื่อ push code ใหม่
- ✅ เหมาะกับ production-like testing

---

## 📋 ขั้นตอนการ Deploy

### 1. เตรียม Git Repository

**ถ้ายังไม่มี Git repository:**

```bash
# Initialize git (ถ้ายังไม่มี)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# สร้าง repository บน GitHub/GitLab/Bitbucket
# แล้ว push
git remote add origin https://github.com/YOUR_USERNAME/hr_crm.git
git branch -M main
git push -u origin main
```

**ถ้ามี Git repository อยู่แล้ว:**
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 2. Deploy ไป Vercel

#### วิธีที่ 1: ผ่าน Vercel Dashboard (แนะนำ)

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. กด **Add New Project**
3. Import Git Repository:
   - เลือก repository ของคุณ (GitHub/GitLab/Bitbucket)
   - หรือกด **Import** ถ้ายังไม่ได้เชื่อมต่อ
4. Configure Project:
   - **Framework Preset**: Next.js (auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
5. Environment Variables:
   - กด **Environment Variables**
   - เพิ่ม:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     NEXT_PUBLIC_LIFF_ID=your_liff_id (ถ้ามี)
     ```
6. กด **Deploy**

#### วิธีที่ 2: ผ่าน Vercel CLI

```bash
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
# - Project name? hr-crm (หรือชื่อที่ต้องการ)
# - Directory? ./
# - Override settings? No
```

### 3. ตั้งค่า Environment Variables

หลังจาก deploy แล้ว:

1. ไปที่ Vercel Dashboard → Project → Settings → Environment Variables
2. เพิ่ม:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_LIFF_ID` (ถ้ามี)

3. กด **Redeploy** เพื่อให้ environment variables มีผล

### 4. ตั้งค่า LINE LIFF App

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel → **LIFF** tab
3. สร้างหรือแก้ไข LIFF App:
   - **Endpoint URL**: `https://your-project.vercel.app/liff/onboarding`
     - หรือถ้าใช้ custom domain: `https://yourdomain.com/liff/onboarding`
   - **Scope**: `profile`, `openid`

### 5. ตั้งค่า Supabase LINE OAuth

1. ไปที่ Supabase Dashboard → Authentication → Providers
2. Enable **LINE** provider
3. ตั้งค่า Redirect URL:
   - `https://your-project.vercel.app/auth/callback`
   - หรือถ้าใช้ custom domain: `https://yourdomain.com/auth/callback`

### 6. ทดสอบ LIFF

1. เปิด LINE App บนมือถือ
2. ไปที่ Chat กับ Bot ของคุณ
3. ส่งข้อความหรือกดปุ่มที่เปิด LIFF App
4. หรือใช้ LIFF URL: `https://liff.line.me/YOUR_LIFF_ID`

---

## 🔧 Custom Domain (Optional)

### ตั้งค่า Custom Domain บน Vercel

1. ไปที่ Vercel Dashboard → Project → Settings → Domains
2. เพิ่ม domain ของคุณ (เช่น `hr.yourdomain.com`)
3. ตั้งค่า DNS records ตามที่ Vercel บอก:
   - เพิ่ม CNAME record: `hr` → `cname.vercel-dns.com`
4. รอให้ DNS propagate (อาจใช้เวลา 1-24 ชั่วโมง)

### อัปเดต LINE LIFF และ Supabase

หลังจากตั้งค่า custom domain แล้ว:

1. **LINE LIFF**: อัปเดต Endpoint URL เป็น `https://hr.yourdomain.com/liff/onboarding`
2. **Supabase**: อัปเดต Redirect URL เป็น `https://hr.yourdomain.com/auth/callback`

---

## 🔄 Auto-Deploy Workflow

### Automatic Deploy

เมื่อคุณ push code ไป Git:
```bash
git add .
git commit -m "Update feature"
git push
```

Vercel จะ auto-deploy ให้อัตโนมัติ!

### Preview Deployments

Vercel จะสร้าง preview URL สำหรับแต่ละ Pull Request:
- เหมาะสำหรับทดสอบก่อน merge
- URL แบบ: `https://hr-crm-git-feature-branch.vercel.app`

---

## 📝 Vercel Configuration File

สร้างไฟล์ `vercel.json` (optional) สำหรับ custom settings:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

---

## 🐛 Troubleshooting

### Build Error

**ปัญหา:** Build ล้มเหลว

**แก้ไข:**
1. ตรวจสอบ logs ใน Vercel Dashboard → Deployments
2. ตรวจสอบว่า environment variables ตั้งค่าถูกต้อง
3. ตรวจสอบว่า dependencies ใน `package.json` ครบ

### Environment Variables ไม่ทำงาน

**ปัญหา:** Environment variables ไม่มีผล

**แก้ไข:**
1. ตรวจสอบว่าใช้ `NEXT_PUBLIC_` prefix สำหรับ client-side variables
2. Redeploy project หลังจากเพิ่ม environment variables
3. ตรวจสอบว่า variables ตั้งค่าใน Production, Preview, และ Development

### LINE LIFF ไม่ทำงาน

**ปัญหา:** LIFF App ไม่เปิด

**แก้ไข:**
1. ตรวจสอบว่า Endpoint URL ใน LINE LIFF ตั้งค่าถูกต้อง (ต้องเป็น HTTPS)
2. ตรวจสอบว่า Supabase Redirect URL ตรงกับ Vercel URL
3. ตรวจสอบ Console logs ใน LINE App

---

## 🎯 Quick Start Checklist

- [ ] Push code ไป Git repository
- [ ] Import project ใน Vercel
- [ ] ตั้งค่า Environment Variables
- [ ] Deploy project
- [ ] Copy Vercel URL (เช่น `https://hr-crm.vercel.app`)
- [ ] ตั้งค่า LINE LIFF Endpoint URL
- [ ] ตั้งค่า Supabase LINE OAuth Redirect URL
- [ ] ทดสอบ LIFF App

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)

---

## 💡 Tips

1. **ใช้ Preview Deployments** สำหรับทดสอบ feature ใหม่ก่อน merge
2. **ตั้งค่า Custom Domain** ถ้าต้องการ URL ที่จำง่าย
3. **Monitor Deployments** ใน Vercel Dashboard เพื่อดู logs และ errors
4. **ใช้ Vercel Analytics** (ถ้า upgrade plan) เพื่อดู performance
