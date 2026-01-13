'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type RoleInsert = Database['public']['Tables']['roles']['Insert']

export async function createRole(
  name: string,
  description: string,
  permissionIds: string[]
) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get org_id using RPC function
  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    return { error: 'Not authenticated' }
  }

  // Create role
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .insert({
      org_id: orgId,
      name,
      description,
    } as RoleInsert)
    .select()
    .single()

  if (roleError || !role) {
    return { error: roleError?.message || 'Failed to create role' }
  }

  // Assign permissions
  if (permissionIds.length > 0) {
    const { error: permError } = await supabase
      .from('role_permissions')
      .insert(
        permissionIds.map((permId) => ({
          role_id: role.id,
          permission_id: permId,
        }))
      )

    if (permError) {
      return { error: permError.message }
    }
  }

  revalidatePath('/admin/roles')
  return { data: role }
}

export async function updateRole(
  roleId: string,
  name: string,
  description: string,
  permissionIds: string[]
) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get org_id using RPC function
  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    return { error: 'Not authenticated' }
  }

  // Update role
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .update({ name, description })
    .eq('id', roleId)
    .eq('org_id', orgId)
    .select()
    .single()

  if (roleError || !role) {
    return { error: roleError?.message || 'Failed to update role' }
  }

  // Replace permissions
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (permissionIds.length > 0) {
    const { error: permError } = await supabase
      .from('role_permissions')
      .insert(
        permissionIds.map((permId) => ({
          role_id: roleId,
          permission_id: permId,
        }))
      )

    if (permError) {
      return { error: permError.message }
    }
  }

  revalidatePath('/admin/roles')
  return { data: role }
}

export async function deleteRole(roleId: string) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get org_id using RPC function
  const { data: orgId } = await supabase.rpc('get_user_org_id', {
    user_id: user.id,
  })

  if (!orgId) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId)
    .eq('org_id', orgId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/roles')
  return { success: true }
}
