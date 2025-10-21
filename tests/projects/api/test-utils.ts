import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import {
  ProjectDataFactory,
  TestProject,
  TestCollaborator,
  TestInvitation,
} from '../database/test-utils'

// Test database configuration
const testDbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const testDbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface APITestClient {
  client: SupabaseClient
  cleanup: () => Promise<void>
}

export interface APIResponse<T = unknown> {
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
  status?: number
}

/**
 * API test helper functions for testing project management endpoints
 */
export class APITestHelpers {
  /**
   * Create a test Supabase client for API testing
   */
  static async createTestClient(): Promise<APITestClient> {
    const testClient = createClient(testDbUrl, testDbKey, {
      db: {
        schema: 'public',
      },
    })

    const cleanup = async () => {
      // Clean up test data in proper order
      await testClient.from('project_activity_log').delete().neq('id', -1)
      await testClient.from('project_collaborators').delete().neq('id', -1)
      await testClient.from('project_invitations').delete().neq('id', -1)
      await testClient.from('projects').delete().neq('id', -1)
    }

    return { client: testClient, cleanup }
  }

  /**
   * Simulate an authenticated API request
   */
  static createAuthenticatedRequest(
    userId: string,
    method: string = 'GET',
    body?: Record<string, unknown>,
    headers: Record<string, string> = {}
  ): NextRequest {
    const request = new NextRequest('http://localhost:3000/api/test', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.generateMockJWT(userId)}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    return request
  }

  /**
   * Generate a mock JWT token for testing
   */
  private static generateMockJWT(userId: string): string {
    // In real tests, you would use a proper JWT library
    // For now, return a mock token that represents the user ID
    return `mock_token_${userId}`
  }

  /**
   * Test project creation via API
   */
  static async testCreateProject(
    client: SupabaseClient,
    projectData: Partial<TestProject> = {}
  ): Promise<APIResponse<TestProject>> {
    const testProject = ProjectDataFactory.createProject(projectData)

    const { data, error } = await client
      .from('projects')
      .insert({
        name: testProject.name,
        description: testProject.description,
        owner_id: testProject.owner_id,
      })
      .select()
      .single()

    return {
      data: data || undefined,
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        : undefined,
    }
  }

  /**
   * Test fetching projects via API
   */
  static async testGetProjects(
    client: SupabaseClient,
    userId: string
  ): Promise<APIResponse<TestProject[]>> {
    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .eq('is_deleted', false)

    return {
      data: data || [],
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        : undefined,
    }
  }

  /**
   * Test updating a project via API
   */
  static async testUpdateProject(
    client: SupabaseClient,
    projectId: string,
    updateData: Partial<TestProject>
  ): Promise<APIResponse<TestProject>> {
    const { data, error } = await client
      .from('projects')
      .update({
        name: updateData.name,
        description: updateData.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single()

    return {
      data: data || undefined,
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        : undefined,
    }
  }

  /**
   * Test deleting a project via API
   */
  static async testDeleteProject(
    client: SupabaseClient,
    projectId: string
  ): Promise<APIResponse<void>> {
    const { error } = await client
      .from('projects')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', projectId)

    return {
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        : undefined,
    }
  }

  /**
   * Test inviting a collaborator via API
   */
  static async testInviteCollaborator(
    client: SupabaseClient,
    projectId: string,
    email: string,
    role: 'editor' | 'viewer' = 'editor'
  ): Promise<APIResponse<TestInvitation>> {
    const invitationData = ProjectDataFactory.createInvitation({
      project_id: projectId,
      invited_email: email,
      role,
    })

    const { data, error } = await client
      .from('project_invitations')
      .insert({
        project_id: projectId,
        invited_by: invitationData.invited_by,
        invited_email: email,
        role,
        token: invitationData.token,
        expires_at: invitationData.expires_at.toISOString(),
      })
      .select()
      .single()

    return {
      data: data || undefined,
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        : undefined,
    }
  }

  /**
   * Test getting project collaborators via API
   */
  static async testGetCollaborators(
    client: SupabaseClient,
    projectId: string
  ): Promise<APIResponse<TestCollaborator[]>> {
    const { data, error } = await client
      .from('project_collaborators')
      .select('*')
      .eq('project_id', projectId)
      .eq('joined_at', null) // Only pending invitations

    return {
      data: data || [],
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        : undefined,
    }
  }

  /**
   * Test removing a collaborator via API
   */
  static async testRemoveCollaborator(
    client: SupabaseClient,
    projectId: string,
    userId: string
  ): Promise<APIResponse<void>> {
    const { error } = await client
      .from('project_collaborators')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)

    return {
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
          }
        : undefined,
    }
  }

  /**
   * Assert API response is successful
   */
  static assertSuccess<T>(response: APIResponse<T>): asserts response is { data: T } {
    if (response.error) {
      throw new Error(`API call failed: ${response.error.message}`)
    }
    if (response.data === undefined) {
      throw new Error('API call returned no data')
    }
  }

  /**
   * Assert API response has specific error
   */
  static assertError(response: APIResponse, expectedMessage?: string, expectedCode?: string): void {
    if (!response.error) {
      throw new Error('Expected API call to fail, but it succeeded')
    }
    if (expectedMessage && !response.error.message.includes(expectedMessage)) {
      throw new Error(
        `Expected error message to contain "${expectedMessage}", got "${response.error.message}"`
      )
    }
    if (expectedCode && response.error.code !== expectedCode) {
      throw new Error(`Expected error code "${expectedCode}", got "${response.error.code}"`)
    }
  }
}
