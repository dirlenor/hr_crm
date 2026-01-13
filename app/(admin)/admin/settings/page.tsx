import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UpdateOrgForm } from '@/components/admin/UpdateOrgForm'

export default async function SettingsPage() {
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

  const { data: org } = await supabase
    .from('orgs')
    .select('*')
    .eq('id', orgId)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your organization settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateOrgForm org={org} />
        </CardContent>
      </Card>
    </div>
  )
}
