# HR CRM - Multi-Tenant CRM Backoffice

Production-ready multi-tenant CRM backoffice built with Next.js, Supabase, and TypeScript.

## Features

- **Multi-Tenant Architecture**: Complete tenant isolation using RLS (Row Level Security)
- **Authentication**: Email/password and LINE OAuth support
- **RBAC System**: Permission-based role management
- **CRM Modules**: Customers, Deals (Pipeline), and Notes
- **Admin Console**: User management, role management, and organization settings

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email/Password + LINE OAuth)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database Management**: MCP Supabase tools

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- LINE Developer account (for LINE OAuth, optional)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

The database schema has already been created using MCP Supabase migrations:

- `001_initial_schema` - Core tables (orgs, profiles, RBAC)
- `002_crm_tables` - CRM tables (customers, deals, notes)
- `003_rls_policies` - RLS policies and security functions
- `004_indexes` - Performance indexes

Permissions and default roles are seeded automatically.

### 4. Configure LINE OAuth (Optional)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable LINE provider
3. Add your LINE Channel ID and Channel Secret
4. Set redirect URL: `http://localhost:3000/auth/callback` (development)
5. Set redirect URL: `https://yourdomain.com/auth/callback` (production)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
hr_crm/
├── app/
│   ├── (auth)/          # Auth pages (sign-in, sign-up, onboarding)
│   ├── (admin)/        # Admin pages (protected)
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (redirects)
│   └── middleware.ts   # Route protection
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── admin/          # Admin components
│   └── crm/            # CRM components
├── lib/
│   ├── supabase/       # Supabase clients (browser, server, middleware)
│   ├── auth.ts         # Auth helpers
│   └── permissions.ts  # Permission helpers
├── actions/            # Server actions
│   ├── org.ts          # Organization management
│   ├── users.ts        # User management
│   ├── roles.ts        # Role management
│   └── crm.ts          # CRM operations
└── types/
    └── database.ts     # Generated Supabase types
```

## Database Schema

### Core Tables

- `orgs` - Organizations (tenants)
- `profiles` - User profiles linked to organizations
- `org_invite_codes` - Invite codes for joining organizations

### RBAC Tables

- `roles` - Organization-scoped roles
- `permissions` - Global permissions
- `role_permissions` - Role-permission mapping
- `user_roles` - User-role assignment

### CRM Tables

- `crm_customers` - Customer records
- `crm_deals` - Sales pipeline deals
- `crm_notes` - Activity notes

## Security

- **RLS Enabled**: All tables (except permissions) have Row Level Security
- **Tenant Isolation**: Enforced via RLS policies checking `org_id`
- **Permission-Based Access**: All operations require appropriate permissions
- **Secure Functions**: `has_permission()` function with `SECURITY DEFINER` and `SET search_path`

## Default Roles

When an organization is created, three default roles are automatically created:

1. **Owner**: All permissions (10 permissions)
2. **Admin**: All permissions except `roles.manage` (9 permissions)
3. **Member**: Read-only CRM permissions (4 permissions)

## Permissions

- `users.manage` - Manage users and invite codes
- `roles.manage` - Manage roles and permissions
- `crm.customers.read` / `crm.customers.write` - Customer access
- `crm.deals.read` / `crm.deals.write` - Deal access
- `crm.notes.read` / `crm.notes.write` - Note access
- `settings.read` / `settings.write` - Settings access

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Supabase Production

1. Use the same Supabase project or create a new one
2. Apply migrations using MCP Supabase tools
3. Update environment variables in Vercel

## Development Workflow

### Using MCP Supabase Tools

- **Apply Migration**: Use `mcp_supabase_apply_migration`
- **Execute SQL**: Use `mcp_supabase_execute_sql` for seed data
- **Generate Types**: Use `mcp_supabase_generate_typescript_types`
- **Verify Schema**: Use `mcp_supabase_list_tables` and `mcp_supabase_get_advisors`

## Testing Checklist

- [ ] First user can create org and becomes Owner
- [ ] Invite code creation and redemption works
- [ ] RLS prevents cross-tenant data access
- [ ] Permission checks block unauthorized actions
- [ ] CRM CRUD operations respect permissions
- [ ] Role assignment updates permissions correctly
- [ ] Onboarding flow redirects correctly
- [ ] LINE OAuth flow works (if configured)

## Future Enhancements

- LINE LIFF integration (Phase 2)
- HR module (Phase 2)
- Employee app (Phase 2)
- Email notifications
- File uploads
- Advanced reporting and analytics

## License

Private - All rights reserved
