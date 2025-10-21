import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'

// Test database configuration
const testDbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const testDbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface TestProject {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: Date
  updated_at: Date
  is_deleted: boolean
  settings: Record<string, unknown>
  status: 'active' | 'archived' | 'suspended'
}

export interface TestCollaborator {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  invited_at: Date
  joined_at?: Date
  last_accessed_at?: Date
}

export interface TestInvitation {
  id: string
  project_id: string
  invited_by: string
  invited_email: string
  role: 'editor' | 'viewer'
  token: string
  expires_at: Date
  accepted_at?: Date
  declined_at?: Date
  created_at: Date
}

/**
 * Test data factory for creating project-related test data
 */
export class ProjectDataFactory {
  static createProject(overrides: Partial<TestProject> = {}): TestProject {
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      owner_id: faker.string.uuid(),
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      is_deleted: false,
      settings: {},
      status: 'active',
      ...overrides,
    }
  }

  static createCollaborator(overrides: Partial<TestCollaborator> = {}): TestCollaborator {
    return {
      id: faker.string.uuid(),
      project_id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      role: 'editor',
      invited_at: faker.date.recent(),
      joined_at: faker.date.recent(),
      last_accessed_at: faker.date.recent(),
      ...overrides,
    }
  }

  static createInvitation(overrides: Partial<TestInvitation> = {}): TestInvitation {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now

    return {
      id: faker.string.uuid(),
      project_id: faker.string.uuid(),
      invited_by: faker.string.uuid(),
      invited_email: faker.internet.email(),
      role: 'editor',
      token: faker.string.alphanumeric(32),
      expires_at: expiresAt,
      created_at: now,
      ...overrides,
    }
  }

  static createProjectsList(count: number): TestProject[] {
    return Array.from({ length: count }, () => this.createProject())
  }

  static createCollaboratorsList(count: number, projectId: string): TestCollaborator[] {
    return Array.from({ length: count }, () => this.createCollaborator({ project_id: projectId }))
  }
}

/**
 * Setup test database with isolated test environment
 */
export async function setupTestDatabase() {
  const testClient = createClient(testDbUrl, testDbKey, {
    db: {
      schema: 'public',
    },
  })

  const cleanup = async () => {
    // Clean up test data in proper order to respect foreign key constraints
    await testClient.from('project_activity_log').delete().neq('id', -1)
    await testClient.from('project_collaborators').delete().neq('id', -1)
    await testClient.from('project_invitations').delete().neq('id', -1)
    await testClient.from('projects').delete().neq('id', -1)
  }

  return {
    client: testClient,
    cleanup,
    dataFactory: ProjectDataFactory,
  }
}

/**
 * Database test helper functions
 */
export class DatabaseTestHelpers {
  static async createTestProject(
    client: SupabaseClient,
    overrides: Partial<TestProject> = {}
  ): Promise<TestProject> {
    const projectData = ProjectDataFactory.createProject(overrides)

    const { data, error } = await client.from('projects').insert(projectData).select().single()

    if (error) {
      throw new Error(`Failed to create test project: ${error.message}`)
    }

    return data
  }

  static async createTestCollaborator(
    client: SupabaseClient,
    projectId: string,
    overrides: Partial<TestCollaborator> = {}
  ): Promise<TestCollaborator> {
    const collaboratorData = ProjectDataFactory.createCollaborator({
      project_id: projectId,
      ...overrides,
    })

    const { data, error } = await client
      .from('project_collaborators')
      .insert(collaboratorData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create test collaborator: ${error.message}`)
    }

    return data
  }

  static async createTestInvitation(
    client: SupabaseClient,
    projectId: string,
    overrides: Partial<TestInvitation> = {}
  ): Promise<TestInvitation> {
    const invitationData = ProjectDataFactory.createInvitation({
      project_id: projectId,
      ...overrides,
    })

    const { data, error } = await client
      .from('project_invitations')
      .insert(invitationData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create test invitation: ${error.message}`)
    }

    return data
  }

  static async assertProjectExists(client: SupabaseClient, projectId: string): Promise<boolean> {
    const { data, error } = await client.from('projects').select('id').eq('id', projectId).single()

    return !error && !!data
  }

  static async assertCollaboratorExists(
    client: SupabaseClient,
    projectId: string,
    userId: string
  ): Promise<boolean> {
    const { data, error } = await client
      .from('project_collaborators')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    return !error && !!data
  }

  static async assertInvitationExists(client: SupabaseClient, token: string): Promise<boolean> {
    const { data, error } = await client
      .from('project_invitations')
      .select('id')
      .eq('token', token)
      .single()

    return !error && !!data
  }
}
