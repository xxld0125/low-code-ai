-- Migration: Update RLS Policies to Fix Recursion
-- Description: Replaces circular RLS policies with simpler, direct checks

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON projects;

DROP POLICY IF EXISTS "Users can view project collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Collaborators can view their own records" ON project_collaborators;

-- Projects RLS Policies (Simplified)

-- Users can view projects they own
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (owner_id = auth.uid() AND is_deleted = FALSE);

-- Users can create their own projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Project owners can update their projects
CREATE POLICY "Project owners can update projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid() AND is_deleted = FALSE)
  WITH CHECK (owner_id = auth.uid());

-- Project owners can delete their projects
CREATE POLICY "Project owners can delete projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid() AND is_deleted = FALSE);

-- Project Collaborators RLS Policies (Simplified)

-- Users can view their own collaboration records
CREATE POLICY "Users can view own collaborations"
  ON project_collaborators FOR SELECT
  USING (user_id = auth.uid());

-- Users can view collaborators for projects they own
CREATE POLICY "Owners can view project collaborators"
  ON project_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND owner_id = auth.uid()
        AND is_deleted = FALSE
    )
  );

-- Project owners can manage collaborators
CREATE POLICY "Project owners can manage collaborators"
  ON project_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND owner_id = auth.uid()
        AND is_deleted = FALSE
    )
  );

-- Project Invitations RLS Policies (Update only the problematic ones)

DROP POLICY IF EXISTS "Users can view project invitations" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can send invitations" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can manage invitations" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can delete invitations" ON project_invitations;

-- Users can view invitations for projects they own
CREATE POLICY "Users can view own project invitations"
  ON project_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND owner_id = auth.uid()
        AND is_deleted = FALSE
    )
  );

-- Users can view invitations sent to them
CREATE POLICY "Users can view invitations sent to them"
  ON project_invitations FOR SELECT
  USING (
    invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Project owners can send invitations
CREATE POLICY "Project owners can send invitations"
  ON project_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND owner_id = auth.uid()
        AND is_deleted = FALSE
    )
  );

-- Project owners can manage invitations
CREATE POLICY "Project owners can manage invitations"
  ON project_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND owner_id = auth.uid()
        AND is_deleted = FALSE
    )
  );

-- Project owners can delete invitations
CREATE POLICY "Project owners can delete invitations"
  ON project_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND owner_id = auth.uid()
        AND is_deleted = FALSE
    )
  );

-- Project Activity Log RLS Policies (Update to avoid recursion)

DROP POLICY IF EXISTS "Users can view project activity logs" ON project_activity_log;

-- Users can view activity logs for projects they own
CREATE POLICY "Users can view own project activity logs"
  ON project_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id
        AND owner_id = auth.uid()
        AND is_deleted = FALSE
    )
  );

-- Users can view activity logs for projects they collaborate on
CREATE POLICY "Users can view collaborated project activity logs"
  ON project_activity_log FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = project_activity_log.project_id
        AND user_id = auth.uid()
        AND joined_at IS NOT NULL
    )
  );

-- Keep existing policies for accepting/declining invitations
-- These don't cause recursion issues