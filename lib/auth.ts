import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function getCurrentUser() {
  const { supabase, user } = await createClient()
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:11',message:'getCurrentProfile entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  const { supabase, user } = await createClient()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:16',message:'After createClient in getCurrentProfile',data:{hasUser:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  // Try to get user from session if not available
  let currentUser = user
  if (!currentUser) {
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    currentUser = sessionUser
  }
  
  if (!currentUser) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:25',message:'No user in getCurrentProfile',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return null
  }

  // Try to query profile directly first (RLS should allow reading own profile)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:30',message:'Before profile query',data:{userId:currentUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single()

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:37',message:'After profile query',data:{hasProfile:!!profile,hasError:!!profileError,errorMessage:profileError?.message,errorCode:profileError?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (profile && !profileError) {
    return profile
  }

  // If that fails, use RPC function to get org_id first
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:45',message:'Before get_user_org_id RPC',data:{userId:currentUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  const { data: orgId, error: rpcError } = await supabase.rpc('get_user_org_id', {
    user_id: currentUser.id,
  })

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:52',message:'After get_user_org_id RPC',data:{hasOrgId:!!orgId,hasError:!!rpcError,errorMessage:rpcError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (orgId && !rpcError) {
    // Try with org_id filter
    const { data: profileWithOrg } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .eq('org_id', orgId)
      .single()
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:62',message:'After profileWithOrg query',data:{hasProfileWithOrg:!!profileWithOrg},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/auth.ts:75',message:'After profileDirect query',data:{hasProfileDirect:!!profileDirect},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  return profileDirect
}

export async function getUserOrgId(): Promise<string | null> {
  const profile = await getCurrentProfile()
  return profile?.org_id ?? null
}
