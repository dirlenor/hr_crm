'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type PositionInsert = Database['public']['Tables']['positions']['Insert']
type PositionUpdate = Database['public']['Tables']['positions']['Update']

export async function createPosition(data: Omit<PositionInsert, 'org_id'>) {
  const { supabase, user } = await createClient()
  
  // Try to get user from session if not available
  let currentUser = user
  if (!currentUser) {
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    currentUser = sessionUser
  }

  if (!currentUser) {
    return { error: 'Not authenticated. Please sign in again.' }
  }

  // Use RPC function to create position (bypasses RLS)
  // Pass user_id explicitly to avoid auth.uid() issues
  const { data: position, error } = await supabase.rpc('create_position', {
    p_name: data.name,
    p_department_id: data.department_id,
    p_level: data.level || 3,
    p_user_id: currentUser.id,  // Pass user_id explicitly
  })

  if (error) {
    return { error: error.message }
  }

  if (!position) {
    return { error: 'Failed to create position' }
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/positions')
  return { data: position }
}

export async function updatePosition(
  id: string,
  data: Omit<PositionUpdate, 'org_id'>
) {
  const { supabase, user } = await createClient()
  const profile = await getCurrentProfile()

  if (!profile || !user) {
    return { error: 'Not authenticated' }
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: user.id,
    permission_key: 'positions.manage',
  })

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  const { data: position, error } = await supabase
    .from('positions')
    .update(data as PositionUpdate)
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/positions')
  return { data: position }
}

export async function deletePosition(id: string) {
  const { supabase, user } = await createClient()
  const profile = await getCurrentProfile()

  if (!profile || !user) {
    return { error: 'Not authenticated' }
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: user.id,
    permission_key: 'positions.manage',
  })

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  const { error } = await supabase
    .from('positions')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.org_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/positions')
  return { success: true }
}
