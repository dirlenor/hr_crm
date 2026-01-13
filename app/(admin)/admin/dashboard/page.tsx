import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Clock, CalendarDays, Wallet, AlertCircle, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default async function DashboardPage() {
  const { supabase, user } = await createClient()

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">กรุณาเข้าสู่ระบบ</p>
      </div>
    )
  }

  // Get org_id
  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">กรุณาสร้างองค์กรก่อน</p>
      </div>
    )
  }

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  // Fetch dashboard data
  const [
    employeesResult,
    attendanceTodayResult,
    pendingLeavesResult,
    pendingOTResult,
    recentEmployeesResult,
  ] = await Promise.all([
    // Total employees
    supabase
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'active'),
    // Attendance today
    supabase
      .from('attendances')
      .select('id, status', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('date', todayStr),
    // Pending leave requests
    supabase
      .from('leave_requests')
      .select('id, employee_id, start_date, end_date, total_days, leave_types(name), employees(first_name, last_name)', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    // Pending OT requests
    supabase
      .from('ot_requests')
      .select('id, employee_id, date, hours, employees(first_name, last_name)', { count: 'exact' })
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    // Recent employees
    supabase
      .from('employees')
      .select('id, first_name, last_name, employee_code, departments(name), positions(name), start_date')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalEmployees = employeesResult.count || 0
  const attendanceToday = attendanceTodayResult.data || []
  const clockedInToday = attendanceToday.filter(a => a.status === 'present' || a.status === 'late').length
  const lateToday = attendanceToday.filter(a => a.status === 'late').length
  const pendingLeaves = pendingLeavesResult.data || []
  const pendingLeavesCount = pendingLeavesResult.count || 0
  const pendingOT = pendingOTResult.data || []
  const pendingOTCount = pendingOTResult.count || 0
  const recentEmployees = recentEmployeesResult.data || []

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          ภาพรวมระบบ HR วันที่ {format(today, 'd MMMM yyyy', { locale: th })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">พนักงานทั้งหมด</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{totalEmployees}</div>
            <p className="stat-label">พนักงานที่ทำงานอยู่</p>
          </CardContent>
        </Card>

        <Card className="card-interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เข้างานวันนี้</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
              <Clock className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-value text-success">{clockedInToday}</div>
            <p className="stat-label">
              {lateToday > 0 ? (
                <span className="text-warning">{lateToday} คนมาสาย</span>
              ) : (
                <span>จาก {totalEmployees} คน</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="card-interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">คำขอลารออนุมัติ</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-50">
              <CalendarDays className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-value text-warning">{pendingLeavesCount}</div>
            <p className="stat-label">รายการรอดำเนินการ</p>
          </CardContent>
        </Card>

        <Card className="card-interactive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">คำขอ OT รออนุมัติ</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50">
              <Wallet className="h-5 w-5 text-info" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="stat-value text-info">{pendingOTCount}</div>
            <p className="stat-label">รายการรอดำเนินการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Leave Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50">
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                คำขอลารออนุมัติ
              </CardTitle>
              <Link href="/admin/leaves">
                <Button variant="ghost" size="sm" className="gap-1">
                  ดูทั้งหมด
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length === 0 ? (
              <div className="empty-state py-8">
                <CheckCircle className="empty-state-icon text-success" />
                <p className="empty-state-title">ไม่มีคำขอลารออนุมัติ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map((leave: any, index: number) => (
                  <div 
                    key={leave.id} 
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-sm avatar-primary">
                        {leave.employees?.first_name?.[0]}{leave.employees?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {leave.employees?.first_name} {leave.employees?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {leave.leave_types?.name} • {leave.total_days} วัน
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/leaves?id=${leave.id}`}>
                      <Button size="sm" variant="outline">ตรวจสอบ</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending OT Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-50">
                  <TrendingUp className="h-4 w-4 text-info" />
                </div>
                คำขอ OT รออนุมัติ
              </CardTitle>
              <Link href="/admin/attendance">
                <Button variant="ghost" size="sm" className="gap-1">
                  ดูทั้งหมด
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingOT.length === 0 ? (
              <div className="empty-state py-8">
                <CheckCircle className="empty-state-icon text-success" />
                <p className="empty-state-title">ไม่มีคำขอ OT รออนุมัติ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOT.map((ot: any, index: number) => (
                  <div 
                    key={ot.id} 
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-sm avatar-primary">
                        {ot.employees?.first_name?.[0]}{ot.employees?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {ot.employees?.first_name} {ot.employees?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ot.date), 'd MMM', { locale: th })} • {ot.hours} ชั่วโมง
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/attendance?tab=ot&id=${ot.id}`}>
                      <Button size="sm" variant="outline">ตรวจสอบ</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Employees */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                <Users className="h-4 w-4 text-primary" />
              </div>
              พนักงานล่าสุด
            </CardTitle>
            <Link href="/admin/employees">
              <Button variant="ghost" size="sm" className="gap-1">
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentEmployees.length === 0 ? (
            <div className="empty-state py-12">
              <Users className="empty-state-icon" />
              <p className="empty-state-title">ยังไม่มีพนักงาน</p>
              <p className="empty-state-description">เริ่มเพิ่มพนักงานคนแรกของคุณ</p>
              <Link href="/admin/employees/new" className="mt-4">
                <Button>เพิ่มพนักงาน</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {recentEmployees.map((emp: any, index: number) => (
                <Link
                  key={emp.id}
                  href={`/admin/employees/${emp.id}`}
                  className="group flex flex-col items-center rounded-xl border p-4 text-center transition-all hover:border-primary/30 hover:shadow-card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="avatar avatar-lg avatar-primary mb-3 transition-transform group-hover:scale-110">
                    {emp.first_name[0]}{emp.last_name[0]}
                  </div>
                  <p className="font-medium text-sm">
                    {emp.first_name} {emp.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {emp.positions?.name || '-'}
                  </p>
                  <div className="badge-neutral mt-2">
                    {emp.departments?.name || '-'}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
