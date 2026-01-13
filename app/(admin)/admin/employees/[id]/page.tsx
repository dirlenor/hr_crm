import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EmployeeDetailView } from '@/components/admin/EmployeeDetailView'

export default async function EmployeeDetailPage({
  params,
}: {
  params: { id: string }
}) {
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
    permission_key: 'employees.read',
  })

  if (!hasPermission) {
    redirect('/admin/employees')
  }

  // Ensure session is set for RLS
  await supabase.auth.getSession()

  // Get employee with relations
  const { data: employee } = await supabase
    .from('employees')
    .select(`
      *,
      departments(id, name, description),
      positions(id, name, level),
      work_schedules(id, name)
    `)
    .eq('id', params.id)
    .eq('org_id', orgId)
    .single()

  if (!employee) {
    notFound()
  }

  // Get departments and positions for edit form
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
    <EmployeeDetailView
      employee={employee}
      departments={departments}
      positions={positions}
      schedules={schedules}
    />
  )
}
