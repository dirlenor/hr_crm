-- Enable RLS on departments table
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "departments_select" ON departments;
DROP POLICY IF EXISTS "departments_insert" ON departments;
DROP POLICY IF EXISTS "departments_update" ON departments;
DROP POLICY IF EXISTS "departments_delete" ON departments;

-- SELECT: Users can read departments in their org if they have permission
CREATE POLICY "departments_select" ON departments
FOR SELECT
USING (
  org_id = get_user_org_id(auth.uid())
  AND (
    has_permission(auth.uid(), 'departments.read')
    OR has_permission(auth.uid(), 'departments.manage')
  )
);

-- INSERT: Users can create departments if they have manage permission
CREATE POLICY "departments_insert" ON departments
FOR INSERT
WITH CHECK (
  org_id = get_user_org_id(auth.uid())
  AND has_permission(auth.uid(), 'departments.manage')
);

-- UPDATE: Users can update departments if they have manage permission
CREATE POLICY "departments_update" ON departments
FOR UPDATE
USING (
  org_id = get_user_org_id(auth.uid())
  AND has_permission(auth.uid(), 'departments.manage')
)
WITH CHECK (
  org_id = get_user_org_id(auth.uid())
  AND has_permission(auth.uid(), 'departments.manage')
);

-- DELETE: Users can delete departments if they have manage permission
CREATE POLICY "departments_delete" ON departments
FOR DELETE
USING (
  org_id = get_user_org_id(auth.uid())
  AND has_permission(auth.uid(), 'departments.manage')
);
