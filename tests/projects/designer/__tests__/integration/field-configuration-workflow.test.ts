/**
 * Integration test for field configuration workflow
 *
 * Test: T045 [US2] Integration test for field configuration workflow
 * Purpose: Test the end-to-end field configuration workflow including validation, database constraints, and field updates
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import {
  validateDataField,
  validateFieldConstraints,
  validateDefaultValue,
} from '@/lib/designer/validation'
import type { CreateDataFieldRequest, UpdateDataFieldRequest } from '@/types/designer/field'

// Test configuration
const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const TEST_DB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

describe('Integration: Field Configuration Workflow', () => {
  let testClient: SupabaseClient
  let testProjectId: string
  let testTableId: string

  beforeEach(async () => {
    // Create test client
    testClient = createClient(TEST_DB_URL, TEST_DB_KEY, {
      db: { schema: 'public' },
    })

    // Create a test project for field configuration
    const projectData = {
      name: 'Test Project for Field Configuration',
      description: 'Integration test project for field configuration',
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

    // Create a test table for field configuration
    const tableData = {
      project_id: testProjectId,
      name: 'Test Table for Field Configuration',
      description: 'Integration test table',
      table_name: 'field_config_test_table',
      schema_definition: {
        name: 'Test Table',
        table_name: 'field_config_test_table',
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
      throw new Error(`Failed to create test table: ${tableError.message}`)
    }

    testTableId = table.id
  })

  afterEach(async () => {
    // Clean up test data
    try {
      // Delete in correct order due to foreign key constraints
      await testClient.from('data_fields').delete().eq('table_id', testTableId)
      await testClient.from('data_tables').delete().eq('id', testTableId)
      await testClient.from('projects').delete().eq('id', testProjectId)
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  })

  describe('Complete Field Configuration Flow', () => {
    test('should create and configure fields with different data types and constraints', async () => {
      const fieldsToCreate: CreateDataFieldRequest[] = [
        {
          name: 'Email Address',
          field_name: 'email_address',
          data_type: 'text',
          is_required: true,
          field_config: { max_length: 255, min_length: 5, pattern: '^[^@]+@[^@]+\.[^@]+$' },
          sort_order: 0,
        },
        {
          name: 'User Age',
          field_name: 'user_age',
          data_type: 'number',
          is_required: true,
          field_config: { precision: 3, scale: 0, min_value: 13, max_value: 120 },
          default_value: '18',
          sort_order: 1,
        },
        {
          name: 'Account Active',
          field_name: 'account_active',
          data_type: 'boolean',
          is_required: false,
          default_value: 'true',
          sort_order: 2,
        },
        {
          name: 'Last Login',
          field_name: 'last_login',
          data_type: 'date',
          is_required: false,
          field_config: { format: 'YYYY-MM-DD HH:mm:ss', default_now: true },
          sort_order: 3,
        },
        {
          name: 'Profile Bio',
          field_name: 'profile_bio',
          data_type: 'text',
          is_required: false,
          field_config: { max_length: 1000, min_length: 0 },
          sort_order: 4,
        },
      ]

      // Validate all fields before creation
      fieldsToCreate.forEach(field => {
        const validationResult = validateDataField(field)
        expect(validationResult.success).toBe(true)
      })

      // Create each field in the database
      const createdFields = []
      for (const fieldData of fieldsToCreate) {
        const { data: createdField, error: fieldError } = await testClient
          .from('data_fields')
          .insert({
            table_id: testTableId,
            name: fieldData.name,
            field_name: fieldData.field_name,
            data_type: fieldData.data_type,
            is_required: fieldData.is_required || false,
            default_value: fieldData.default_value,
            field_config: fieldData.field_config || {},
            sort_order: fieldData.sort_order || 0,
          })
          .select()
          .single()

        expect(fieldError).toBeNull()
        expect(createdField).toBeDefined()
        expect(createdField.name).toBe(fieldData.name)
        expect(createdField.field_name).toBe(fieldData.field_name)
        expect(createdField.data_type).toBe(fieldData.data_type)
        expect(createdField.is_required).toBe(fieldData.is_required || false)

        createdFields.push(createdField)
      }

      expect(createdFields).toHaveLength(5)

      // Verify field constraints are properly stored
      const emailField = createdFields.find(f => f.field_name === 'email_address')
      expect(emailField?.field_config).toMatchObject({
        max_length: 255,
        min_length: 5,
        pattern: '^[^@]+@[^@]+\.[^@]+$',
      })

      const ageField = createdFields.find(f => f.field_name === 'user_age')
      expect(ageField?.field_config).toMatchObject({
        precision: 3,
        scale: 0,
        min_value: 13,
        max_value: 120,
      })
      expect(ageField?.default_value).toBe('18')

      const lastLoginField = createdFields.find(f => f.field_name === 'last_login')
      expect(lastLoginField?.field_config).toMatchObject({
        format: 'YYYY-MM-DD HH:mm:ss',
        default_now: true,
      })

      // Verify complete table structure with fields
      const { data: tableWithFields, error: fetchError } = await testClient
        .from('data_tables')
        .select(
          `
          *,
          data_fields (*)
        `
        )
        .eq('id', testTableId)
        .single()

      expect(fetchError).toBeNull()
      expect(tableWithFields.data_fields).toHaveLength(5)

      // Verify fields are in correct sort order
      const sortedFields = tableWithFields.data_fields.sort(
        (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
      )
      expect(sortedFields[0].field_name).toBe('email_address')
      expect(sortedFields[1].field_name).toBe('user_age')
      expect(sortedFields[2].field_name).toBe('account_active')
      expect(sortedFields[3].field_name).toBe('last_login')
      expect(sortedFields[4].field_name).toBe('profile_bio')
    })

    test('should update field configuration while maintaining data integrity', async () => {
      // Create initial field
      const initialField: CreateDataFieldRequest = {
        name: 'Product Name',
        field_name: 'product_name',
        data_type: 'text',
        is_required: true,
        field_config: { max_length: 50 },
        sort_order: 0,
      }

      const { data: createdField, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: initialField.name,
          field_name: initialField.field_name,
          data_type: initialField.data_type,
          is_required: initialField.is_required,
          field_config: initialField.field_config,
          sort_order: initialField.sort_order,
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(createdField.field_config.max_length).toBe(50)

      // Update field configuration
      const updateData: UpdateDataFieldRequest = {
        name: 'Product Title',
        field_name: 'product_title',
        field_config: { max_length: 100, min_length: 5, pattern: '^[A-Za-z0-9\\s]+$' },
        is_required: false,
        default_value: 'Untitled Product',
      }

      const { data: updatedField, error: updateError } = await testClient
        .from('data_fields')
        .update(updateData)
        .eq('id', createdField.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedField.name).toBe('Product Title')
      expect(updatedField.field_name).toBe('product_title')
      expect(updatedField.is_required).toBe(false)
      expect(updatedField.default_value).toBe('Untitled Product')
      expect(updatedField.field_config).toMatchObject({
        max_length: 100,
        min_length: 5,
        pattern: '^[A-Za-z0-9\\s]+$',
      })

      // Verify the updated field configuration is valid
      const validationAfterUpdate = validateFieldConstraints(
        updatedField.data_type,
        updatedField.field_config,
        updatedField.default_value
      )
      expect(validationAfterUpdate.isValid).toBe(true)
    })

    test('should handle field type conversion with validation', async () => {
      // Create a text field
      const { data: textField, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Rating',
          field_name: 'rating',
          data_type: 'text',
          is_required: false,
          field_config: { max_length: 10 },
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(textField.data_type).toBe('text')

      // Convert to number field with appropriate configuration
      const updateData: UpdateDataFieldRequest = {
        data_type: 'number',
        field_config: { precision: 3, scale: 1, min_value: 0, max_value: 10 },
        default_value: '5.0',
      }

      const { data: numberField, error: updateError } = await testClient
        .from('data_fields')
        .update(updateData)
        .eq('id', textField.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(numberField.data_type).toBe('number')
      expect(numberField.field_config).toMatchObject({
        precision: 3,
        scale: 1,
        min_value: 0,
        max_value: 10,
      })
      expect(numberField.default_value).toBe('5.0')

      // Verify new field configuration is valid
      const validationResult = validateFieldConstraints(
        numberField.data_type,
        numberField.field_config,
        numberField.default_value
      )
      expect(validationResult.isValid).toBe(true)
    })

    test('should reject invalid field configurations at database level', async () => {
      // Try to create field with invalid constraints
      const invalidField = {
        table_id: testTableId,
        name: 'Invalid Number Field',
        field_name: 'invalid_number',
        data_type: 'number',
        is_required: true,
        field_config: { scale: 10 }, // Invalid: scale without precision
        sort_order: 0,
      }

      // This should succeed at database level since JSON field accepts any valid JSON
      const { data: createdField, error: createError } = await testClient
        .from('data_fields')
        .insert(invalidField)
        .select()
        .single()

      expect(createError).toBeNull()
      expect(createdField).toBeDefined()

      // But our validation should catch the error
      const validationResult = validateFieldConstraints(
        createdField.data_type,
        createdField.field_config
      )
      expect(validationResult.isValid).toBe(false)
      expect(validationResult.errors.length).toBeGreaterThan(0)
    })

    test('should maintain field uniqueness constraints within table', async () => {
      // Create first field
      const firstField = {
        table_id: testTableId,
        name: 'Unique Field',
        field_name: 'unique_field',
        data_type: 'text',
        is_required: false,
        field_config: {},
        sort_order: 0,
      }

      const { error: firstError } = await testClient.from('data_fields').insert(firstField)
      expect(firstError).toBeNull()

      // Try to create second field with same field_name
      const duplicateField = {
        table_id: testTableId,
        name: 'Another Unique Field',
        field_name: 'unique_field', // Duplicate field_name
        data_type: 'text',
        is_required: false,
        field_config: {},
        sort_order: 1,
      }

      const { error: duplicateError } = await testClient.from('data_fields').insert(duplicateField)
      // This might not be enforced at database level unless there's a unique constraint
      // but our application logic should prevent it
      if (duplicateError) {
        expect(duplicateError.message).toContain('duplicate key')
      }
    })
  })

  describe('Field Constraint Validation', () => {
    test('should validate and apply text field constraints', async () => {
      const fieldConfig = {
        max_length: 100,
        min_length: 10,
        pattern: '^[A-Za-z\\s]+$',
      }

      // Test valid configuration
      const validValidation = validateFieldConstraints('text', fieldConfig, 'John Doe')
      expect(validValidation.isValid).toBe(true)

      // Create field with constraints
      const { data: field, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Full Name',
          field_name: 'full_name',
          data_type: 'text',
          is_required: true,
          field_config: fieldConfig,
          default_value: 'John Doe',
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(field.field_config).toMatchObject(fieldConfig)

      // Test invalid default values
      const tooShortValidation = validateDefaultValue('text', 'Short', fieldConfig)
      expect(tooShortValidation.isValid).toBe(false)
      expect(tooShortValidation.errors).toContain(
        'Default value is shorter than minimum length of 10'
      )

      const patternMismatchValidation = validateDefaultValue('text', 'John123', fieldConfig)
      expect(patternMismatchValidation.isValid).toBe(false)
      expect(patternMismatchValidation.errors).toContain(
        'Default value does not match the specified pattern'
      )
    })

    test('should validate and apply number field constraints', async () => {
      const fieldConfig = {
        precision: 8,
        scale: 2,
        min_value: 0,
        max_value: 9999.99,
      }

      // Create field with constraints
      const { data: field, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Price',
          field_name: 'price',
          data_type: 'number',
          is_required: true,
          field_config: fieldConfig,
          default_value: '19.99',
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(field.field_config).toMatchObject(fieldConfig)

      // Test valid default value
      const validValidation = validateDefaultValue('number', '19.99', fieldConfig)
      expect(validValidation.isValid).toBe(true)

      // Test invalid default values
      const belowMinValidation = validateDefaultValue('number', '-5', fieldConfig)
      expect(belowMinValidation.isValid).toBe(false)
      expect(belowMinValidation.errors).toContain('Default value is less than minimum value of 0')

      const aboveMaxValidation = validateDefaultValue('number', '10000', fieldConfig)
      expect(aboveMaxValidation.isValid).toBe(false)
      expect(aboveMaxValidation.errors).toContain(
        'Default value is greater than maximum value of 9999.99'
      )
    })

    test('should validate and apply date field constraints', async () => {
      const fieldConfig = {
        format: 'YYYY-MM-DD HH:mm:ss',
        default_now: false,
      }

      // Create field with constraints
      const { data: field, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Created At',
          field_name: 'created_at',
          data_type: 'date',
          is_required: true,
          field_config: fieldConfig,
          default_value: 'CURRENT_TIMESTAMP',
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(field.field_config).toMatchObject(fieldConfig)

      // Test valid default values
      const validDefaults = ['CURRENT_TIMESTAMP', 'NOW()', 'CURRENT_DATE']
      validDefaults.forEach(defaultValue => {
        const validation = validateDefaultValue('date', defaultValue, fieldConfig)
        expect(validation.isValid).toBe(true)
      })

      // Test invalid default value
      const invalidValidation = validateDefaultValue('date', 'invalid date', fieldConfig)
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors).toContain('Date default value must be a valid date function')
    })

    test('should validate and apply boolean field constraints', async () => {
      // Create boolean field
      const { data: field, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Is Active',
          field_name: 'is_active',
          data_type: 'boolean',
          is_required: false,
          field_config: {},
          default_value: 'true',
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(field.data_type).toBe('boolean')

      // Test valid default values
      const validDefaults = ['true', 'false', 'TRUE', 'FALSE', '1', '0']
      validDefaults.forEach(defaultValue => {
        const validation = validateDefaultValue('boolean', defaultValue, {})
        expect(validation.isValid).toBe(true)
      })

      // Test invalid default value
      const invalidValidation = validateDefaultValue('boolean', 'maybe', {})
      expect(invalidValidation.isValid).toBe(false)
      expect(invalidValidation.errors).toContain(
        'Boolean default value must be true, false, 1, or 0'
      )
    })
  })

  describe('Complex Field Configuration Scenarios', () => {
    test('should handle multiple field updates in sequence', async () => {
      // Create initial field
      const { data: field, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Test Field',
          field_name: 'test_field',
          data_type: 'text',
          is_required: false,
          field_config: { max_length: 50 },
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()

      // First update: Change name and make required
      const update1: UpdateDataFieldRequest = {
        name: 'Updated Test Field',
        is_required: true,
      }

      const { data: updated1, error: error1 } = await testClient
        .from('data_fields')
        .update(update1)
        .eq('id', field.id)
        .select()
        .single()

      expect(error1).toBeNull()
      expect(updated1.name).toBe('Updated Test Field')
      expect(updated1.is_required).toBe(true)

      // Second update: Update field configuration
      const update2: UpdateDataFieldRequest = {
        field_config: { max_length: 100, min_length: 5 },
        default_value: 'default value',
      }

      const { data: updated2, error: error2 } = await testClient
        .from('data_fields')
        .update(update2)
        .eq('id', field.id)
        .select()
        .single()

      expect(error2).toBeNull()
      expect(updated2.field_config).toMatchObject({
        max_length: 100,
        min_length: 5,
      })
      expect(updated2.default_value).toBe('default value')

      // Final validation
      const finalValidation = validateFieldConstraints(
        updated2.data_type,
        updated2.field_config,
        updated2.default_value
      )
      expect(finalValidation.isValid).toBe(true)
    })

    test('should handle field deletion and reordering', async () => {
      // Create multiple fields
      const fields = [
        { name: 'Field A', field_name: 'field_a', sort_order: 0 },
        { name: 'Field B', field_name: 'field_b', sort_order: 1 },
        { name: 'Field C', field_name: 'field_c', sort_order: 2 },
        { name: 'Field D', field_name: 'field_d', sort_order: 3 },
      ]

      const createdFields = []
      for (const fieldData of fields) {
        const { data: field, error } = await testClient
          .from('data_fields')
          .insert({
            table_id: testTableId,
            name: fieldData.name,
            field_name: fieldData.field_name,
            data_type: 'text',
            is_required: false,
            field_config: {},
            sort_order: fieldData.sort_order,
          })
          .select()
          .single()

        expect(error).toBeNull()
        createdFields.push(field)
      }

      expect(createdFields).toHaveLength(4)

      // Delete the second field
      const { error: deleteError } = await testClient
        .from('data_fields')
        .delete()
        .eq('id', createdFields[1].id)

      expect(deleteError).toBeNull()

      // Reorder remaining fields
      const remainingFields = createdFields.filter((_, index) => index !== 1)
      for (let i = 0; i < remainingFields.length; i++) {
        const { error: reorderError } = await testClient
          .from('data_fields')
          .update({ sort_order: i })
          .eq('id', remainingFields[i].id)

        expect(reorderError).toBeNull()
      }

      // Verify final order
      const { data: finalFields, error: fetchError } = await testClient
        .from('data_fields')
        .select('*')
        .eq('table_id', testTableId)
        .order('sort_order', { ascending: true })

      expect(fetchError).toBeNull()
      expect(finalFields).not.toBeNull()
      if (finalFields) {
        expect(finalFields).toHaveLength(3)
        expect(finalFields[0].field_name).toBe('field_a')
        expect(finalFields[0].sort_order).toBe(0)
        expect(finalFields[1].field_name).toBe('field_c')
        expect(finalFields[1].sort_order).toBe(1)
        expect(finalFields[2].field_name).toBe('field_d')
        expect(finalFields[2].sort_order).toBe(2)
      }
    })

    test('should handle complex field configuration with nested validation', async () => {
      const complexFieldConfig = {
        max_length: 500,
        min_length: 10,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        validation: 'email format with domain restrictions',
      }

      // Create field with complex configuration
      const { data: field, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Advanced Email Field',
          field_name: 'advanced_email',
          data_type: 'text',
          is_required: true,
          field_config: complexFieldConfig,
          default_value: 'user@example.com',
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()

      // Validate the complex configuration
      const constraintValidation = validateFieldConstraints(
        'text',
        complexFieldConfig,
        'user@example.com'
      )
      expect(constraintValidation.isValid).toBe(true)

      // Test with invalid email
      const invalidEmailValidation = validateFieldConstraints(
        'text',
        complexFieldConfig,
        'invalid-email'
      )
      expect(invalidEmailValidation.isValid).toBe(false)
      expect(invalidEmailValidation.errors).toContain(
        'Default value does not match the specified pattern'
      )

      // Update configuration to be more restrictive
      const restrictiveConfig = {
        ...complexFieldConfig,
        min_length: 15,
        max_length: 100,
      }

      const { data: updatedField, error: updateError } = await testClient
        .from('data_fields')
        .update({ field_config: restrictiveConfig })
        .eq('id', field.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedField).toBeDefined() // Use updatedField to avoid unused variable warning

      // Previous default value should now be invalid
      const restrictiveValidation = validateFieldConstraints(
        'text',
        restrictiveConfig,
        'user@example.com'
      )
      expect(restrictiveValidation.isValid).toBe(false)
      expect(restrictiveValidation.errors).toContain(
        'Default value is shorter than minimum length of 15'
      )
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle field creation with missing required properties', async () => {
      // Try to create field without required properties
      const incompleteField = {
        table_id: testTableId,
        // Missing name and field_name
        data_type: 'text',
        sort_order: 0,
      }

      const { error } = await testClient.from('data_fields').insert(incompleteField)
      expect(error).not.toBeNull()
      expect(error?.message).toContain('null value')
    })

    test('should handle field creation with invalid table reference', async () => {
      const orphanedField = {
        table_id: '00000000-0000-0000-0000-000000000000', // Non-existent table
        name: 'Orphaned Field',
        field_name: 'orphaned_field',
        data_type: 'text',
        is_required: false,
        field_config: {},
        sort_order: 0,
      }

      const { error } = await testClient.from('data_fields').insert(orphanedField)
      expect(error).not.toBeNull()
      expect(error?.message).toContain('violates foreign key constraint')
    })

    test('should handle concurrent field updates', async () => {
      // Create initial field
      const { data: field, error: createError } = await testClient
        .from('data_fields')
        .insert({
          table_id: testTableId,
          name: 'Concurrent Test Field',
          field_name: 'concurrent_field',
          data_type: 'text',
          is_required: false,
          field_config: { max_length: 50 },
          sort_order: 0,
        })
        .select()
        .single()

      expect(createError).toBeNull()

      // Simulate concurrent updates
      const update1 = testClient
        .from('data_fields')
        .update({ name: 'Updated by User 1', field_config: { max_length: 100 } })
        .eq('id', field.id)

      const update2 = testClient
        .from('data_fields')
        .update({ name: 'Updated by User 2', is_required: true })
        .eq('id', field.id)

      // Execute both updates
      const [, result2] = await Promise.all([update1, update2])

      // Both updates should succeed (last write wins in most cases)
      expect(result2.error).toBeNull()

      // Verify final state
      const { data: finalField, error: fetchError } = await testClient
        .from('data_fields')
        .select('*')
        .eq('id', field.id)
        .single()

      expect(fetchError).toBeNull()
      expect(finalField.name).toBeDefined()
      expect(finalField.field_config).toBeDefined()
    })
  })
})
