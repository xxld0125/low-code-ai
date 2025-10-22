-- Migration: Fix Duplicate Project IDs in get_user_projects Function
-- Description: Adds DISTINCT to prevent duplicate project records that cause React key warnings

-- Drop and recreate the function with DISTINCT to prevent duplicates
DROP FUNCTION IF EXISTS get_user_projects;

-- Function: Get User Projects (Fixed)
CREATE OR REPLACE FUNCTION get_user_projects(
  p_user_id UUID,
  p_include_archived BOOLEAN DEFAULT FALSE,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  user_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.name,
    p.description,
    p.owner_id,
    p.created_at,
    p.updated_at,
    p.status,
    CASE
      WHEN p.owner_id = p_user_id THEN 'owner'
      ELSE COALESCE(pc.role, 'viewer')
    END as user_role
  FROM projects p
  LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = p_user_id
  WHERE
    p.is_deleted = FALSE
    AND (
      p.owner_id = p_user_id
      OR (pc.user_id = p_user_id AND pc.joined_at IS NOT NULL)
    )
    AND (p_include_archived = TRUE OR p.status = 'active')
  ORDER BY p.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;