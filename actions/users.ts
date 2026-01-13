'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type InviteCodeInsert = Database['public']['Tables']['org_invite_codes']['Insert']

export async function createInviteCode(
  roleId: string,
  maxUses: number = 1,
  expiresAt?: string
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

  // Generate unique code
  const code = Math.random().toString(36).substring(2, 10).toUpperCase()

  const { data, error } = await supabase
    .from('org_invite_codes')
    .insert({
      org_id: orgId,
      code,
      role_id: roleId,
      max_uses: maxUses,
      expires_at: expiresAt || null,
      created_by: user.id,
    } as InviteCodeInsert)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { data }
}

export async function assignRoleToUser(userId: string, roleId: string) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleId,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended') {
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
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .eq('org_id', orgId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
