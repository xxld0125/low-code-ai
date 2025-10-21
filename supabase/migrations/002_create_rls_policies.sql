-- Migration: Create Row Level Security (RLS) Policies
-- Description: Creates RLS policies for project management tables to ensure proper access control

-- Projects RLS Policies

-- Users can view their own projects and collaborated projects
CREATE POLICY "Users can view accessible projects"
  ON projects FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND joined_at IS NOT NULL
    )
  );

-- Users can insert their own projects
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Project owners can update their projects
CREATE POLICY "Project owners can update projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid());

-- Project owners can delete their projects
CREATE POLICY "Project owners can delete projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());

-- Project Collaborators RLS Policies

-- Users can view collaborators for projects they have access to
CREATE POLICY "Users can view project collaborators"
  ON project_collaborators FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND joined_at IS NOT NULL
    )
  );

-- Project owners can manage collaborators
CREATE POLICY "Project owners can manage collaborators"
  ON project_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Collaborators can view their own collaboration records
CREATE POLICY "Collaborators can view their own records"
  ON project_collaborators FOR SELECT
  USING (user_id = auth.uid());

-- Project Invitations RLS Policies

-- Users can view invitations for projects they own or invitations sent to them
CREATE POLICY "Users can view project invitations"
  ON project_invitations FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    ) OR
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
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Project owners can manage invitations
CREATE POLICY "Project owners can manage invitations"
  ON project_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Project owners can delete invitations
CREATE POLICY "Project owners can delete invitations"
  ON project_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND owner_id = auth.uid()
    )
  );

-- Users can accept invitations sent to them
CREATE POLICY "Users can accept their invitations"
  ON project_invitations FOR UPDATE
  USING (
    invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) AND
    accepted_at IS NULL AND
    declined_at IS NULL AND
    expires_at > NOW()
  )
  WITH CHECK (
    invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) AND
    accepted_at = NOW() AND
    declined_at IS NULL
  );

-- Users can decline invitations sent to them
CREATE POLICY "Users can decline their invitations"
  ON project_invitations FOR UPDATE
  USING (
    invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) AND
    accepted_at IS NULL AND
    declined_at IS NULL AND
    expires_at > NOW()
  )
  WITH CHECK (
    invited_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) AND
    accepted_at IS NULL AND
    declined_at = NOW()
  );

-- Project Activity Log RLS Policies

-- Users can view activity logs for projects they have access to
CREATE POLICY "Users can view project activity logs"
  ON project_activity_log FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND joined_at IS NOT NULL
    )
  );

-- System can insert activity logs (for triggers and functions)
CREATE POLICY "System can insert activity logs"
  ON project_activity_log FOR INSERT
  WITH CHECK (true); -- This will be controlled by database functions