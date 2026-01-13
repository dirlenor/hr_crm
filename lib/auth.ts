import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function getCurrentUser() {
  const { supabase, user } = await createClient()
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { supabase, user } = await createClient()
  
  // Try to get user from session if not available
  let currentUser = user
  if (!currentUser) {
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    currentUser = sessionUser
  }
  
  if (!currentUser) {
    return null
  }

  // Use RPC function to get org_id first
  const { data: orgId, error: rpcError } = await supabase.rpc('get_user_org_id', {
    user_id: currentUser.id,
  })

  if (orgId && !rpcError) {
    // Try with org_id filter
    const { data: profileWithOrg } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .eq('org_id', orgId)
      .single()
    
    if (profileWithOrg) {
      return profileWithOrg
    }
  }

  // Last resort: try without any filter (RLS policy should allow id = auth.uid())
  const { data: profileDirect } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .maybeSingle()

  return profileDirect
}

export async function getUserOrgId(): Promise<string | null> {
  const profile = await getCurrentProfile()
  return profile?.org_id ?? null
}
