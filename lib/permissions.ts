import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Permission = Database['public']['Tables']['permissions']['Row']

/**
 * Server-side permission check using has_permission function
 */
export async function checkPermissionServer(
  userId: string,
  permissionKey: string
): Promise<boolean> {
  const { supabase } = await createClient()
  
  const { data, error } = await supabase.rpc('has_permission', {
    user_id: userId,
    permission_key: permissionKey,
  })

  if (error) {
    console.error('Error checking permission:', error)
    return false
  }

  return data ?? false
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const { supabase } = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      roles:role_id (
        role_permissions (
          permissions:permission_id (
            key
          )
        )
      )
    `)
    .eq('user_id', userId)

  if (error || !data) {
    console.error('Error fetching user permissions:', error)
    return []
  }

  const permissions = new Set<string>()
  
  for (const userRole of data) {
    const role = userRole.roles as any
    if (role?.role_permissions) {
      for (const rp of role.role_permissions) {
        const perm = rp.permissions as any
        if (perm?.key) {
          permissions.add(perm.key)
        }
      }
    }
  }

  return Array.from(permissions)
}

/**
 * Check if current user has a permission
 */
export async function hasPermission(permissionKey: string): Promise<boolean> {
  const { user } = await createClient()

  if (!user) return false

  return checkPermissionServer(user.id, permissionKey)
}
