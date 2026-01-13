-- Add departments permissions to permissions table
INSERT INTO permissions (key, description)
VALUES 
  ('departments.read', 'Read departments'),
  ('departments.manage', 'Create/update/delete departments')
ON CONFLICT (key) DO NOTHING;

-- Add departments permissions to Owner role (for all existing orgs)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id AS role_id,
  p.id AS permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Owner'
  AND p.key IN ('departments.read', 'departments.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add departments permissions to Admin role (for all existing orgs)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id AS role_id,
  p.id AS permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin'
  AND p.key IN ('departments.read', 'departments.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;
