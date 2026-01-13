# LINE LIFF Setup Guide

## 📋 ภาพรวม

LINE LIFF (LINE Front-end Framework) ต้องการ HTTPS endpoint สำหรับ development และ production

## 🎯 วิธีทดสอบ LIFF

มี 2 วิธีหลัก:
1. **ngrok** - สำหรับ local development (ดูด้านล่าง)
2. **Vercel** - สำหรับ production-like testing (แนะนำ - ดู `VERCEL_DEPLOY.md`)

## 🚀 วิธีใช้ ngrok สำหรับ Development

### 1. ติดตั้ง ngrok

**Windows:**
```powershell
# Download จาก https://ngrok.com/download
# หรือใช้ Chocolatey
choco install ngrok

# หรือใช้ Scoop
scoop install ngrok
```

**macOS:**
```bash
brew install ngrok
```

**Linux:**
```bash
# Download binary จาก https://ngrok.com/download
# หรือใช้ package manager
```

### 2. สมัครและตั้งค่า ngrok

1. สมัคร account ที่ https://ngrok.com (ฟรี)
2. Copy **authtoken** จาก dashboard
3. ตั้งค่า authtoken:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 3. เริ่ม Next.js Development Server

```bash
npm run dev
```

Server จะรันที่ `http://localhost:3000`

### 4. เริ่ม ngrok Tunnel

เปิด terminal ใหม่ (ให้ Next.js server ยังรันอยู่):

```bash
ngrok http 3000
```

คุณจะเห็น output แบบนี้:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xx-xxx-xxx.ngrok-free.app -> http://localhost:3000
```

**สำคัญ:** Copy URL ที่ขึ้นต้นด้วย `https://` (เช่น `https://xxxx-xx-xx-xxx-xxx.ngrok-free.app`)

### 5. ตั้งค่า LINE LIFF App

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ของคุณ
3. ไปที่ **LIFF** tab
4. กด **Add** เพื่อสร้าง LIFF App ใหม่

**ตั้งค่า LIFF App:**
- **LIFF app name**: HR System Employee App
- **Size**: Full
- **Endpoint URL**: `https://xxxx-xx-xx-xxx-xxx.ngrok-free.app/liff/onboarding` (ใช้ ngrok URL)
- **Scope**: `profile`, `openid`
- **Bot feature**: Enable (ถ้าต้องการ)

5. Copy **LIFF ID** ที่ได้ (จะใช้ใน code)

### 6. ตั้งค่า Supabase LINE OAuth

1. ไปที่ Supabase Dashboard → Authentication → Providers
2. Enable **LINE** provider
3. ตั้งค่า:
   - **LINE Channel ID**: จาก LINE Developers Console
   - **LINE Channel Secret**: จาก LINE Developers Console
   - **Redirect URL**: `https://xxxx-xx-xx-xxx-xxx.ngrok-free.app/auth/callback` (ใช้ ngrok URL)

### 7. อัปเดต Environment Variables

เพิ่มใน `.env.local`:
```env
NEXT_PUBLIC_LIFF_ID=YOUR_LIFF_ID
NEXT_PUBLIC_NGROK_URL=https://xxxx-xx-xx-xxx-xxx.ngrok-free.app
```

### 8. ทดสอบ LIFF

1. เปิด LINE App บนมือถือ
2. ไปที่ Chat กับ Bot ของคุณ
3. ส่งข้อความหรือกดปุ่มที่เปิด LIFF App
4. หรือใช้ LIFF URL โดยตรง: `https://liff.line.me/YOUR_LIFF_ID`

---

## 🔧 Troubleshooting

### ngrok URL เปลี่ยนทุกครั้งที่ restart

**แก้ไข:** ใช้ ngrok static domain (ต้อง upgrade plan) หรือใช้ ngrok config file:

```yaml
# ngrok.yml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  web:
    proto: http
    addr: 3000
    domain: your-static-domain.ngrok-free.app  # ต้อง upgrade plan
```

รันด้วย:
```bash
ngrok start web
```

### CORS Error

ตรวจสอบว่า Supabase redirect URL ตั้งค่าถูกต้อง

### LINE OAuth ไม่ทำงาน

1. ตรวจสอบ Redirect URL ใน LINE Channel Settings
2. ตรวจสอบ Redirect URL ใน Supabase
3. ตรวจสอบ Channel ID และ Secret

---

## 📝 LIFF Endpoints ที่ต้องใช้

1. **Onboarding**: `/liff/onboarding?code=INVITE_CODE`
2. **Dashboard**: `/liff/dashboard`
3. **Auth Callback**: `/auth/callback`

---

## 🎯 Quick Start Commands

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy ngrok HTTPS URL และตั้งค่าใน:
# 1. LINE LIFF App Endpoint URL
# 2. Supabase LINE OAuth Redirect URL
```

---

## 📚 Resources

- [ngrok Documentation](https://ngrok.com/docs)
- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Supabase LINE OAuth](https://supabase.com/docs/guides/auth/social-login/auth-line)
