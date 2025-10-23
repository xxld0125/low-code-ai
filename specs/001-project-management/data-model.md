# Data Model: Project Management Feature

**Feature**: Project Management for Low-Code Platform
**Database**: Supabase PostgreSQL
**Auth System**: Supabase Auth
**Date**: 2025-01-21

## Overview

This data model defines the entities and relationships required for the project management feature, enabling users to create, manage, and collaborate on low-code development projects with proper access control and invitation workflows.

## Core Entities

### 1. Project

The central entity representing a low-code development project.

```sql
CREATE TABLE projects (
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

-- Indexes for performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_is_deleted ON projects(is_deleted);
```

**Fields**:

- `id`: Unique project identifier (UUID)
- `name`: Project name (1-100 characters, required)
- `description`: Optional project description (max 500 characters)
- `owner_id`: Reference to the project owner (auth.users)
- `created_at`: Project creation timestamp
- `updated_at`: Last modification timestamp
- `is_deleted`: Soft delete flag for project recovery
- `settings`: JSONB field for project-specific settings
- `status`: Project status (active, archived, suspended)

**Validation Rules**:

- Project names must be unique within a user's workspace
- Names must be between 1-100 characters
- Descriptions limited to 500 characters
- Only authenticated users can create projects

### 2. Project Collaborators

Many-to-many relationship between users and projects defining access levels.

```sql
CREATE TABLE project_collaborators (
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

-- Indexes
CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX idx_project_collaborators_role ON project_collaborators(role);
```

**Fields**:

- `id`: Unique collaboration record identifier
- `project_id`: Reference to the project
- `user_id`: Reference to the collaborating user
- `role`: Access level (owner, editor, viewer)
- `invited_at`: When the user was invited
- `joined_at`: When the user accepted the invitation
- `last_accessed_at`: Last time the user accessed the project

**Role Permissions**:

- **owner**: Full control (create, read, update, delete, manage collaborators)
- **editor**: Can edit project content, invite viewers
- **viewer**: Read-only access to project content

**Validation Rules**:

- A user can only have one role per project
- Project owners automatically have owner role
- Users cannot collaborate on their own projects through this table

### 3. Project Invitations

Pending invitations for users to join projects.

```sql
CREATE TABLE project_invitations (
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

-- Indexes
CREATE INDEX idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX idx_project_invitations_token ON project_invitations(token);
CREATE INDEX idx_project_invitations_email ON project_invitations(invited_email);
CREATE INDEX idx_project_invitations_expires_at ON project_invitations(expires_at);
```

**Fields**:

- `id`: Unique invitation identifier
- `project_id`: Reference to the project
- `invited_by`: User who sent the invitation
- `invited_email`: Email address of the invited user
- `role\*\*: Role the user will have if they accept
- `token`: Unique token for invitation acceptance
- `expires_at`: When the invitation expires
- `accepted_at`: When the invitation was accepted
- `declined_at`: When the invitation was declined
- `created_at`: When the invitation was created

**Validation Rules**:

- Invitation tokens must be unique
- Invitations expire after 7 days
- Email format must be valid
- Cannot invite someone who is already a collaborator
- Cannot invite the project owner

### 4. Project Activity Log

Audit trail for project activities.

```sql
CREATE TABLE project_activity_log (
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

-- Indexes
CREATE INDEX idx_project_activity_log_project_id ON project_activity_log(project_id);
CREATE INDEX idx_project_activity_log_user_id ON project_activity_log(user_id);
CREATE INDEX idx_project_activity_log_created_at ON project_activity_log(created_at);
```

**Fields**:

- `id`: Unique activity log identifier
- `project_id`: Reference to the project
- `user_id`: User who performed the action
- `action`: Type of activity performed
- `details`: Additional context about the activity
- `created_at`: When the activity occurred

## Row Level Security (RLS) Policies

### Projects RLS

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

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
```

### Project Collaborators RLS

```sql
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

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
```

### Project Invitations RLS

```sql
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations for projects they own
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
```

## Database Functions

### Get User Projects Function

```sql
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
```

### Create Project Function

```sql
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
```

### Invite Collaborator Function

```sql
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
BEGIN
  -- Check if user is project owner
  IF NOT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND owner_id = p_invited_by
  ) THEN
    RAISE EXCEPTION 'Only project owners can invite collaborators';
  END IF;

  -- Check if user is already a collaborator
  IF EXISTS (
    SELECT 1 FROM project_collaborators pc
    JOIN auth.users u ON pc.user_id = u.id
    WHERE pc.project_id = p_project_id AND u.email = p_invited_email
  ) THEN
    RAISE EXCEPTION 'User is already a collaborator on this project';
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
```

## Data Validation and Constraints

### Business Logic Validation

1. **Project Name Uniqueness**: Each user can only have one project with a given name
2. **Role Hierarchy**: Only owners can manage collaborators and change permissions
3. **Invitation Limits**: Invitations expire after 7 days and cannot be sent to existing collaborators
4. **Soft Deletes**: Projects are marked as deleted rather than physically removed
5. **Audit Trail**: All significant actions are logged for accountability

### Performance Considerations

1. **Indexing Strategy**: Proper indexes on foreign keys and frequently queried columns
2. **Query Optimization**: Functions use SECURITY DEFINER for controlled access
3. **Pagination**: Built-in pagination for large project lists
4. **Caching Strategy**: Consider Redis caching for frequently accessed project metadata

## Migration Strategy

### Initial Migration

```sql
-- Migration file: 001_create_projects_schema.sql

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
-- (Table creation statements from above)

-- Create functions
-- (Function creation statements from above)

-- Enable RLS
-- (RLS policy creation statements from above)

-- Insert initial data if needed
```

### Data Seeding

```sql
-- Example: Create default project settings template
INSERT INTO projects (name, description, owner_id, settings)
SELECT
  'Sample Project',
  'A sample project to help you get started',
  id,
  '{"theme": "default", "version": "1.0.0"}'::jsonb
FROM auth.users
LIMIT 1; -- Only for the first user during development
```

## Database Testing Considerations

### API Test Data Factories

```typescript
// Test factory for API testing with database
export class ProjectDataFactory {
  static createForAPI(overrides: Partial<Project> = {}): Project {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      owner_id: faker.string.uuid(),
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
      settings: {},
      status: 'active',
      ...overrides,
    }
  }

  static createCollaboratorForAPI(overrides: Partial<Collaborator> = {}): Collaborator {
    return {
      id: faker.string.uuid(),
      project_id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      role: 'editor',
      invited_at: new Date(),
      joined_at: new Date(),
      ...overrides,
    }
  }
}
```

### API Database Test Setup

```typescript
// API testing database setup
export async function setupAPITestDatabase(): Promise<APITestDatabase> {
  const testClient = createClient(testDbUrl, testDbKey)

  const cleanup = async () => {
    // Clean up test data in proper order to respect foreign key constraints
    await testClient.from('project_activity_log').delete().neq('id', -1)
    await testClient.from('project_collaborators').delete().neq('id', -1)
    await testClient.from('project_invitations').delete().neq('id', -1)
    await testClient.from('projects').delete().neq('id', -1)
  }

  return { client: testClient, cleanup }
}
```

### API Test Scenarios

```typescript
// API endpoint test scenarios
export class APITestScenarios {
  static async testProjectCreationAPI(testClient: SupabaseClient): Promise<void> {
    const testProject = ProjectDataFactory.createForAPI()

    // Test API project creation
    const result = await testClient.from('projects').insert(testProject).select().single()

    // Validate API response
    if (result.error) {
      throw new Error(`API project creation failed: ${result.error.message}`)
    }

    // Validate database state
    expect(result.data.name).toBe(testProject.name)
    expect(result.data.owner_id).toBe(testProject.owner_id)
  }

  static async testCollaboratorAPI(testClient: SupabaseClient): Promise<void> {
    const testProject = await this.createTestProject(testClient)
    const testCollaborator = ProjectDataFactory.createCollaboratorForAPI({
      project_id: testProject.id,
    })

    // Test API collaborator addition
    const result = await testClient
      .from('project_collaborators')
      .insert(testCollaborator)
      .select()
      .single()

    // Validate API response and database constraints
    expect(result.data.project_id).toBe(testProject.id)
    expect(result.data.role).toBe(testCollaborator.role)
  }
}
```

This data model provides a robust foundation for the project management feature with proper security, scalability, and maintainability considerations.
