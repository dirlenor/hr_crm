-- Create RPC function to create employee (bypasses RLS)
CREATE OR REPLACE FUNCTION create_employee(
  p_first_name text,  -- Required parameters first
  p_last_name text,
  p_start_date date,
  p_employee_code text DEFAULT NULL,  -- Optional parameters after
  p_nickname text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_department_id uuid DEFAULT NULL,
  p_position_id uuid DEFAULT NULL,
  p_employment_type text DEFAULT 'full-time',
  p_base_salary numeric DEFAULT NULL,
  p_user_id uuid DEFAULT NULL  -- Accept user_id as parameter
)
RETURNS employees
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id uuid;
  v_user_id_param uuid;
  v_invite_code text;
  v_employee employees;
BEGIN
  -- Use provided user_id or fallback to auth.uid()
  v_user_id_param := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id_param IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get user's org_id
  SELECT get_user_org_id(v_user_id_param) INTO v_org_id;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'User does not belong to an organization';
  END IF;
  
  -- Check permission
  IF NOT has_permission(v_user_id_param, 'employees.create') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Generate invite code
  SELECT generate_employee_invite_code() INTO v_invite_code;
  
  IF v_invite_code IS NULL THEN
    RAISE EXCEPTION 'Failed to generate invite code';
  END IF;
  
  -- Insert employee
  INSERT INTO employees (
    org_id,
    employee_code,
    first_name,
    last_name,
    nickname,
    email,
    phone,
    department_id,
    position_id,
    employment_type,
    start_date,
    base_salary,
    status,
    invite_code,
    invite_expires_at,
    invite_sent_at,
    created_by,
    updated_by
  )
  VALUES (
    v_org_id,
    p_employee_code,
    p_first_name,
    p_last_name,
    p_nickname,
    p_email,
    p_phone,
    p_department_id,
    p_position_id,
    p_employment_type,
    p_start_date,
    p_base_salary,
    'pending',
    v_invite_code,
    (NOW() + INTERVAL '30 days'),
    NOW(),
    v_user_id_param,
    v_user_id_param
  )
  RETURNING * INTO v_employee;
  
  RETURN v_employee;
END;
$$;
