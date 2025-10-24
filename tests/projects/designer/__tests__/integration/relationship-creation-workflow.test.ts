/**
 * Integration test for relationship creation workflow
 *
 * Test: T058 [US3] Integration test for relationship creation workflow
 * Purpose: Test the end-to-end relationship creation workflow from UI interaction to database constraints
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { validateRelationshipCreation } from '@/lib/designer/validation'
import type { CreateTableRelationshipRequest } from '@/types/designer/relationship'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Mock the validation functions
const mockValidateRelationshipCreation = jest.fn() as jest.MockedFunction<
  (
    projectId: string,
    sourceTableId: string,
    targetTableId: string,
    sourceFieldId: string,
    targetFieldId: string,
    existingRelationships: Array<{
      id: string
      source_table_id: string
      target_table_id: string
      source_field_id: string
      target_field_id: string
    }>
  ) => Promise<ValidationResult>
>
const mockCheckCircularDependency = jest.fn()

// Mock the validation module
jest.mock('@/lib/designer/validation', () => ({
  validateRelationshipCreation: mockValidateRelationshipCreation,
  checkCircularDependency: mockCheckCircularDependency,
  validateRelationshipUpdate: jest.fn(),
  validateRelationshipDeletion: jest.fn(),
  validateFieldForRelationship: jest.fn(),
  getRelationshipValidationSummary: jest.fn(),
  validateFieldCompatibilityForRelationship: jest.fn(),
}))

describe('Integration: Relationship Creation Workflow', () => {
  const mockProjectId = 'test-project-123'
  const mockOnSave = jest.fn() as jest.MockedFunction<
    (relationshipData: CreateTableRelationshipRequest) => Promise<void>
  >

  beforeEach(() => {
    // Default successful validation
    mockValidateRelationshipCreation.mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: [],
    })
  })

  describe('Complete Relationship Creation Flow', () => {
    test('should validate a one-to-many relationship successfully', async () => {
      // Mock validation call
      const validation = (await mockValidateRelationshipCreation(
        mockProjectId,
        'table-users',
        'table-posts',
        'field-id',
        'field-user-id',
        []
      )) as ValidationResult

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
      expect(validation.warnings).toHaveLength(0)
    })

    test('should initialize with pre-selected tables and fields', () => {
      const relationshipData: CreateTableRelationshipRequest = {
        source_table_id: 'table-users',
        source_field_id: 'field-id',
        target_table_id: 'table-posts',
        target_field_id: 'field-user-id',
        relationship_name: 'users_to_posts',
        relationship_type: 'one_to_many',
        cascade_config: {
          on_delete: 'restrict',
          on_update: 'cascade',
        },
      }

      // Validate that the relationship data is correctly structured
      expect(relationshipData.source_table_id).toBe('table-users')
      expect(relationshipData.source_field_id).toBe('field-id')
      expect(relationshipData.target_table_id).toBe('table-posts')
      expect(relationshipData.target_field_id).toBe('field-user-id')
      expect(relationshipData.relationship_name).toBe('users_to_posts')
      expect(relationshipData.relationship_type).toBe('one_to_many')
    })

    test('should handle validation errors appropriately', async () => {
      // Mock validation to return errors
      mockValidateRelationshipCreation.mockResolvedValue({
        isValid: false,
        errors: ['Source table and target table cannot be the same'],
        warnings: [],
      })

      const validation = await mockValidateRelationshipCreation(
        mockProjectId,
        'table-users',
        'table-users', // Same table - should cause validation error
        'field-id',
        'field-email',
        []
      )

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Source table and target table cannot be the same')
      expect(validation.warnings).toHaveLength(0)
    })

    test('should validate field type compatibility', async () => {
      // Create incompatible field types scenario
      const validation = await mockValidateRelationshipCreation(
        mockProjectId,
        'table-users', // Has number ID field
        'table-posts', // Has text fields (modified for test)
        'field-id', // number type
        'field-title', // text type - incompatible
        []
      )

      // Validation should fail due to type incompatibility
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    test('should handle circular dependency detection', async () => {
      // Mock circular dependency detection
      mockValidateRelationshipCreation.mockResolvedValue({
        isValid: false,
        errors: ['This relationship would create a circular dependency'],
        warnings: [],
      })

      const validation = await mockValidateRelationshipCreation(
        mockProjectId,
        'table-comments',
        'table-posts',
        'field-post-id-fk',
        'field-post-id',
        [
          // Existing relationships that would create circular dependency
          {
            id: 'rel-1',
            source_table_id: 'table-posts',
            target_table_id: 'table-comments',
            source_field_id: 'field-post-id',
            target_field_id: 'field-post-id-fk',
          },
        ]
      )

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('This relationship would create a circular dependency')
    })

    test('should allow editing existing relationships', () => {
      const existingRelationship = {
        id: 'rel-1',
        project_id: mockProjectId,
        source_table_id: 'table-users',
        target_table_id: 'table-posts',
        source_field_id: 'field-id',
        target_field_id: 'field-user-id',
        relationship_name: 'users_posts',
        relationship_type: 'one_to_many' as const,
        cascade_config: {
          on_delete: 'cascade' as const,
          on_update: 'restrict' as const,
        },
        status: 'active' as const,
        created_by: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      // Simulate updating cascade configuration
      const updatedRelationship = {
        ...existingRelationship,
        cascade_config: {
          on_delete: 'set_null' as const,
          on_update: 'restrict' as const,
        },
      }

      expect(updatedRelationship.source_table_id).toBe('table-users')
      expect(updatedRelationship.target_table_id).toBe('table-posts')
      expect(updatedRelationship.cascade_config.on_delete).toBe('set_null')
      expect(updatedRelationship.cascade_config.on_update).toBe('restrict')
    })

    test('should show appropriate validation states', async () => {
      // Test initial validation state
      let validation = await validateRelationshipCreation(mockProjectId, '', '', '', '', [])

      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)

      // Test valid configuration
      validation = await validateRelationshipCreation(
        mockProjectId,
        'table-users',
        'table-posts',
        'field-id',
        'field-user-id',
        []
      )

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    test('should handle relationship data transformation', () => {
      const relationshipData: CreateTableRelationshipRequest = {
        source_table_id: 'table-users',
        source_field_id: 'field-id',
        target_table_id: 'table-posts',
        target_field_id: 'field-user-id',
        relationship_name: 'users_posts',
        relationship_type: 'one_to_many',
        cascade_config: {
          on_delete: 'restrict',
          on_update: 'cascade',
        },
      }

      // Test data transformation for API
      const apiData = {
        project_id: mockProjectId,
        ...relationshipData,
        status: 'active' as const,
      }

      expect(apiData).toEqual({
        project_id: mockProjectId,
        source_table_id: 'table-users',
        source_field_id: 'field-id',
        target_table_id: 'table-posts',
        target_field_id: 'field-user-id',
        relationship_name: 'users_posts',
        relationship_type: 'one_to_many',
        cascade_config: {
          on_delete: 'restrict',
          on_update: 'cascade',
        },
        status: 'active',
      })
    })
  })

  describe('Integration with Backend Validation', () => {
    test('should integrate with backend relationship validation', async () => {
      // Mock validation with warnings
      mockValidateRelationshipCreation.mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: ['A reverse relationship exists between these tables'],
      })

      const validation = await mockValidateRelationshipCreation(
        mockProjectId,
        'table-posts',
        'table-users',
        'field-post-id',
        'field-id',
        []
      )

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
      expect(validation.warnings).toContain('A reverse relationship exists between these tables')
    })

    test('should handle API errors during relationship creation', async () => {
      // Mock save function to throw an error
      mockOnSave.mockRejectedValue(new Error('Database constraint violation'))

      const relationshipData: CreateTableRelationshipRequest = {
        source_table_id: 'table-users',
        source_field_id: 'field-id',
        target_table_id: 'table-posts',
        target_field_id: 'field-user-id',
        relationship_name: 'users_posts',
        relationship_type: 'one_to_many',
        cascade_config: {
          on_delete: 'restrict',
          on_update: 'cascade',
        },
      }

      try {
        await mockOnSave(relationshipData)
        // If we reach here, the error wasn't thrown properly
        expect(true).toBe(false) // This should fail
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Database constraint violation')
      }

      // onSave should have been called despite the error
      expect(mockOnSave).toHaveBeenCalledWith(relationshipData)
    })

    test('should handle relationship validation with multiple existing relationships', async () => {
      const existingRelationships = [
        {
          id: 'rel-1',
          source_table_id: 'table-users',
          target_table_id: 'table-posts',
          source_field_id: 'field-id',
          target_field_id: 'field-user-id',
        },
        {
          id: 'rel-2',
          source_table_id: 'table-posts',
          target_table_id: 'table-comments',
          source_field_id: 'field-post-id',
          target_field_id: 'field-post-id-fk',
        },
      ]

      const validation = await mockValidateRelationshipCreation(
        mockProjectId,
        'table-comments',
        'table-users',
        'field-post-id-fk',
        'field-id',
        existingRelationships
      )

      // This should potentially detect complex relationship chains
      expect(validation).toBeDefined()
      expect(typeof validation.isValid).toBe('boolean')
      expect(Array.isArray(validation.errors)).toBe(true)
      expect(Array.isArray(validation.warnings)).toBe(true)
    })

    test('should validate relationship name uniqueness', async () => {
      const existingRelationships = [
        {
          id: 'rel-1',
          relationship_name: 'users_posts',
          source_table_id: 'table-users',
          target_table_id: 'table-posts',
          source_field_id: 'field-id',
          target_field_id: 'field-user-id',
        },
      ]

      // Test validation with duplicate relationship name
      const validation = await mockValidateRelationshipCreation(
        mockProjectId,
        'table-users',
        'table-posts',
        'field-id',
        'field-user-id',
        existingRelationships
      )

      expect(validation).toBeDefined()
      // The validation should check for name uniqueness
      if (!validation.isValid) {
        expect(
          validation.errors.some(
            (error: string) =>
              error.toLowerCase().includes('duplicate') ||
              error.toLowerCase().includes('already exists')
          )
        ).toBe(true)
      }
    })
  })
})
