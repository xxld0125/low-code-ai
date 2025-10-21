-- Migration: Create Database Functions
-- Description: Creates database functions for project management operations

-- Function: Get User Projects
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
  SELECT
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

-- Function: Create Project
CREATE OR REPLACE FUNCTION create_project(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_owner_id UUID
)
RETURNS UUID AS $$
DECLARE
  project_id UUID;
BEGIN
  -- Check if user already has a project with this name
  IF EXISTS (
    SELECT 1 FROM projects
    WHERE owner_id = p_owner_id
    AND name = p_name
    AND is_deleted = FALSE
  ) THEN
    RAISE EXCEPTION 'Project name already exists';
  END IF;

  -- Validate project name length
  IF char_length(p_name) < 1 OR char_length(p_name) > 100 THEN
    RAISE EXCEPTION 'Project name must be between 1 and 100 characters';
  END IF;

  -- Validate project description length
  IF p_description IS NOT NULL AND char_length(p_description) > 500 THEN
    RAISE EXCEPTION 'Project description must be less than 500 characters';
  END IF;

  -- Create the project
  INSERT INTO projects (name, description, owner_id)
  VALUES (p_name, p_description, p_owner_id)
  RETURNING id INTO project_id;

  -- Log the activity
  INSERT INTO project_activity_log (project_id, user_id, action, details)
  VALUES (
    project_id,
    p_owner_id,
    'created',
    jsonb_build_object('name', p_name, 'description', p_description)
  );

  RETURN project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update Project
CREATE OR REPLACE FUNCTION update_project(
  p_project_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  project_owner_id UUID;
BEGIN
  -- Get project owner and verify permissions
  SELECT owner_id INTO project_owner_id
  FROM projects
  WHERE id = p_project_id AND is_deleted = FALSE;

  IF project_owner_id IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  IF project_owner_id != p_user_id THEN
    RAISE EXCEPTION 'Only project owners can update projects';
  END IF;

  -- Validate project name if provided
  IF p_name IS NOT NULL THEN
    IF char_length(p_name) < 1 OR char_length(p_name) > 100 THEN
      RAISE EXCEPTION 'Project name must be between 1 and 100 characters';
    END IF;

    -- Check if name is unique for this user
    IF EXISTS (
      SELECT 1 FROM projects
      WHERE id != p_project_id
      AND owner_id = p_user_id
      AND name = p_name
      AND is_deleted = FALSE
    ) THEN
      RAISE EXCEPTION 'Project name already exists';
    END IF;
  END IF;

  -- Validate project description if provided
  IF p_description IS NOT NULL AND char_length(p_description) > 500 THEN
    RAISE EXCEPTION 'Project description must be less than 500 characters';
  END IF;

  -- Validate status if provided
  IF p_status IS NOT NULL AND p_status NOT IN ('active', 'archived', 'suspended') THEN
    RAISE EXCEPTION 'Invalid project status';
  END IF;

  -- Update the project
  UPDATE projects
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    status = COALESCE(p_status, status),
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Log the activity
  INSERT INTO project_activity_log (project_id, user_id, action, details)
  VALUES (
    p_project_id,
    p_user_id,
    'updated',
    jsonb_build_object(
      'name', p_name,
      'description', p_description,
      'status', p_status
    )
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Delete Project (Soft Delete)
CREATE OR REPLACE FUNCTION delete_project(
  p_project_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  project_owner_id UUID;
BEGIN
  -- Get project owner and verify permissions
  SELECT owner_id INTO project_owner_id
  FROM projects
  WHERE id = p_project_id AND is_deleted = FALSE;

  IF project_owner_id IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  IF project_owner_id != p_user_id THEN
    RAISE EXCEPTION 'Only project owners can delete projects';
  END IF;

  -- Soft delete the project
  UPDATE projects
  SET
    is_deleted = TRUE,
    status = 'archived',
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Log the activity
  INSERT INTO project_activity_log (project_id, user_id, action, details)
  VALUES (
    p_project_id,
    p_user_id,
    'deleted',
    jsonb_build_object('deleted_at', NOW())
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Invite Collaborator
CREATE OR REPLACE FUNCTION invite_collaborator(
  p_project_id UUID,
  p_invited_email TEXT,
  p_role TEXT,
  p_invited_by UUID
)
RETURNS UUID AS $$
DECLARE
  invitation_id UUID;
  invitation_token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  project_owner_id UUID;
  user_exists BOOLEAN;
BEGIN
  -- Validate role
  IF p_role NOT IN ('editor', 'viewer') THEN
    RAISE EXCEPTION 'Invalid role. Must be editor or viewer';
  END IF;

  -- Validate email format
  IF p_invited_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Get project owner and verify permissions
  SELECT owner_id INTO project_owner_id
  FROM projects
  WHERE id = p_project_id AND is_deleted = FALSE;

  IF project_owner_id IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  IF project_owner_id != p_invited_by THEN
    RAISE EXCEPTION 'Only project owners can invite collaborators';
  END IF;

  -- Check if user is already a collaborator
  SELECT EXISTS(
    SELECT 1 FROM project_collaborators pc
    JOIN auth.users u ON pc.user_id = u.id
    WHERE pc.project_id = p_project_id AND u.email = p_invited_email
  ) INTO user_exists;

  IF user_exists THEN
    RAISE EXCEPTION 'User is already a collaborator on this project';
  END IF;

  -- Don't allow inviting the project owner
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = project_owner_id AND email = p_invited_email
  ) THEN
    RAISE EXCEPTION 'Cannot invite the project owner as a collaborator';
  END IF;

  -- Generate invitation token and expiration
  invitation_token := encode(gen_random_bytes(32), 'hex');
  expires_at := NOW() + INTERVAL '7 days';

  -- Create invitation
  INSERT INTO project_invitations (
    project_id, invited_by, invited_email, role, token, expires_at
  )
  VALUES (
    p_project_id, p_invited_by, p_invited_email, p_role,
    invitation_token, expires_at
  )
  RETURNING id INTO invitation_id;

  -- Log the activity
  INSERT INTO project_activity_log (project_id, user_id, action, details)
  VALUES (
    p_project_id,
    p_invited_by,
    'invitation_sent',
    jsonb_build_object('email', p_invited_email, 'role', p_role)
  );

  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Accept Invitation
CREATE OR REPLACE FUNCTION accept_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  invitation_record RECORD;
  collaborator_id UUID;
BEGIN
  -- Get invitation details
  SELECT
    pi.id,
    pi.project_id,
    pi.invited_email,
    pi.role,
    pi.expires_at
  INTO invitation_record
  FROM project_invitations pi
  WHERE pi.token = p_token
    AND pi.accepted_at IS NULL
    AND pi.declined_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Check if invitation has expired
  IF invitation_record.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  -- Verify the invitation was sent to this user's email
  IF invitation_record.invited_email != (
    SELECT email FROM auth.users WHERE id = p_user_id
  ) THEN
    RAISE EXCEPTION 'This invitation was not sent to your email address';
  END IF;

  -- Add user as collaborator
  INSERT INTO project_collaborators (
    project_id, user_id, role, joined_at
  )
  VALUES (
    invitation_record.project_id,
    p_user_id,
    invitation_record.role,
    NOW()
  )
  RETURNING id INTO collaborator_id;

  -- Update invitation as accepted
  UPDATE project_invitations
  SET accepted_at = NOW()
  WHERE id = invitation_record.id;

  -- Log the activity
  INSERT INTO project_activity_log (project_id, user_id, action, details)
  VALUES (
    invitation_record.project_id,
    p_user_id,
    'invitation_accepted',
    jsonb_build_object('invitation_id', invitation_record.id, 'role', invitation_record.role)
  );

  RETURN invitation_record.project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Remove Collaborator
CREATE OR REPLACE FUNCTION remove_collaborator(
  p_project_id UUID,
  p_collaborator_user_id UUID,
  p_removed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  project_owner_id UUID;
  collaborator_role TEXT;
BEGIN
  -- Get project owner and verify permissions
  SELECT owner_id INTO project_owner_id
  FROM projects
  WHERE id = p_project_id AND is_deleted = FALSE;

  IF project_owner_id IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  IF project_owner_id != p_removed_by THEN
    RAISE EXCEPTION 'Only project owners can remove collaborators';
  END IF;

  -- Don't allow removing the project owner
  IF p_collaborator_user_id = project_owner_id THEN
    RAISE EXCEPTION 'Cannot remove the project owner';
  END IF;

  -- Get collaborator role for logging
  SELECT role INTO collaborator_role
  FROM project_collaborators
  WHERE project_id = p_project_id AND user_id = p_collaborator_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Collaborator not found on this project';
  END IF;

  -- Remove the collaborator
  DELETE FROM project_collaborators
  WHERE project_id = p_project_id AND user_id = p_collaborator_user_id;

  -- Log the activity
  INSERT INTO project_activity_log (project_id, user_id, action, details)
  VALUES (
    p_project_id,
    p_removed_by,
    'collaborator_removed',
    jsonb_build_object('removed_user_id', p_collaborator_user_id, 'role', collaborator_role)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;