import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateEmployeeForm } from '@/components/admin/CreateEmployeeForm'

export default async function NewEmployeePage() {
  const { supabase, user } = await createClient()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    redirect('/onboarding')
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: user.id,
    permission_key: 'employees.create',
  })

  if (!hasPermission) {
    redirect('/admin/employees')
  }

  // Get departments and positions
  const [departmentsResult, positionsResult, schedulesResult] = await Promise.all([
    supabase
      .from('departments')
      .select('id, name')
      .eq('org_id', orgId)
      .order('name'),
    supabase
      .from('positions')
      .select('id, name, department_id')
      .eq('org_id', orgId)
      .order('name'),
    supabase
      .from('work_schedules')
      .select('id, name')
      .eq('org_id', orgId)
      .order('name'),
  ])

  const departments = departmentsResult.data || []
  const positions = positionsResult.data || []
  const schedules = schedulesResult.data || []

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="page-title">เพิ่มพนักงานใหม่</h1>
        <p className="page-description">กรอกข้อมูลพนักงานและส่ง Invite Link ให้ลงทะเบียนผ่าน LINE</p>
      </div>

      <CreateEmployeeForm
        departments={departments}
        positions={positions}
        schedules={schedules}
      />
    </div>
  )
}
