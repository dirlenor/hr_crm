import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Building2, Users } from 'lucide-react'

export default async function DepartmentsPage() {
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

  // Get departments with employee count
  const { data: departments } = await supabase
    .from('departments')
    .select('*, employees(id)')
    .eq('org_id', orgId)
    .order('name')

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

      {departments && departments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept: any) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {dept.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-3">
                  {dept.description || 'ไม่มีรายละเอียด'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-1 h-4 w-4" />
                    {dept.employees?.length || 0} พนักงาน
                  </div>
                  <Link href={`/admin/departments/${dept.id}`}>
                    <Button variant="outline" size="sm">จัดการ</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
}
