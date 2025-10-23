/**
 * Unit test for field validation rules (Enhanced validation for field configuration)
 *
 * Test: T044 [US2] Unit test for field validation rules
 * Purpose: Validate enhanced field validation logic for field configuration modal
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import {
  validateTextFieldConfig,
  validateNumberFieldConfig,
  validateDateFieldConfig,
  validateFieldConstraints,
  validateDefaultValue,
  validateFieldNaming,
  validateFieldCompatibilityForRelationship,
  validateFieldForMigration,
} from '@/lib/designer/validation'
import type { DataField } from '@/types/designer'
import type { DataFieldType } from '@/types/designer/field'

describe('Enhanced Field Validation Rules', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Text Field Configuration Validation', () => {
    test('should validate valid text field configuration', () => {
      const config = {
        max_length: 255,
        min_length: 5,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate text field with minimal configuration', () => {
      const config = {}

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject invalid max_length', () => {
      const config = { max_length: -1 }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Max length must be a number between 1 and 65535')
    })

    test('should reject max_length out of range', () => {
      const config = { max_length: 70000 }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Max length must be a number between 1 and 65535')
    })

    test('should reject invalid min_length', () => {
      const config = { min_length: -5 }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Min length must be a non-negative number')
    })

    test('should reject min_length greater than max_length', () => {
      const config = { max_length: 100, min_length: 150 }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Min length cannot be greater than max length')
    })

    test('should reject invalid pattern', () => {
      const config = { pattern: '[invalid regex' }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Pattern must be a valid regular expression')
    })

    test('should accept valid pattern', () => {
      const config = { pattern: '^[a-zA-Z0-9]+$' }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle non-string pattern', () => {
      const config = { pattern: 123 }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Pattern must be a string')
    })
  })

  describe('Number Field Configuration Validation', () => {
    test('should validate valid number field configuration', () => {
      const config = {
        precision: 10,
        scale: 2,
        min_value: 0,
        max_value: 9999.99,
      }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate number field with minimal configuration', () => {
      const config = {}

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject invalid precision', () => {
      const config = { precision: 0 }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Precision must be a number between 1 and 65')
    })

    test('should reject precision out of range', () => {
      const config = { precision: 100 }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Precision must be a number between 1 and 65')
    })

    test('should reject invalid scale', () => {
      const config = { scale: -1 }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Scale must be a number between 0 and 30')
    })

    test('should reject scale greater than precision', () => {
      const config = { precision: 5, scale: 10 }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Scale cannot be greater than precision')
    })

    test('should reject non-numeric min_value', () => {
      const config = { min_value: 'not a number' }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Min value must be a number')
    })

    test('should reject non-numeric max_value', () => {
      const config = { max_value: 'not a number' }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Max value must be a number')
    })

    test('should reject min_value greater than max_value', () => {
      const config = { min_value: 100, max_value: 50 }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Min value cannot be greater than max value')
    })

    test('should allow equal min and max values', () => {
      const config = { min_value: 50, max_value: 50 }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Date Field Configuration Validation', () => {
    test('should validate valid date field configuration', () => {
      const config = {
        format: 'YYYY-MM-DD HH:mm:ss',
        default_now: true,
      }

      const result = validateDateFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate date field with minimal configuration', () => {
      const config = {}

      const result = validateDateFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should accept all valid date formats', () => {
      const validFormats = ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'HH:mm:ss']

      validFormats.forEach(format => {
        const config = { format }
        const result = validateDateFieldConfig(config)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    test('should reject invalid date format', () => {
      const config = { format: 'MM/DD/YYYY' }

      const result = validateDateFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Format must be one of: YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, HH:mm:ss'
      )
    })

    test('should reject non-string format', () => {
      const config = { format: 123 }

      const result = validateDateFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Format must be a string')
    })

    test('should reject non-boolean default_now', () => {
      const config = { default_now: 'true' }

      const result = validateDateFieldConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Default now must be a boolean')
    })
  })

  describe('Field Constraints Validation', () => {
    test('should validate valid text field constraints', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { max_length: 100, min_length: 5 }
      const default_value = 'test value'

      const result = validateFieldConstraints(data_type, field_config, default_value)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate valid number field constraints', () => {
      const data_type: DataFieldType = 'number'
      const field_config = { precision: 10, scale: 2, min_value: 0, max_value: 100 }
      const default_value = '50'

      const result = validateFieldConstraints(data_type, field_config, default_value)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate valid date field constraints', () => {
      const data_type: DataFieldType = 'date'
      const field_config = { format: 'YYYY-MM-DD' }
      const default_value = 'CURRENT_TIMESTAMP'

      const result = validateFieldConstraints(data_type, field_config, default_value)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate valid boolean field constraints', () => {
      const data_type: DataFieldType = 'boolean'
      const field_config = {}
      const default_value = 'true'

      const result = validateFieldConstraints(data_type, field_config, default_value)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject invalid field type', () => {
      const data_type = 'invalid_type' as DataFieldType
      const field_config = {}

      const result = validateFieldConstraints(data_type, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unsupported field type: invalid_type')
    })

    test('should accumulate errors from both field config and default value', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { max_length: -1 } // Invalid
      const default_value = 'This is a very long default value that exceeds max length'

      const result = validateFieldConstraints(data_type, field_config, default_value)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Default Value Validation', () => {
    test('should validate text default within length constraints', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { max_length: 50, min_length: 5 }
      const default_value = 'valid default'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject text default exceeding max length', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { max_length: 10 }
      const default_value = 'this is too long'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Default value exceeds maximum length of 10')
    })

    test('should reject text default below min length', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { min_length: 10 }
      const default_value = 'short'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Default value is shorter than minimum length of 10')
    })

    test('should reject text default not matching pattern', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { pattern: '^[0-9]+$' }
      const default_value = 'not a number'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Default value does not match the specified pattern')
    })

    test('should validate numeric default within range', () => {
      const data_type: DataFieldType = 'number'
      const field_config = { min_value: 0, max_value: 100 }
      const default_value = '50'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject numeric default below minimum', () => {
      const data_type: DataFieldType = 'number'
      const field_config = { min_value: 10 }
      const default_value = '5'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Default value is less than minimum value of 10')
    })

    test('should reject numeric default above maximum', () => {
      const data_type: DataFieldType = 'number'
      const field_config = { max_value: 50 }
      const default_value = '100'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Default value is greater than maximum value of 50')
    })

    test('should reject non-numeric default for number field', () => {
      const data_type: DataFieldType = 'number'
      const field_config = {}
      const default_value = 'not a number'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Default value must be a valid number')
    })

    test('should validate date default functions', () => {
      const data_type: DataFieldType = 'date'
      const field_config = {}
      const validDefaults = ['CURRENT_TIMESTAMP', 'NOW()', 'CURRENT_DATE', 'CURRENT_TIME']

      validDefaults.forEach(defaultValue => {
        const result = validateDefaultValue(data_type, defaultValue, field_config)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    test('should reject invalid date default', () => {
      const data_type: DataFieldType = 'date'
      const field_config = {}
      const default_value = 'invalid date function'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Date default value must be a valid date function (e.g., CURRENT_TIMESTAMP, NOW())'
      )
    })

    test('should validate boolean default values', () => {
      const data_type: DataFieldType = 'boolean'
      const field_config = {}
      const validDefaults = ['true', 'false', 'TRUE', 'FALSE', '1', '0']

      validDefaults.forEach(defaultValue => {
        const result = validateDefaultValue(data_type, defaultValue, field_config)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    test('should reject invalid boolean default', () => {
      const data_type: DataFieldType = 'boolean'
      const field_config = {}
      const default_value = 'maybe'

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Boolean default value must be true, false, 1, or 0')
    })
  })

  describe('Field Naming Validation', () => {
    test('should validate valid field names', () => {
      const result = validateFieldNaming('User Email', 'user_email')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject empty display name', () => {
      const result = validateFieldNaming('', 'field_name')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Display name is required')
    })

    test('should reject whitespace-only display name', () => {
      const result = validateFieldNaming('   ', 'field_name')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Display name is required')
    })

    test('should reject display name exceeding maximum length', () => {
      const longName = 'a'.repeat(101)
      const result = validateFieldNaming(longName, 'field_name')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Display name cannot exceed 100 characters')
    })

    test('should reject empty field name', () => {
      const result = validateFieldNaming('Display Name', '')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field name is required')
    })

    test('should reject whitespace-only field name', () => {
      const result = validateFieldNaming('Display Name', '   ')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field name is required')
    })

    test('should reject invalid field name format', () => {
      const invalidNames = [
        '123field', // starts with number
        'field-name', // contains hyphen
        'field name', // contains space
        'FieldName', // contains uppercase
        '_field', // starts with underscore
        'field@name', // contains special character
      ]

      invalidNames.forEach(fieldName => {
        const result = validateFieldNaming('Display Name', fieldName)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain(
          'Field name must start with a letter and contain only lowercase letters, numbers, and underscores'
        )
      })
    })

    test('should reject field name exceeding maximum length', () => {
      const longFieldName = 'a'.repeat(64)
      const result = validateFieldNaming('Display Name', longFieldName)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field name cannot exceed 63 characters')
    })

    test('should accept field name at maximum length', () => {
      const longFieldName = 'a'.repeat(63)
      const result = validateFieldNaming('Display Name', longFieldName)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Field Compatibility for Relationships', () => {
    test('should validate compatible exact type matches', () => {
      const types: DataFieldType[] = ['text', 'number', 'date', 'boolean']

      types.forEach(type => {
        const result = validateFieldCompatibilityForRelationship(type, type)
        expect(result.isCompatible).toBe(true)
        expect(result.warnings).toHaveLength(0)
      })
    })

    test('should reject incompatible type matches', () => {
      const incompatiblePairs = [
        ['text', 'number'],
        ['text', 'date'],
        ['text', 'boolean'],
        ['number', 'date'],
        ['number', 'boolean'],
        ['date', 'boolean'],
      ]

      incompatiblePairs.forEach(([sourceType, targetType]) => {
        const result = validateFieldCompatibilityForRelationship(
          sourceType as DataFieldType,
          targetType as DataFieldType
        )
        expect(result.isCompatible).toBe(false)
        expect(result.warnings).toHaveLength(1)
        expect(result.warnings[0]).toContain('are not compatible for relationships')
      })
    })
  })

  describe('Field Migration Validation', () => {
    const mockField: DataField = {
      id: 'field-id',
      table_id: 'table-id',
      name: 'Test Field',
      field_name: 'test_field',
      data_type: 'text',
      is_required: false,
      default_value: '',
      field_config: { max_length: 100 },
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    test('should allow migration with no changes', () => {
      const newField: Partial<DataField> = {}

      const result = validateFieldForMigration(mockField, newField)
      expect(result.canMigrate).toBe(true)
      expect(result.warnings).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    test('should allow migration with compatible type change', () => {
      const newField: Partial<DataField> = {
        data_type: 'text', // Same type
      }

      const result = validateFieldForMigration(mockField, newField)
      expect(result.canMigrate).toBe(true)
      expect(result.warnings).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    test('should reject migration with incompatible type change', () => {
      const newField: Partial<DataField> = {
        data_type: 'number', // Different type
      }

      const result = validateFieldForMigration(mockField, newField)
      expect(result.canMigrate).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Cannot change field type from text to number')
    })

    test('should warn when making field required', () => {
      const newField: Partial<DataField> = {
        is_required: true,
      }

      const result = validateFieldForMigration(mockField, newField)
      expect(result.canMigrate).toBe(true)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]).toContain('Making field required may fail')
    })

    test('should warn when reducing max length', () => {
      const newField: Partial<DataField> = {
        field_config: { max_length: 50 },
      }

      const result = validateFieldForMigration(mockField, newField)
      expect(result.canMigrate).toBe(true)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0]).toContain('Reducing max length may truncate existing data')
    })

    test('should handle multiple changes', () => {
      const newField: Partial<DataField> = {
        is_required: true,
        field_config: { max_length: 50 },
      }

      const result = validateFieldForMigration(mockField, newField)
      expect(result.canMigrate).toBe(true)
      expect(result.warnings).toHaveLength(2)
      expect(result.errors).toHaveLength(0)
    })

    test('should block migration with multiple errors', () => {
      const newField: Partial<DataField> = {
        data_type: 'number', // Incompatible change
        is_required: true,
      }

      const result = validateFieldForMigration(mockField, newField)
      expect(result.canMigrate).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.warnings).toHaveLength(1)
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    test('should handle empty field config for text type', () => {
      const data_type: DataFieldType = 'text'
      const field_config = {}

      const result = validateFieldConstraints(data_type, field_config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle null and undefined values in config', () => {
      const data_type: DataFieldType = 'text'
      const field_config = {
        max_length: null,
        min_length: undefined,
        pattern: null,
      }

      const result = validateFieldConstraints(data_type, field_config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle zero values for numeric config', () => {
      const config = {
        precision: 1,
        scale: 0,
        min_value: 0,
        max_value: 0,
      }

      const result = validateNumberFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle boundary values for text length', () => {
      const config = {
        max_length: 1,
        min_length: 0,
      }

      const result = validateTextFieldConfig(config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle empty default value', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { max_length: 10 }
      const default_value = ''

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should handle whitespace-only default value', () => {
      const data_type: DataFieldType = 'text'
      const field_config = { max_length: 10 }
      const default_value = '   '

      const result = validateDefaultValue(data_type, default_value, field_config)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
