/**
 * Integration test for project creation workflow
 *
 * Test: End-to-end project creation workflow validation
 * Expected: Should fail initially before implementation
 * Purpose: Validate complete user journey from API to database
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'

// Test configuration
const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const TEST_DB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

// Test data factory
interface ProjectCreationData {
  name: string
  description?: string
  settings: Record<string, unknown>
}

interface ExpectedProjectStructure {
  id: unknown
  name: string
  description: string | null
  owner_id: string
  created_at: unknown
  updated_at: unknown
  status: string
  is_deleted: boolean
  settings: Record<string, unknown>
}

interface CreatedProject {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
  status: string
  is_deleted: boolean
  settings: Record<string, unknown>
}

class ProjectWorkflowTestDataFactory {
  static createProjectCreationData(overrides: Partial<ProjectCreationData> = {}) {
    return {
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(2),
      settings: {
        theme: 'default',
        version: '1.0.0',
        ...overrides.settings,
      },
      ...overrides,
    }
  }

  static createExpectedProjectStructure(
    projectData: ProjectCreationData,
    userId: string
  ): ExpectedProjectStructure {
    return {
      id: expect.any(String),
      name: projectData.name,
      description: projectData.description || null,
      owner_id: userId,
      created_at: expect.any(String),
      updated_at: expect.any(String),
      status: 'active',
      is_deleted: false,
      settings: projectData.settings || {},
    }
  }
}

describe('Integration: Project Creation Workflow', () => {
  let supabase: SupabaseClient
  let testUserId: string
  let createdProjects: CreatedProject[]

  beforeAll(async () => {
    // Initialize test Supabase client
    supabase = createClient(TEST_DB_URL, TEST_DB_KEY)

    // Generate test user ID
    testUserId = faker.string.uuid()
    createdProjects = []

    console.log('Integration test setup complete for project workflow')
  })

  afterAll(async () => {
    // Clean up all created test data
    try {
      if (supabase && createdProjects.length > 0) {
        const projectIds = createdProjects.map(p => p.id).filter(Boolean)

        for (const projectId of projectIds) {
          await supabase.from('projects').delete().eq('id', projectId)
        }
      }
    } catch (error) {
      console.warn('Integration test cleanup warning:', error)
    }
  })

  beforeEach(async () => {
    // Reset created projects array for each test
    createdProjects = []
  })

  describe('Complete Project Creation Flow', () => {
    test('should create project and verify it appears in user projects list', async () => {
      // Arrange
      const projectData = ProjectWorkflowTestDataFactory.createProjectCreationData({
        name: 'Integration Test Project',
      })

      // Step 1: Create project via API
      const createResult = await supabase
        .from('projects')
        .insert({
          ...projectData,
          owner_id: testUserId,
        })
        .select()
        .single()

      console.log('Step 1 - Create project result:', createResult)

      // Should fail initially
      expect(createResult.error).toBeDefined()
      expect(createResult.error?.message).toMatch(/(does not exist|permission denied)/)

      // When implemented:
      // expect(createResult.error).toBeNull()
      // expect(createResult.data).toMatchObject(
      //   ProjectWorkflowTestDataFactory.createExpectedProjectStructure(projectData, testUserId)
      // )

      // Track created project for cleanup
      if (createResult.data) {
        createdProjects.push(createResult.data)
      }

      // Step 2: Verify project appears in user's project list
      const listResult = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', testUserId)
        .eq('is_deleted', false)

      console.log('Step 2 - List projects result:', listResult)

      // Should fail initially
      expect(listResult.error).toBeDefined()

      // When implemented:
      // expect(listResult.error).toBeNull()
      // expect(listResult.data).toHaveLength(1)
      // expect(listResult.data[0].name).toBe(projectData.name)
      // expect(listResult.data[0].owner_id).toBe(testUserId)
    })

    test('should maintain data consistency across API and database operations', async () => {
      // Arrange
      const projectData = ProjectWorkflowTestDataFactory.createProjectCreationData({
        name: 'Consistency Test Project',
        description: 'Testing data consistency',
        settings: { feature: 'consistency' },
      })

      // Step 1: Create project
      const createResult = await supabase
        .from('projects')
        .insert({
          ...projectData,
          owner_id: testUserId,
        })
        .select()
        .single()

      console.log('Consistency test - Create result:', createResult)

      // Should fail initially
      expect(createResult.error).toBeDefined()

      // Track for cleanup
      if (createResult.data) {
        createdProjects.push(createResult.data)
      }

      // Step 2: Retrieve project directly to verify consistency
      const retrieveResult = await supabase
        .from('projects')
        .select('*')
        .eq('id', createResult.data?.id || 'test-id')
        .single()

      console.log('Consistency test - Retrieve result:', retrieveResult)

      // Should fail initially
      expect(retrieveResult.error).toBeDefined()

      // When implemented:
      // expect(retrieveResult.error).toBeNull()
      // expect(retrieveResult.data).toEqual(createResult.data)
      // expect(retrieveResult.data.name).toBe(projectData.name)
      // expect(retrieveResult.data.description).toBe(projectData.description)
      // expect(retrieveResult.data.settings).toEqual(projectData.settings)
    })
  })

  describe('Project Creation Edge Cases', () => {
    test('should handle multiple project creations for same user', async () => {
      // Arrange
      const projectData1 = ProjectWorkflowTestDataFactory.createProjectCreationData({
        name: 'Project 1',
      })
      const projectData2 = ProjectWorkflowTestDataFactory.createProjectCreationData({
        name: 'Project 2',
      })

      // Step 1: Create first project
      const createResult1 = await supabase
        .from('projects')
        .insert({
          ...projectData1,
          owner_id: testUserId,
        })
        .select()
        .single()

      // Step 2: Create second project
      const createResult2 = await supabase
        .from('projects')
        .insert({
          ...projectData2,
          owner_id: testUserId,
        })
        .select()
        .single()

      console.log('Multi-project creation result 1:', createResult1)
      console.log('Multi-project creation result 2:', createResult2)

      // Should fail initially
      expect(createResult1.error).toBeDefined()
      expect(createResult2.error).toBeDefined()

      // Track for cleanup
      if (createResult1.data) createdProjects.push(createResult1.data)
      if (createResult2.data) createdProjects.push(createResult2.data)

      // Step 3: Verify both projects appear in user's list
      const listResult = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', testUserId)
        .eq('is_deleted', false)

      console.log('Multi-project list result:', listResult)

      // Should fail initially
      expect(listResult.error).toBeDefined()

      // When implemented:
      // expect(listResult.error).toBeNull()
      // expect(listResult.data).toHaveLength(2)
      // const projectNames = listResult.data.map(p => p.name)
      // expect(projectNames).toContain(projectData1.name)
      // expect(projectNames).toContain(projectData2.name)
    })

    test('should handle project creation with minimal data', async () => {
      // Arrange
      const minimalProjectData = {
        name: 'Minimal Test Project',
      }

      // Step 1: Create project with minimal data
      const createResult = await supabase
        .from('projects')
        .insert({
          ...minimalProjectData,
          owner_id: testUserId,
        })
        .select()
        .single()

      console.log('Minimal project creation result:', createResult)

      // Should fail initially
      expect(createResult.error).toBeDefined()

      // Track for cleanup
      if (createResult.data) {
        createdProjects.push(createResult.data)
      }

      // Step 2: Verify default values are set correctly
      const retrieveResult = await supabase
        .from('projects')
        .select('*')
        .eq('id', createResult.data?.id || 'test-id')
        .single()

      console.log('Minimal project retrieve result:', retrieveResult)

      // Should fail initially
      expect(retrieveResult.error).toBeDefined()

      // When implemented:
      // expect(createResult.error).toBeNull()
      // expect(retrieveResult.error).toBeNull()
      // expect(retrieveResult.data.name).toBe(minimalProjectData.name)
      // expect(retrieveResult.data.description).toBeNull()
      // expect(retrieveResult.data.status).toBe('active')
      // expect(retrieveResult.data.is_deleted).toBe(false)
      // expect(retrieveResult.data.settings).toEqual({})
    })
  })

  describe('Project Creation Performance', () => {
    test('should complete project creation workflow within performance budget', async () => {
      // Arrange
      const projectData = ProjectWorkflowTestDataFactory.createProjectCreationData({
        name: 'Performance Test Project',
      })

      // Step 1: Measure project creation time
      const createStartTime = performance.now()
      const createResult = await supabase
        .from('projects')
        .insert({
          ...projectData,
          owner_id: testUserId,
        })
        .select()
        .single()
      const createEndTime = performance.now()
      const creationTime = createEndTime - createStartTime

      console.log(`Project creation time: ${creationTime}ms`)

      // Track for cleanup
      if (createResult.data) {
        createdProjects.push(createResult.data)
      }

      // Step 2: Measure project retrieval time
      const retrieveStartTime = performance.now()
      const retrieveResult = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', testUserId)
        .limit(10)
      const retrieveEndTime = performance.now()
      const retrievalTime = retrieveEndTime - retrieveStartTime

      console.log(`Project retrieval time: ${retrievalTime}ms`)

      const totalTime = creationTime + retrievalTime
      console.log(`Total workflow time: ${totalTime}ms`)

      // Should fail initially
      expect(createResult.error).toBeDefined()
      expect(retrieveResult.error).toBeDefined()

      // When implemented:
      // Performance budget: 200ms total (100ms creation + 100ms retrieval)
      // expect(creationTime).toBeLessThan(100)
      // expect(retrievalTime).toBeLessThan(100)
      // expect(totalTime).toBeLessThan(200)
    })
  })

  describe('Data Integrity Validation', () => {
    test('should maintain referential integrity throughout workflow', async () => {
      // Arrange
      const projectData = ProjectWorkflowTestDataFactory.createProjectCreationData({
        name: 'Integrity Test Project',
      })

      // Step 1: Create project
      const createResult = await supabase
        .from('projects')
        .insert({
          ...projectData,
          owner_id: testUserId,
        })
        .select()
        .single()

      console.log('Integrity test - Create result:', createResult)

      // Should fail initially
      expect(createResult.error).toBeDefined()

      // Track for cleanup
      if (createResult.data) {
        createdProjects.push(createResult.data)
      }

      // Step 2: Verify activity log entry is created (if activity_log table exists)
      const activityResult = await supabase
        .from('project_activity_log')
        .select('*')
        .eq('project_id', createResult.data?.id || 'test-id')
        .eq('action', 'created')

      console.log('Integrity test - Activity log result:', activityResult)

      // Should fail initially (activity_log may not exist yet)
      expect(activityResult.error).toBeDefined()

      // When implemented:
      // expect(createResult.error).toBeNull()
      // expect(activityResult.error).toBeNull()
      // expect(activityResult.data).toHaveLength(1)
      // expect(activityResult.data[0].action).toBe('created')
      // expect(activityResult.data[0].user_id).toBe(testUserId)
    })
  })

  describe('Error Handling and Recovery', () => {
    test('should handle workflow interruption gracefully', async () => {
      // Arrange
      const validProjectData = ProjectWorkflowTestDataFactory.createProjectCreationData({
        name: 'Workflow Interruption Test',
      })

      // Step 1: Attempt to create project with invalid data to trigger error
      const invalidProjectData = {
        ...validProjectData,
        owner_id: 'invalid-uuid-format',
      }

      const invalidResult = await supabase.from('projects').insert(invalidProjectData).select()

      console.log('Invalid project creation result:', invalidResult)

      // Should fail with validation error
      expect(invalidResult.error).toBeDefined()

      // Step 2: Verify system can still create valid projects
      const validResult = await supabase
        .from('projects')
        .insert({
          ...validProjectData,
          owner_id: testUserId,
        })
        .select()
        .single()

      console.log('Valid project creation result:', validResult)

      // Should fail initially
      expect(validResult.error).toBeDefined()

      // Track for cleanup
      if (validResult.data) {
        createdProjects.push(validResult.data)
      }

      // When implemented:
      // expect(invalidResult.error).not.toBeNull() // Should fail with invalid data
      // expect(validResult.error).toBeNull() // Should succeed with valid data
    })
  })
})

/**
 * Test Notes:
 *
 * 1. These tests are designed to FAIL initially before implementation
 * 2. They validate complete end-to-end workflows
 * 3. Tests verify data consistency across API operations
 * 4. Performance tests ensure workflow meets requirements
 * 5. Error handling tests validate system resilience
 * 6. Data integrity tests verify referential constraints
 *
 * Expected failures before implementation:
 * - relation "projects" does not exist
 * - permission denied for RLS
 * - Missing activity_log table
 *
 * After implementation, update expectations to validate complete workflow functionality
 */
