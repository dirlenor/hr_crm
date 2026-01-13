-- Create RPC function to update department (bypasses RLS issues with auth.uid())
CREATE OR REPLACE FUNCTION update_department(
  p_id uuid,
  p_name text,
  p_description text DEFAULT NULL,
  p_parent_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS departments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id uuid;
  v_user_id_param uuid;
  v_department departments;
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
  IF NOT has_permission(v_user_id_param, 'departments.manage') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Verify department belongs to same org
  IF NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE id = p_id 
    AND org_id = v_org_id
  ) THEN
    RAISE EXCEPTION 'Department does not belong to your organization';
  END IF;
  
  -- Update department
  UPDATE departments
  SET 
    name = p_name,
    description = p_description,
    parent_id = p_parent_id,
    updated_at = NOW()
  WHERE id = p_id
    AND org_id = v_org_id
  RETURNING * INTO v_department;
  
  IF v_department IS NULL THEN
    RAISE EXCEPTION 'Department not found';
  END IF;
  
  RETURN v_department;
END;
$$;

-- Create RPC function to delete department (bypasses RLS issues with auth.uid())
CREATE OR REPLACE FUNCTION delete_department(
  p_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id uuid;
  v_user_id_param uuid;
  v_deleted_count int;
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
  IF NOT has_permission(v_user_id_param, 'departments.manage') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Verify department belongs to same org
  IF NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE id = p_id 
    AND org_id = v_org_id
  ) THEN
    RAISE EXCEPTION 'Department does not belong to your organization';
  END IF;
  
  -- Check if department has employees
  IF EXISTS (
    SELECT 1 FROM employees 
    WHERE department_id = p_id
  ) THEN
    RAISE EXCEPTION 'Cannot delete department with employees. Please reassign or remove employees first.';
  END IF;
  
  -- Delete department
  DELETE FROM departments
  WHERE id = p_id
    AND org_id = v_org_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count = 0 THEN
    RAISE EXCEPTION 'Department not found';
  END IF;
  
  RETURN TRUE;
END;
$$;
