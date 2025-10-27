/**
 * API integration test for table CRUD operations
 *
 * Test: T034 [US1] API integration test for table CRUD operations
 * Purpose: Test API endpoints for table CRUD operations
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Test configuration
const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const TEST_DB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

describe('Integration: API CRUD Operations', () => {
  let testClient: SupabaseClient
  let testProjectId: string
  let createdTableId: string | null = null

  beforeEach(async () => {
    // Create test client
    testClient = createClient(TEST_DB_URL, TEST_DB_KEY, {
      db: { schema: 'public' },
    })

    // Create a test project for API testing
    const projectData = {
      name: 'API Test Project',
      description: 'Project for API integration testing',
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
      if (createdTableId) {
        await testClient.from('data_fields').delete().eq('table_id', createdTableId)
        await testClient.from('data_tables').delete().eq('id', createdTableId)
        createdTableId = null
      }
      await testClient.from('projects').delete().eq('id', testProjectId)
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  })

  describe('Table API Endpoints', () => {
    describe('GET /api/designer/tables', () => {
      test('should list tables for a project', async () => {
        // Create test tables
        const table1Data = {
          project_id: testProjectId,
          name: 'Table 1',
          table_name: 'table_1',
          description: 'First test table',
          status: 'draft' as const,
          schema_definition: { name: 'Table 1' },
          created_by: 'test-user-id',
        }

        const table2Data = {
          project_id: testProjectId,
          name: 'Table 2',
          table_name: 'table_2',
          description: 'Second test table',
          status: 'active' as const,
          schema_definition: { name: 'Table 2' },
          created_by: 'test-user-id',
        }

        await testClient.from('data_tables').insert(table1Data)
        await testClient.from('data_tables').insert(table2Data)

        // Test API call
        const response = await fetch(
          `${API_BASE_URL}/api/designer/tables?projectId=${testProjectId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data.tables).toBeDefined()
        expect(Array.isArray(data.tables)).toBe(true)
        expect(data.tables.length).toBeGreaterThanOrEqual(2)

        // Verify table structure
        const table1 = data.tables.find((t: { name: string }) => t.name === 'Table 1')
        const table2 = data.tables.find((t: { name: string }) => t.name === 'Table 2')

        expect(table1).toBeDefined()
        expect(table1.project_id).toBe(testProjectId)
        expect(table1.table_name).toBe('table_1')
        expect(table1.status).toBe('draft')

        expect(table2).toBeDefined()
        expect(table2.project_id).toBe(testProjectId)
        expect(table2.table_name).toBe('table_2')
        expect(table2.status).toBe('active')
      })

      test('should return empty list for project with no tables', async () => {
        const response = await fetch(
          `${API_BASE_URL}/api/designer/tables?projectId=${testProjectId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data.tables).toBeDefined()
        expect(Array.isArray(data.tables)).toBe(true)
        expect(data.tables.length).toBe(0)
      })

      test('should handle missing projectId parameter', async () => {
        const response = await fetch(`${API_BASE_URL}/api/designer/tables`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toContain('Project ID is required')
      })
    })

    describe('POST /api/designer/tables', () => {
      test('should create a new table', async () => {
        const createData = {
          projectId: testProjectId,
          name: 'API Test Table',
          tableName: 'api_test_table',
          description: 'Table created via API',
        }

        const response = await fetch(`${API_BASE_URL}/api/designer/tables`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        })

        expect(response.ok).toBe(true)
        expect(response.status).toBe(201)

        const data = await response.json()
        expect(data.table).toBeDefined()
        expect(data.table.name).toBe('API Test Table')
        expect(data.table.table_name).toBe('api_test_table')
        expect(data.table.description).toBe('Table created via API')
        expect(data.table.project_id).toBe(testProjectId)
        expect(data.table.status).toBe('draft')

        createdTableId = data.table.id
      })

      test('should handle missing required fields', async () => {
        const invalidData = {
          name: 'Invalid Table',
          // Missing projectId and tableName
        }

        const response = await fetch(`${API_BASE_URL}/api/designer/tables`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidData),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toContain('Missing required fields')
      })

      test('should handle invalid JSON payload', async () => {
        const response = await fetch(`${API_BASE_URL}/api/designer/tables`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: 'invalid json',
        })

        expect(response.status).toBe(500)
      })

      test('should handle duplicate table names', async () => {
        const tableData = {
          projectId: testProjectId,
          name: 'Duplicate Test',
          tableName: 'duplicate_table',
          description: 'First table',
        }

        // Create first table
        const firstResponse = await fetch(`${API_BASE_URL}/api/designer/tables`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tableData),
        })

        expect(firstResponse.ok).toBe(true)

        // Try to create second table with same name
        const duplicateData = {
          projectId: testProjectId,
          name: 'Duplicate Test 2',
          tableName: 'duplicate_table', // Same table_name
          description: 'Second table',
        }

        const secondResponse = await fetch(`${API_BASE_URL}/api/designer/tables`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(duplicateData),
        })

        expect(secondResponse.status).toBe(500)
        const errorData = await secondResponse.json()
        expect(errorData.error).toContain('duplicate key')
      })
    })

    describe('GET /api/designer/tables/[tableId]', () => {
      beforeEach(async () => {
        // Create a table for individual operations testing
        const tableData = {
          project_id: testProjectId,
          name: 'Individual Test Table',
          table_name: 'individual_test',
          description: 'Table for individual API tests',
          status: 'draft' as const,
          schema_definition: { name: 'Individual Test Table' },
          created_by: 'test-user-id',
        }

        const { data } = await testClient.from('data_tables').insert(tableData).select().single()

        createdTableId = data.id
      })

      test('should get a specific table by ID', async () => {
        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data.table).toBeDefined()
        expect(data.table.id).toBe(createdTableId)
        expect(data.table.name).toBe('Individual Test Table')
        expect(data.table.table_name).toBe('individual_test')
        expect(data.table.project_id).toBe(testProjectId)
        expect(Array.isArray(data.table.data_fields)).toBe(true)
      })

      test('should handle non-existent table ID', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000'
        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${fakeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        expect(response.status).toBe(404)
        const data = await response.json()
        expect(data.error).toContain('Table not found')
      })

      test('should handle invalid table ID format', async () => {
        const response = await fetch(`${API_BASE_URL}/api/designer/tables/invalid-id`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        expect(response.status).toBe(500)
      })
    })

    describe('PUT /api/designer/tables/[tableId]', () => {
      beforeEach(async () => {
        // Create a table for update testing
        const tableData = {
          project_id: testProjectId,
          name: 'Update Test Table',
          table_name: 'update_test',
          description: 'Table for update tests',
          status: 'draft' as const,
          schema_definition: { name: 'Update Test Table' },
          created_by: 'test-user-id',
        }

        const { data } = await testClient.from('data_tables').insert(tableData).select().single()

        createdTableId = data.id
      })

      test('should update table name and description', async () => {
        const updateData = {
          name: 'Updated Table Name',
          description: 'Updated description via API',
        }

        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data.table).toBeDefined()
        expect(data.table.id).toBe(createdTableId)
        expect(data.table.name).toBe('Updated Table Name')
        expect(data.table.description).toBe('Updated description via API')
        expect(data.table.table_name).toBe('update_test') // Unchanged
      })

      test('should update table status', async () => {
        const updateData = {
          status: 'active',
        }

        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data.table.status).toBe('active')
      })

      test('should handle partial updates', async () => {
        const updateData = {
          description: 'Only updating description',
        }

        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data.table.name).toBe('Update Test Table') // Unchanged
        expect(data.table.description).toBe('Only updating description')
        expect(data.table.table_name).toBe('update_test') // Unchanged
      })

      test('should handle empty update payload', async () => {
        const updateData = {}

        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toContain('No fields to update')
      })

      test('should handle update on non-existent table', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000'
        const updateData = {
          name: 'Updated Name',
        }

        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${fakeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })

        expect(response.status).toBe(404)
        const data = await response.json()
        expect(data.error).toContain('Table not found')
      })
    })

    describe('DELETE /api/designer/tables/[tableId]', () => {
      beforeEach(async () => {
        // Create a table for delete testing
        const tableData = {
          project_id: testProjectId,
          name: 'Delete Test Table',
          table_name: 'delete_test',
          description: 'Table for delete tests',
          status: 'active' as const,
          schema_definition: { name: 'Delete Test Table' },
          created_by: 'test-user-id',
        }

        const { data } = await testClient.from('data_tables').insert(tableData).select().single()

        createdTableId = data.id
      })

      test('should soft delete a table', async () => {
        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        expect(response.ok).toBe(true)
        const data = await response.json()

        expect(data.message).toContain('deleted successfully')
        expect(data.table).toBeDefined()
        expect(data.table.id).toBe(createdTableId)
        expect(data.table.status).toBe('deleted')

        // Verify table is soft deleted (still exists but with deleted status)
        const { data: deletedTable } = await testClient
          .from('data_tables')
          .select('*')
          .eq('id', createdTableId)
          .single()

        expect(deletedTable.status).toBe('deleted')
      })

      test('should handle delete on non-existent table', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000'
        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${fakeId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        expect(response.status).toBe(404)
        const data = await response.json()
        expect(data.error).toContain('Table not found')
      })

      test('should handle delete on already deleted table', async () => {
        // First delete
        await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'DELETE',
        })

        // Try to delete again
        const response = await fetch(`${API_BASE_URL}/api/designer/tables/${createdTableId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // Should still succeed as soft delete operation is idempotent
        expect(response.ok).toBe(true)
      })
    })
  })

  describe('API Error Handling', () => {
    test('should handle malformed request URLs', async () => {
      const response = await fetch(`${API_BASE_URL}/api/designer/tables/invalid-path`, {
        method: 'GET',
      })

      expect(response.status).toBe(404)
    })

    test('should handle server errors gracefully', async () => {
      // This test would normally involve mocking database errors
      // For now, we test the error response format
      const response = await fetch(`${API_BASE_URL}/api/designer/tables?projectId=invalid-uuid`, {
        method: 'GET',
      })

      // The API should handle invalid UUID gracefully
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(response.status).toBeLessThan(600)

      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    test('should maintain consistent error response format', async () => {
      // Test different error conditions have consistent format
      const errors = [
        {
          url: `${API_BASE_URL}/api/designer/tables`,
          method: 'POST' as const,
          body: '{}', // Missing required fields
        },
        {
          url: `${API_BASE_URL}/api/designer/tables/00000000-0000-0000-0000-000000000000`,
          method: 'GET' as const,
        },
      ]

      for (const errorTest of errors) {
        const response = await fetch(errorTest.url, {
          method: errorTest.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: errorTest.body ? JSON.stringify(errorTest.body) : undefined,
        })

        const data = await response.json()

        // All error responses should have an 'error' field
        expect(data).toHaveProperty('error')
        expect(typeof data.error).toBe('string')
        expect(data.error.length).toBeGreaterThan(0)
      }
    })
  })

  describe('API Performance', () => {
    test('should respond within acceptable time limits', async () => {
      // Create a table first
      const tableData = {
        project_id: testProjectId,
        name: 'Performance Test Table',
        table_name: 'performance_test',
        description: 'Table for performance testing',
        status: 'draft' as const,
        schema_definition: { name: 'Performance Test Table' },
        created_by: 'test-user-id',
      }

      const { data: table } = await testClient
        .from('data_tables')
        .insert(tableData)
        .select()
        .single()

      // Test API response times
      const startTime = Date.now()

      const response = await fetch(`${API_BASE_URL}/api/designer/tables/${table.id}`, {
        method: 'GET',
      })

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.ok).toBe(true)
      expect(responseTime).toBeLessThan(1000) // Should respond within 1 second
    })

    test('should handle concurrent requests', async () => {
      // Create multiple tables
      const tablePromises = Array.from({ length: 5 }, (_, i) => {
        const tableData = {
          project_id: testProjectId,
          name: `Concurrent Test Table ${i}`,
          table_name: `concurrent_test_${i}`,
          description: `Table ${i} for concurrent testing`,
          status: 'draft' as const,
          schema_definition: { name: `Concurrent Test Table ${i}` },
          created_by: 'test-user-id',
        }

        return testClient.from('data_tables').insert(tableData).select().single()
      })

      const tables = await Promise.all(tablePromises)

      // Make concurrent API requests
      const apiPromises = tables.map(({ data: table }) =>
        fetch(`${API_BASE_URL}/api/designer/tables/${table.id}`, {
          method: 'GET',
        })
      )

      const responses = await Promise.all(apiPromises)

      // All requests should succeed
      responses.forEach(response => {
        expect(response.ok).toBe(true)
      })

      // Clean up created tables
      await Promise.all(
        tables.map(({ data: table }) => testClient.from('data_tables').delete().eq('id', table.id))
      )
    })
  })
})
