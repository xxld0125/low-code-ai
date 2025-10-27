/**
 * Unit test for table validation logic
 *
 * Test: T032 [US1] Unit test for table validation logic
 * Purpose: Validate table creation and field validation logic using Zod schemas
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import {
  validateDataField,
  validateTable,
  validateRelationship,
  validateTableName,
  validateFieldName,
  validateLockRequest,
  validateUniqueFieldNames,
  validateFieldCompatibility,
  getValidationErrorMessage,
  getFieldValidationError,
} from '@/lib/designer/validation'
import type { DataFieldType } from '@/types/designer'

describe('Table Validation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Table Name Validation', () => {
    test('should validate correct table names', () => {
      const validNames = ['users', 'user_profiles', 'table123', 'a_long_table_name']

      validNames.forEach(name => {
        const result = validateTableName(name)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(name)
        }
      })
    })

    test('should reject invalid table names', () => {
      const invalidNames = [
        '', // empty
        '123table', // starts with number
        'users-table', // contains hyphen
        'users table', // contains space
        'Users', // contains uppercase
        '_users', // starts with underscore
        'users@name', // contains special character
        'a'.repeat(64), // too long
      ]

      invalidNames.forEach(name => {
        const result = validateTableName(name)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1)
        }
      })
    })
  })

  describe('Field Name Validation', () => {
    test('should validate correct field names', () => {
      const validNames = ['id', 'user_id', 'email_address', 'created_at', 'price1']

      validNames.forEach(name => {
        const result = validateFieldName(name)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBe(name)
        }
      })
    })

    test('should reject invalid field names', () => {
      const invalidNames = [
        '', // empty
        '123id', // starts with number
        'user-id', // contains hyphen
        'user name', // contains space
        'UserName', // contains uppercase
        '_private', // starts with underscore
        'name@domain', // contains special character
        'a'.repeat(64), // too long
      ]

      invalidNames.forEach(name => {
        const result = validateFieldName(name)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Data Field Validation', () => {
    test('should validate basic text field', () => {
      const field = {
        name: 'Email',
        field_name: 'email',
        data_type: 'text' as DataFieldType,
        is_required: true,
        default_value: '',
        field_config: {},
        sort_order: 0,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(true)
    })

    test('should validate text field with configuration', () => {
      const field = {
        name: 'Username',
        field_name: 'username',
        data_type: 'text' as DataFieldType,
        is_required: true,
        field_config: {
          max_length: 50,
          min_length: 3,
          pattern: '^[a-zA-Z0-9_]+$',
        },
        sort_order: 1,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(true)
    })

    test('should validate number field with precision and scale', () => {
      const field = {
        name: 'Price',
        field_name: 'price',
        data_type: 'number' as DataFieldType,
        is_required: false,
        field_config: {
          precision: 10,
          scale: 2,
          min_value: 0,
          max_value: 999999.99,
        },
        sort_order: 2,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(true)
    })

    test('should validate date field with default now', () => {
      const field = {
        name: 'Created At',
        field_name: 'created_at',
        data_type: 'date' as DataFieldType,
        is_required: true,
        field_config: {
          default_now: true,
          format: 'timestamp',
        },
        sort_order: 3,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(true)
    })

    test('should validate boolean field', () => {
      const field = {
        name: 'Is Active',
        field_name: 'is_active',
        data_type: 'boolean' as DataFieldType,
        is_required: false,
        field_config: {},
        sort_order: 4,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(true)
    })

    test('should reject invalid text field configuration', () => {
      const field = {
        name: 'Invalid Text',
        field_name: 'invalid_text',
        data_type: 'text' as DataFieldType,
        is_required: true,
        field_config: {
          max_length: -1, // Invalid negative length
          min_length: 10,
        },
        sort_order: 0,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(false)
    })

    test('should reject invalid number field configuration', () => {
      const field = {
        name: 'Invalid Number',
        field_name: 'invalid_number',
        data_type: 'number' as DataFieldType,
        is_required: true,
        field_config: {
          precision: 5,
          scale: 10, // Scale greater than precision
        },
        sort_order: 0,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(false)
    })

    test('should reject invalid min/max values', () => {
      const field = {
        name: 'Bad Range',
        field_name: 'bad_range',
        data_type: 'number' as DataFieldType,
        is_required: true,
        field_config: {
          min_value: 100,
          max_value: 50, // Max less than min
        },
        sort_order: 0,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(false)
    })

    test('should reject unsupported data type', () => {
      const field = {
        name: 'Bad Type',
        field_name: 'bad_type',
        data_type: 'invalid_type' as DataFieldType,
        is_required: true,
        field_config: {},
        sort_order: 0,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(false)
    })
  })

  describe('Table Creation Validation', () => {
    test('should validate complete table creation request', () => {
      const table = {
        name: 'Users',
        description: 'User accounts table',
        table_name: 'users',
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: {},
            sort_order: 0,
          },
          {
            name: 'Email',
            field_name: 'email',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: { max_length: 255 },
            sort_order: 1,
          },
          {
            name: 'Created At',
            field_name: 'created_at',
            data_type: 'date' as DataFieldType,
            is_required: true,
            field_config: { default_now: true },
            sort_order: 2,
          },
        ],
      }

      const result = validateTable(table)
      expect(result.success).toBe(true)
    })

    test('should reject table with no fields', () => {
      const table = {
        name: 'Empty Table',
        table_name: 'empty_table',
        fields: [],
      }

      const result = validateTable(table)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least one field')
      }
    })

    test('should reject table with duplicate field names', () => {
      const table = {
        name: 'Bad Table',
        table_name: 'bad_table',
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: {},
            sort_order: 0,
          },
          {
            name: 'ID Copy',
            field_name: 'id', // Duplicate field name
            data_type: 'text' as DataFieldType,
            is_required: false,
            field_config: {},
            sort_order: 1,
          },
        ],
      }

      const result = validateTable(table)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Field names must be unique')
      }
    })

    test('should reject table with invalid name', () => {
      const table = {
        name: 'Bad Table',
        table_name: '123invalid', // Invalid table name
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: {},
            sort_order: 0,
          },
        ],
      }

      const result = validateTable(table)
      expect(result.success).toBe(false)
    })

    test('should handle optional description', () => {
      const table = {
        name: 'Simple Table',
        table_name: 'simple_table',
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: {},
            sort_order: 0,
          },
        ],
      }

      const result = validateTable(table)
      expect(result.success).toBe(true)
    })
  })

  describe('Relationship Validation', () => {
    test('should validate one-to-many relationship', () => {
      const relationship = {
        source_table_id: '550e8400-e29b-41d4-a716-446655440001',
        target_table_id: '550e8400-e29b-41d4-a716-446655440002',
        source_field_id: '550e8400-e29b-41d4-a716-446655440003',
        target_field_id: '550e8400-e29b-41d4-a716-446655440004',
        relationship_name: 'user_posts',
        relationship_type: 'one_to_many' as const,
        cascade_config: {
          on_delete: 'cascade' as const,
          on_update: 'cascade' as const,
        },
      }

      const result = validateRelationship(relationship)
      expect(result.success).toBe(true)
    })

    test('should reject relationship with same source and target table', () => {
      const relationship = {
        source_table_id: '550e8400-e29b-41d4-a716-446655440001',
        target_table_id: '550e8400-e29b-41d4-a716-446655440001', // Same as source
        source_field_id: '550e8400-e29b-41d4-a716-446655440002',
        target_field_id: '550e8400-e29b-41d4-a716-446655440003',
        relationship_name: 'self_reference',
        relationship_type: 'one_to_many' as const,
      }

      const result = validateRelationship(relationship)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'Source and target tables must be different'
        )
      }
    })

    test('should reject relationship with invalid UUID', () => {
      const relationship = {
        source_table_id: 'invalid-uuid',
        target_table_id: '550e8400-e29b-41d4-a716-446655440002',
        source_field_id: '550e8400-e29b-41d4-a716-446655440003',
        target_field_id: '550e8400-e29b-41d4-a716-446655440004',
        relationship_name: 'bad_relationship',
        relationship_type: 'one_to_many' as const,
      }

      const result = validateRelationship(relationship)
      expect(result.success).toBe(false)
    })
  })

  describe('Lock Request Validation', () => {
    test('should validate lock request', () => {
      const lockRequest = {
        lock_type: 'optimistic' as const,
        reason: 'Editing table schema',
        duration_minutes: 30,
      }

      const result = validateLockRequest(lockRequest)
      expect(result.success).toBe(true)
    })

    test('should reject invalid lock type', () => {
      const lockRequest = {
        lock_type: 'invalid_type' as const,
        reason: 'Some reason',
        duration_minutes: 30,
      }

      const result = validateLockRequest(lockRequest)
      expect(result.success).toBe(false)
    })

    test('should reject duration outside range', () => {
      const lockRequest = {
        lock_type: 'optimistic' as const,
        reason: 'Some reason',
        duration_minutes: 2000, // Exceeds 1440 (24 hours)
      }

      const result = validateLockRequest(lockRequest)
      expect(result.success).toBe(false)
    })
  })

  describe('Custom Validation Functions', () => {
    test('validateUniqueFieldNames should return true for unique names', () => {
      const fields = [
        { field_name: 'id' },
        { field_name: 'name' },
        { field_name: 'email' },
        { field_name: 'created_at' },
      ]

      expect(validateUniqueFieldNames(fields)).toBe(true)
    })

    test('validateUniqueFieldNames should return false for duplicate names', () => {
      const fields = [
        { field_name: 'id' },
        { field_name: 'name' },
        { field_name: 'name' }, // Duplicate
        { field_name: 'email' },
      ]

      expect(validateUniqueFieldNames(fields)).toBe(false)
    })

    test('validateFieldCompatibility should return true for matching types', () => {
      expect(validateFieldCompatibility('text', 'text')).toBe(true)
      expect(validateFieldCompatibility('number', 'number')).toBe(true)
      expect(validateFieldCompatibility('date', 'date')).toBe(true)
      expect(validateFieldCompatibility('boolean', 'boolean')).toBe(true)
    })

    test('validateFieldCompatibility should return false for different types', () => {
      expect(validateFieldCompatibility('text', 'number')).toBe(false)
      expect(validateFieldCompatibility('number', 'date')).toBe(false)
      expect(validateFieldCompatibility('date', 'boolean')).toBe(false)
    })
  })

  describe('Error Message Helpers', () => {
    test('getValidationErrorMessage should format Zod error properly', () => {
      // Test with a mock ZodError
      const mockError = {
        issues: [
          { path: ['name'], message: 'Name is required' },
          { path: ['fields', 0, 'field_name'], message: 'Invalid field name' },
        ],
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any

      const errorMessage = getValidationErrorMessage(mockError)
      expect(errorMessage).toBe('name: Name is required, fields.0.field_name: Invalid field name')
    })

    test('getFieldValidationError should return empty array for valid config', () => {
      const errors = getFieldValidationError('email', 'text', {
        max_length: 255,
        min_length: 5,
      })

      expect(errors).toHaveLength(0)
    })

    test('getFieldValidationError should return errors for invalid config', () => {
      const errors = getFieldValidationError('price', 'number', {
        precision: 5,
        scale: 10, // Invalid: scale > precision
      })

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('price:')
    })

    test('getFieldValidationError should handle unsupported field type', () => {
      const errors = getFieldValidationError('field', 'invalid_type' as DataFieldType, {})

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Unsupported field type')
    })
  })

  describe('Schema Edge Cases', () => {
    test('should handle maximum field name length', () => {
      const longName = 'a'.repeat(63) // Exactly at the limit
      const result = validateFieldName(longName)
      expect(result.success).toBe(true)

      const tooLongName = 'a'.repeat(64) // Over the limit
      const result2 = validateFieldName(tooLongName)
      expect(result2.success).toBe(false)
    })

    test('should handle maximum table name length', () => {
      const longName = 'a'.repeat(63) // Exactly at the limit
      const result = validateTableName(longName)
      expect(result.success).toBe(true)

      const tooLongName = 'a'.repeat(64) // Over the limit
      const result2 = validateTableName(tooLongName)
      expect(result2.success).toBe(false)
    })

    test('should handle maximum description length', () => {
      const table = {
        name: 'Test Table',
        table_name: 'test_table',
        description: 'a'.repeat(500), // Exactly at the limit
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: {},
            sort_order: 0,
          },
        ],
      }

      const result = validateTable(table)
      expect(result.success).toBe(true)

      const tableWithTooLongDesc = {
        ...table,
        description: 'a'.repeat(501), // Over the limit
      }

      const result2 = validateTable(tableWithTooLongDesc)
      expect(result2.success).toBe(false)
    })

    test('should handle empty field config', () => {
      const field = {
        name: 'Simple Field',
        field_name: 'simple_field',
        data_type: 'text' as DataFieldType,
        is_required: false,
        field_config: {},
        sort_order: 0,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(true)
    })

    test('should handle undefined field config', () => {
      const field = {
        name: 'Simple Field',
        field_name: 'simple_field',
        data_type: 'text' as DataFieldType,
        is_required: false,
        sort_order: 0,
      }

      const result = validateDataField(field)
      expect(result.success).toBe(true)
    })
  })
})
