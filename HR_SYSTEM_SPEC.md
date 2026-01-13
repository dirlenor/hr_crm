# HR System Specification (Phase 1)

## 📋 ภาพรวมระบบ

ระบบบริหารทรัพยากรบุคคล (HR System) แบบ Multi-tenant สำหรับจัดการพนักงาน, เงินเดือน, การลา และการเข้า-ออกงาน

### ผู้ใช้งาน

| Role | Platform | สิทธิ์การใช้งาน |
|------|----------|----------------|
| **Owner/Admin** | Web Dashboard | จัดการทุกอย่าง |
| **HR Manager** | Web Dashboard | จัดการพนักงาน, เงินเดือน, อนุมัติลา |
| **Employee** | LINE LIFF | Clock in/out, ขอลา, ดูข้อมูลตัวเอง |

---

## 🗃️ Database Schema

### 1. `departments` (แผนก)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- name: text NOT NULL (เช่น "ฝ่ายขาย", "ฝ่ายบัญชี")
- description: text
- parent_id: uuid REFERENCES departments(id) -- สำหรับ sub-department
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
```

### 2. `positions` (ตำแหน่ง)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- department_id: uuid REFERENCES departments(id)
- name: text NOT NULL (เช่น "Manager", "Senior Developer")
- level: int DEFAULT 1 -- ระดับตำแหน่ง (1=Entry, 2=Junior, 3=Senior, 4=Lead, 5=Manager)
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
```

### 3. `salary_structures` (โครงสร้างเงินเดือน)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- position_id: uuid REFERENCES positions(id)
- base_salary_min: decimal(12,2) -- เงินเดือนขั้นต่ำ
- base_salary_max: decimal(12,2) -- เงินเดือนขั้นสูง
- ot_rate_multiplier: decimal(4,2) DEFAULT 1.5 -- ตัวคูณ OT ปกติ
- ot_holiday_multiplier: decimal(4,2) DEFAULT 3.0 -- ตัวคูณ OT วันหยุด
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
```

### 4. `employees` (พนักงาน)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- user_id: uuid REFERENCES auth.users(id) -- เชื่อมกับ Supabase Auth
- employee_code: text UNIQUE -- รหัสพนักงาน (เช่น EMP001)
- first_name: text NOT NULL
- last_name: text NOT NULL
- nickname: text
- email: text
- phone: text
- line_user_id: text -- LINE User ID สำหรับ LIFF
- department_id: uuid REFERENCES departments(id)
- position_id: uuid REFERENCES positions(id)
- employment_type: text DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern'))
- start_date: date NOT NULL -- วันเริ่มงาน
- end_date: date -- วันสิ้นสุดสัญญา (ถ้ามี)
- status: text DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'terminated', 'on-leave'))
- base_salary: decimal(12,2) -- เงินเดือนปัจจุบัน
- bank_account: text -- เลขบัญชีธนาคาร
- bank_name: text -- ชื่อธนาคาร
- tax_id: text -- เลขประจำตัวผู้เสียภาษี
- social_security_id: text -- เลขประกันสังคม
- avatar_url: text
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
- created_by: uuid REFERENCES auth.users(id)
- updated_by: uuid REFERENCES auth.users(id)
```

### 5. `work_schedules` (ตารางเวลาทำงาน)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- name: text NOT NULL (เช่น "Office Hours", "Shift A")
- work_start_time: time NOT NULL (เช่น '09:00')
- work_end_time: time NOT NULL (เช่น '18:00')
- break_minutes: int DEFAULT 60 -- พักเที่ยง
- work_days: text[] DEFAULT '{mon,tue,wed,thu,fri}' -- วันทำงาน
- late_threshold_minutes: int DEFAULT 15 -- สายเกินกี่นาทีถือว่ามาสาย
- created_at: timestamptz DEFAULT now()
```

### 6. `employee_schedules` (กำหนดตารางให้พนักงาน)
```sql
- id: uuid PRIMARY KEY
- employee_id: uuid REFERENCES employees(id)
- schedule_id: uuid REFERENCES work_schedules(id)
- effective_date: date NOT NULL -- วันที่เริ่มใช้ตาราง
- created_at: timestamptz DEFAULT now()
```

### 7. `attendances` (บันทึกเข้า-ออกงาน)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- employee_id: uuid REFERENCES employees(id)
- date: date NOT NULL
- clock_in: timestamptz -- เวลาเข้างาน
- clock_out: timestamptz -- เวลาออกงาน
- clock_in_location: jsonb -- {lat, lng, address}
- clock_out_location: jsonb
- clock_in_photo_url: text -- รูปถ่ายตอน clock in
- status: text DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent', 'half-day', 'holiday', 'leave'))
- late_minutes: int DEFAULT 0 -- สายกี่นาที
- ot_minutes: int DEFAULT 0 -- OT กี่นาที
- notes: text
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()

UNIQUE(employee_id, date)
```

### 8. `leave_types` (ประเภทการลา)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- name: text NOT NULL (เช่น "ลาป่วย", "ลาพักร้อน", "ลากิจ")
- name_en: text
- days_per_year: int -- จำนวนวันลาต่อปี (null = ไม่จำกัด)
- is_paid: boolean DEFAULT true -- ลาแบบได้เงินเดือนหรือไม่
- requires_approval: boolean DEFAULT true
- requires_document: boolean DEFAULT false -- ต้องแนบเอกสารไหม
- advance_days: int DEFAULT 0 -- ต้องขอล่วงหน้ากี่วัน
- created_at: timestamptz DEFAULT now()
```

### 9. `leave_balances` (ยอดวันลาคงเหลือ)
```sql
- id: uuid PRIMARY KEY
- employee_id: uuid REFERENCES employees(id)
- leave_type_id: uuid REFERENCES leave_types(id)
- year: int NOT NULL
- total_days: decimal(4,1) -- วันลาทั้งหมด
- used_days: decimal(4,1) DEFAULT 0 -- ใช้ไปแล้ว
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()

UNIQUE(employee_id, leave_type_id, year)
```

### 10. `leave_requests` (คำขอลา)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- employee_id: uuid REFERENCES employees(id)
- leave_type_id: uuid REFERENCES leave_types(id)
- start_date: date NOT NULL
- end_date: date NOT NULL
- total_days: decimal(4,1) NOT NULL
- reason: text
- document_url: text -- แนบเอกสาร
- status: text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
- approved_by: uuid REFERENCES auth.users(id)
- approved_at: timestamptz
- rejection_reason: text
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
```

### 11. `payroll_periods` (งวดเงินเดือน)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- name: text NOT NULL (เช่น "January 2024")
- start_date: date NOT NULL
- end_date: date NOT NULL
- pay_date: date -- วันจ่ายเงินเดือน
- status: text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid'))
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
- created_by: uuid REFERENCES auth.users(id)
```

### 12. `payroll_items` (รายการเงินเดือนพนักงาน)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- payroll_period_id: uuid REFERENCES payroll_periods(id)
- employee_id: uuid REFERENCES employees(id)

-- รายได้
- base_salary: decimal(12,2) -- เงินเดือนพื้นฐาน
- ot_hours: decimal(6,2) DEFAULT 0 -- ชั่วโมง OT
- ot_amount: decimal(12,2) DEFAULT 0 -- เงิน OT
- allowances: decimal(12,2) DEFAULT 0 -- เบี้ยเลี้ยง/ค่าเดินทาง
- bonus: decimal(12,2) DEFAULT 0 -- โบนัส
- other_income: decimal(12,2) DEFAULT 0 -- รายได้อื่นๆ

-- หัก
- late_deduction: decimal(12,2) DEFAULT 0 -- หักมาสาย
- absent_deduction: decimal(12,2) DEFAULT 0 -- หักขาดงาน
- tax: decimal(12,2) DEFAULT 0 -- ภาษี
- social_security: decimal(12,2) DEFAULT 0 -- ประกันสังคม
- other_deduction: decimal(12,2) DEFAULT 0 -- หักอื่นๆ

-- สรุป
- gross_salary: decimal(12,2) -- รายได้รวม
- total_deduction: decimal(12,2) -- หักรวม
- net_salary: decimal(12,2) -- เงินเดือนสุทธิ

- notes: text
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()

UNIQUE(payroll_period_id, employee_id)
```

### 13. `holidays` (วันหยุด)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- date: date NOT NULL
- name: text NOT NULL (เช่น "วันสงกรานต์")
- is_paid: boolean DEFAULT true
- created_at: timestamptz DEFAULT now()

UNIQUE(org_id, date)
```

### 14. `ot_requests` (คำขอทำ OT)
```sql
- id: uuid PRIMARY KEY
- org_id: uuid REFERENCES orgs(id)
- employee_id: uuid REFERENCES employees(id)
- date: date NOT NULL
- start_time: time NOT NULL
- end_time: time NOT NULL
- hours: decimal(4,2) NOT NULL
- reason: text
- status: text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
- approved_by: uuid REFERENCES auth.users(id)
- approved_at: timestamptz
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
```

---

## 🔐 RLS Policies

### หลักการ
1. **org_id isolation** - ทุก table ต้องกรองด้วย org_id
2. **Employee self-access** - พนักงานดูได้เฉพาะข้อมูลตัวเอง
3. **Manager access** - HR/Admin ดูได้ทั้งองค์กร

### ตัวอย่าง Policy

```sql
-- employees: พนักงานดูได้เฉพาะตัวเอง, Admin ดูได้ทั้งหมด
CREATE POLICY "employees_select" ON employees
FOR SELECT USING (
  org_id = get_user_org_id(auth.uid())
  AND (
    user_id = auth.uid() -- ดูตัวเอง
    OR has_permission(auth.uid(), 'employees.read') -- หรือมีสิทธิ์
  )
);

-- attendances: พนักงานดูได้เฉพาะของตัวเอง
CREATE POLICY "attendances_select" ON attendances
FOR SELECT USING (
  org_id = get_user_org_id(auth.uid())
  AND (
    employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
    OR has_permission(auth.uid(), 'attendances.read')
  )
);

-- leave_requests: พนักงานจัดการได้เฉพาะของตัวเอง
CREATE POLICY "leave_requests_insert" ON leave_requests
FOR INSERT WITH CHECK (
  org_id = get_user_org_id(auth.uid())
  AND employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
);
```

---

## 📱 LINE LIFF Features (สำหรับพนักงาน)

### 1. Clock In/Out
- ถ่ายรูป Selfie
- บันทึก GPS Location
- แสดงสถานะ (ตรงเวลา/สาย)

### 2. ขอลา
- เลือกประเภทลา
- เลือกวันที่
- แนบเอกสาร (ถ้าต้องการ)
- ดูสถานะคำขอ

### 3. ดูข้อมูลตัวเอง
- ข้อมูลส่วนตัว
- ยอดวันลาคงเหลือ
- ประวัติการเข้างาน
- สลิปเงินเดือน

### 4. ขอทำ OT
- ระบุวันและเวลา
- ระบุเหตุผล
- ดูสถานะคำขอ

---

## 🖥️ Admin Dashboard Features

### 1. Dashboard
- จำนวนพนักงานทั้งหมด
- พนักงานเข้างานวันนี้
- คำขอลารออนุมัติ
- คำขอ OT รออนุมัติ
- กราฟการเข้างานรายเดือน

### 2. Employees (พนักงาน)
- รายชื่อพนักงาน
- เพิ่ม/แก้ไข/ลบพนักงาน
- ดูรายละเอียดพนักงาน
- กำหนดแผนก/ตำแหน่ง

### 3. Departments (แผนก)
- จัดการโครงสร้างแผนก
- ดูพนักงานในแผนก

### 4. Positions (ตำแหน่ง)
- จัดการตำแหน่ง
- กำหนดโครงสร้างเงินเดือน

### 5. Attendance (การเข้างาน)
- ดูการเข้างานรายวัน/รายเดือน
- แก้ไขบันทึก (Admin only)
- รายงานมาสาย/ขาดงาน

### 6. Leave Management (จัดการลา)
- ดูคำขอลา
- อนุมัติ/ปฏิเสธ
- ตั้งค่าประเภทลา
- ดูยอดวันลาพนักงาน

### 7. OT Management
- ดูคำขอ OT
- อนุมัติ/ปฏิเสธ
- รายงาน OT รายเดือน

### 8. Payroll (เงินเดือน)
- สร้างงวดเงินเดือน
- คำนวณเงินเดือนอัตโนมัติ
- แก้ไขรายการ
- อนุมัติและจ่าย
- พิมพ์สลิปเงินเดือน

### 9. Settings
- ตั้งค่าองค์กร
- ตั้งค่าตารางเวลาทำงาน
- ตั้งค่าวันหยุด
- จัดการ Roles/Permissions

### 10. Reports
- รายงานการเข้างาน
- รายงานการลา
- รายงาน OT
- รายงานเงินเดือน
- Export Excel/PDF

---

## 🔑 Permissions

```
-- พนักงาน
employees.read
employees.create
employees.update
employees.delete

-- แผนก/ตำแหน่ง
departments.read
departments.manage
positions.read
positions.manage

-- การเข้างาน
attendances.read
attendances.manage

-- การลา
leaves.read
leaves.request (ขอลาตัวเอง)
leaves.approve

-- OT
ot.read
ot.request (ขอ OT ตัวเอง)
ot.approve

-- เงินเดือน
payroll.read
payroll.manage
payroll.approve

-- ตั้งค่า
settings.manage
users.manage
roles.manage
```

---

## 📅 Implementation Plan

### Phase 1.1 - Foundation (Current Sprint)
- [ ] ลบ CRM tables (crm_customers, crm_deals, crm_notes)
- [ ] สร้าง HR tables ใหม่
- [ ] สร้าง RLS policies
- [ ] เพิ่ม Permissions ใหม่

### Phase 1.2 - Employee Management
- [ ] CRUD Departments
- [ ] CRUD Positions
- [ ] CRUD Employees
- [ ] Salary Structure

### Phase 1.3 - Attendance
- [ ] Work Schedules
- [ ] Attendance records
- [ ] Late/Absent tracking

### Phase 1.4 - Leave Management
- [ ] Leave Types
- [ ] Leave Requests
- [ ] Leave Balances
- [ ] Approval workflow

### Phase 1.5 - Payroll
- [ ] Payroll Periods
- [ ] Salary Calculation
- [ ] Payslip generation

### Phase 2 - LINE LIFF
- [ ] LIFF App setup
- [ ] Clock in/out
- [ ] Leave request
- [ ] View personal info

---

## ⚙️ Tech Stack

- **Frontend (Admin)**: Next.js + Tailwind + shadcn/ui
- **Frontend (Employee)**: LINE LIFF + React
- **Backend**: Supabase (Postgres + Auth + RLS)
- **Auth**: Supabase Auth (Email + LINE OAuth)

---

## 📝 Notes

1. **Multi-tenant**: รองรับหลายบริษัท แยกด้วย org_id
2. **LINE LIFF**: พนักงานใช้งานผ่าน LINE เท่านั้น ไม่ต้อง login แยก
3. **Timezone**: ใช้ Asia/Bangkok เป็นหลัก
4. **Currency**: THB (บาท)
