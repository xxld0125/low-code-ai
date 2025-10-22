-- Migration: Fix RLS Infinite Recursion
-- Description: Creates helper functions and fixes RLS policies to avoid circular dependencies

-- Helper function to check if user has access to a project
CREATE OR REPLACE FUNCTION user_has_project_access(
  p_project_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the owner
  IF EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND owner_id = p_user_id AND is_deleted = FALSE
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if user is an active collaborator
  IF EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_id = p_project_id
      AND user_id = p_user_id
      AND joined_at IS NOT NULL
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a single project by ID with access check
CREATE OR REPLACE FUNCTION get_project_by_id(
  p_project_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  owner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  is_deleted BOOLEAN
) AS $$
BEGIN
  -- Only return the project if user has access
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.owner_id,
    p.created_at,
    p.updated_at,
    p.status,
    p.is_deleted
  FROM projects p
  WHERE p.id = p_project_id
    AND p.is_deleted = FALSE
    AND user_has_project_access(p_project_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get collaborators for a project with access check
CREATE OR REPLACE FUNCTION get_project_collaborators(
  p_project_id UUID,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  user_id UUID,
  role TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID
) AS $$
BEGIN
  -- Only return collaborators if user has access to the project
  RETURN QUERY
  SELECT
    pc.id,
    pc.project_id,
    pc.user_id,
    pc.role,
    pc.joined_at,
    pc.invited_at,
    pc.invited_by
  FROM project_collaborators pc
  WHERE pc.project_id = p_project_id
    AND user_has_project_access(p_project_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;