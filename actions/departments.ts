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

  // Revalidate all related paths to ensure fresh data
  revalidatePath('/admin/departments')
  revalidatePath('/admin/employees/new')
  revalidatePath('/admin/departments/new')
  
  return { data: department }
}

export async function updateDepartment(
  id: string,
  data: Omit<DepartmentUpdate, 'org_id'>
) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Ensure session is set for RLS
  await supabase.auth.getSession()

  // Now RLS should work - try direct query first
  const { data: department, error } = await supabase
    .from('departments')
    .update(data as DepartmentUpdate)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    // If RLS fails, fallback to RPC function
    const { data: rpcDepartment, error: rpcError } = await supabase.rpc('update_department', {
      p_id: id,
      p_name: data.name,
      p_description: data.description || null,
      p_parent_id: (data as any).parent_id || null,
      p_user_id: user.id,
    })

    if (rpcError) {
      return { error: rpcError.message }
    }

    if (!rpcDepartment) {
      return { error: 'Failed to update department' }
    }

    revalidatePath('/admin/departments')
    revalidatePath(`/admin/departments/${id}`)
    return { data: rpcDepartment }
  }

  revalidatePath('/admin/departments')
  revalidatePath(`/admin/departments/${id}`)
  return { data: department }
}

export async function deleteDepartment(id: string) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Ensure session is set for RLS
  await supabase.auth.getSession()

  // Now RLS should work - try direct query first
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)

  if (error) {
    // If RLS fails, fallback to RPC function
    const { data: success, error: rpcError } = await supabase.rpc('delete_department', {
      p_id: id,
      p_user_id: user.id,
    })

    if (rpcError) {
      return { error: rpcError.message }
    }

    if (!success) {
      return { error: 'Failed to delete department' }
    }

    revalidatePath('/admin/departments')
    return { success: true }
  }

  revalidatePath('/admin/departments')
  return { success: true }
}
