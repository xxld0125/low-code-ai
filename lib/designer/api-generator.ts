/**
 * API Endpoint Generation Logic
 *
 * Purpose: Generate CRUD API endpoints for dynamic tables based on their schema definitions
 * Author: Data Model Designer System
 * Version: 1.0.0
 */

import { z } from 'zod'
import type { DataTableWithFields } from '@/types/designer/table'
import type { DataField } from '@/types/designer/field'
import type { TableRelationship } from '@/types/designer/relationship'

// OpenAPI type definitions
interface OpenAPIPathItem {
  get?: Record<string, unknown>
  post?: Record<string, unknown>
  put?: Record<string, unknown>
  patch?: Record<string, unknown>
  delete?: Record<string, unknown>
  head?: Record<string, unknown>
  options?: Record<string, unknown>
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

// Type definitions for API generation
export interface GeneratedEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  handler: string // Handler function name
  description: string
  parameters: EndpointParameter[]
  requestBody?: RequestBodySchema
  responses: ResponseSchema[]
  validation?: ValidationSchema
}

export interface EndpointParameter {
  name: string
  type: 'path' | 'query' | 'header'
  dataType: string
  required: boolean
  description: string
}

export interface RequestBodySchema {
  contentType: string
  schema: Record<string, unknown>
  required: boolean
}

export interface ResponseSchema {
  statusCode: number
  description: string
  schema: Record<string, unknown>
}

export interface ValidationSchema {
  create?: z.ZodSchema
  update?: z.ZodSchema
  query?: z.ZodSchema
  params?: z.ZodSchema
}

export interface GeneratedAPI {
  tableName: string
  endpoints: GeneratedEndpoint[]
  types: GeneratedType[]
  validation: ValidationSchema
  documentation: APIDocumentation
}

interface GeneratedType {
  name: string
  kind: 'interface' | 'type' | 'enum'
  definition: string
  description: string
}

interface APIDocumentation {
  summary: string
  description: string
  tags: string[]
  examples: APIExample[]
}

interface APIExample {
  title: string
  description: string
  method: string
  path: string
  requestBody?: Record<string, unknown>
  response: Record<string, unknown>
}

// Main API Generator Class
export class APIGenerator {
  private tables: DataTableWithFields[]
  private relationships: TableRelationship[]
  private generatedAPIs: Map<string, GeneratedAPI> = new Map()

  constructor(tables: DataTableWithFields[], relationships: TableRelationship[] = []) {
    this.tables = tables
    this.relationships = relationships
  }

  /**
   * Generate complete CRUD API for all tables
   */
  generateAllAPIs(): Map<string, GeneratedAPI> {
    for (const table of this.tables) {
      if (table.status === 'active') {
        const api = this.generateTableAPI(table)
        this.generatedAPIs.set(table.table_name, api)
      }
    }
    return this.generatedAPIs
  }

  /**
   * Generate CRUD API for a specific table
   */
  generateTableAPI(table: DataTableWithFields): GeneratedAPI {
    const tableName = table.table_name
    // const capitalizedName = this.capitalize(table.name) // Reserved for future use

    // Generate TypeScript types
    const types = this.generateTypes(table)

    // Generate validation schemas
    const validation = this.generateValidationSchemas(table)

    // Generate CRUD endpoints
    const endpoints = [
      this.generateListEndpoint(table),
      this.generateGetByIdEndpoint(table),
      this.generateCreateEndpoint(table),
      this.generateUpdateEndpoint(table),
      this.generateDeleteEndpoint(table),
    ]

    // Generate documentation
    const documentation = this.generateDocumentation(table)

    return {
      tableName,
      endpoints,
      types,
      validation,
      documentation,
    }
  }

  /**
   * Generate TypeScript types for a table
   */
  private generateTypes(table: DataTableWithFields): GeneratedType[] {
    // const tableName = table.table_name // Reserved for future use
    // const capitalizedName = this.capitalize(table.name) // Reserved for future use
    const types: GeneratedType[] = []

    // Main entity interface
    const entityInterface = this.generateEntityInterface(table)
    types.push(entityInterface)

    // Create request interface
    const createInterface = this.generateCreateInterface(table)
    types.push(createInterface)

    // Update request interface
    const updateInterface = this.generateUpdateInterface(table)
    types.push(updateInterface)

    // Query parameters interface
    const queryInterface = this.generateQueryInterface(table)
    types.push(queryInterface)

    // Response interfaces
    const listResponseInterface = this.generateListResponseInterface(table)
    types.push(listResponseInterface)

    return types
  }

  /**
   * Generate entity interface
   */
  private generateEntityInterface(table: DataTableWithFields): GeneratedType {
    const fields = table.fields || []
    const fieldDefinitions = fields
      .map(field => {
        const tsType = this.mapDataTypeToTypeScript(field.data_type, field.field_config)
        const optional = !field.is_required ? '?' : ''
        return `  ${field.field_name}${optional}: ${tsType}`
      })
      .join('\n')

    return {
      name: `${this.capitalize(table.name)}Entity`,
      kind: 'interface',
      definition: `export interface ${this.capitalize(table.name)}Entity {\n${fieldDefinitions}\n}`,
      description: `Complete entity definition for ${table.name}`,
    }
  }

  /**
   * Generate create request interface
   */
  private generateCreateInterface(table: DataTableWithFields): GeneratedType {
    const fields = table.fields?.filter(f => !f.is_primary_key) || []
    const fieldDefinitions = fields
      .map(field => {
        const tsType = this.mapDataTypeToTypeScript(field.data_type, field.field_config)
        const optional = !field.is_required ? '?' : ''
        return `  ${field.field_name}${optional}: ${tsType}`
      })
      .join('\n')

    return {
      name: `Create${this.capitalize(table.name)}Request`,
      kind: 'interface',
      definition: `export interface Create${this.capitalize(table.name)}Request {\n${fieldDefinitions}\n}`,
      description: `Request interface for creating ${table.name}`,
    }
  }

  /**
   * Generate update request interface
   */
  private generateUpdateInterface(table: DataTableWithFields): GeneratedType {
    const fields = table.fields?.filter(f => !f.is_primary_key) || []
    const fieldDefinitions = fields
      .map(field => {
        const tsType = this.mapDataTypeToTypeScript(field.data_type, field.field_config)
        return `  ${field.field_name}?: ${tsType}`
      })
      .join('\n')

    return {
      name: `Update${this.capitalize(table.name)}Request`,
      kind: 'interface',
      definition: `export interface Update${this.capitalize(table.name)}Request {\n${fieldDefinitions}\n}`,
      description: `Request interface for updating ${table.name}`,
    }
  }

  /**
   * Generate query parameters interface
   */
  private generateQueryInterface(table: DataTableWithFields): GeneratedType {
    return {
      name: `${this.capitalize(table.name)}QueryParams`,
      kind: 'interface',
      definition: `export interface ${this.capitalize(table.name)}QueryParams {\n  page?: number\n  limit?: number\n  sort?: string\n  order?: 'asc' | 'desc'\n  search?: string\n}`,
      description: `Query parameters for ${table.name} list operations`,
    }
  }

  /**
   * Generate list response interface
   */
  private generateListResponseInterface(table: DataTableWithFields): GeneratedType {
    return {
      name: `${this.capitalize(table.name)}ListResponse`,
      kind: 'interface',
      definition: `export interface ${this.capitalize(table.name)}ListResponse {\n  data: ${this.capitalize(table.name)}Entity[]\n  total: number\n  page: number\n  limit: number\n  totalPages: number\n}`,
      description: `Response interface for ${table.name} list operations`,
    }
  }

  /**
   * Generate validation schemas using Zod
   */
  private generateValidationSchemas(table: DataTableWithFields): ValidationSchema {
    const createSchema = this.generateCreateValidationSchema(table)
    const updateSchema = this.generateUpdateValidationSchema(table)
    const querySchema = this.generateQueryValidationSchema(table)
    const paramsSchema = this.generateParamsValidationSchema(table)

    return {
      create: createSchema,
      update: updateSchema,
      query: querySchema,
      params: paramsSchema,
    }
  }

  /**
   * Generate create validation schema
   */
  private generateCreateValidationSchema(table: DataTableWithFields): z.ZodSchema {
    const fields = table.fields?.filter(f => !f.is_primary_key) || []
    const schemaFields: Record<string, z.ZodTypeAny> = {}

    for (const field of fields) {
      const fieldSchema = this.generateFieldValidationSchema(field)
      if (field.is_required) {
        schemaFields[field.field_name] = fieldSchema
      } else {
        schemaFields[field.field_name] = fieldSchema.optional()
      }
    }

    return z.object(schemaFields)
  }

  /**
   * Generate update validation schema
   */
  private generateUpdateValidationSchema(table: DataTableWithFields): z.ZodSchema {
    const fields = table.fields?.filter(f => !f.is_primary_key) || []
    const schemaFields: Record<string, z.ZodTypeAny> = {}

    for (const field of fields) {
      const fieldSchema = this.generateFieldValidationSchema(field)
      schemaFields[field.field_name] = fieldSchema.optional()
    }

    return z.object(schemaFields)
  }

  /**
   * Generate query validation schema
   */

  private generateQueryValidationSchema(table: DataTableWithFields): z.ZodSchema {
    // table parameter reserved for future use - could be used for table-specific query parameters
    void table // Explicitly mark as unused to avoid ESLint errors
    return z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      sort: z.string().optional(),
      order: z.enum(['asc', 'desc']).optional(),
      search: z.string().optional(),
    })
  }

  /**
   * Generate params validation schema
   */

  private generateParamsValidationSchema(table: DataTableWithFields): z.ZodSchema {
    // table parameter reserved for future use - could be used for table-specific parameter validation
    void table // Explicitly mark as unused to avoid ESLint errors
    return z.object({
      id: z.string().uuid(),
    })
  }

  /**
   * Generate field validation schema
   */
  private generateFieldValidationSchema(field: DataField): z.ZodTypeAny {
    let baseSchema: z.ZodTypeAny

    switch (field.data_type) {
      case 'text':
        let textSchema = z.string()
        const maxLength = field.field_config?.max_length as number
        const minLength = field.field_config?.min_length as number
        if (maxLength) textSchema = textSchema.max(maxLength)
        if (minLength) textSchema = textSchema.min(minLength)
        baseSchema = textSchema
        break

      case 'number':
        let numberSchema = z.number()
        const max = field.field_config?.max_value as number
        const min = field.field_config?.min_value as number
        if (max !== undefined) numberSchema = numberSchema.max(max)
        if (min !== undefined) numberSchema = numberSchema.min(min)
        baseSchema = numberSchema
        break

      case 'date':
        baseSchema = z.string().datetime()
        break

      case 'boolean':
        baseSchema = z.boolean()
        break

      default:
        baseSchema = z.unknown()
    }

    return baseSchema
  }

  /**
   * Generate LIST endpoint
   */
  private generateListEndpoint(table: DataTableWithFields): GeneratedEndpoint {
    const tableName = table.table_name
    const capitalizedName = this.capitalize(table.name)

    return {
      method: 'GET',
      path: `/api/designer/tables/${tableName}`,
      handler: `list${capitalizedName}`,
      description: `Retrieve a paginated list of ${table.name}`,
      parameters: [
        {
          name: 'page',
          type: 'query',
          dataType: 'number',
          required: false,
          description: 'Page number (default: 1)',
        },
        {
          name: 'limit',
          type: 'query',
          dataType: 'number',
          required: false,
          description: 'Items per page (default: 20, max: 100)',
        },
        {
          name: 'sort',
          type: 'query',
          dataType: 'string',
          required: false,
          description: 'Field to sort by',
        },
        {
          name: 'order',
          type: 'query',
          dataType: 'string',
          required: false,
          description: 'Sort order (asc or desc)',
        },
        {
          name: 'search',
          type: 'query',
          dataType: 'string',
          required: false,
          description: 'Search term',
        },
      ],
      responses: [
        {
          statusCode: 200,
          description: `Successfully retrieved ${table.name} list`,
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: `#/components/schemas/${capitalizedName}Entity` },
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
        {
          statusCode: 400,
          description: 'Invalid query parameters',
          schema: { $ref: '#/components/schemas/Error' },
        },
      ],
    }
  }

  /**
   * Generate GET BY ID endpoint
   */
  private generateGetByIdEndpoint(table: DataTableWithFields): GeneratedEndpoint {
    const tableName = table.table_name
    const capitalizedName = this.capitalize(table.name)

    return {
      method: 'GET',
      path: `/api/designer/tables/${tableName}/{id}`,
      handler: `get${capitalizedName}ById`,
      description: `Retrieve a single ${table.name.slice(0, -1)} by ID`,
      parameters: [
        {
          name: 'id',
          type: 'path',
          dataType: 'string',
          required: true,
          description: `${table.name.slice(0, -1)} ID`,
        },
      ],
      responses: [
        {
          statusCode: 200,
          description: `Successfully retrieved ${table.name.slice(0, -1)}`,
          schema: { $ref: `#/components/schemas/${capitalizedName}Entity` },
        },
        {
          statusCode: 404,
          description: `${this.capitalize(table.name.slice(0, -1))} not found`,
          schema: { $ref: '#/components/schemas/Error' },
        },
      ],
    }
  }

  /**
   * Generate CREATE endpoint
   */
  private generateCreateEndpoint(table: DataTableWithFields): GeneratedEndpoint {
    const tableName = table.table_name
    const capitalizedName = this.capitalize(table.name)

    return {
      method: 'POST',
      path: `/api/designer/tables/${tableName}`,
      handler: `create${capitalizedName}`,
      description: `Create a new ${table.name.slice(0, -1)}`,
      parameters: [],
      requestBody: {
        contentType: 'application/json',
        schema: { $ref: `#/components/schemas/Create${capitalizedName}Request` },
        required: true,
      },
      responses: [
        {
          statusCode: 201,
          description: `Successfully created ${table.name.slice(0, -1)}`,
          schema: { $ref: `#/components/schemas/${capitalizedName}Entity` },
        },
        {
          statusCode: 400,
          description: 'Invalid request body',
          schema: { $ref: '#/components/schemas/Error' },
        },
        {
          statusCode: 422,
          description: 'Validation error',
          schema: { $ref: '#/components/schemas/ValidationError' },
        },
      ],
    }
  }

  /**
   * Generate UPDATE endpoint
   */
  private generateUpdateEndpoint(table: DataTableWithFields): GeneratedEndpoint {
    const tableName = table.table_name
    const capitalizedName = this.capitalize(table.name)

    return {
      method: 'PUT',
      path: `/api/designer/tables/${tableName}/{id}`,
      handler: `update${capitalizedName}`,
      description: `Update an existing ${table.name.slice(0, -1)}`,
      parameters: [
        {
          name: 'id',
          type: 'path',
          dataType: 'string',
          required: true,
          description: `${table.name.slice(0, -1)} ID`,
        },
      ],
      requestBody: {
        contentType: 'application/json',
        schema: { $ref: `#/components/schemas/Update${capitalizedName}Request` },
        required: true,
      },
      responses: [
        {
          statusCode: 200,
          description: `Successfully updated ${table.name.slice(0, -1)}`,
          schema: { $ref: `#/components/schemas/${capitalizedName}Entity` },
        },
        {
          statusCode: 404,
          description: `${this.capitalize(table.name.slice(0, -1))} not found`,
          schema: { $ref: '#/components/schemas/Error' },
        },
        {
          statusCode: 422,
          description: 'Validation error',
          schema: { $ref: '#/components/schemas/ValidationError' },
        },
      ],
    }
  }

  /**
   * Generate DELETE endpoint
   */
  private generateDeleteEndpoint(table: DataTableWithFields): GeneratedEndpoint {
    const tableName = table.table_name
    const capitalizedName = this.capitalize(table.name)

    return {
      method: 'DELETE',
      path: `/api/designer/tables/${tableName}/{id}`,
      handler: `delete${capitalizedName}`,
      description: `Delete an existing ${table.name.slice(0, -1)}`,
      parameters: [
        {
          name: 'id',
          type: 'path',
          dataType: 'string',
          required: true,
          description: `${table.name.slice(0, -1)} ID`,
        },
      ],
      responses: [
        {
          statusCode: 204,
          description: `Successfully deleted ${table.name.slice(0, -1)}`,
          schema: {},
        },
        {
          statusCode: 404,
          description: `${this.capitalize(table.name.slice(0, -1))} not found`,
          schema: { $ref: '#/components/schemas/Error' },
        },
        {
          statusCode: 409,
          description: `Cannot delete ${table.name.slice(0, -1)} due to foreign key constraints`,
          schema: { $ref: '#/components/schemas/Error' },
        },
      ],
    }
  }

  /**
   * Generate API documentation
   */
  private generateDocumentation(table: DataTableWithFields): APIDocumentation {
    const capitalizedName = this.capitalize(table.name)
    const entityName = table.name.slice(0, -1)

    return {
      summary: `${capitalizedName} Management API`,
      description: `Complete CRUD API for managing ${entityName} entities. This API provides endpoints for creating, reading, updating, and deleting ${entityName} records.`,
      tags: [capitalizedName, table.table_name],
      examples: [
        {
          title: `Create ${entityName}`,
          description: `Example of creating a new ${entityName}`,
          method: 'POST',
          path: `/api/designer/tables/${table.table_name}`,
          requestBody: this.generateCreateExample(table),
          response: this.generateEntityExample(table),
        },
        {
          title: `List ${table.name}`,
          description: `Example of listing ${entityName} records with pagination`,
          method: 'GET',
          path: `/api/designer/tables/${table.table_name}?page=1&limit=10`,
          response: {
            data: [this.generateEntityExample(table)],
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      ],
    }
  }

  /**
   * Generate create example
   */
  private generateCreateExample(table: DataTableWithFields): Record<string, unknown> {
    const example: Record<string, unknown> = {}
    const fields = table.fields?.filter(f => !f.is_primary_key) || []

    for (const field of fields) {
      if (field.is_required) {
        example[field.field_name] = this.generateFieldValueExample(field)
      }
    }

    return example
  }

  /**
   * Generate entity example
   */
  private generateEntityExample(table: DataTableWithFields): Record<string, unknown> {
    const example: Record<string, unknown> = {}
    const fields = table.fields || []

    for (const field of fields) {
      example[field.field_name] = this.generateFieldValueExample(field)
    }

    return example
  }

  /**
   * Generate field value example
   */
  private generateFieldValueExample(field: DataField): unknown {
    switch (field.data_type) {
      case 'text':
        if (field.field_name.includes('email')) return 'user@example.com'
        if (field.field_name.includes('name')) return 'Example Name'
        if (field.field_name.includes('description')) return 'Example description'
        return 'example text'

      case 'number':
        if (field.field_name.includes('id')) return 1
        if (field.field_name.includes('price') || field.field_name.includes('amount')) return 99.99
        return 42

      case 'date':
        return new Date().toISOString()

      case 'boolean':
        return field.field_name.includes('active') || field.field_name.includes('enabled')

      default:
        return null
    }
  }

  /**
   * Map data type to TypeScript type
   */
  private mapDataTypeToTypeScript(
    dataType: string,
    fieldConfig: Record<string, unknown> = {}
  ): string {
    switch (dataType) {
      case 'text':
        return 'string'
      case 'number':
        return (fieldConfig as { scale?: number }).scale &&
          (fieldConfig as { scale?: number }).scale! > 0
          ? 'number'
          : 'number'
      case 'date':
        return 'string' // ISO date string
      case 'boolean':
        return 'boolean'
      default:
        return 'unknown'
    }
  }

  /**
   * Capitalize first letter of string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Export generated API as OpenAPI specification
   */
  exportToOpenAPI(): OpenAPISpec {
    const openAPISpec: OpenAPISpec = {
      openapi: '3.0.0',
      info: {
        title: 'Generated Data Model API',
        version: '1.0.0',
        description: 'Auto-generated CRUD API for data model tables',
      },
      paths: {},
      components: {
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
          },
          ValidationError: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              fieldErrors: { type: 'object' },
            },
          },
        },
      },
    }

    // tableName from generatedAPIs iteration is reserved for future use
    // Currently using the generatedAPIs structure directly

    // Convert to proper OpenAPI format - this is a simplified implementation
    // In a full implementation, you would process all endpoints and types
    const pathsObject = openAPISpec.paths as Record<string, unknown>
    const schemasObject = (openAPISpec.components as { schemas: Record<string, unknown> }).schemas

    // Process all APIs to add to paths and schemas
    for (const [, api] of this.generatedAPIs) {
      // Add paths
      for (const endpoint of api.endpoints) {
        if (!pathsObject[endpoint.path]) {
          pathsObject[endpoint.path] = {}
        }

        const pathItem = pathsObject[endpoint.path] as Record<string, unknown>
        pathItem[endpoint.method.toLowerCase()] = {
          summary: endpoint.description,
          description: endpoint.description,
          tags: api.documentation.tags,
          parameters: endpoint.parameters.map(param => ({
            name: param.name,
            in: param.type,
            required: param.required,
            schema: { type: param.dataType },
            description: param.description,
          })),
          responses: endpoint.responses.reduce(
            (acc, response) => {
              acc[response.statusCode] = {
                description: response.description,
                content: {
                  'application/json': {
                    schema: response.schema,
                  },
                },
              }
              return acc
            },
            {} as Record<string, unknown>
          ),
        }

        // Add request body if present
        if (endpoint.requestBody) {
          const methodObject = pathItem[endpoint.method.toLowerCase()] as Record<string, unknown>
          methodObject.requestBody = {
            content: {
              [endpoint.requestBody.contentType]: {
                schema: endpoint.requestBody.schema,
              },
            },
            required: endpoint.requestBody.required,
          }
        }
      }

      // Add schemas
      for (const type of api.types) {
        schemasObject[type.name] = {
          type: 'object',
          description: type.description,
        }
      }
    }

    return openAPISpec
  }

  /**
   * Export generated API as TypeScript code
   */
  exportToTypeScript(): string {
    let code = `
// Auto-generated API types and validation schemas
// Generated at: ${new Date().toISOString()}

import { z } from 'zod'

`

    // Add types for each table
    for (const [tableName, api] of this.generatedAPIs) {
      code += `// ${api.documentation.summary}\n`

      // Add type definitions
      for (const type of api.types) {
        code += `${type.definition}\n\n`
      }

      // Add validation schemas
      if (api.validation.create) {
        code += `export const create${this.capitalize(tableName)}Schema = `
        code += `${this.getZodSchemaString(api.validation.create)}\n\n`
      }

      if (api.validation.update) {
        code += `export const update${this.capitalize(tableName)}Schema = `
        code += `${this.getZodSchemaString(api.validation.update)}\n\n`
      }

      if (api.validation.query) {
        code += `export const ${tableName}QuerySchema = `
        code += `${this.getZodSchemaString(api.validation.query)}\n\n`
      }
    }

    return code
  }

  /**
   * Convert Zod schema to string representation
   */

  private getZodSchemaString(schema: z.ZodSchema): string {
    // schema parameter reserved for future use - will be used to traverse and convert Zod schemas to string
    void schema // Explicitly mark as unused to avoid ESLint errors
    // This is a simplified version - in a real implementation,
    // you'd want to traverse the Zod schema and generate proper TypeScript code
    return 'z.object({ /* schema definition */ })'
  }
}

// Export utility functions
export const generateAPIForTables = (
  tables: DataTableWithFields[],
  relationships: TableRelationship[] = []
): Map<string, GeneratedAPI> => {
  const generator = new APIGenerator(tables, relationships)
  return generator.generateAllAPIs()
}

export const generateOpenAPISpec = (
  tables: DataTableWithFields[],
  relationships: TableRelationship[] = []
): OpenAPISpec => {
  const generator = new APIGenerator(tables, relationships)
  generator.generateAllAPIs()
  return generator.exportToOpenAPI()
}

export const generateTypeScriptAPIClient = (
  tables: DataTableWithFields[],
  relationships: TableRelationship[] = []
): string => {
  const generator = new APIGenerator(tables, relationships)
  generator.generateAllAPIs()
  return generator.exportToTypeScript()
}
