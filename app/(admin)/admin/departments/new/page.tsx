import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateDepartmentForm } from '@/components/admin/CreateDepartmentForm'

export default async function NewDepartmentPage() {
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

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="page-title">เพิ่มแผนกใหม่</h1>
        <p className="page-description">สร้างแผนกใหม่ในองค์กร</p>
      </div>

      <CreateDepartmentForm />
    </div>
  )
}
