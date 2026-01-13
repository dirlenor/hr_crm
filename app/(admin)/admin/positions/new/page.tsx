import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePositionForm } from '@/components/admin/CreatePositionForm'

export default async function NewPositionPage() {
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

  // Get departments for dropdown
  const { data: departments } = await supabase
    .from('departments')
    .select('id, name')
    .eq('org_id', orgId)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="page-title">เพิ่มตำแหน่งใหม่</h1>
        <p className="page-description">สร้างตำแหน่งใหม่ในองค์กร</p>
      </div>

      <CreatePositionForm departments={departments || []} />
    </div>
  )
}
