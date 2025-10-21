-- Migration: Create Project Management Schema
-- Description: Creates tables for project management feature including projects, collaborators, invitations, and activity log

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,

  -- Metadata
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'suspended')),

  -- Constraints
  CONSTRAINT projects_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT projects_description_length CHECK (char_length(description) <= 500)
);

-- Indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted);

-- Project collaborators table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  UNIQUE(project_id, user_id),
  CONSTRAINT project_collaborators_owner_role CHECK (
    -- Only project owners can have owner role
    role != 'owner' OR user_id = (SELECT owner_id FROM projects WHERE id = project_id)
  )
);

-- Indexes for project_collaborators table
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_role ON project_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_joined_at ON project_collaborators(joined_at);

-- Project invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT project_invitations_email_format CHECK (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT project_invitations_expiration CHECK (expires_at > created_at),
  CONSTRAINT project_invitations_not_both_accepted CHECK (
    (accepted_at IS NULL) OR (declined_at IS NULL)
  )
);

-- Indexes for project_invitations table
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_expires_at ON project_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_project_invitations_created_at ON project_invitations(created_at);

-- Project activity log table (audit trail)
CREATE TABLE IF NOT EXISTS project_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN (
    'created', 'updated', 'deleted', 'archived', 'restored',
    'collaborator_added', 'collaborator_removed', 'collaborator_role_changed',
    'invitation_sent', 'invitation_accepted', 'invitation_declined'
  )),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project_activity_log table
CREATE INDEX IF NOT EXISTS idx_project_activity_log_project_id ON project_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_user_id ON project_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_created_at ON project_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_project_activity_log_action ON project_activity_log(action);

-- Create updated_at trigger function for projects table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity_log ENABLE ROW LEVEL SECURITY;