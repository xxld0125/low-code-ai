/**
 * Database Tests: Project Ownership Permissions
 * Tests database-level permissions and Row Level Security (RLS) policies for project operations
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { DatabaseTestHelpers, type TestDatabaseClient } from './test-utils'
import { type TestProject, type TestUser } from './test-utils'

describe('Database: Project Ownership Permissions', () => {
  let dbClient: TestDatabaseClient
  let owner: TestUser
  let editor: TestUser
  let viewer: TestUser
  let outsider: TestUser
  let testProject: TestProject

  beforeEach(async () => {
    dbClient = await DatabaseTestHelpers.createTestClient()

    // Create test users with different roles
    owner = await DatabaseTestHelpers.createUser({
      email: 'owner@test.com',
      name: 'Project Owner',
    })

    editor = await DatabaseTestHelpers.createUser({
      email: 'editor@test.com',
      name: 'Project Editor',
    })

    viewer = await DatabaseTestHelpers.createUser({
      email: 'viewer@test.com',
      name: 'Project Viewer',
    })

    outsider = await DatabaseTestHelpers.createUser({
      email: 'outsider@test.com',
      name: 'Outside User',
    })

    // Create test project owned by 'owner'
    testProject = await DatabaseTestHelpers.createTestProject(dbClient.client, {
      name: 'Test Project for Permissions',
      description: 'Project to test ownership permissions',
      owner_id: owner.id,
    })

    // Add collaborators with different roles
    await DatabaseTestHelpers.addCollaborator(dbClient.client, testProject.id, editor.id, 'editor')

    await DatabaseTestHelpers.addCollaborator(dbClient.client, testProject.id, viewer.id, 'viewer')
  })

  afterEach(async () => {
    await dbClient.cleanup()
  })

  describe('Project Read Permissions', () => {
    it('should allow owner to read project', async () => {
      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.id).toBe(testProject.id)
    })

    it('should allow editor to read project', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.id).toBe(testProject.id)
    })

    it('should allow viewer to read project', async () => {
      // Switch to viewer context
      await dbClient.switchUser(viewer.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.id).toBe(testProject.id)
    })

    it('should deny outsider from reading project', async () => {
      // Switch to outsider context
      await dbClient.switchUser(outsider.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('PGRST116') // Not found due to RLS
    })

    it('should allow reading all projects for owner', async () => {
      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('owner_id', owner.id)

      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data![0].id).toBe(testProject.id)
    })

    it('should show only accessible projects for collaborators', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      const { data, error } = await dbClient.client.from('projects').select('*')

      expect(error).toBeNull()
      expect(data).toHaveLength(1)
      expect(data![0].id).toBe(testProject.id)
    })

    it('should show empty list for outsider', async () => {
      // Switch to outsider context
      await dbClient.switchUser(outsider.id)

      const { data, error } = await dbClient.client.from('projects').select('*')

      expect(error).toBeNull()
      expect(data).toHaveLength(0)
    })
  })

  describe('Project Update Permissions', () => {
    it('should allow owner to update project', async () => {
      const updateData = {
        name: 'Updated by Owner',
        description: 'Updated description by owner',
      }

      const { data, error } = await dbClient.client
        .from('projects')
        .update(updateData)
        .eq('id', testProject.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(updateData.name)
      expect(data!.description).toBe(updateData.description)
    })

    it('should allow editor to update project', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      const updateData = {
        name: 'Updated by Editor',
        description: 'Updated description by editor',
      }

      const { data, error } = await dbClient.client
        .from('projects')
        .update(updateData)
        .eq('id', testProject.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.name).toBe(updateData.name)
      expect(data!.description).toBe(updateData.description)
    })

    it('should deny viewer from updating project', async () => {
      // Switch to viewer context
      await dbClient.switchUser(viewer.id)

      const updateData = {
        name: 'Updated by Viewer',
      }

      const { data, error } = await dbClient.client
        .from('projects')
        .update(updateData)
        .eq('id', testProject.id)
        .select()

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })

    it('should deny outsider from updating project', async () => {
      // Switch to outsider context
      await dbClient.switchUser(outsider.id)

      const updateData = {
        name: 'Updated by Outsider',
      }

      const { data, error } = await dbClient.client
        .from('projects')
        .update(updateData)
        .eq('id', testProject.id)
        .select()

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })
  })

  describe('Project Delete Permissions', () => {
    it('should allow owner to delete project', async () => {
      const { error } = await dbClient.client
        .from('projects')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)

      expect(error).toBeNull()

      // Verify project is marked as deleted
      const { data: deletedProject } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(deletedProject!.is_deleted).toBe(true)
    })

    it('should deny editor from deleting project', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })

    it('should deny viewer from deleting project', async () => {
      // Switch to viewer context
      await dbClient.switchUser(viewer.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })

    it('should deny outsider from deleting project', async () => {
      // Switch to outsider context
      await dbClient.switchUser(outsider.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', testProject.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })
  })

  describe('Project Status Change Permissions', () => {
    it('should allow owner to change project status', async () => {
      const { data, error } = await dbClient.client
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', testProject.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.status).toBe('archived')
    })

    it('should deny editor from changing project status', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', testProject.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })

    it('should deny viewer from changing project status', async () => {
      // Switch to viewer context
      await dbClient.switchUser(viewer.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', testProject.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })
  })

  describe('Collaborator Management Permissions', () => {
    it('should allow owner to add collaborators', async () => {
      const newCollaborator = await DatabaseTestHelpers.createUser({
        email: 'newcollab@test.com',
        name: 'New Collaborator',
      })

      const { data, error } = await dbClient.client
        .from('project_collaborators')
        .insert({
          project_id: testProject.id,
          user_id: newCollaborator.id,
          role: 'viewer',
          invited_by: owner.id,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.user_id).toBe(newCollaborator.id)
    })

    it('should allow editor to add collaborators', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      const newCollaborator = await DatabaseTestHelpers.createUser({
        email: 'editorcollab@test.com',
        name: 'Editor Added Collaborator',
      })

      const { data, error } = await dbClient.client
        .from('project_collaborators')
        .insert({
          project_id: testProject.id,
          user_id: newCollaborator.id,
          role: 'viewer',
          invited_by: editor.id,
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.user_id).toBe(newCollaborator.id)
    })

    it('should deny viewer from adding collaborators', async () => {
      // Switch to viewer context
      await dbClient.switchUser(viewer.id)

      const newCollaborator = await DatabaseTestHelpers.createUser({
        email: 'viewerattempt@test.com',
        name: 'Viewer Attempted Collaborator',
      })

      const { data, error } = await dbClient.client.from('project_collaborators').insert({
        project_id: testProject.id,
        user_id: newCollaborator.id,
        role: 'viewer',
        invited_by: viewer.id,
      })

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })

    it('should allow owner to remove collaborators', async () => {
      const { error } = await dbClient.client
        .from('project_collaborators')
        .delete()
        .eq('project_id', testProject.id)
        .eq('user_id', editor.id)

      expect(error).toBeNull()

      // Verify collaborator is removed
      const { data: remainingCollaborators } = await dbClient.client
        .from('project_collaborators')
        .select('*')
        .eq('project_id', testProject.id)

      expect(remainingCollaborators).toHaveLength(1) // Only viewer remains
      expect(remainingCollaborators![0].user_id).toBe(viewer.id)
    })

    it('should deny editor from removing other collaborators', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      const { data, error } = await dbClient.client
        .from('project_collaborators')
        .delete()
        .eq('project_id', testProject.id)
        .eq('user_id', viewer.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })
  })

  describe('Cross-User Permission Isolation', () => {
    it('should prevent users from accessing other users projects', async () => {
      // Create another project owned by outsider
      const otherProject = await DatabaseTestHelpers.createTestProject(dbClient.client, {
        name: 'Other User Project',
        owner_id: outsider.id,
      })

      // Try to access other project as owner
      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', otherProject.id)
        .single()

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('PGRST116') // Not found due to RLS
    })

    it('should prevent privilege escalation through role changes', async () => {
      // Switch to editor context
      await dbClient.switchUser(editor.id)

      // Try to upgrade own role to owner
      const { data, error } = await dbClient.client
        .from('project_collaborators')
        .update({ role: 'owner' })
        .eq('project_id', testProject.id)
        .eq('user_id', editor.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })

    it('should maintain role hierarchy in collaborative operations', async () => {
      // Switch to viewer context
      await dbClient.switchUser(viewer.id)

      // Try to perform editor-level operation
      const newCollaborator = await DatabaseTestHelpers.createUser({
        email: 'viewerattempt@test.com',
        name: 'Viewer Attempted Collaborator',
      })

      const { data, error } = await dbClient.client.from('project_collaborators').insert({
        project_id: testProject.id,
        user_id: newCollaborator.id,
        role: 'viewer',
        invited_by: viewer.id,
      })

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('42501') // Permission denied
    })
  })

  describe('Permission Edge Cases', () => {
    it('should handle deleted projects correctly', async () => {
      // Delete project as owner
      await dbClient.client.from('projects').update({ is_deleted: true }).eq('id', testProject.id)

      // Switch to editor context
      await dbClient.switchUser(editor.id)

      // Should not be able to access deleted project
      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(error).toBeTruthy()
      expect(data).toBeNull()
    })

    it('should handle archived projects correctly', async () => {
      // Archive project as owner
      await dbClient.client.from('projects').update({ status: 'archived' }).eq('id', testProject.id)

      // Editor should still be able to read archived project
      await dbClient.switchUser(editor.id)

      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', testProject.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data!.status).toBe('archived')
    })

    it('should prevent access to non-existent projects', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000'

      const { data, error } = await dbClient.client
        .from('projects')
        .select('*')
        .eq('id', nonExistentId)
        .single()

      expect(error).toBeTruthy()
      expect(data).toBeNull()
      expect(error?.code).toBe('PGRST116') // Not found
    })
  })
})
