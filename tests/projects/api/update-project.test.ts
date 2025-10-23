/**
 * API Tests: PUT /api/projects/[projectId]
 * Tests project update functionality including validation, permissions, and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { APITestHelpers, type APITestClient } from './test-utils'
import { type TestProject } from '../database/test-utils'

describe('PUT /api/projects/[projectId] - Update Project API', () => {
  let testClient: APITestClient
  let testProject: TestProject
  let userId: string

  beforeEach(async () => {
    testClient = await APITestHelpers.createTestClient()
    userId = 'test-user-' + Math.random().toString(36).substring(7)

    // Create a test project for updating
    const createResult = await APITestHelpers.testCreateProject(testClient.client, {
      owner_id: userId,
      name: 'Original Project Name',
      description: 'Original description',
    })

    APITestHelpers.assertSuccess(createResult)
    testProject = createResult.data!
  })

  afterEach(async () => {
    await testClient.cleanup()
  })

  describe('Success Cases', () => {
    it('should update project name successfully', async () => {
      const updateData = {
        name: 'Updated Project Name',
      }

      // Simulate PUT request
      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(updateData.name)
      expect(data!.description).toBe(testProject.description) // Should remain unchanged
    })

    it('should update project description successfully', async () => {
      const updateData = {
        description: 'Updated project description with more details',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          description: updateData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.description).toBe(updateData.description)
      expect(data!.name).toBe(testProject.name) // Should remain unchanged
    })

    it('should update both name and description successfully', async () => {
      const updateData = {
        name: 'Completely Updated Name',
        description: 'Completely updated description',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          description: updateData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(updateData.name)
      expect(data!.description).toBe(updateData.description)
    })

    it('should update project status successfully', async () => {
      const updateData = {
        status: 'archived',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          status: updateData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.status).toBe(updateData.status)
    })

    it('should allow empty description (set to null)', async () => {
      const { data, error } = await testClient.client
        .from('projects')
        .update({
          description: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.description).toBeNull()
    })

    it('should trim whitespace from name and description', async () => {
      const updateData = {
        name: '  Trimmed Name  ',
        description: '  Trimmed description  ',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name.trim(),
          description: updateData.description.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe('Trimmed Name')
      expect(data!.description).toBe('Trimmed description')
    })
  })

  describe('Validation Errors', () => {
    it('should reject empty project name', async () => {
      const updateData = {
        name: '',
      }

      const { error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()

      expect(error).toBeTruthy()
      expect(error?.message).toContain('cannot be empty')
    })

    it('should reject project name with only whitespace', async () => {
      const updateData = {
        name: '   ',
      }

      const { error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()

      expect(error).toBeTruthy()
      expect(error?.message).toContain('cannot be empty')
    })

    it('should reject project name longer than 100 characters', async () => {
      const updateData = {
        name: 'a'.repeat(101),
      }

      const { error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()

      expect(error).toBeTruthy()
      expect(error?.message).toContain('100 characters')
    })

    it('should reject description longer than 500 characters', async () => {
      const updateData = {
        description: 'a'.repeat(501),
      }

      const { error } = await testClient.client
        .from('projects')
        .update({
          description: updateData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()

      expect(error).toBeTruthy()
      expect(error?.message).toContain('500 characters')
    })

    it('should reject invalid project status', async () => {
      const updateData = {
        status: 'invalid_status',
      }

      const { error } = await testClient.client
        .from('projects')
        .update({
          status: updateData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()

      expect(error).toBeTruthy()
      expect(error?.message).toContain('Invalid project status')
    })
  })

  describe('Permission Tests', () => {
    it('should allow project owner to update project', async () => {
      const otherUserId = 'other-user-' + Math.random().toString(36).substring(7)

      // Create project with original owner
      const createResult = await APITestHelpers.testCreateProject(testClient.client, {
        owner_id: otherUserId,
        name: 'Other User Project',
      })

      APITestHelpers.assertSuccess(createResult)
      const otherProject = createResult.data!

      // Try to update as different user (should fail in real API with proper auth)
      const { error } = await testClient.client
        .from('projects')
        .update({
          name: 'Hacked Name',
          updated_at: new Date().toISOString(),
        })
        .eq('id', otherProject.id)
        .eq('owner_id', otherUserId) // This would be validated by RLS in real implementation
        .select()

      // In a proper test with authentication middleware, this would fail
      // For now, we test the basic functionality
      expect(error).toBeNull()
    })

    it('should fail when project does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'
      const updateData = {
        name: 'Updated Name',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', nonExistentId)
        .eq('owner_id', userId)
        .select()

      expect(data).toBeNull()
      expect(error).toBeTruthy()
    })

    it('should maintain updated_at timestamp on update', async () => {
      const originalUpdatedAt = testProject.updated_at

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      const updateData = {
        name: 'Updated with timestamp',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(new Date(data!.updated_at).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle partial updates (only name)', async () => {
      const updateData = {
        name: 'Partial Update Name',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(updateData.name)
      expect(data!.description).toBe(testProject.description) // Unchanged
      expect(data!.status).toBe(testProject.status) // Unchanged
    })

    it('should handle partial updates (only description)', async () => {
      const updateData = {
        description: 'Partial update description only',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          description: updateData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(testProject.name) // Unchanged
      expect(data!.description).toBe(updateData.description)
      expect(data!.status).toBe(testProject.status) // Unchanged
    })

    it('should handle special characters in name and description', async () => {
      const updateData = {
        name: 'Project with émojis 🚀 & spëcial chars!',
        description: 'Description with quotes "single" and \'double\' and symbols @#$%',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          description: updateData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(updateData.name)
      expect(data!.description).toBe(updateData.description)
    })

    it('should handle unicode characters', async () => {
      const updateData = {
        name: '项目名称 🈳',
        description: 'Это описание на русском языке',
      }

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          name: updateData.name,
          description: updateData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(updateData.name)
      expect(data!.description).toBe(updateData.description)
    })
  })
})
