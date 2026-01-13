import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Plus, Building2, Users, Edit } from 'lucide-react'
import { DeleteDepartmentButton } from '@/components/admin/DeleteDepartmentButton'

export const dynamic = 'force-dynamic'

export default async function DepartmentsPage() {
  try {
    const { supabase, user } = await createClient()

    if (!user) {
      return null
    }

    // Get org_id first
    const { data: orgId } = await supabase.rpc('get_user_org_id', {
      user_id: user.id,
    })

    if (!orgId) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">แผนก</h1>
              <p className="text-gray-600">กรุณาสร้างองค์กรก่อน</p>
            </div>
          </div>
        </div>
      )
    }

    // Use RPC function directly (bypasses RLS issues with setSession)
    const { data: departments, error: deptError } = await supabase.rpc('get_departments', {
      p_user_id: user.id,
    })
    
    // Get employee counts separately for each department using RPC
    let departmentsWithCounts = departments || []
    if (departments && departments.length > 0) {
      departmentsWithCounts = await Promise.all(
        departments.map(async (dept: any) => {
          // Use RPC function to get employee count
          const { data: employees } = await supabase.rpc('get_employees', {
            p_user_id: user.id,
            p_status: null,
            p_search: null,
          })
          const count = employees?.filter((e: any) => e.department_id === dept.id).length || 0
          return { ...dept, employeeCount: count }
        })
      )
    }

    // Log error if any (for debugging)
    if (deptError) {
      console.error('Error fetching departments:', deptError)
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">แผนก</h1>
          <p className="text-gray-600">จัดการโครงสร้างแผนกในองค์กร</p>
        </div>
        <Link href="/admin/departments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มแผนก
          </Button>
        </Link>
      </div>

      {deptError && (
        <Card>
          <CardContent className="p-4">
            <p className="text-red-600">เกิดข้อผิดพลาด: {deptError.message}</p>
          </CardContent>
        </Card>
      )}

      {departmentsWithCounts && departmentsWithCounts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>รายการแผนก ({departmentsWithCounts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อแผนก</TableHead>
                  <TableHead>รายละเอียด</TableHead>
                  <TableHead className="text-center">จำนวนพนักงาน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentsWithCounts.map((dept: any) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {dept.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{dept.employeeCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/departments/${dept.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-3 w-3" />
                            แก้ไข
                          </Button>
                        </Link>
                        <DeleteDepartmentButton departmentId={dept.id} departmentName={dept.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">ยังไม่มีแผนก</p>
            <Link href="/admin/departments/new">
              <Button>เพิ่มแผนกแรก</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
  } catch (error: any) {
    console.error('DepartmentsPage error:', error)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">แผนก</h1>
            <p className="text-gray-600">จัดการโครงสร้างแผนกในองค์กร</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <p className="text-red-600">เกิดข้อผิดพลาด: {error?.message || 'Unknown error'}</p>
            <p className="text-sm text-gray-500 mt-2">กรุณาลอง refresh หน้าเว็บหรือติดต่อผู้ดูแลระบบ</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}
