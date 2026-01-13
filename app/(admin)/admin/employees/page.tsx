import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Plus, Search, Users, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  const { supabase, user } = await createClient()

  if (!user) {
    return null
  }

  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    return null
  }

  let query = supabase
    .from('employees')
    .select('*, departments(name), positions(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (searchParams.search) {
    query = query.or(`first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%,employee_code.ilike.%${searchParams.search}%`)
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  const { data: employees, count } = await query

  // Stats
  const activeCount = employees?.filter(e => e.status === 'active').length || 0
  const totalCount = employees?.length || 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">พนักงาน</h1>
          <p className="page-description">จัดการข้อมูลพนักงานในองค์กร • {activeCount} คนทำงานอยู่</p>
        </div>
        <Link href="/admin/employees/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            เพิ่มพนักงาน
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center">
        <form method="get" className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="ค้นหาชื่อ หรือ รหัสพนักงาน..."
              defaultValue={searchParams.search}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            ค้นหา
          </Button>
        </form>
        
        <div className="flex gap-2">
          <Link href="/admin/employees">
            <Button 
              variant={!searchParams.status ? 'default' : 'outline'} 
              size="sm"
            >
              ทั้งหมด ({totalCount})
            </Button>
          </Link>
          <Link href="/admin/employees?status=active">
            <Button 
              variant={searchParams.status === 'active' ? 'default' : 'outline'} 
              size="sm"
            >
              ทำงานอยู่
            </Button>
          </Link>
          <Link href="/admin/employees?status=pending">
            <Button 
              variant={searchParams.status === 'pending' ? 'default' : 'outline'} 
              size="sm"
            >
              รอลงทะเบียน
            </Button>
          </Link>
          <Link href="/admin/employees?status=resigned">
            <Button 
              variant={searchParams.status === 'resigned' ? 'default' : 'outline'} 
              size="sm"
            >
              ลาออก
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-24">รหัส</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันเริ่มงาน</TableHead>
              <TableHead className="text-right">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees && employees.length > 0 ? (
              employees.map((emp: any) => (
                <TableRow key={emp.id} className="group">
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {emp.employee_code || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-sm avatar-primary">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <Link
                          href={`/admin/employees/${emp.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {emp.first_name} {emp.last_name}
                        </Link>
                        {emp.nickname && (
                          <span className="text-muted-foreground"> ({emp.nickname})</span>
                        )}
                        {emp.email && (
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="badge-neutral">
                      {emp.departments?.name || '-'}
                    </span>
                  </TableCell>
                  <TableCell>{emp.positions?.name || '-'}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {emp.employment_type === 'full-time' && 'พนักงานประจำ'}
                      {emp.employment_type === 'part-time' && 'พาร์ทไทม์'}
                      {emp.employment_type === 'contract' && 'สัญญาจ้าง'}
                      {emp.employment_type === 'intern' && 'ฝึกงาน'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {emp.status === 'active' && <span className="badge-success">ทำงานอยู่</span>}
                    {emp.status === 'pending' && (
                      <div className="flex flex-col gap-1">
                        <span className="badge-warning">รอลงทะเบียน</span>
                        {emp.invite_code && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {emp.invite_code}
                          </span>
                        )}
                      </div>
                    )}
                    {emp.status === 'resigned' && <span className="badge-neutral">ลาออก</span>}
                    {emp.status === 'terminated' && <span className="badge-danger">เลิกจ้าง</span>}
                    {emp.status === 'on-leave' && <span className="badge-warning">ลาพัก</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(emp.start_date), 'd MMM yyyy', { locale: th })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/employees/${emp.id}`}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        ดูข้อมูล
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="empty-state py-12">
                    <Users className="empty-state-icon" />
                    <p className="empty-state-title">ไม่พบพนักงาน</p>
                    <p className="empty-state-description">
                      {searchParams.search 
                        ? `ไม่พบผลลัพธ์สำหรับ "${searchParams.search}"`
                        : 'เริ่มเพิ่มพนักงานคนแรกของคุณ'
                      }
                    </p>
                    {!searchParams.search && (
                      <Link href="/admin/employees/new" className="mt-4">
                        <Button>เพิ่มพนักงาน</Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
