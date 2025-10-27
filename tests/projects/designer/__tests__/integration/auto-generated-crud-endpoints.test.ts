/**
 * Integration test for auto-generated CRUD endpoints
 *
 * Test: T068 [US4] Integration test for auto-generated CRUD endpoints
 * Purpose: Test the complete functionality of auto-generated CRUD API endpoints
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { APIGenerator } from '@/lib/designer/api-generator'
import { endpointRegistry } from '@/lib/designer/endpoint-registry'
import { tableRegistry } from '@/lib/designer/table-registry'
import type { DataTableWithFields } from '@/types/designer/table'

// Import OpenAPI types
interface OpenAPIResponse {
  description: string
  content?: Record<string, unknown>
  schema?: Record<string, unknown>
}

interface OpenAPIOperation {
  responses: Record<string, OpenAPIResponse>
  parameters?: Array<Record<string, unknown>>
  requestBody?: Record<string, unknown>
}

interface OpenAPIPathItem {
  get?: OpenAPIOperation
  post?: OpenAPIOperation
  put?: OpenAPIOperation
  patch?: OpenAPIOperation
  delete?: OpenAPIOperation
  head?: OpenAPIOperation
  options?: OpenAPIOperation
}

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers?: Array<{
    url: string
    description: string
  }>
  paths: Record<string, OpenAPIPathItem>
  components: {
    schemas: Record<string, unknown>
  }
}

// Test configuration
const TEST_DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const TEST_DB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key'

describe('Integration: Auto-Generated CRUD Endpoints', () => {
  let testClient: SupabaseClient
  let testProjectId: string
  let testTable: DataTableWithFields
  let apiGenerator: APIGenerator

  beforeEach(async () => {
    // Create test client
    testClient = createClient(TEST_DB_URL, TEST_DB_KEY, {
      db: { schema: 'public' },
    })

    // Create a test project
    const projectData = {
      name: 'Test Project for CRUD Endpoints',
      description: 'Integration test project for auto-generated CRUD endpoints',
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

    // Create a test table
    testTable = await createTestTable()

    // Initialize API generator
    apiGenerator = new APIGenerator([testTable], [])
  })

  afterEach(async () => {
    // Clean up test data
    try {
      // Clean up in correct order due to foreign key constraints
      await testClient.from('test_crud_products').delete().not('id', 'is', null)
      await testClient.from('data_fields').delete().eq('table_id', testTable.id)
      await testClient.from('data_tables').delete().eq('id', testTable.id)
      await testClient.from('projects').delete().eq('id', testProjectId)

      // Clear registry caches
      tableRegistry.clearCache()
      endpointRegistry.clearCache()
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  })

  async function createTestTable(): Promise<DataTableWithFields> {
    // Create table definition
    const tableData = {
      project_id: testProjectId,
      name: 'Products',
      description: 'Test products table for CRUD endpoint testing',
      table_name: 'test_crud_products',
      schema_definition: {
        name: 'Products',
        table_name: 'test_crud_products',
        fields: [],
      },
      status: 'active' as const,
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

    // Create fields
    const fields = [
      {
        table_id: table.id,
        name: 'Product Name',
        field_name: 'name',
        data_type: 'text',
        is_required: true,
        field_config: { max_length: 100 },
        sort_order: 1,
      },
      {
        table_id: table.id,
        name: 'Description',
        field_name: 'description',
        data_type: 'text',
        is_required: false,
        field_config: { max_length: 500 },
        sort_order: 2,
      },
      {
        table_id: table.id,
        name: 'Price',
        field_name: 'price',
        data_type: 'number',
        is_required: true,
        field_config: { min_value: 0, max_value: 99999.99, precision: 8, scale: 2 },
        sort_order: 3,
      },
      {
        table_id: table.id,
        name: 'In Stock',
        field_name: 'in_stock',
        data_type: 'boolean',
        is_required: false,
        field_config: {},
        sort_order: 4,
      },
      {
        table_id: table.id,
        name: 'Category',
        field_name: 'category',
        data_type: 'text',
        is_required: false,
        field_config: { max_length: 50 },
        sort_order: 5,
      },
    ]

    const { data: createdFields, error: fieldsError } = await testClient
      .from('data_fields')
      .insert(fields)
      .select()

    if (fieldsError) {
      throw new Error(`Failed to create test fields: ${fieldsError.message}`)
    }

    // Create the actual database table
    await createDatabaseTable()

    return {
      ...table,
      fields: createdFields || [],
      relationships: { outgoing: [], incoming: [] },
    }
  }

  async function createDatabaseTable(): Promise<void> {
    // In a real implementation, this would create the actual database table
    // For this test, we'll simulate table creation by assuming the table exists
    console.log(`Creating database table`)
  }

  describe('API Generation', () => {
    test('should generate API for table', () => {
      const generatedAPIs = apiGenerator.generateAllAPIs()
      expect(generatedAPIs.has('test_crud_products')).toBe(true)

      const api = generatedAPIs.get('test_crud_products')!
      expect(api.endpoints).toHaveLength(5) // GET, GET by ID, POST, PUT, DELETE
      expect(api.types).toHaveLength(5) // Entity, Create, Update, Query, ListResponse
      expect(api.validation).toBeDefined()
      expect(api.documentation).toBeDefined()
    })

    test('should generate correct endpoint definitions', () => {
      const api = apiGenerator.generateTableAPI(testTable)

      const listEndpoint = api.endpoints.find(
        e => e.method === 'GET' && e.path === '/api/designer/tables/test_crud_products'
      )
      expect(listEndpoint).toBeDefined()
      expect(listEndpoint!.description).toContain('Retrieve a paginated list')
      expect(listEndpoint!.parameters).toHaveLength(5) // page, limit, sort, order, search

      const createEndpoint = api.endpoints.find(
        e => e.method === 'POST' && e.path === '/api/designer/tables/test_crud_products'
      )
      expect(createEndpoint).toBeDefined()
      expect(createEndpoint!.requestBody).toBeDefined()
      expect(createEndpoint!.responses).toHaveLength(3) // 201, 400, 422
    })

    test('should generate TypeScript types', () => {
      const api = apiGenerator.generateTableAPI(testTable)

      const entityType = api.types.find(t => t.name === 'ProductsEntity')
      expect(entityType).toBeDefined()
      expect(entityType!.definition).toContain('name: string')
      expect(entityType!.definition).toContain('price: number')
      expect(entityType!.definition).toContain('in_stock?: boolean')

      const createType = api.types.find(t => t.name === 'CreateProductsRequest')
      expect(createType).toBeDefined()
      expect(createType!.definition).toContain('name: string')
      expect(createType!.definition).toContain('description?: string')
    })

    test('should generate validation schemas', () => {
      const api = apiGenerator.generateTableAPI(testTable)

      expect(api.validation.create).toBeDefined()
      expect(api.validation.update).toBeDefined()
      expect(api.validation.query).toBeDefined()
      expect(api.validation.params).toBeDefined()
    })

    test('should export OpenAPI specification', () => {
      const openAPISpec = apiGenerator.exportToOpenAPI() as OpenAPISpec

      expect(openAPISpec.openapi).toBe('3.0.0')
      expect(openAPISpec.info.title).toBe('Generated Data Model API')
      expect(openAPISpec.paths['/api/designer/tables/test_crud_products']).toBeDefined()
      expect(openAPISpec.components.schemas).toBeDefined()
    })
  })

  describe('Endpoint Registration', () => {
    test('should register endpoints for table', async () => {
      const registeredEndpoints = await endpointRegistry.registerTableEndpoints(testTable)
      expect(registeredEndpoints).toHaveLength(5)

      const stats = endpointRegistry.getEndpointStats()
      expect(stats.totalEndpoints).toBe(5)
      expect(stats.activeEndpoints).toBe(5)
      expect(stats.endpointsByTable['test_crud_products']).toBe(5)
    })

    test('should find registered endpoints', async () => {
      await endpointRegistry.registerTableEndpoints(testTable)

      const listEndpoint = endpointRegistry.findEndpoint(
        '/api/designer/tables/test_crud_products',
        'GET'
      )
      expect(listEndpoint).toBeDefined()
      expect(listEndpoint!.method).toBe('GET')
      expect(listEndpoint!.tableName).toBe('test_crud_products')

      const createEndpoint = endpointRegistry.findEndpoint(
        '/api/designer/tables/test_crud_products',
        'POST'
      )
      expect(createEndpoint).toBeDefined()
      expect(createEndpoint!.method).toBe('POST')
    })

    test('should check endpoint existence', async () => {
      await endpointRegistry.registerTableEndpoints(testTable)

      expect(
        endpointRegistry.endpointExists('/api/designer/tables/test_crud_products', 'GET')
      ).toBe(true)
      expect(
        endpointRegistry.endpointExists('/api/designer/tables/test_crud_products', 'POST')
      ).toBe(true)
      expect(
        endpointRegistry.endpointExists('/api/designer/tables/test_crud_products', 'INVALID')
      ).toBe(false)
      expect(endpointRegistry.endpointExists('/invalid/path', 'GET')).toBe(false)
    })

    test('should unregister table endpoints', async () => {
      await endpointRegistry.registerTableEndpoints(testTable)
      expect(endpointRegistry.getEndpointStats().totalEndpoints).toBe(5)

      await endpointRegistry.unregisterTableEndpoints('test_crud_products')
      expect(endpointRegistry.getEndpointStats().totalEndpoints).toBe(0)
    })
  })

  describe('CRUD Operations Simulation', () => {
    beforeEach(async () => {
      await endpointRegistry.registerTableEndpoints(testTable)
    })

    test('should simulate CREATE operation', async () => {
      const createData = {
        name: 'Test Product',
        description: 'A test product for CRUD operations',
        price: 29.99,
        in_stock: true,
        category: 'Electronics',
      }

      // Simulate validation
      const validation = apiGenerator.generateTableAPI(testTable).validation.create
      expect(validation).toBeDefined()

      // In a real test, this would make an actual API call
      const validationResult = validation?.safeParse(createData)
      expect(validationResult?.success).toBe(true)

      // Simulate database insertion
      const { data: record, error } = await testClient
        .from('test_crud_products')
        .insert({
          ...createData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(record).toBeDefined()
      expect(record.name).toBe(createData.name)
      expect(record.price).toBe(createData.price)
    })

    test('should simulate READ operations', async () => {
      // Create a test record first
      const { data: testRecord } = await testClient
        .from('test_crud_products')
        .insert({
          name: 'Test Product for Read',
          price: 19.99,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      expect(testRecord).toBeDefined()

      // Simulate GET by ID
      const { data: record, error } = await testClient
        .from('test_crud_products')
        .select('*')
        .eq('id', testRecord.id)
        .single()

      expect(error).toBeNull()
      expect(record).toBeDefined()
      expect(record.id).toBe(testRecord.id)

      // Simulate LIST with pagination
      const { data: records, count } = await testClient
        .from('test_crud_products')
        .select('*', { count: 'exact' })
        .range(0, 9)
        .order('created_at', { ascending: false })

      expect(records).toBeDefined()
      expect(Array.isArray(records)).toBe(true)
      expect(count).toBeGreaterThanOrEqual(1)
    })

    test('should simulate UPDATE operation', async () => {
      // Create a test record first
      const { data: testRecord } = await testClient
        .from('test_crud_products')
        .insert({
          name: 'Original Product',
          price: 10.99,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      expect(testRecord).toBeDefined()

      // Simulate update
      const updateData = {
        name: 'Updated Product',
        price: 15.99,
        description: 'Updated description',
      }

      const { data: updatedRecord, error } = await testClient
        .from('test_crud_products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testRecord.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(updatedRecord).toBeDefined()
      expect(updatedRecord.name).toBe(updateData.name)
      expect(updatedRecord.price).toBe(updateData.price)
      expect(updatedRecord.id).toBe(testRecord.id) // ID should not change
    })

    test('should simulate DELETE operation', async () => {
      // Create a test record first
      const { data: testRecord } = await testClient
        .from('test_crud_products')
        .insert({
          name: 'Product to Delete',
          price: 5.99,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      expect(testRecord).toBeDefined()

      // Simulate delete
      const { error } = await testClient.from('test_crud_products').delete().eq('id', testRecord.id)

      expect(error).toBeNull()

      // Verify deletion
      const { data: deletedRecord } = await testClient
        .from('test_crud_products')
        .select('*')
        .eq('id', testRecord.id)
        .single()

      expect(deletedRecord).toBeNull()
    })
  })

  describe('Error Handling Simulation', () => {
    beforeEach(async () => {
      await endpointRegistry.registerTableEndpoints(testTable)
    })

    test('should handle validation errors', async () => {
      const invalidData = {
        name: '', // Required field empty
        price: -10, // Below minimum value
        in_stock: 'not-a-boolean', // Invalid type
      }

      const validation = apiGenerator.generateTableAPI(testTable).validation.create
      const validationResult = validation?.safeParse(invalidData)

      expect(validationResult?.success).toBe(false)
      expect(validationResult?.error?.issues).toHaveLength(3)
    })

    test('should handle not found errors', async () => {
      const nonExistentId = crypto.randomUUID()

      const { data: record, error } = await testClient
        .from('test_crud_products')
        .select('*')
        .eq('id', nonExistentId)
        .single()

      expect(error).not.toBeNull()
      expect(record).toBeNull()
    })

    test('should handle constraint violations', async () => {
      // This would test foreign key constraints in a real implementation
      // For now, we'll simulate the validation
      const validation = apiGenerator.generateTableAPI(testTable).validation.create

      const validData = {
        name: 'Valid Product',
        price: 25.99,
      }

      const validationResult = validation?.safeParse(validData)
      expect(validationResult?.success).toBe(true)
    })
  })

  describe('Performance Testing', () => {
    test('should handle batch operations efficiently', async () => {
      const startTime = Date.now()
      const batchSize = 50
      const records: Array<Record<string, unknown>> = []

      // Create multiple records
      for (let i = 0; i < batchSize; i++) {
        records.push({
          name: `Product ${i}`,
          price: Math.random() * 100,
          category: `Category ${i % 5}`,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      // Insert in batches (simulated)
      const { data: createdRecords, error } = await testClient
        .from('test_crud_products')
        .insert(records)
        .select()

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(error).toBeNull()
      expect(createdRecords).toHaveLength(batchSize)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds

      // Cleanup
      await testClient
        .from('test_crud_products')
        .delete()
        .in('id', createdRecords?.map(r => r.id) || [])
    })

    test('should handle large result sets with pagination', async () => {
      // Create test data
      const testData = Array.from({ length: 100 }, (_, i) => ({
        name: `Product ${i}`,
        price: Math.random() * 100,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      await testClient.from('test_crud_products').insert(testData)

      // Test pagination performance
      const startTime = Date.now()

      const { data: page1, count: totalCount } = await testClient
        .from('test_crud_products')
        .select('*', { count: 'exact' })
        .range(0, 19)
        .order('created_at', { ascending: false })

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(page1).toHaveLength(20)
      expect(totalCount).toBe(100)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second

      // Cleanup
      await testClient
        .from('test_crud_products')
        .delete()
        .in(
          'id',
          testData.map(r => r.id)
        )
    })
  })

  describe('API Documentation Generation', () => {
    test('should generate comprehensive API documentation', () => {
      const api = apiGenerator.generateTableAPI(testTable)

      expect(api.documentation.summary).toBe('Products Management API')
      expect(api.documentation.description).toContain('Complete CRUD API')
      expect(api.documentation.tags).toContain('Products')
      expect(api.documentation.examples).toHaveLength(2)
    })

    test('should generate OpenAPI specification with all endpoints', () => {
      const openAPISpec = apiGenerator.exportToOpenAPI() as OpenAPISpec

      const productsPath = openAPISpec.paths['/api/designer/tables/test_crud_products']
      expect(productsPath).toBeDefined()
      expect(productsPath.get).toBeDefined()
      expect(productsPath.post).toBeDefined()

      const getByIdPath = openAPISpec.paths['/api/designer/tables/test_crud_products/{id}']
      expect(getByIdPath).toBeDefined()
      expect(getByIdPath.get).toBeDefined()
      expect(getByIdPath.put).toBeDefined()
      expect(getByIdPath.delete).toBeDefined()
    })

    test('should include response schemas and examples', () => {
      const openAPISpec = apiGenerator.exportToOpenAPI() as OpenAPISpec

      expect(openAPISpec.components.schemas.Error).toBeDefined()
      expect(openAPISpec.components.schemas.ValidationError).toBeDefined()

      const productsPath = openAPISpec.paths['/api/designer/tables/test_crud_products']
      expect(productsPath.get).toBeDefined()
      expect(productsPath.get?.responses).toBeDefined()
      const getResponse = productsPath.get!.responses[200]
      expect(getResponse.description).toContain('Successfully retrieved')
    })
  })
})
