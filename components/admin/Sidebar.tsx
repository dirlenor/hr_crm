'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Clock,
  CalendarDays,
  Wallet,
  Settings,
  Shield,
  FileText,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  { 
    name: 'Dashboard', 
    nameEn: 'Dashboard',
    href: '/admin/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'พนักงาน', 
    nameEn: 'Employees',
    href: '/admin/employees', 
    icon: Users 
  },
  { 
    name: 'แผนก', 
    nameEn: 'Departments',
    href: '/admin/departments', 
    icon: Building2 
  },
  { 
    name: 'ตำแหน่ง', 
    nameEn: 'Positions',
    href: '/admin/positions', 
    icon: Briefcase 
  },
  { 
    name: 'การเข้างาน', 
    nameEn: 'Attendance',
    href: '/admin/attendance', 
    icon: Clock 
  },
  { 
    name: 'การลา', 
    nameEn: 'Leaves',
    href: '/admin/leaves', 
    icon: CalendarDays 
  },
  { 
    name: 'เงินเดือน', 
    nameEn: 'Payroll',
    href: '/admin/payroll', 
    icon: Wallet 
  },
  { 
    name: 'รายงาน', 
    nameEn: 'Reports',
    href: '/admin/reports', 
    icon: FileText 
  },
]

const systemNavigation = [
  { 
    name: 'ผู้ใช้งาน', 
    nameEn: 'Users',
    href: '/admin/users', 
    icon: Users 
  },
  { 
    name: 'สิทธิ์', 
    nameEn: 'Roles',
    href: '/admin/roles', 
    icon: Shield 
  },
  { 
    name: 'ตั้งค่า', 
    nameEn: 'Settings',
    href: '/admin/settings', 
    icon: Settings 
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-700/50 px-5">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25">
            HR
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white leading-tight">HR System</span>
            <span className="text-xs text-slate-400">ระบบบริหารงานบุคคล</span>
          </div>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-custom py-4">
        <div className="px-3 mb-2">
          <p className="px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            หลัก
          </p>
        </div>
        <div className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive ? "" : "group-hover:scale-110"
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 opacity-50" />
                )}
              </Link>
            )
          })}
        </div>

        {/* System Navigation */}
        <div className="mt-6 px-3 mb-2">
          <p className="px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
            ระบบ
          </p>
        </div>
        <div className="space-y-1 px-3">
          {systemNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive ? "" : "group-hover:scale-110"
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 opacity-50" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs text-slate-400">เวอร์ชัน</p>
          <p className="text-sm font-medium text-white">1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
