'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

/**
 * Create new employee (Admin only)
 */
export async function createEmployee(data: Omit<EmployeeInsert, 'org_id' | 'created_by' | 'updated_by' | 'status' | 'invite_code' | 'invite_expires_at' | 'invite_sent_at'>) {
  const { supabase, user, session } = await createClient()
  
  // Try to get user from session if not available
  let currentUser = user
  if (!currentUser) {
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    currentUser = sessionUser
  }

  if (!currentUser) {
    return { error: 'Not authenticated' }
  }

  // Use RPC function to get org_id
  const { data: orgId, error: orgIdError } = await supabase.rpc('get_user_org_id', {
    user_id: currentUser.id,
  })

  if (!orgId || orgIdError) {
    return { error: 'Not authenticated. Please complete onboarding.' }
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: currentUser.id,
    permission_key: 'employees.create',
  })

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  // Use RPC function to create employee (bypasses RLS)
  const { data: employee, error } = await supabase.rpc('create_employee', {
    p_first_name: data.first_name,
    p_last_name: data.last_name,
    p_start_date: data.start_date,
    p_employee_code: data.employee_code || null,
    p_nickname: data.nickname || null,
    p_email: data.email || null,
    p_phone: data.phone || null,
    p_department_id: data.department_id || null,
    p_position_id: data.position_id || null,
    p_employment_type: data.employment_type || 'full-time',
    p_base_salary: data.base_salary || null,
    p_user_id: currentUser.id,
  })

  if (error) {
    return { error: error.message }
  }

  if (!employee) {
    return { error: 'Failed to create employee' }
  }

  revalidatePath('/admin/employees')
  return { data: employee }
}

/**
 * Update employee
 */
export async function updateEmployee(
  id: string,
  data: Omit<EmployeeUpdate, 'org_id' | 'updated_by'>
) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Ensure session is set for RLS
  await supabase.auth.getSession()

  // Now RLS should work - try direct query first
  const { data: employee, error } = await supabase
    .from('employees')
    .update({
      ...data,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    } as EmployeeUpdate)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    // If RLS fails, fallback to RPC function
    const { data: rpcEmployee, error: rpcError } = await supabase.rpc('update_employee', {
      p_id: id,
      p_employee_code: data.employee_code || null,
      p_first_name: data.first_name || null,
      p_last_name: data.last_name || null,
      p_nickname: data.nickname || null,
      p_email: data.email || null,
      p_phone: data.phone || null,
      p_department_id: data.department_id || null,
      p_position_id: data.position_id || null,
      p_employment_type: data.employment_type || null,
      p_start_date: data.start_date || null,
      p_base_salary: data.base_salary || null,
      p_user_id: user.id,
    })

    if (rpcError) {
      return { error: rpcError.message }
    }

    if (!rpcEmployee) {
      return { error: 'Failed to update employee' }
    }

    revalidatePath('/admin/employees')
    revalidatePath(`/admin/employees/${id}`)
    return { data: rpcEmployee }
  }

  revalidatePath('/admin/employees')
  revalidatePath(`/admin/employees/${id}`)
  return { data: employee }
}

/**
 * Delete employee
 */
export async function deleteEmployee(id: string) {
  const { supabase, user } = await createClient()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Ensure session is set for RLS
  await supabase.auth.getSession()

  // Now RLS should work - try direct query first
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) {
    // If RLS fails, fallback to RPC function
    const { data: success, error: rpcError } = await supabase.rpc('delete_employee', {
      p_id: id,
      p_user_id: user.id,
    })

    if (rpcError) {
      return { error: rpcError.message }
    }

    if (!success) {
      return { error: 'Failed to delete employee' }
    }

    revalidatePath('/admin/employees')
    return { success: true }
  }

  revalidatePath('/admin/employees')
  return { success: true }
}

/**
 * Link employee with LINE account (for LIFF)
 */
export async function linkEmployeeWithLine(
  employeeCode: string,
  lineUserId: string,
  userId?: string
) {
  const { supabase } = await createClient()

  const { data, error } = await supabase.rpc('link_employee_with_line', {
    employee_code_param: employeeCode,
    line_user_id_param: lineUserId,
    user_id_param: userId || null,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data || !data.success) {
    return { error: data?.error || 'Failed to link employee' }
  }

  return { data }
}

/**
 * Get employee by invite code
 */
export async function getEmployeeByInviteCode(inviteCode: string) {
  const { supabase } = await createClient()

  const { data, error } = await supabase
    .from('employees')
    .select('id, employee_code, first_name, last_name, email, phone, org_id, departments(name), positions(name)')
    .eq('invite_code', inviteCode)
    .eq('status', 'pending')
    .gt('invite_expires_at', new Date().toISOString())
    .single()

  if (error || !data) {
    return { error: 'Invalid or expired invite code' }
  }

  return { data }
}
