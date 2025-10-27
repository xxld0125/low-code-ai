/**
 * Unit test for relationship validation logic
 *
 * Test: T057 [US3] Unit test for relationship validation logic
 * Purpose: Validate relationship creation, update, deletion, and circular dependency detection
 */

import { describe, test, expect } from '@jest/globals'
import {
  validateRelationshipCreation,
  checkCircularDependency,
  validateRelationshipUpdate,
  validateRelationshipDeletion,
  validateFieldForRelationship,
  getRelationshipValidationSummary,
  validateFieldCompatibilityForRelationship,
} from '@/lib/designer/validation'
import type { DataField } from '@/types/designer/field'

describe('Relationship Validation Logic', () => {
  const mockProjectId = 'project-123'
  const mockSourceTableId = 'table-1'
  const mockTargetTableId = 'table-2'
  const mockSourceFieldId = 'field-1'
  const mockTargetFieldId = 'field-2'

  const mockExistingRelationships = [
    {
      id: 'rel-1',
      source_table_id: 'table-1',
      target_table_id: 'table-3',
    },
    {
      id: 'rel-2',
      source_table_id: 'table-3',
      target_table_id: 'table-4',
    },
  ]

  describe('validateRelationshipCreation', () => {
    test('should validate a valid relationship creation', async () => {
      const result = await validateRelationshipCreation(
        mockProjectId,
        mockSourceTableId,
        mockTargetTableId,
        mockSourceFieldId,
        mockTargetFieldId,
        mockExistingRelationships
      )

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    test('should reject relationship with missing required fields', async () => {
      const result = await validateRelationshipCreation(
        '', // Missing projectId
        mockSourceTableId,
        mockTargetTableId,
        mockSourceFieldId,
        mockTargetFieldId,
        mockExistingRelationships
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('All relationship fields are required')
    })

    test('should reject self-relationship', async () => {
      const result = await validateRelationshipCreation(
        mockProjectId,
        mockSourceTableId,
        mockSourceTableId, // Same as source
        mockSourceFieldId,
        mockTargetFieldId,
        mockExistingRelationships
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Cannot create a relationship between a table and itself')
    })

    test('should reject duplicate relationship', async () => {
      const existingWithDuplicate = [
        ...mockExistingRelationships,
        {
          id: 'rel-3',
          source_table_id: mockSourceTableId,
          target_table_id: mockTargetTableId,
        },
      ]

      const result = await validateRelationshipCreation(
        mockProjectId,
        mockSourceTableId,
        mockTargetTableId,
        mockSourceFieldId,
        mockTargetFieldId,
        existingWithDuplicate
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('A relationship already exists between these tables')
    })

    test('should warn about reverse relationship', async () => {
      const existingWithReverse = [
        ...mockExistingRelationships,
        {
          id: 'rel-3',
          source_table_id: mockTargetTableId,
          target_table_id: mockSourceTableId,
        },
      ]

      const result = await validateRelationshipCreation(
        mockProjectId,
        mockSourceTableId,
        mockTargetTableId,
        mockSourceFieldId,
        mockTargetFieldId,
        existingWithReverse
      )

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'A reverse relationship exists between these tables. This may create a circular dependency.'
      )
    })
  })

  describe('checkCircularDependency', () => {
    test('should detect no circular dependency in simple relationships', async () => {
      const relationships = [
        { source_table_id: 'table-1', target_table_id: 'table-2' },
        { source_table_id: 'table-2', target_table_id: 'table-3' },
      ]

      const hasCycle = await checkCircularDependency(
        mockProjectId,
        'table-1',
        'table-2',
        relationships
      )

      expect(hasCycle).toBe(false)
    })

    test('should detect direct circular dependency', async () => {
      const relationships = [
        { source_table_id: 'table-1', target_table_id: 'table-2' },
        { source_table_id: 'table-2', target_table_id: 'table-1' }, // Direct cycle
      ]

      const hasCycle = await checkCircularDependency(
        mockProjectId,
        'table-1',
        'table-2',
        relationships
      )

      expect(hasCycle).toBe(true)
    })

    test('should detect indirect circular dependency', async () => {
      const relationships = [
        { source_table_id: 'table-1', target_table_id: 'table-2' },
        { source_table_id: 'table-2', target_table_id: 'table-3' },
        { source_table_id: 'table-3', target_table_id: 'table-1' }, // Indirect cycle
      ]

      const hasCycle = await checkCircularDependency(
        mockProjectId,
        'table-1',
        'table-2',
        relationships
      )

      expect(hasCycle).toBe(true)
    })

    test('should handle complex relationship graphs', async () => {
      const relationships = [
        { source_table_id: 'table-1', target_table_id: 'table-2' },
        { source_table_id: 'table-1', target_table_id: 'table-3' },
        { source_table_id: 'table-2', target_table_id: 'table-4' },
        { source_table_id: 'table-3', target_table_id: 'table-4' },
        { source_table_id: 'table-4', target_table_id: 'table-5' },
      ]

      const hasCycle = await checkCircularDependency(
        mockProjectId,
        'table-1',
        'table-2',
        relationships
      )

      expect(hasCycle).toBe(false)
    })

    test('should detect cycle in complex graph', async () => {
      const relationships = [
        { source_table_id: 'table-1', target_table_id: 'table-2' },
        { source_table_id: 'table-2', target_table_id: 'table-3' },
        { source_table_id: 'table-3', target_table_id: 'table-4' },
        { source_table_id: 'table-4', target_table_id: 'table-2' }, // Creates cycle
      ]

      const hasCycle = await checkCircularDependency(
        mockProjectId,
        'table-1',
        'table-2',
        relationships
      )

      expect(hasCycle).toBe(true)
    })

    test('should handle empty relationships array', async () => {
      const hasCycle = await checkCircularDependency(mockProjectId, 'table-1', 'table-2', [])

      expect(hasCycle).toBe(false)
    })
  })

  describe('validateRelationshipUpdate', () => {
    test('should validate valid relationship update', async () => {
      const existingRelationships = [
        { id: 'rel-1', relationship_name: 'users_posts' },
        { id: 'rel-2', relationship_name: 'posts_comments' },
      ]

      const result = await validateRelationshipUpdate(
        'rel-1',
        { relationship_name: 'user_posts' },
        existingRelationships
      )

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject duplicate relationship name', async () => {
      const existingRelationships = [
        { id: 'rel-1', relationship_name: 'users_posts' },
        { id: 'rel-2', relationship_name: 'posts_comments' },
      ]

      const result = await validateRelationshipUpdate(
        'rel-1',
        { relationship_name: 'posts_comments' }, // Duplicate name
        existingRelationships
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Relationship name must be unique within the project')
    })

    test('should reject invalid cascade configuration', async () => {
      const result = await validateRelationshipUpdate(
        'rel-1',
        {
          cascade_config: {
            on_delete: 'invalid_option',
            on_update: 'cascade',
          },
        },
        []
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid cascade delete configuration')
    })

    test('should reject invalid relationship status', async () => {
      const result = await validateRelationshipUpdate('rel-1', { status: 'invalid_status' }, [])

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid relationship status')
    })

    test('should allow valid cascade configurations', async () => {
      const validConfigs = [
        { on_delete: 'cascade', on_update: 'cascade' },
        { on_delete: 'restrict', on_update: 'restrict' },
        { on_delete: 'set_null', on_update: 'cascade' },
      ]

      for (const config of validConfigs) {
        const result = await validateRelationshipUpdate('rel-1', { cascade_config: config }, [])

        expect(result.isValid).toBe(true)
      }
    })
  })

  describe('validateRelationshipDeletion', () => {
    test('should allow deletion of independent relationship', async () => {
      const existingRelationships = [
        { id: 'rel-1', source_table_id: 'table-1', target_table_id: 'table-2' },
      ]

      const result = await validateRelationshipDeletion('rel-1', existingRelationships)

      expect(result.canDelete).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    test('should warn about dependent relationships', async () => {
      const existingRelationships = [
        { id: 'rel-1', source_table_id: 'table-1', target_table_id: 'table-2' },
        { id: 'rel-2', source_table_id: 'table-2', target_table_id: 'table-3' },
        { id: 'rel-3', source_table_id: 'table-2', target_table_id: 'table-4' },
      ]

      const result = await validateRelationshipDeletion('rel-1', existingRelationships)

      expect(result.canDelete).toBe(true)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]).toContain('may affect 2 other relationship(s)')
    })

    test('should handle relationship not found', async () => {
      const existingRelationships = [
        { id: 'rel-1', source_table_id: 'table-1', target_table_id: 'table-2' },
      ]

      const result = await validateRelationshipDeletion(
        'rel-999', // Non-existent ID
        existingRelationships
      )

      expect(result.canDelete).toBe(false)
      expect(result.warnings).toContain('Relationship not found')
    })
  })

  describe('validateFieldForRelationship', () => {
    const mockValidField: DataField = {
      id: 'field-1',
      name: 'ID',
      field_name: 'id',
      table_id: 'table-1',
      data_type: 'number',
      is_required: true,
      order: 1,
      field_config: {},
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    test('should validate valid source field', () => {
      const result = validateFieldForRelationship(mockValidField, true)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate valid target field', () => {
      const targetField = {
        ...mockValidField,
        field_name: 'user_id',
      }

      const result = validateFieldForRelationship(targetField, false)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject source field that is not required', () => {
      const invalidField = {
        ...mockValidField,
        is_required: false,
      }

      const result = validateFieldForRelationship(invalidField, true)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Source field for relationship should be required')
    })

    test('should reject source field that is not a primary key', () => {
      const invalidField = {
        ...mockValidField,
        field_name: 'name',
      }

      const result = validateFieldForRelationship(invalidField, true)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Source field should be a primary key or unique identifier')
    })

    test('should reject target field that does not end with _id', () => {
      const invalidField = {
        ...mockValidField,
        field_name: 'name',
      }

      const result = validateFieldForRelationship(invalidField, false)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        "Target field name should end with _id to indicate it's a foreign key"
      )
    })

    test('should reject invalid field names for relationships', () => {
      const invalidField = {
        ...mockValidField,
        field_name: '123-invalid',
      }

      const result = validateFieldForRelationship(invalidField, true)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field name is invalid for relationship')
    })

    test('should reject unsuitable data types for relationships', () => {
      const invalidField = {
        ...mockValidField,
        data_type: 'date' as const,
      }

      const result = validateFieldForRelationship(invalidField, true)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field type date is not suitable for relationships')
    })

    test('should accept boolean and text field types with validation', () => {
      const booleanField = {
        ...mockValidField,
        data_type: 'boolean' as const,
      }

      const booleanResult = validateFieldForRelationship(booleanField, false)
      expect(booleanResult.isValid).toBe(false) // Boolean fields are generally not suitable
      expect(booleanResult.errors).toContain('Field type boolean is not suitable for relationships')

      const textField = {
        ...mockValidField,
        data_type: 'text' as const,
      }

      const textResult = validateFieldForRelationship(textField, false)
      expect(textResult.isValid).toBe(true)
    })
  })

  describe('getRelationshipValidationSummary', () => {
    test('should return error summary for failed validation', () => {
      const validationResult = {
        isValid: false,
        errors: ['Source table is required', 'Target field is invalid'],
        warnings: [],
      }

      const summary = getRelationshipValidationSummary(validationResult)

      expect(summary.type).toBe('error')
      expect(summary.message).toBe(
        'Validation failed: Source table is required, Target field is invalid'
      )
    })

    test('should return warning summary for validation with warnings', () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: ['Reverse relationship exists'],
      }

      const summary = getRelationshipValidationSummary(validationResult)

      expect(summary.type).toBe('warning')
      expect(summary.message).toBe('Warning: Reverse relationship exists')
    })

    test('should return success summary for passed validation', () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      }

      const summary = getRelationshipValidationSummary(validationResult)

      expect(summary.type).toBe('success')
      expect(summary.message).toBe('Relationship validation passed')
    })
  })

  describe('validateFieldCompatibilityForRelationship', () => {
    test('should validate exact type matches', () => {
      const result = validateFieldCompatibilityForRelationship('text', 'text')

      expect(result.isCompatible).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    test('should validate compatible number types with warnings', () => {
      const result = validateFieldCompatibilityForRelationship('number', 'number')

      expect(result.isCompatible).toBe(true)
      expect(result.warnings).toContain(
        'Ensure the precision and scale of both fields are compatible'
      )
    })

    test('should validate compatible date types with warnings', () => {
      const result = validateFieldCompatibilityForRelationship('date', 'date')

      expect(result.isCompatible).toBe(true)
      expect(result.warnings).toContain('Ensure both fields use the same date format')
    })

    test('should reject incompatible field types', () => {
      const result = validateFieldCompatibilityForRelationship('text', 'number')

      expect(result.isCompatible).toBe(false)
      expect(result.warnings).toContain(
        'Field types text and number are not compatible for relationships'
      )
    })

    test('should validate boolean type compatibility', () => {
      const result = validateFieldCompatibilityForRelationship('boolean', 'boolean')

      expect(result.isCompatible).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('Integration with validateRelationshipCreation', () => {
    test('should integrate circular dependency detection', async () => {
      // Create a scenario that would create a circular dependency
      const relationshipsThatCreateCycle = [
        { source_table_id: 'table-2', target_table_id: 'table-3' },
        { source_table_id: 'table-3', target_table_id: 'table-1' },
      ]

      const result = await validateRelationshipCreation(
        mockProjectId,
        'table-1',
        'table-2',
        mockSourceFieldId,
        mockTargetFieldId,
        relationshipsThatCreateCycle
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('This relationship would create a circular dependency')
    })

    test('should handle complex validation scenarios', async () => {
      // Complex scenario: reverse relationship exists and would create cycle
      const complexRelationships = [
        { source_table_id: mockTargetTableId, target_table_id: 'table-3' },
        { source_table_id: 'table-3', target_table_id: mockSourceTableId },
      ]

      const result = await validateRelationshipCreation(
        mockProjectId,
        mockSourceTableId,
        mockTargetTableId,
        mockSourceFieldId,
        mockTargetFieldId,
        complexRelationships
      )

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
