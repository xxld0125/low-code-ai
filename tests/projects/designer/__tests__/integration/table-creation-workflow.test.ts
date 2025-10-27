/**
 * Integration test for complete table creation workflow
 *
 * Test: T033 [US1] Integration test for complete table creation workflow
 * Purpose: Test the end-to-end table creation workflow from API to database
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { validateTable } from '@/lib/designer/validation'
import type { CreateTableRequest } from '@/types/designer/table'
import type { DataFieldType } from '@/types/designer/field'

// Test configuration
const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const TEST_DB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

describe('Integration: Table Creation Workflow', () => {
  let testClient: SupabaseClient
  let testProjectId: string

  beforeEach(async () => {
    // Create test client
    testClient = createClient(TEST_DB_URL, TEST_DB_KEY, {
      db: { schema: 'public' },
    })

    // Create a test project for table creation
    const projectData = {
      name: 'Test Project for Table Creation',
      description: 'Integration test project',
      owner_id: 'test-user-id',
      status: 'active' as const,
      is_deleted: false,
      settings: {},
    }

    const { data, error } = await testClient.from('projects').insert(projectData).select().single()

    if (error) {
      throw new Error(`Failed to create test project: ${error.message}`)
    }

    testProjectId = data.id
  })

  afterEach(async () => {
    // Clean up test data
    try {
      // Delete tables first (due to foreign key constraints)
      await testClient.from('data_fields').delete().eq('table_id', testProjectId)
      await testClient.from('data_tables').delete().eq('project_id', testProjectId)
      await testClient.from('projects').delete().eq('id', testProjectId)
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  })

  describe('Complete Table Creation Flow', () => {
    test('should create a complete table with multiple fields', async () => {
      const tableData: CreateTableRequest = {
        name: 'Users',
        description: 'User accounts and authentication data',
        table_name: 'users',
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            default_value: undefined,
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
            name: 'Password Hash',
            field_name: 'password_hash',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: { max_length: 255 },
            sort_order: 2,
          },
          {
            name: 'Full Name',
            field_name: 'full_name',
            data_type: 'text' as DataFieldType,
            is_required: false,
            field_config: { max_length: 100 },
            sort_order: 3,
          },
          {
            name: 'Created At',
            field_name: 'created_at',
            data_type: 'date' as DataFieldType,
            is_required: true,
            field_config: { default_now: true },
            sort_order: 4,
          },
          {
            name: 'Is Active',
            field_name: 'is_active',
            data_type: 'boolean' as DataFieldType,
            is_required: false,
            default_value: 'true',
            sort_order: 5,
          },
        ],
      }

      // Validate table data before creation
      const validationResult = validateTable(tableData)
      expect(validationResult.success).toBe(true)

      // Create the table record
      const { data: createdTable, error: tableError } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: tableData.name,
          description: tableData.description,
          table_name: tableData.table_name,
          schema_definition: tableData,
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      expect(tableError).toBeNull()
      expect(createdTable).toBeDefined()
      expect(createdTable.name).toBe('Users')
      expect(createdTable.table_name).toBe('users')
      expect(createdTable.status).toBe('draft')

      // Create field records
      if (tableData.fields) {
        const fieldPromises = tableData.fields.map(async (field, index) => {
          const { data: createdField, error: fieldError } = await testClient
            .from('data_fields')
            .insert({
              table_id: createdTable.id,
              name: field.name,
              field_name: field.field_name,
              data_type: field.data_type,
              is_required: field.is_required,
              default_value: field.default_value,
              field_config: field.field_config || {},
              sort_order: field.sort_order || index,
            })
            .select()
            .single()

          expect(fieldError).toBeNull()
          expect(createdField).toBeDefined()
          expect(createdField.name).toBe(field.name)
          expect(createdField.field_name).toBe(field.field_name)
          expect(createdField.data_type).toBe(field.data_type)
          expect(createdField.is_required).toBe(field.is_required)

          return createdField
        })

        const createdFields = await Promise.all(fieldPromises)
        expect(createdFields).toHaveLength(6)

        // Verify fields are properly ordered
        const sortedFields = createdFields.sort((a, b) => a.sort_order - b.sort_order)
        expect(sortedFields[0].field_name).toBe('id')
        expect(sortedFields[1].field_name).toBe('email')
        expect(sortedFields[2].field_name).toBe('password_hash')
        expect(sortedFields[3].field_name).toBe('full_name')
        expect(sortedFields[4].field_name).toBe('created_at')
        expect(sortedFields[5].field_name).toBe('is_active')
      }

      // Verify complete table structure by fetching it
      const { data: fetchedTable, error: fetchError } = await testClient
        .from('data_tables')
        .select(
          `
          *,
          data_fields (*)
        `
        )
        .eq('id', createdTable.id)
        .single()

      expect(fetchError).toBeNull()
      expect(fetchedTable.data_fields).toHaveLength(6)
      expect(fetchedTable.schema_definition).toEqual(tableData)
    })

    test('should handle table creation with different field types', async () => {
      const tableData: CreateTableRequest = {
        name: 'Products',
        table_name: 'products',
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            sort_order: 0,
          },
          {
            name: 'Name',
            field_name: 'name',
            data_type: 'text' as DataFieldType,
            is_required: true,
            field_config: { max_length: 100 },
            sort_order: 1,
          },
          {
            name: 'Price',
            field_name: 'price',
            data_type: 'number' as DataFieldType,
            is_required: true,
            field_config: { precision: 10, scale: 2, min_value: 0 },
            sort_order: 2,
          },
          {
            name: 'In Stock',
            field_name: 'in_stock',
            data_type: 'boolean' as DataFieldType,
            is_required: false,
            default_value: 'true',
            sort_order: 3,
          },
          {
            name: 'Created Date',
            field_name: 'created_date',
            data_type: 'date' as DataFieldType,
            is_required: true,
            field_config: { format: 'date' },
            sort_order: 4,
          },
        ],
      }

      // Create the table
      const { data: createdTable, error: tableError } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: tableData.name,
          table_name: tableData.table_name,
          schema_definition: tableData,
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      expect(tableError).toBeNull()

      // Create fields with different types
      if (tableData.fields) {
        for (const field of tableData.fields) {
          const { data: createdField, error: fieldError } = await testClient
            .from('data_fields')
            .insert({
              table_id: createdTable.id,
              name: field.name,
              field_name: field.field_name,
              data_type: field.data_type,
              is_required: field.is_required,
              default_value: field.default_value,
              field_config: field.field_config || {},
              sort_order: field.sort_order || 0,
            })
            .select()
            .single()

          expect(fieldError).toBeNull()
          expect(createdField.data_type).toBe(field.data_type)

          // Verify type-specific configurations
          if (field.data_type === 'number' && field.field_config) {
            expect(createdField.field_config).toMatchObject(field.field_config)
          }
        }
      }

      // Verify the table and fields were created correctly
      const { data: finalTable, error: finalError } = await testClient
        .from('data_tables')
        .select(
          `
          *,
          data_fields (*)
        `
        )
        .eq('id', createdTable.id)
        .single()

      expect(finalError).toBeNull()
      expect(finalTable.data_fields).toHaveLength(5)

      const textFields = finalTable.data_fields.filter(
        (f: { data_type: string }) => f.data_type === 'text'
      )
      const numberFields = finalTable.data_fields.filter(
        (f: { data_type: string }) => f.data_type === 'number'
      )
      const booleanFields = finalTable.data_fields.filter(
        (f: { data_type: string }) => f.data_type === 'boolean'
      )
      const dateFields = finalTable.data_fields.filter(
        (f: { data_type: string }) => f.data_type === 'date'
      )

      expect(textFields).toHaveLength(2)
      expect(numberFields).toHaveLength(1)
      expect(booleanFields).toHaveLength(1)
      expect(dateFields).toHaveLength(1)
    })

    test('should reject duplicate table names within same project', async () => {
      const tableData: CreateTableRequest = {
        name: 'First Users',
        table_name: 'users',
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            sort_order: 0,
          },
        ],
      }

      // Create first table
      const { error: firstError } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: tableData.name,
          table_name: tableData.table_name,
          schema_definition: tableData,
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      expect(firstError).toBeNull()

      // Try to create second table with same name
      const duplicateTableData: CreateTableRequest = {
        name: 'Second Users',
        table_name: 'users', // Same table_name
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            sort_order: 0,
          },
        ],
      }

      const { error: duplicateError } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: duplicateTableData.name,
          table_name: duplicateTableData.table_name,
          schema_definition: duplicateTableData,
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      // This should fail due to unique constraint on (project_id, table_name)
      expect(duplicateError).not.toBeNull()
      expect(duplicateError?.message).toContain('duplicate key')
    })

    test('should handle table status transitions correctly', async () => {
      const tableData: CreateTableRequest = {
        name: 'Status Test Table',
        table_name: 'status_test',
        fields: [
          {
            name: 'ID',
            field_name: 'id',
            data_type: 'text' as DataFieldType,
            is_required: true,
            sort_order: 0,
          },
        ],
      }

      // Create table in draft status
      const { data: createdTable, error: createError } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: tableData.name,
          table_name: tableData.table_name,
          schema_definition: tableData,
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      expect(createError).toBeNull()
      expect(createdTable.status).toBe('draft')

      // Update to active status (simulate deployment)
      const { data: updatedTable, error: updateError } = await testClient
        .from('data_tables')
        .update({ status: 'active' })
        .eq('id', createdTable.id)
        .select()
        .single()

      expect(updateError).toBeNull()
      expect(updatedTable.status).toBe('active')

      // Update to deprecated status
      const { data: deprecatedTable, error: deprecatedError } = await testClient
        .from('data_tables')
        .update({ status: 'deprecated' })
        .eq('id', createdTable.id)
        .select()
        .single()

      expect(deprecatedError).toBeNull()
      expect(deprecatedTable.status).toBe('deprecated')
    })

    test('should maintain field ordering and constraints', async () => {
      const tableData: CreateTableRequest = {
        name: 'Ordered Table',
        table_name: 'ordered_table',
        fields: [
          {
            name: 'First Field',
            field_name: 'first_field',
            data_type: 'text' as DataFieldType,
            is_required: false,
            sort_order: 10, // Non-sequential order
          },
          {
            name: 'Second Field',
            field_name: 'second_field',
            data_type: 'number' as DataFieldType,
            is_required: true,
            sort_order: 5,
          },
          {
            name: 'Third Field',
            field_name: 'third_field',
            data_type: 'boolean' as DataFieldType,
            is_required: false,
            sort_order: 15,
          },
        ],
      }

      // Create table
      const { data: createdTable, error: tableError } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: tableData.name,
          table_name: tableData.table_name,
          schema_definition: tableData,
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      expect(tableError).toBeNull()

      // Create fields in different order than sort_order
      const fieldsToCreate = [...tableData.fields!].reverse() // Create in reverse order
      for (const field of fieldsToCreate) {
        const { error: fieldError } = await testClient.from('data_fields').insert({
          table_id: createdTable.id,
          name: field.name,
          field_name: field.field_name,
          data_type: field.data_type,
          is_required: field.is_required,
          field_config: field.field_config || {},
          sort_order: field.sort_order,
        })

        expect(fieldError).toBeNull()
      }

      // Verify fields are returned in correct sort_order
      const { data: fetchedFields, error: fetchError } = await testClient
        .from('data_fields')
        .select('*')
        .eq('table_id', createdTable.id)
        .order('sort_order', { ascending: true })

      expect(fetchError).toBeNull()
      expect(fetchedFields).toHaveLength(3)

      // Verify correct order based on sort_order
      if (fetchedFields) {
        expect(fetchedFields[0].field_name).toBe('second_field') // sort_order: 5
        expect(fetchedFields[0].is_required).toBe(true)

        expect(fetchedFields[1].field_name).toBe('first_field') // sort_order: 10
        expect(fetchedFields[1].is_required).toBe(false)

        expect(fetchedFields[2].field_name).toBe('third_field') // sort_order: 15
        expect(fetchedFields[2].is_required).toBe(false)
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle table creation with missing required fields', async () => {
      const invalidTableData = {
        name: 'Invalid Table',
        // Missing table_name
        fields: [],
      }

      const { error } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: invalidTableData.name,
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      expect(error).not.toBeNull()
      expect(error?.message).toContain('null value')
    })

    test('should handle field creation with invalid data type', async () => {
      // Create table first
      const { data: createdTable } = await testClient
        .from('data_tables')
        .insert({
          project_id: testProjectId,
          name: 'Test Table',
          table_name: 'test_table',
          schema_definition: { name: 'Test Table' },
          status: 'draft',
          created_by: 'test-user-id',
        })
        .select()
        .single()

      // Try to create field with invalid data type
      const { error } = await testClient.from('data_fields').insert({
        table_id: createdTable.id,
        name: 'Invalid Field',
        field_name: 'invalid_field',
        data_type: 'invalid_type', // Invalid type
        is_required: false,
        field_config: {},
        sort_order: 0,
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('invalid input value')
    })

    test('should handle orphaned field records', async () => {
      // Try to create field without valid table_id
      const { error } = await testClient.from('data_fields').insert({
        table_id: '00000000-0000-0000-0000-000000000000', // Non-existent table
        name: 'Orphaned Field',
        field_name: 'orphaned_field',
        data_type: 'text' as DataFieldType,
        is_required: false,
        field_config: {},
        sort_order: 0,
      })

      expect(error).not.toBeNull()
      expect(error?.message).toContain('violates foreign key constraint')
    })
  })
})
