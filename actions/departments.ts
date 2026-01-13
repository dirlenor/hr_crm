'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type DepartmentInsert = Database['public']['Tables']['departments']['Insert']
type DepartmentUpdate = Database['public']['Tables']['departments']['Update']

export async function createDepartment(data: Omit<DepartmentInsert, 'org_id'>) {
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

  // Use RPC function to create department (bypasses RLS)
  // Pass user_id explicitly to avoid auth.uid() issues
  const { data: department, error } = await supabase.rpc('create_department', {
    p_name: data.name,
    p_description: data.description || null,
    p_parent_id: (data as any).parent_id || null,
    p_user_id: currentUser.id,  // Pass user_id explicitly
  })

  if (error) {
    return { error: error.message }
  }

  if (!department) {
    return { error: 'Failed to create department' }
  }

  revalidatePath('/admin/departments')
  return { data: department }
}

export async function updateDepartment(
  id: string,
  data: Omit<DepartmentUpdate, 'org_id'>
) {
  const { supabase, user } = await createClient()
  const profile = await getCurrentProfile()

  if (!profile || !user) {
    return { error: 'Not authenticated' }
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: user.id,
    permission_key: 'departments.manage',
  })

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  const { data: department, error } = await supabase
    .from('departments')
    .update(data as DepartmentUpdate)
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/departments')
  return { data: department }
}

export async function deleteDepartment(id: string) {
  const { supabase, user } = await createClient()
  const profile = await getCurrentProfile()

  if (!profile || !user) {
    return { error: 'Not authenticated' }
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: user.id,
    permission_key: 'departments.manage',
  })

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.org_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/departments')
  return { success: true }
}
