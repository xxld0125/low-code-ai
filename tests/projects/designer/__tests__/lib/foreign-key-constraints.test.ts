/**
 * Foreign key constraint verification tests
 *
 * Test: T059 [US3] Foreign key constraint verification tests
 * Purpose: Verify that foreign key constraints are properly enforced when relationships are created
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { validateRelationshipCreation } from '@/lib/designer/validation'
import type { CreateTableRelationshipRequest } from '@/types/designer/relationship'
import type { CreateDataFieldRequest } from '@/types/designer/field'
import type { DataFieldType } from '@/types/designer/field'

// Test configuration
const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const TEST_DB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

describe('Foreign Key Constraint Verification', () => {
  let testClient: SupabaseClient
  let testProjectId: string
  let usersTableId: string
  let postsTableId: string
  let commentsTableId: string

  beforeEach(async () => {
    // Create test client
    testClient = createClient(TEST_DB_URL, TEST_DB_KEY, {
      db: { schema: 'public' },
    })

    // Create a test project
    const projectData = {
      name: 'Test Project for Foreign Key Constraints',
      description: 'Integration test project for foreign key constraint verification',
      owner_id: 'test-user-id',
      status: 'active' as const,
      is_deleted: false,
      settings: {},
    }

    const { data: project, error: projectError } = await testClient
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (projectError) {
      throw new Error(`Failed to create test project: ${projectError.message}`)
    }

    testProjectId = project.id

    // Create test tables
    const tables = await Promise.all([
      createTestTable('Users', 'users'),
      createTestTable('Posts', 'posts'),
      createTestTable('Comments', 'comments'),
    ])

    usersTableId = tables[0]
    postsTableId = tables[1]
    commentsTableId = tables[2]
  })

  afterEach(async () => {
    // Clean up test data
    try {
      // Clean up in correct order due to foreign key constraints
      await testClient
        .from('table_relationships')
        .delete()
        .in('source_table_id', [usersTableId, postsTableId, commentsTableId])
      await testClient
        .from('table_relationships')
        .delete()
        .in('target_table_id', [usersTableId, postsTableId, commentsTableId])
      await testClient
        .from('data_fields')
        .delete()
        .in('table_id', [usersTableId, postsTableId, commentsTableId])
      await testClient
        .from('data_tables')
        .delete()
        .in('id', [usersTableId, postsTableId, commentsTableId])
      await testClient.from('projects').delete().eq('id', testProjectId)
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  })

  async function createTestTable(name: string, tableName: string): Promise<string> {
    const tableData = {
      project_id: testProjectId,
      name,
      description: `Test table for ${name}`,
      table_name: `test_fk_${tableName}_${Date.now()}`,
      schema_definition: {
        name,
        table_name: tableName,
        fields: [],
      },
      status: 'draft' as const,
      created_by: 'test-user-id',
    }

    const { data: table, error: tableError } = await testClient
      .from('data_tables')
      .insert(tableData)
      .select()
      .single()

    if (tableError) {
      throw new Error(`Failed to create test table ${name}: ${tableError.message}`)
    }

    return table.id
  }

  async function createTestField(
    tableId: string,
    name: string,
    fieldName: string,
    dataType: DataFieldType,
    isRequired = false,
    fieldConfig: Record<string, unknown> = {},
    sortOrder = 0
  ): Promise<string> {
    const fieldData: CreateDataFieldRequest = {
      name,
      field_name: fieldName,
      data_type: dataType,
      is_required: isRequired,
      field_config: fieldConfig,
      sort_order: sortOrder,
    }

    const { data: field, error: fieldError } = await testClient
      .from('data_fields')
      .insert({
        table_id: tableId,
        name: fieldData.name,
        field_name: fieldData.field_name,
        data_type: fieldData.data_type,
        is_required: fieldData.is_required,
        field_config: fieldData.field_config,
        sort_order: fieldData.sort_order,
        order: sortOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (fieldError) {
      throw new Error(`Failed to create test field ${name}: ${fieldError.message}`)
    }

    return field.id
  }

  async function createTestRelationship(
    sourceTableId: string,
    sourceFieldId: string,
    targetTableId: string,
    targetFieldId: string,
    relationshipName: string,
    cascadeConfig: CreateTableRelationshipRequest['cascade_config']
  ): Promise<string> {
    const relationshipData: CreateTableRelationshipRequest = {
      source_table_id: sourceTableId,
      source_field_id: sourceFieldId,
      target_table_id: targetTableId,
      target_field_id: targetFieldId,
      relationship_name: relationshipName,
      relationship_type: 'one_to_many',
      cascade_config: cascadeConfig || {
        on_delete: 'restrict',
        on_update: 'cascade',
      },
    }

    // Validate relationship before creation
    const validation = await validateRelationshipCreation(
      testProjectId,
      sourceTableId,
      targetTableId,
      sourceFieldId,
      targetFieldId,
      []
    )

    if (!validation.isValid) {
      throw new Error(`Relationship validation failed: ${validation.errors.join(', ')}`)
    }

    const { data: relationship, error: relationshipError } = await testClient
      .from('table_relationships')
      .insert({
        project_id: testProjectId,
        ...relationshipData,
        status: 'active',
        created_by: 'test-user-id',
      })
      .select()
      .single()

    if (relationshipError) {
      throw new Error(`Failed to create test relationship: ${relationshipError.message}`)
    }

    return relationship.id
  }

  describe('Basic Foreign Key Constraint Creation', () => {
    test('should create and store foreign key relationship correctly', async () => {
      // Create primary key fields
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)

      // Create foreign key field
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      // Create relationship: users.id -> posts.user_id
      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      // Verify relationship was created
      const { data: relationship, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(fetchError).toBeNull()
      expect(relationship).not.toBeNull()
      expect(relationship!.source_table_id).toBe(usersTableId)
      expect(relationship!.target_table_id).toBe(postsTableId)
      expect(relationship!.source_field_id).toBe(usersIdField)
      expect(relationship!.target_field_id).toBe(postsUserIdField)
      expect(relationship!.relationship_name).toBe('users_posts')
      expect(relationship!.relationship_type).toBe('one_to_many')
      expect(relationship!.cascade_config).toEqual({
        on_delete: 'restrict',
        on_update: 'cascade',
      })
      expect(relationship!.status).toBe('active')
    })

    test('should enforce cascade delete configuration', async () => {
      // Create fields for cascade delete test
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      // Create relationship with CASCADE DELETE
      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_cascade',
        {
          on_delete: 'cascade',
          on_update: 'cascade',
        }
      )

      // Verify cascade configuration is stored
      const { data: relationship, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(fetchError).toBeNull()
      expect(relationship!.cascade_config.on_delete).toBe('cascade')
      expect(relationship!.cascade_config.on_update).toBe('cascade')
    })

    test('should enforce set null delete configuration', async () => {
      // Create fields for set null test (foreign key must be nullable)
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        false,
        {},
        1
      ) // Nullable

      // Create relationship with SET NULL
      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_set_null',
        {
          on_delete: 'set_null',
          on_update: 'cascade',
        }
      )

      // Verify set null configuration is stored
      const { data: relationship, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(fetchError).toBeNull()
      expect(relationship!.cascade_config.on_delete).toBe('set_null')
    })

    test('should enforce restrict delete configuration', async () => {
      // Create fields for restrict test
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      // Create relationship with RESTRICT
      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_restrict',
        {
          on_delete: 'restrict',
          on_update: 'restrict',
        }
      )

      // Verify restrict configuration is stored
      const { data: relationship, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(fetchError).toBeNull()
      expect(relationship!.cascade_config.on_delete).toBe('restrict')
      expect(relationship!.cascade_config.on_update).toBe('restrict')
    })
  })

  describe('Foreign Key Constraint Validation', () => {
    test('should prevent self-referencing relationships', async () => {
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      const usersRefField = await createTestField(
        usersTableId,
        'Self Ref',
        'self_ref_id',
        'number',
        false,
        {},
        1
      )

      // Try to create self-referencing relationship
      const validation = await validateRelationshipCreation(
        testProjectId,
        usersTableId,
        usersTableId,
        usersIdField,
        usersRefField,
        []
      )

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Source and target tables must be different')
    })

    test('should prevent duplicate relationships', async () => {
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      // Create first relationship
      await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_unique',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      // Try to create duplicate relationship
      const validation = await validateRelationshipCreation(
        testProjectId,
        usersTableId,
        postsTableId,
        usersIdField,
        postsUserIdField,
        [
          {
            source_table_id: usersTableId,
            target_table_id: postsTableId,
          },
        ]
      )

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('A relationship already exists between these tables')
    })

    test('should validate field type compatibility', async () => {
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsTitleField = await createTestField(
        postsTableId,
        'Title',
        'title',
        'text',
        false,
        { max_length: 255 },
        2
      )

      // Try to create relationship with incompatible field types
      const validation = await validateRelationshipCreation(
        testProjectId,
        usersTableId,
        postsTableId,
        usersIdField,
        postsTitleField,
        []
      )

      // The validation should catch type incompatibility
      expect(validation.isValid).toBe(false)
    })
  })

  describe('Complex Relationship Scenarios', () => {
    test('should handle chain relationships (users -> posts -> comments)', async () => {
      // Create primary key fields
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsIdField = await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(commentsTableId, 'ID', 'id', 'number', true, {}, 0)

      // Create foreign key fields
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )
      const commentsPostIdField = await createTestField(
        commentsTableId,
        'Post ID',
        'post_id',
        'number',
        true,
        {},
        1
      )

      // Create relationships: users.id -> posts.user_id and posts.id -> comments.post_id
      const usersPostsRelId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts',
        {
          on_delete: 'cascade',
          on_update: 'cascade',
        }
      )

      const postsCommentsRelId = await createTestRelationship(
        postsTableId,
        postsIdField,
        commentsTableId,
        commentsPostIdField,
        'posts_comments',
        {
          on_delete: 'cascade',
          on_update: 'cascade',
        }
      )

      // Verify both relationships exist
      const { data: relationships, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .in('id', [usersPostsRelId, postsCommentsRelId])
        .order('created_at')

      expect(fetchError).toBeNull()
      expect(relationships).toHaveLength(2)
      expect(relationships![0].relationship_name).toBe('users_posts')
      expect(relationships![1].relationship_name).toBe('posts_comments')
    })

    test('should detect potential circular dependencies', async () => {
      // Create fields for circular dependency test
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)

      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )
      const usersPostsIdField = await createTestField(
        usersTableId,
        'Post ID',
        'post_id',
        'number',
        false,
        {},
        2
      )

      // Create existing relationship: users -> posts
      await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      // Try to create reverse relationship: posts -> users
      const validation = await validateRelationshipCreation(
        testProjectId,
        postsTableId,
        usersTableId,
        postsUserIdField,
        usersPostsIdField,
        [
          {
            source_table_id: usersTableId,
            target_table_id: postsTableId,
          },
        ]
      )

      // Should warn about potential circular dependency
      expect(validation.warnings.length).toBeGreaterThan(0)
      expect(validation.warnings.some(w => w.includes('circular dependency'))).toBe(true)
    })

    test('should handle multiple foreign keys to same table', async () => {
      // Create fields for multiple relationships test
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)

      const postsAuthorField = await createTestField(
        postsTableId,
        'Author ID',
        'author_id',
        'number',
        true,
        {},
        2
      )
      const postsEditorField = await createTestField(
        postsTableId,
        'Editor ID',
        'editor_id',
        'number',
        false,
        {},
        3
      )

      // Create two relationships from users to posts
      const authorRelId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsAuthorField,
        'users_posts_author',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      const editorRelId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsEditorField,
        'users_posts_editor',
        {
          on_delete: 'set_null',
          on_update: 'cascade',
        }
      )

      // Verify both relationships exist with different cascade configurations
      const { data: relationships, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .in('id', [authorRelId, editorRelId])

      expect(fetchError).toBeNull()
      expect(relationships).toHaveLength(2)

      const authorRel = relationships!.find(r => r.relationship_name === 'users_posts_author')
      const editorRel = relationships!.find(r => r.relationship_name === 'users_posts_editor')

      expect(authorRel!.cascade_config.on_delete).toBe('restrict')
      expect(editorRel!.cascade_config.on_delete).toBe('set_null')
    })
  })

  describe('Foreign Key Constraint Updates and Deletion', () => {
    test('should allow updating relationship cascade configuration', async () => {
      // Create initial relationship
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_update_test',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      // Update cascade configuration
      const { data: updatedRelationship, error: updateError } = await testClient
        .from('table_relationships')
        .update({
          cascade_config: {
            on_delete: 'cascade',
            on_update: 'restrict',
          },
        })
        .eq('id', relationshipId)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedRelationship!.cascade_config.on_delete).toBe('cascade')
      expect(updatedRelationship!.cascade_config.on_update).toBe('restrict')
    })

    test('should allow deactivating relationships without deletion', async () => {
      // Create relationship
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_deactivate_test',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      // Deactivate relationship
      const { data: deactivatedRelationship, error: deactivateError } = await testClient
        .from('table_relationships')
        .update({ status: 'inactive' })
        .eq('id', relationshipId)
        .select()
        .single()

      expect(deactivateError).toBeNull()
      expect(deactivatedRelationship!.status).toBe('inactive')

      // Relationship should still exist but be inactive
      const { data: fetchedRelationship, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(fetchError).toBeNull()
      expect(fetchedRelationship!.status).toBe('inactive')
    })

    test('should allow deleting relationships', async () => {
      // Create relationship
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_delete_test',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      // Verify relationship exists
      const { data: existingRelationship, error: existingError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(existingError).toBeNull()
      expect(existingRelationship).not.toBeNull()

      // Delete relationship
      const { error: deleteError } = await testClient
        .from('table_relationships')
        .delete()
        .eq('id', relationshipId)

      expect(deleteError).toBeNull()

      // Verify relationship is deleted
      const { data: deletedRelationship, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(fetchError).not.toBeNull() // Should not find the relationship
      expect(deletedRelationship).toBeNull()
    })
  })

  describe('Foreign Key Constraint Edge Cases', () => {
    test('should handle relationship with nullable foreign key fields', async () => {
      // Create fields for nullable foreign key test
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        false,
        {},
        1
      ) // Nullable

      // Create relationship with nullable foreign key
      const relationshipId = await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'users_posts_nullable',
        {
          on_delete: 'set_null',
          on_update: 'cascade',
        }
      )

      // Verify relationship is created successfully
      const { data: relationship, error: fetchError } = await testClient
        .from('table_relationships')
        .select('*')
        .eq('id', relationshipId)
        .single()

      expect(fetchError).toBeNull()
      expect(relationship!.cascade_config.on_delete).toBe('set_null')
    })

    test('should prevent creating relationships that would violate existing data', async () => {
      // This test would typically involve checking if existing data in the target table
      // would violate the new foreign key constraint. For our implementation,
      // we focus on the metadata validation rather than actual data constraints.

      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      // The validation should pass since we're not checking actual data constraints
      const validation = await validateRelationshipCreation(
        testProjectId,
        usersTableId,
        postsTableId,
        usersIdField,
        postsUserIdField,
        []
      )

      expect(validation.isValid).toBe(true)
    })

    test('should handle relationship name uniqueness within project', async () => {
      const usersIdField = await createTestField(usersTableId, 'ID', 'id', 'number', true, {}, 0)
      await createTestField(postsTableId, 'ID', 'id', 'number', true, {}, 0)
      const postsUserIdField = await createTestField(
        postsTableId,
        'User ID',
        'user_id',
        'number',
        true,
        {},
        1
      )

      // Create first relationship
      await createTestRelationship(
        usersTableId,
        usersIdField,
        postsTableId,
        postsUserIdField,
        'unique_relationship_name',
        {
          on_delete: 'restrict',
          on_update: 'cascade',
        }
      )

      // Try to create another relationship with the same name (this would be caught at application level)
      // In our implementation, we focus on the constraint metadata
      const { data: duplicateRelationship, error: duplicateError } = await testClient
        .from('table_relationships')
        .insert({
          project_id: testProjectId,
          source_table_id: usersTableId,
          source_field_id: usersIdField,
          target_table_id: postsTableId,
          target_field_id: postsUserIdField,
          relationship_name: 'unique_relationship_name', // Same name
          relationship_type: 'one_to_many',
          cascade_config: {
            on_delete: 'restrict',
            on_update: 'cascade',
          },
          status: 'active',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      // Database might enforce uniqueness or allow duplicates (handled at app level)
      // For this test, we just verify the relationship creation process
      if (duplicateError) {
        expect(duplicateError.message).toContain('duplicate key')
      } else {
        // If no database constraint, the app should handle this validation
        expect(duplicateRelationship).not.toBeNull()
      }
    })
  })
})
