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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:14',message:'createEmployee entry',data:{hasData:!!data,firstName:data.first_name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  const { supabase, user, session } = await createClient()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:18',message:'After createClient',data:{hasUser:!!user,userId:user?.id,hasSession:!!session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Try to get user from session if not available
  let currentUser = user
  if (!currentUser) {
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    currentUser = sessionUser
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:25',message:'Fallback getUser',data:{hasSessionUser:!!sessionUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }

  if (!currentUser) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:32',message:'No user found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return { error: 'Not authenticated' }
  }

  // Use RPC function to get org_id instead of getCurrentProfile (more reliable)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:40',message:'Before get_user_org_id RPC',data:{userId:currentUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  
  const { data: orgId, error: orgIdError } = await supabase.rpc('get_user_org_id', {
    user_id: currentUser.id,
  })
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:47',message:'After get_user_org_id RPC',data:{hasOrgId:!!orgId,hasError:!!orgIdError,errorMessage:orgIdError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  if (!orgId || orgIdError) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:52',message:'No orgId found',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return { error: 'Not authenticated. Please complete onboarding.' }
  }

  // Check permission
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:42',message:'Before permission check',data:{userId:currentUser.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: currentUser.id,
    permission_key: 'employees.create',
  })
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:50',message:'After permission check',data:{hasPermission:!!hasPermission},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  // Use RPC function to create employee (bypasses RLS)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:81',message:'Before create_employee RPC',data:{userId:currentUser.id,firstName:data.first_name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  const { data: employee, error } = await supabase.rpc('create_employee', {
    p_first_name: data.first_name,  // Required parameters first
    p_last_name: data.last_name,
    p_start_date: data.start_date,
    p_employee_code: data.employee_code || null,  // Optional parameters after
    p_nickname: data.nickname || null,
    p_email: data.email || null,
    p_phone: data.phone || null,
    p_department_id: data.department_id || null,
    p_position_id: data.position_id || null,
    p_employment_type: data.employment_type || 'full-time',
    p_base_salary: data.base_salary || null,
    p_user_id: currentUser.id,  // Pass user_id explicitly
  })

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7bfc2665-b30e-4e03-aba2-ec07d756f3ec',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions/employees.ts:98',message:'After create_employee RPC',data:{hasEmployee:!!employee,hasError:!!error,errorMessage:error?.message,errorCode:error?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion

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
  const profile = await getCurrentProfile()

  if (!profile || !user) {
    return { error: 'Not authenticated' }
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: user.id,
    permission_key: 'employees.update',
  })

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  const { data: employee, error } = await supabase
    .from('employees')
    .update({
      ...data,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    } as EmployeeUpdate)
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
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
  const profile = await getCurrentProfile()

  if (!profile || !user) {
    return { error: 'Not authenticated' }
  }

  // Check permission
  const { data: hasPermission } = await supabase.rpc('has_permission', {
    user_id: user.id,
    permission_key: 'employees.delete',
  })

  if (!hasPermission) {
    return { error: 'Permission denied' }
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.org_id)

  if (error) {
    return { error: error.message }
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
