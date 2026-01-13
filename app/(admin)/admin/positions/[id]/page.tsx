import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditPositionForm } from '@/components/admin/EditPositionForm'

export default async function PositionDetailPage({
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
    permission_key: 'positions.manage',
  })

  if (!hasPermission) {
    redirect('/admin/positions')
  }

  // Get position with department
  const { data: position } = await supabase
    .from('positions')
    .select('*, departments(id, name)')
    .eq('id', params.id)
    .eq('org_id', orgId)
    .single()

  if (!position) {
    notFound()
  }

  // Get all departments for dropdown
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .eq('org_id', orgId)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="page-title">แก้ไขตำแหน่ง</h1>
        <p className="page-description">แก้ไขข้อมูลตำแหน่ง: {position.name}</p>
      </div>

      <EditPositionForm 
        position={position} 
        departments={departments || []} 
      />
    </div>
  )
}
