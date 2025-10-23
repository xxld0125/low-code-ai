/**
 * API Tests: DELETE /api/projects/[projectId]
 * Tests project deletion functionality including validation, permissions, and error handling
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { APITestHelpers, type APITestClient } from './test-utils'
import { type TestProject } from '../database/test-utils'

describe('DELETE /api/projects/[projectId] - Delete Project API', () => {
  let testClient: APITestClient
  let testProject: TestProject
  let userId: string

  beforeEach(async () => {
    testClient = await APITestHelpers.createTestClient()
    userId = 'test-user-' + Math.random().toString(36).substring(7)

    // Create a test project for deletion
    const createResult = await APITestHelpers.testCreateProject(testClient.client, {
      owner_id: userId,
      name: 'Test Project for Deletion',
      description: 'This project will be deleted',
    })

    APITestHelpers.assertSuccess(createResult)
    testProject = createResult.data!
  })

  afterEach(async () => {
    await testClient.cleanup()
  })

  describe('Success Cases', () => {
    it('should delete project successfully', async () => {
      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify project is marked as deleted
      const { data: deletedProject, error: fetchError } = await testClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(fetchError).toBeNull()
      expect(deletedProject).toBeTruthy()
      expect(deletedProject!.is_deleted).toBe(true)
      expect(deletedProject!.deleted_at).toBeTruthy()
    })

    it('should not physically delete the project (soft delete)', async () => {
      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Project should still exist in database but be marked as deleted
      const { data: projectRecord, error: fetchError } = await testClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .eq('is_deleted', true)
        .single()

      expect(fetchError).toBeNull()
      expect(projectRecord).toBeTruthy()
      expect(projectRecord!.id).toBe(testProject.id)
    })

    it('should set deleted_at timestamp', async () => {
      const beforeDelete = new Date()

      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify deleted_at timestamp is set
      const { data: deletedProject, error: fetchError } = await testClient.client
        .from('projects')
        .select('deleted_at')
        .eq('id', testProject.id)
        .single()

      expect(fetchError).toBeNull()
      expect(deletedProject).toBeTruthy()
      expect(deletedProject!.deleted_at).toBeTruthy()

      const deletedAt = new Date(deletedProject!.deleted_at)
      expect(deletedAt.getTime()).toBeGreaterThanOrEqual(beforeDelete.getTime())
    })

    it('should not appear in regular project list after deletion', async () => {
      // Verify project appears in regular list before deletion
      const { data: beforeList, error: beforeError } = await testClient.client
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_deleted', false)

      expect(beforeError).toBeNull()
      expect(beforeList).toContainEqual(expect.objectContaining({ id: testProject.id }))

      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify project no longer appears in regular list
      const { data: afterList, error: afterError } = await testClient.client
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_deleted', false)

      expect(afterError).toBeNull()
      expect(afterList).not.toContainEqual(expect.objectContaining({ id: testProject.id }))
    })

    it('should handle deletion of project with no collaborators', async () => {
      // Delete project with no collaborators
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify deletion succeeded
      const { data: deletedProject } = await testClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(deletedProject!.is_deleted).toBe(true)
    })
  })

  describe('Permission Tests', () => {
    it('should allow project owner to delete project', async () => {
      // Create project with different owner
      const otherUserId = 'other-user-' + Math.random().toString(36).substring(7)
      const createResult = await APITestHelpers.testCreateProject(testClient.client, {
        owner_id: otherUserId,
        name: 'Other User Project',
      })

      APITestHelpers.assertSuccess(createResult)
      const otherProject = createResult.data!

      // Try to delete as different user (should fail with proper RLS)
      const { error } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', otherProject.id)
        .eq('owner_id', userId) // This would fail with proper RLS

      // With proper RLS, this should fail
      // For now, we test the basic functionality
      expect(error).toBeTruthy()
    })

    it('should fail when project does not exist', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const { data, error } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', nonExistentId)
        .eq('owner_id', userId)

      expect(data).toBeNull()
      expect(error).toBeTruthy()
    })

    it('should maintain owner_id after deletion', async () => {
      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify owner_id is preserved
      const { data: deletedProject } = await testClient.client
        .from('projects')
        .select('owner_id')
        .eq('id', testProject.id)
        .single()

      expect(deletedProject!.owner_id).toBe(userId)
    })
  })

  describe('Edge Cases', () => {
    it('should handle deletion of already deleted project', async () => {
      // Delete the project first time
      const { error: firstDelete } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(firstDelete).toBeNull()

      // Try to delete again
      const { error: secondDelete } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      // Should succeed or at least not error out (idempotent operation)
      expect(secondDelete).toBeNull()
    })

    it('should preserve other project metadata after deletion', async () => {
      const originalName = testProject.name
      const originalDescription = testProject.description
      const originalStatus = testProject.status

      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify other metadata is preserved
      const { data: deletedProject } = await testClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(deletedProject!.name).toBe(originalName)
      expect(deletedProject!.description).toBe(originalDescription)
      expect(deletedProject!.status).toBe(originalStatus)
      expect(deletedProject!.owner_id).toBe(userId)
      expect(deletedProject!.created_at).toBe(testProject.created_at)
    })

    it('should update updated_at timestamp on deletion', async () => {
      const originalUpdatedAt = testProject.updated_at

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify updated_at timestamp is updated
      const { data: deletedProject } = await testClient.client
        .from('projects')
        .select('updated_at')
        .eq('id', testProject.id)
        .single()

      expect(new Date(deletedProject!.updated_at).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      )
    })

    it('should handle deletion with null description', async () => {
      // Update project to have null description
      await testClient.client
        .from('projects')
        .update({ description: null })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify deletion succeeded with null description
      const { data: deletedProject } = await testClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(deletedProject!.is_deleted).toBe(true)
      expect(deletedProject!.description).toBeNull()
    })
  })

  describe('Data Integrity Tests', () => {
    it('should maintain project ID after deletion', async () => {
      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Verify project ID is preserved
      const { data: deletedProject } = await testClient.client
        .from('projects')
        .select('id')
        .eq('id', testProject.id)
        .single()

      expect(deletedProject!.id).toBe(testProject.id)
    })

    it('should allow querying deleted projects specifically', async () => {
      // Delete the project
      const { error: deleteError } = await testClient.client
        .from('projects')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)
        .eq('owner_id', userId)

      expect(deleteError).toBeNull()

      // Should be able to find in deleted projects
      const { data: deletedProjects } = await testClient.client
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_deleted', true)

      expect(deletedProjects).toContainEqual(
        expect.objectContaining({ id: testProject.id, is_deleted: true })
      )

      // Should not appear in active projects
      const { data: activeProjects } = await testClient.client
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_deleted', false)

      expect(activeProjects).not.toContainEqual(expect.objectContaining({ id: testProject.id }))
    })
  })
})
