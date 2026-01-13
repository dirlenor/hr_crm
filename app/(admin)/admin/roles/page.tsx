import { createClient } from '@/lib/supabase/server'
import { RolePermissionEditor } from '@/components/admin/RolePermissionEditor'

export default async function RolesPage() {
  const { supabase, user } = await createClient()

  if (!user) {
    return null
  }

  // Get org_id using RPC function
  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    return null
  }

  const { data: roles } = await supabase
    .from('roles')
    .select('*, role_permissions(permissions(id, key))')
    .eq('org_id', orgId)
    .order('name')

  const { data: permissions } = await supabase
    .from('permissions')
    .select('*')
    .order('key')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles</h1>
        <p className="text-gray-600">Manage roles and permissions</p>
      </div>

      <RolePermissionEditor roles={roles || []} permissions={permissions || []} />
    </div>
  )
}
