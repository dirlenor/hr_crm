import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { UserTable } from '@/components/admin/UserTable'

export default async function UsersPage() {
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

  const { data: users } = await supabase
    .from('profiles')
    .select('*, user_roles(roles(id, name))')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .eq('org_id', orgId)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-600">Manage users and invite codes</p>
      </div>

      <UserTable users={users || []} roles={roles || []} />
    </div>
  )
}
