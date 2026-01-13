# 📱 วิธีเข้าถึงหน้า LIFF

## ⚠️ สิ่งสำคัญ

**LIFF (LINE Front-end Framework) ต้องเปิดผ่าน LINE App เท่านั้น!**
- ❌ ไม่สามารถเปิดผ่าน browser ธรรมดาได้
- ✅ ต้องเปิดผ่าน LINE App บนมือถือ หรือ LINE Web
- ✅ ต้องตั้งค่า LINE LIFF App ใน LINE Developers Console ก่อน

---

## 🚀 ขั้นตอนการตั้งค่าและเข้าถึง LIFF

### 1. ตั้งค่า LINE LIFF App ใน LINE Developers Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก **Channel** ของคุณ (หรือสร้างใหม่)
3. ไปที่แท็บ **LIFF**
4. กด **Add** เพื่อสร้าง LIFF App ใหม่

**ตั้งค่า LIFF App:**
- **LIFF app name**: `HR System Employee App`
- **Size**: `Full` (หรือ `Tall` ตามต้องการ)
- **Endpoint URL**: `https://hrcrm-three.vercel.app/liff/onboarding`
  - หรือใช้: `https://hr-dcv94bpc8-thanawatsiriwisitthana-gmailcoms-projects.vercel.app/liff/onboarding`
- **Scope**: 
  - ✅ `profile`
  - ✅ `openid`
  - ✅ `email` (ถ้าต้องการ)
- **Bot feature**: Enable (ถ้าต้องการ)

5. กด **Add** แล้ว **Copy LIFF ID** ที่ได้ (จะใช้ในขั้นตอนต่อไป)

---

### 2. ตั้งค่า Supabase LINE OAuth

1. ไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
2. เลือก Project ของคุณ
3. ไปที่ **Authentication** → **Providers**
4. Enable **LINE** provider
5. ตั้งค่า:
   - **LINE Channel ID**: จาก LINE Developers Console → Channel Settings
   - **LINE Channel Secret**: จาก LINE Developers Console → Channel Settings
   - **Redirect URL**: `https://hrcrm-three.vercel.app/auth/callback`
     - หรือใช้: `https://hr-dcv94bpc8-thanawatsiriwisitthana-gmailcoms-projects.vercel.app/auth/callback`

6. กด **Save**

---

### 3. อัปเดต Environment Variables ใน Vercel (ถ้าต้องการ)

ถ้าต้องการใช้ LIFF ID ใน code:

1. ไปที่ [Vercel Dashboard](https://vercel.com/thanawatsiriwisitthana-gmailcoms-projects/hr_crm)
2. ไปที่ **Settings** → **Environment Variables**
3. เพิ่ม:
   - `NEXT_PUBLIC_LIFF_ID` = `YOUR_LIFF_ID` (จากขั้นตอนที่ 1)
4. กด **Save** และ **Redeploy**

---

### 4. วิธีเข้าถึง LIFF

#### วิธีที่ 1: ผ่าน LINE App (แนะนำ)

1. เปิด **LINE App** บนมือถือ
2. ไปที่ **Chat** กับ Bot ของคุณ
3. ส่งข้อความหรือกดปุ่มที่เปิด LIFF App
4. หรือใช้ **LIFF URL** โดยตรง:
   ```
   https://liff.line.me/YOUR_LIFF_ID
   ```

#### วิธีที่ 2: ผ่าน LINE Web

1. เปิด [LINE Web](https://web.line.me/)
2. ไปที่ Chat กับ Bot
3. กดปุ่มหรือลิงก์ที่เปิด LIFF App

#### วิธีที่ 3: ผ่าน QR Code (ถ้ามี)

1. สร้าง QR Code ที่ชี้ไปที่: `https://liff.line.me/YOUR_LIFF_ID`
2. Scan QR Code ด้วย LINE App

---

## 🔗 LIFF URLs

### Onboarding Page (ลงทะเบียนพนักงาน)
```
https://liff.line.me/YOUR_LIFF_ID
```
หรือ
```
https://liff.line.me/YOUR_LIFF_ID?code=INVITE_CODE
```

### Dashboard Page (หลังลงทะเบียนแล้ว)
```
https://liff.line.me/YOUR_LIFF_ID/dashboard
```
(ต้อง redirect ภายใน LIFF app)

---

## 🧪 ทดสอบ LIFF

### 1. ทดสอบผ่าน Browser (จำกัด)

**หมายเหตุ:** LIFF จะไม่ทำงานเต็มที่ใน browser ธรรมดา แต่สามารถดู UI ได้:

- Onboarding: https://hrcrm-three.vercel.app/liff/onboarding
- Dashboard: https://hrcrm-three.vercel.app/liff/dashboard

### 2. ทดสอบผ่าน LINE App (แนะนำ)

1. เปิด LINE App
2. ไปที่ Chat กับ Bot
3. ส่งข้อความหรือกดปุ่ม LIFF
4. หรือเปิด URL: `https://liff.line.me/YOUR_LIFF_ID`

---

## 📋 Checklist

- [ ] สร้าง LINE Channel ใน LINE Developers Console
- [ ] สร้าง LIFF App และได้ LIFF ID
- [ ] ตั้งค่า LIFF Endpoint URL เป็น Vercel URL
- [ ] Enable LINE OAuth ใน Supabase
- [ ] ตั้งค่า Redirect URL ใน Supabase
- [ ] ทดสอบเปิด LIFF ผ่าน LINE App

---

## 🐛 Troubleshooting

### LIFF ไม่เปิดใน LINE App

1. ตรวจสอบว่า LIFF ID ถูกต้อง
2. ตรวจสอบว่า LIFF App ถูก Enable แล้ว
3. ตรวจสอบว่า Endpoint URL ถูกต้องและ accessible

### LINE OAuth ไม่ทำงาน

1. ตรวจสอบ Redirect URL ใน Supabase ตรงกับ Vercel URL
2. ตรวจสอบ Channel ID และ Secret ถูกต้อง
3. ตรวจสอบว่า LINE OAuth ถูก Enable ใน Supabase

### หน้า LIFF แสดง Error

1. ตรวจสอบ Environment Variables ใน Vercel
2. ตรวจสอบ Logs ใน Vercel Dashboard
3. ตรวจสอบว่า Supabase URL และ Key ถูกต้อง

---

## 📚 Resources

- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [LINE Developers Console](https://developers.line.biz/console/)
- [Supabase LINE OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-line)
