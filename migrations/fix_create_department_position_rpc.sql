-- Fix create_department RPC to accept user_id parameter instead of relying on auth.uid()
DROP FUNCTION IF EXISTS create_department(text, text, uuid);

CREATE OR REPLACE FUNCTION create_department(
  p_name text,
  p_description text DEFAULT NULL,
  p_parent_id uuid DEFAULT NULL,
  p_user_id uuid DEFAULT NULL  -- Accept user_id as parameter
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
  
  -- Insert department
  INSERT INTO departments (org_id, name, description, parent_id)
  VALUES (v_org_id, p_name, p_description, p_parent_id)
  RETURNING * INTO v_department;
  
  RETURN v_department;
END;
$$;

-- Fix create_position RPC similarly
DROP FUNCTION IF EXISTS create_position(text, uuid, int);

CREATE OR REPLACE FUNCTION create_position(
  p_name text,
  p_department_id uuid,
  p_level int DEFAULT 3,
  p_user_id uuid DEFAULT NULL  -- Accept user_id as parameter
)
RETURNS positions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_org_id uuid;
  v_user_id_param uuid;
  v_position positions;
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
  IF NOT has_permission(v_user_id_param, 'positions.manage') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Verify department belongs to same org
  IF NOT EXISTS (
    SELECT 1 FROM departments 
    WHERE id = p_department_id 
    AND org_id = v_org_id
  ) THEN
    RAISE EXCEPTION 'Department does not belong to your organization';
  END IF;
  
  -- Insert position
  INSERT INTO positions (org_id, department_id, name, level)
  VALUES (v_org_id, p_department_id, p_name, p_level)
  RETURNING * INTO v_position;
  
  RETURN v_position;
END;
$$;
