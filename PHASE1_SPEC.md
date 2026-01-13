# Phase 1: Multi-Tenant CRM Backoffice - Specification Document

**⚠️ สำคัญ: อ่านไฟล์นี้ก่อนเริ่มทำงานทุกครั้ง**

## 📋 Overview

สร้าง multi-tenant SaaS CRM Backoffice ที่ production-ready โดยใช้:
- **Next.js 14+** (App Router) + TypeScript
- **Supabase** (Postgres + Auth + RLS)
- **Tailwind CSS** + **shadcn/ui**
- **MCP Supabase** tools สำหรับ database management

## 🎯 Core Requirements

### Multi-Tenant Architecture
- **Tenant Isolation**: ทุก business table ต้องมี `org_id`
- **RLS Enforcement**: ใช้ RLS เป็นตัวบังคับ tenant isolation **ห้ามพึ่ง frontend filtering**
- **User-Org Relationship**: ผู้ใช้ 1 คน = 1 org (Phase 1)

### Authentication
- **Methods**: 
  - Supabase Auth (email/password)
  - LINE OAuth (รองรับการสมัครผ่าน LINE)
- **LINE LIFF**: Phase 1 ยังไม่มี LINE LIFF แต่ต้องเตรียม schema และ auth flow รองรับไว้
- **Onboarding Flow**:
  - ผู้ใช้คนแรก → สร้าง org → กลายเป็น Owner
  - ผู้ใช้คนถัดไป → ต้อง join ด้วย invite code
  - รองรับทั้ง email/password และ LINE OAuth

### RBAC System
- **Permission-Based**: ใช้ permission keys แทน hard-coded role checks
- **Function**: `has_permission(user_id, permission_key)` ใน Postgres
- **RLS Integration**: ทุก policy ต้องเช็ค permission ผ่าน function นี้

## 🗄️ Database Schema

### Core Tables

#### 1. `orgs`
```sql
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- name: text NOT NULL
- created_at: timestamptz DEFAULT now()
```

#### 2. `profiles`
```sql
- id: uuid PRIMARY KEY REFERENCES auth.users(id)
- org_id: uuid NOT NULL REFERENCES orgs(id)
- email: text (optional cache, สำหรับ email/password auth)
- display_name: text
- avatar_url: text (optional, สำหรับ LINE profile picture)
- auth_provider: text DEFAULT 'email' CHECK (auth_provider IN ('email', 'line'))
- line_user_id: text UNIQUE (optional, สำหรับ LINE users)
- status: text DEFAULT 'active' CHECK (status IN ('active', 'suspended'))
- created_at: timestamptz DEFAULT now()
```

**Notes:**
- `line_user_id`: เก็บ LINE user ID จาก LINE OAuth (unique เพื่อป้องกัน duplicate)
- `auth_provider`: บอกว่า user login ผ่าน email หรือ LINE
- `avatar_url`: รองรับ LINE profile picture

#### 3. `org_invite_codes`
```sql
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- org_id: uuid NOT NULL REFERENCES orgs(id)
- code: text UNIQUE NOT NULL
- role_id: uuid REFERENCES roles(id) -- role ที่จะ assign เมื่อ redeem
- expires_at: timestamptz
- max_uses: int DEFAULT 1
- used_count: int DEFAULT 0
- created_by: uuid REFERENCES profiles(id)
- created_at: timestamptz DEFAULT now()
```

### RBAC Tables

#### 4. `roles`
```sql
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- org_id: uuid NOT NULL REFERENCES orgs(id)
- name: text NOT NULL
- description: text
- created_at: timestamptz DEFAULT now()
UNIQUE(org_id, name)
```

#### 5. `permissions` (Global Table)
```sql
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- key: text UNIQUE NOT NULL
- description: text
```

**Required Permission Keys:**
- `users.manage`
- `roles.manage`
- `crm.customers.read`
- `crm.customers.write`
- `crm.deals.read`
- `crm.deals.write`
- `crm.notes.read`
- `crm.notes.write`
- `settings.read`
- `settings.write`

#### 6. `role_permissions`
```sql
- role_id: uuid REFERENCES roles(id) ON DELETE CASCADE
- permission_id: uuid REFERENCES permissions(id) ON DELETE CASCADE
PRIMARY KEY (role_id, permission_id)
```

#### 7. `user_roles`
```sql
- user_id: uuid REFERENCES profiles(id) ON DELETE CASCADE
- role_id: uuid REFERENCES roles(id) ON DELETE CASCADE
PRIMARY KEY (user_id, role_id)
```

### CRM Tables

#### 8. `crm_customers`
```sql
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- org_id: uuid NOT NULL REFERENCES orgs(id)
- name: text NOT NULL
- customer_type: text CHECK (customer_type IN ('company', 'person'))
- contact_name: text
- phone: text
- email: text
- tags: text[]
- status: text DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'inactive'))
- owner_user_id: uuid REFERENCES profiles(id)
- created_by: uuid REFERENCES profiles(id)
- updated_by: uuid REFERENCES profiles(id)
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
```

#### 9. `crm_deals`
```sql
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- org_id: uuid NOT NULL REFERENCES orgs(id)
- customer_id: uuid REFERENCES crm_customers(id) ON DELETE SET NULL
- title: text NOT NULL
- stage: text DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'proposal', 'won', 'lost'))
- value: numeric(12,2) DEFAULT 0
- expected_close_date: date
- owner_user_id: uuid REFERENCES profiles(id)
- created_by: uuid REFERENCES profiles(id)
- updated_by: uuid REFERENCES profiles(id)
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz DEFAULT now()
```

#### 10. `crm_notes`
```sql
- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- org_id: uuid NOT NULL REFERENCES orgs(id)
- customer_id: uuid REFERENCES crm_customers(id) ON DELETE CASCADE
- deal_id: uuid REFERENCES crm_deals(id) ON DELETE CASCADE
- note: text NOT NULL
- created_by: uuid REFERENCES profiles(id)
- created_at: timestamptz DEFAULT now()
```

### Indexes (Required)
```sql
-- Tenant isolation indexes
CREATE INDEX idx_profiles_org_id ON profiles(org_id);
CREATE INDEX idx_crm_customers_org_id ON crm_customers(org_id);
CREATE INDEX idx_crm_deals_org_id ON crm_deals(org_id);
CREATE INDEX idx_crm_notes_org_id ON crm_notes(org_id);
CREATE INDEX idx_roles_org_id ON roles(org_id);

-- Foreign key indexes
CREATE INDEX idx_crm_deals_customer_id ON crm_deals(customer_id);
CREATE INDEX idx_crm_notes_customer_id ON crm_notes(customer_id);
CREATE INDEX idx_crm_notes_deal_id ON crm_notes(deal_id);
CREATE INDEX idx_org_invite_codes_org_id ON org_invite_codes(org_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

-- LINE OAuth indexes
CREATE INDEX idx_profiles_line_user_id ON profiles(line_user_id) WHERE line_user_id IS NOT NULL;
CREATE INDEX idx_profiles_auth_provider ON profiles(auth_provider);
```

## 🔒 RLS Policies Requirements

### General Rules
1. **Enable RLS** บนทุก table ยกเว้น `permissions` (global read-only)
2. **Tenant Isolation**: ทุก policy ต้องเช็ค `org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())`
3. **Permission Gating**: ใช้ `has_permission(auth.uid(), 'permission.key')` สำหรับ access control

### Required Policies

#### `profiles`
- **SELECT**: ผู้ใช้สามารถอ่าน profile ของตัวเองได้เสมอ หรืออ่าน profile ใน org เดียวกันได้ (ถ้ามี permission)
- **INSERT**: ผู้ใช้สามารถสร้าง profile ของตัวเองได้ (auth.uid() = id) และต้องมี org_id
- **UPDATE**: ผู้ใช้สามารถอัปเดต profile ของตัวเองได้ หรือ admin (users.manage) สามารถอัปเดตได้

#### `orgs`
- **SELECT**: อ่านได้เฉพาะ org ที่ตัวเองเป็นสมาชิก
- **INSERT**: สร้างได้เฉพาะเมื่อยังไม่มี profile (onboarding flow)
- **UPDATE**: อัปเดตได้เฉพาะ owner/admin (settings.write)

#### `org_invite_codes`
- **SELECT**: อ่านได้เฉพาะใน org ของตัวเอง (users.manage)
- **INSERT**: สร้างได้เฉพาะ admin (users.manage)
- **UPDATE**: อัปเดตได้เฉพาะ admin (users.manage)

#### `roles`
- **SELECT**: อ่านได้เฉพาะใน org ของตัวเอง
- **INSERT/UPDATE/DELETE**: ต้องมี permission `roles.manage`

#### `crm_customers`
- **SELECT**: ต้องมี permission `crm.customers.read` + tenant isolation
- **INSERT/UPDATE/DELETE**: ต้องมี permission `crm.customers.write` + tenant isolation

#### `crm_deals`
- **SELECT**: ต้องมี permission `crm.deals.read` + tenant isolation
- **INSERT/UPDATE/DELETE**: ต้องมี permission `crm.deals.write` + tenant isolation

#### `crm_notes`
- **SELECT**: ต้องมี permission `crm.notes.read` + tenant isolation
- **INSERT/DELETE**: ต้องมี permission `crm.notes.write` + tenant isolation

### `has_permission()` Function

```sql
CREATE OR REPLACE FUNCTION has_permission(
  user_id uuid,
  permission_key text
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = has_permission.user_id
      AND p.key = has_permission.permission_key
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🌱 Seed Data

### Permissions (10 keys)
```sql
INSERT INTO permissions (key, description) VALUES
('users.manage', 'Manage users and invite codes'),
('roles.manage', 'Manage roles and permissions'),
('crm.customers.read', 'Read customers'),
('crm.customers.write', 'Create/update/delete customers'),
('crm.deals.read', 'Read deals'),
('crm.deals.write', 'Create/update/delete deals'),
('crm.notes.read', 'Read notes'),
('crm.notes.write', 'Create/delete notes'),
('settings.read', 'Read organization settings'),
('settings.write', 'Update organization settings');
```

### Default Roles (สร้างหลัง permissions)
- **Owner**: ทุก permissions (10 permissions)
- **Admin**: ทุก permissions ยกเว้น `roles.manage` (9 permissions)
- **Member**: Read-only CRM permissions (4 permissions: customers.read, deals.read, notes.read, settings.read)

## 🚀 Application Structure

### File Organization
```
hr_crm/
├── app/
│   ├── (auth)/
│   │   ├── auth/
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── crm/
│   │       │   ├── customers/
│   │       │   │   ├── page.tsx
│   │       │   │   └── [id]/page.tsx
│   │       │   ├── deals/
│   │       │   │   ├── page.tsx
│   │       │   │   └── [id]/page.tsx
│   │       │   └── notes/page.tsx
│   │       ├── users/page.tsx
│   │       ├── roles/page.tsx
│   │       └── settings/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── middleware.ts
├── components/
│   ├── ui/ (shadcn components)
│   ├── crm/
│   ├── admin/
│   └── auth/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth.ts
│   ├── permissions.ts
│   └── types.ts
├── actions/
│   ├── org.ts
│   ├── users.ts
│   ├── roles.ts
│   └── crm.ts
└── types/
    └── database.ts
```

## 🔐 Authentication Flow

### Middleware Logic (`app/middleware.ts`)
```typescript
1. Check if route is public (/auth/*, /onboarding)
2. If protected route:
   - Check auth session
   - If no session → redirect /auth/sign-in
   - If session exists:
     - Check if user has profile
     - If no profile → redirect /onboarding
     - If has profile → allow access
```

### Authentication Methods

#### Email/Password Auth
- Standard Supabase email/password sign-up/sign-in
- Email verification (optional, configurable in Supabase)

#### LINE OAuth
- ใช้ Supabase Auth LINE Provider
- Setup ใน Supabase Dashboard:
  - Enable LINE provider
  - Configure LINE Channel ID & Channel Secret
  - Set redirect URL
- Flow:
  1. User clicks "Sign in with LINE"
  2. Redirect to LINE OAuth consent screen
  3. LINE redirects back with authorization code
  4. Supabase creates auth.users record
  5. Extract LINE user info (user_id, display_name, picture_url)
  6. Create/update profile with LINE data

### Onboarding Flow (`app/onboarding/page.tsx`)
```typescript
1. Check if user already has profile
   - If yes → redirect /admin
2. Detect auth provider:
   - Email users: Show email in form
   - LINE users: Show LINE display name + avatar
3. Show two options:
   - Option 1: Create new org (first user)
     - Form: org name
     - On submit: 
       - Create org
       - Create profile (with auth_provider, line_user_id if LINE)
       - Sync display_name, avatar_url from auth provider
       - Assign Owner role
   - Option 2: Join existing org (invite code)
     - Form: invite code input
     - On submit: 
       - Validate code (not expired, not maxed out)
       - Atomically increment used_count
       - Create profile (with auth_provider, line_user_id if LINE)
       - Sync display_name, avatar_url from auth provider
       - Assign role from invite code
```

### Profile Sync After LINE OAuth
```typescript
// ใน auth callback หรือ server action
- Extract LINE user data from Supabase auth.users metadata
- Update profiles table:
  - auth_provider = 'line'
  - line_user_id = LINE user ID (from metadata)
  - display_name = LINE display name
  - avatar_url = LINE picture URL
```

## 📱 Pages & Features

### 1. `/admin/dashboard`
- KPIs:
  - Total customers count
  - Open deals count
  - Won deals this month
  - Revenue this month (sum of won deals)

### 2. `/admin/crm/customers`
- **List Page**:
  - Table with search/filter
  - Columns: name, type, contact, status, owner
  - Actions: Create (modal/page), Edit, Delete
  - Permission: `crm.customers.read` (view), `crm.customers.write` (create/edit/delete)
- **Detail Page** (`/admin/crm/customers/[id]`):
  - Customer info form
  - Linked deals list
  - Notes timeline (add note form)
  - Permission: `crm.customers.read` (view), `crm.customers.write` (edit)

### 3. `/admin/crm/deals`
- **Pipeline Board**:
  - Kanban view by stage (new, contacted, proposal, won, lost)
  - Deal cards with title, customer, value
  - Drag & drop (optional, nice-to-have)
  - Toggle list/board view
  - Permission: `crm.deals.read` (view), `crm.deals.write` (create/edit)
- **Detail Page** (`/admin/crm/deals/[id]`):
  - Deal info form
  - Linked customer info
  - Notes timeline (add note form)
  - Update stage/value
  - Permission: `crm.deals.read` (view), `crm.deals.write` (edit)

### 4. `/admin/users`
- **Features**:
  - List users in org (profiles table)
  - Create invite code modal:
    - Select role to assign
    - Set max uses, expiration
    - Generate unique code
  - Assign/remove roles per user
  - Suspend/activate user
  - Permission: `users.manage` required

### 5. `/admin/roles`
- **Features**:
  - List roles in org
  - Create role: name, description, select permissions
  - Edit role: update name, description, permissions
  - Delete role (with confirmation)
  - Permission: `roles.manage` required

### 6. `/admin/settings`
- **Features**:
  - Update org name
  - Basic preferences (optional)
  - Permission: `settings.read` (view), `settings.write` (edit)

## 🛠️ Server Actions

### `actions/org.ts`
```typescript
- createOrg(name: string)
  - Create org
  - Create profile for current user:
    - Detect auth provider (email/line)
    - Extract LINE data if LINE user (line_user_id, display_name, avatar_url)
    - Set auth_provider, org_id
  - Assign Owner role
  
- redeemInviteCode(code: string)
  - Validate code (not expired, not maxed out)
  - Atomically increment used_count
  - Create profile:
    - Detect auth provider (email/line)
    - Extract LINE data if LINE user
    - Set auth_provider, org_id
  - Assign role from invite code

- syncLineProfile(userId: string)
  - Extract LINE data from auth.users metadata
  - Update profiles: line_user_id, display_name, avatar_url, auth_provider
  - Call after LINE OAuth callback
```

### `actions/users.ts`
```typescript
- createInviteCode(orgId, roleId, maxUses, expiresAt)
  - Generate unique code
  - Insert into org_invite_codes
  
- assignRoleToUser(userId, roleId)
  - Insert into user_roles
  
- removeRoleFromUser(userId, roleId)
  - Delete from user_roles
  
- updateUserStatus(userId, status)
  - Update profiles.status
```

### `actions/roles.ts`
```typescript
- createRole(orgId, name, description, permissionIds[])
  - Insert role + role_permissions
  
- updateRole(roleId, name, description, permissionIds[])
  - Update role + replace permissions
  
- deleteRole(roleId)
  - Delete role (cascade deletes role_permissions, user_roles)
```

### `actions/crm.ts`
```typescript
- createCustomer(data)
  - Set org_id from user's profile
  - Set created_by, updated_by
  
- updateCustomer(id, data)
  - Set updated_by
  
- deleteCustomer(id)
  
- createDeal(data)
- updateDeal(id, data)
- updateDealStage(id, stage)
- createNote(data)
- deleteNote(id)
```

## 🔧 Permission Helpers

### `lib/permissions.ts`
```typescript
// Server-side
async function checkPermissionServer(userId: string, permissionKey: string): Promise<boolean>
  - Call has_permission() via RPC or direct query

// Client-side (cache in context)
function getUserPermissions(userId: string): Promise<string[]>
  - Fetch all permissions for user
  - Cache in React context

function hasPermission(permissionKey: string): boolean
  - Check from cached permissions
```

## 🎨 UI Components (shadcn/ui)

### Required Components
- Button, Input, Label, Form
- Table, Card, Dialog, Sheet
- Select, Badge, Avatar
- Tabs, Separator
- Toast (sonner)

### Custom Components
- `CustomerForm` - Create/edit customer
- `DealCard` - Deal card for pipeline
- `PipelineBoard` - Kanban board
- `NoteTimeline` - Notes display
- `UserTable` - Users list
- `RolePermissionEditor` - Permission toggle matrix
- `Sidebar` - Admin navigation
- `InviteCodeModal` - Create invite code

## 🔒 Security Checklist

- [ ] RLS enabled on all tables (except permissions)
- [ ] Tenant isolation enforced via RLS (org_id matching)
- [ ] Permission checks in all RLS policies
- [ ] Server actions validate permissions
- [ ] Middleware protects admin routes
- [ ] Onboarding prevents duplicate org creation
- [ ] Invite code redemption is atomic
- [ ] Audit fields (created_by, updated_by) set automatically

## 📝 Implementation Notes

### MCP Supabase Workflow
1. **Migrations**: ใช้ `mcp_supabase_apply_migration` แทน migration files
2. **Seed Data**: ใช้ `mcp_supabase_execute_sql` สำหรับ seed
3. **Type Generation**: ใช้ `mcp_supabase_generate_typescript_types` → save to `types/database.ts`
4. **Verification**: ใช้ `mcp_supabase_list_tables` และ `mcp_supabase_get_advisors` หลัง migration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# LINE OAuth (configure in Supabase Dashboard, not needed in .env)
# LINE_CHANNEL_ID (set in Supabase Dashboard)
# LINE_CHANNEL_SECRET (set in Supabase Dashboard)
```

### Testing Priorities
1. First user creates org → becomes Owner
2. Invite code creation and redemption
3. RLS prevents cross-tenant access
4. Permission checks block unauthorized actions
5. CRM CRUD respects permissions
6. Role assignment updates permissions

## 🚫 Phase 1 Exclusions

- ❌ LINE LIFF integration (เตรียม schema ไว้แล้ว, จะทำใน Phase 2)
- ❌ HR module
- ❌ Employee app
- ❌ Email notifications (optional)
- ❌ File uploads (optional)

## 🔮 Phase 2 Preparation (Schema Ready)

Schema ที่เตรียมไว้สำหรับ Phase 2:
- ✅ `profiles.line_user_id` - สำหรับ identify LINE users
- ✅ `profiles.auth_provider` - แยก email vs LINE users
- ✅ `profiles.avatar_url` - รองรับ LINE profile picture
- ✅ LINE OAuth flow - พร้อมใช้งานแล้ว
- ⏳ LINE LIFF integration - จะทำใน Phase 2

## ✅ Phase 1 Deliverables

1. ✅ Next.js project with TypeScript
2. ✅ Supabase database schema (via MCP)
3. ✅ RLS policies + has_permission function
4. ✅ Seed data (permissions + default roles)
5. ✅ Authentication flow (sign-in, sign-up, onboarding)
6. ✅ Admin layout with sidebar
7. ✅ CRM modules (customers, deals, notes)
8. ✅ Admin console (users, roles, settings)
9. ✅ TypeScript types from Supabase
10. ✅ README with setup instructions

---

**⚠️ จำไว้: RLS เป็นตัวบังคับ tenant isolation ห้ามพึ่ง frontend filtering**
