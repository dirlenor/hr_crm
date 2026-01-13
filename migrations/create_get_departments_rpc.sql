-- Create RPC function to get departments (bypasses RLS issues with auth.uid())
CREATE OR REPLACE FUNCTION get_departments(
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  org_id uuid,
  parent_id uuid,
  created_at timestamptz,
  updated_at timestamptz
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
  
  -- Check permission
  IF NOT has_permission(v_user_id_param, 'departments.read') 
     AND NOT has_permission(v_user_id_param, 'departments.manage') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Return departments for the user's org
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.org_id,
    d.parent_id,
    d.created_at,
    d.updated_at
  FROM departments d
  WHERE d.org_id = v_org_id
  ORDER BY d.name;
END;
$$;
