'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Create a new organization and assign Owner role to the current user
 */
export async function createOrg(name: string) {
  try {
    const { supabase, user } = await createClient()
    
    if (!user) {
      console.error('No user found')
      return { error: 'Not authenticated. Please sign out and sign in again.' }
    }

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return { error: 'User already belongs to an organization' }
    }

    // Get user metadata for LINE OAuth
    const userMetadata = user.user_metadata || {}
    const authProvider = userMetadata.provider === 'line' ? 'line' : 'email'
    const lineUserId = userMetadata.sub || userMetadata.line_user_id || null
    const displayName = userMetadata.name || userMetadata.display_name || user.email || null
    const avatarUrl = userMetadata.picture || userMetadata.avatar_url || null

    // Create org
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({ name })
      .select()
      .single()

    if (orgError || !org) {
      console.error('Error creating org:', orgError)
      return { error: orgError?.message || 'Failed to create organization' }
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        org_id: org.id,
        email: user.email,
        display_name: displayName,
        avatar_url: avatarUrl,
        auth_provider: authProvider,
        line_user_id: lineUserId,
      })

    if (profileError) {
      return { error: profileError.message }
    }

    // Create default roles for org
    const { error: rolesError } = await supabase.rpc('create_default_roles_for_org', {
      org_id_param: org.id,
    })

    if (rolesError) {
      console.error('Error creating default roles:', rolesError)
      // Continue anyway, roles can be created manually
    }

    // Assign Owner role
    const { data: ownerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('org_id', org.id)
      .eq('name', 'Owner')
      .single()

    if (ownerRole) {
      const { error: roleAssignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role_id: ownerRole.id,
        })

      if (roleAssignError) {
        console.error('Error assigning Owner role:', roleAssignError)
        // Continue anyway, can be assigned manually
      }
    }

    revalidatePath('/onboarding')
    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error in createOrg:', error)
    return { error: error?.message || 'An unexpected error occurred' }
  }
}

/**
 * Redeem an invite code to join an organization
 */
export async function redeemInviteCode(code: string) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user already has a profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    return { error: 'User already belongs to an organization' }
  }

  // Find invite code
  const { data: inviteCode, error: inviteError } = await supabase
    .from('org_invite_codes')
    .select('*, orgs(*)')
    .eq('code', code)
    .single()

  if (inviteError || !inviteCode) {
    return { error: 'Invalid invite code' }
  }

  // Check expiration
  if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
    return { error: 'Invite code has expired' }
  }

  // Check max uses
  if (inviteCode.max_uses && inviteCode.used_count >= inviteCode.max_uses) {
    return { error: 'Invite code has reached maximum uses' }
  }

  // Atomically increment used_count
  const { error: updateError } = await supabase
    .from('org_invite_codes')
    .update({ used_count: (inviteCode.used_count || 0) + 1 })
    .eq('id', inviteCode.id)
    .eq('used_count', inviteCode.used_count) // Optimistic locking

  if (updateError) {
    return { error: 'Failed to redeem invite code. Please try again.' }
  }

  // Get user metadata for LINE OAuth
  const userMetadata = user.user_metadata || {}
  const authProvider = userMetadata.provider === 'line' ? 'line' : 'email'
  const lineUserId = userMetadata.sub || userMetadata.line_user_id || null
  const displayName = userMetadata.name || userMetadata.display_name || user.email || null
  const avatarUrl = userMetadata.picture || userMetadata.avatar_url || null

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      org_id: inviteCode.org_id,
      email: user.email,
      display_name: displayName,
      avatar_url: avatarUrl,
      auth_provider: authProvider,
      line_user_id: lineUserId,
    })

  if (profileError) {
    return { error: profileError.message }
  }

  // Assign role from invite code
  if (inviteCode.role_id) {
    const { error: roleAssignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role_id: inviteCode.role_id,
      })

    if (roleAssignError) {
      console.error('Error assigning role from invite:', roleAssignError)
      // Continue anyway
    }
  }

  revalidatePath('/onboarding')
  return { success: true }
}

/**
 * Sync LINE profile data after OAuth callback
 */
export async function syncLineProfile(userId: string) {
  const { supabase, user } = await createClient()
  
  if (!user || user.id !== userId) {
    return { error: 'Unauthorized' }
  }

  const userMetadata = user.user_metadata || {}
  const lineUserId = userMetadata.sub || userMetadata.line_user_id || null
  const displayName = userMetadata.name || userMetadata.display_name || null
  const avatarUrl = userMetadata.picture || userMetadata.avatar_url || null

  const { error } = await supabase
    .from('profiles')
    .update({
      auth_provider: 'line',
      line_user_id: lineUserId,
      display_name: displayName,
      avatar_url: avatarUrl,
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
