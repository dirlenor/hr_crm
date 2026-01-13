-- Create RPC function to get employees (bypasses RLS issues with auth.uid())
CREATE OR REPLACE FUNCTION get_employees(
  p_user_id uuid DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_search text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  employee_code text,
  first_name text,
  last_name text,
  nickname text,
  email text,
  phone text,
  status text,
  employment_type text,
  start_date date,
  end_date date,
  department_id uuid,
  position_id uuid,
  work_schedule_id uuid,
  org_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  department_name text,
  position_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id uuid;
  v_user_id_param uuid;
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
  
  -- Return employees with department and position names
  RETURN QUERY
  SELECT 
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.nickname,
    e.email,
    e.phone,
    e.status,
    e.employment_type,
    e.start_date,
    e.end_date,
    e.department_id,
    e.position_id,
    e.work_schedule_id,
    e.org_id,
    e.created_at,
    e.updated_at,
    d.name as department_name,
    p.name as position_name
  FROM employees e
  LEFT JOIN departments d ON e.department_id = d.id
  LEFT JOIN positions p ON e.position_id = p.id
  WHERE e.org_id = v_org_id
    AND (p_status IS NULL OR e.status = p_status)
    AND (
      p_search IS NULL OR
      e.first_name ILIKE '%' || p_search || '%' OR
      e.last_name ILIKE '%' || p_search || '%' OR
      e.employee_code ILIKE '%' || p_search || '%'
    )
  ORDER BY e.created_at DESC;
END;
$$;
