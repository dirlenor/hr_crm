import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditDepartmentForm } from '@/components/admin/EditDepartmentForm'

export default async function DepartmentDetailPage({
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
    permission_key: 'departments.manage',
  })

  if (!hasPermission) {
    redirect('/admin/departments')
  }

  // Get department
  const { data: department } = await supabase
    .from('departments')
    .select('*')
    .eq('id', params.id)
    .eq('org_id', orgId)
    .single()

  if (!department) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="page-title">แก้ไขแผนก</h1>
        <p className="page-description">แก้ไขข้อมูลแผนก: {department.name}</p>
      </div>

      <EditDepartmentForm department={department} />
    </div>
  )
}
