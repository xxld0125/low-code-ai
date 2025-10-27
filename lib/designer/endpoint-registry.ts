/**
 * API Endpoint Registry System
 *
 * Purpose: Manage registration, discovery, and lifecycle of dynamic API endpoints
 * Author: Data Model Designer System
 * Version: 1.0.0
 */

import { APIGenerator, generateAPIForTables } from './api-generator'
import { tableRegistry } from './table-registry'
import type { DataTableWithFields } from '@/types/designer/table'
import type { TableRelationship } from '@/types/designer/relationship'
import type { GeneratedEndpoint } from './api-generator'

// OpenAPI type definitions
interface OpenAPIPathItem {
  get?: Record<string, unknown>
  post?: Record<string, unknown>
  put?: Record<string, unknown>
  patch?: Record<string, unknown>
  delete?: Record<string, unknown>
  head?: Record<string, unknown>
  options?: Record<string, unknown>
  'x-rateLimit'?: Record<string, unknown>
  'x-cache'?: Record<string, unknown>
  [key: string]: Record<string, unknown> | undefined
}

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, OpenAPIPathItem>
  components: {
    schemas: Record<string, unknown>
    securitySchemes?: Record<string, unknown>
  }
  security?: Array<Record<string, string[]>>
}

// Endpoint Registration Interface
export interface RegisteredEndpoint {
  id: string
  path: string
  method: string
  handler: string
  tableName: string
  projectId: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  metadata: {
    tags: string[]
    version: string
    documentation: string
    examples: Record<string, unknown>[]
  }
}

export interface EndpointRegistration {
  endpointId: string
  tableName: string
  projectId: string
  endpoint: GeneratedEndpoint
  isActive: boolean
  customHandler?: string
  middlewares: string[]
  rateLimiting?: {
    requests: number
    window: number // in seconds
  }
  authentication?: {
    required: boolean
    roles: string[]
    permissions: string[]
  }
  caching?: {
    enabled: boolean
    ttl: number // in seconds
  }
}

export interface EndpointRegistryConfig {
  autoRegister: boolean
  enableCaching: boolean
  enableRateLimiting: boolean
  enableAuthentication: boolean
  defaultCacheTTL: number
  defaultRateLimit: {
    requests: number
    window: number
  }
  apiVersion: string
  basePath: string
}

// Registry Implementation
class EndpointRegistry {
  private registeredEndpoints: Map<string, RegisteredEndpoint> = new Map()
  private endpointRegistrations: Map<string, EndpointRegistration> = new Map()
  private apiGenerator: APIGenerator
  private config: EndpointRegistryConfig

  constructor(config: Partial<EndpointRegistryConfig> = {}) {
    this.config = {
      autoRegister: true,
      enableCaching: true,
      enableRateLimiting: false,
      enableAuthentication: true,
      defaultCacheTTL: 300, // 5 minutes
      defaultRateLimit: {
        requests: 100,
        window: 60, // 1 minute
      },
      apiVersion: 'v1',
      basePath: '/api/designer/tables',
      ...config,
    }

    this.apiGenerator = new APIGenerator([], [])
  }

  /**
   * Register all endpoints for a table
   */
  async registerTableEndpoints(
    table: DataTableWithFields,
    relationships: TableRelationship[] = []
  ): Promise<RegisteredEndpoint[]> {
    try {
      // Update API generator with latest table data
      const tables = await tableRegistry.getProjectTables(table.project_id)
      this.apiGenerator = new APIGenerator(tables, relationships)

      // Generate API for the table
      const generatedAPIs = generateAPIForTables([table], relationships)
      const tableAPI = generatedAPIs.get(table.table_name)

      if (!tableAPI) {
        throw new Error(`Failed to generate API for table: ${table.table_name}`)
      }

      const registeredEndpoints: RegisteredEndpoint[] = []

      // Register each endpoint
      for (const endpoint of tableAPI.endpoints) {
        const registeredEndpoint = await this.registerEndpoint(table, endpoint)
        registeredEndpoints.push(registeredEndpoint)
      }

      // Register table in registry
      await tableRegistry.registerTable(table)

      return registeredEndpoints
    } catch (error) {
      console.error(`Error registering endpoints for table ${table.table_name}:`, error)
      throw error
    }
  }

  /**
   * Register a single endpoint
   */
  async registerEndpoint(
    table: DataTableWithFields,
    endpoint: GeneratedEndpoint
  ): Promise<RegisteredEndpoint> {
    try {
      const endpointId = this.generateEndpointId(table.table_name, endpoint.method, endpoint.path)
      const fullPath = this.buildFullPath(endpoint.path)

      const registeredEndpoint: RegisteredEndpoint = {
        id: endpointId,
        path: fullPath,
        method: endpoint.method,
        handler: endpoint.handler,
        tableName: table.table_name,
        projectId: table.project_id,
        description: endpoint.description,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          tags: [table.table_name, this.config.apiVersion],
          version: this.config.apiVersion,
          documentation: endpoint.description,
          examples: [],
        },
      }

      // Store in registry
      this.registeredEndpoints.set(endpointId, registeredEndpoint)

      // Create endpoint registration with default settings
      const registration: EndpointRegistration = {
        endpointId,
        tableName: table.table_name,
        projectId: table.project_id,
        endpoint,
        isActive: true,
        middlewares: [],
        ...this.getDefaultEndpointSettings(),
      }

      this.endpointRegistrations.set(endpointId, registration)

      console.log(
        `Registered endpoint: ${endpoint.method} ${fullPath} for table ${table.table_name}`
      )

      return registeredEndpoint
    } catch (error) {
      console.error('Error registering endpoint:', error)
      throw error
    }
  }

  /**
   * Unregister all endpoints for a table
   */
  async unregisterTableEndpoints(tableName: string): Promise<void> {
    try {
      const endpointsToRemove: string[] = []

      // Find all endpoints for the table
      for (const [endpointId, endpoint] of this.registeredEndpoints) {
        if (endpoint.tableName === tableName) {
          endpointsToRemove.push(endpointId)
        }
      }

      // Remove endpoints
      for (const endpointId of endpointsToRemove) {
        this.registeredEndpoints.delete(endpointId)
        this.endpointRegistrations.delete(endpointId)
      }

      // Remove table from registry
      await tableRegistry.unregisterTable(tableName)

      console.log(`Unregistered ${endpointsToRemove.length} endpoints for table ${tableName}`)
    } catch (error) {
      console.error(`Error unregistering endpoints for table ${tableName}:`, error)
      throw error
    }
  }

  /**
   * Update endpoint registration
   */
  async updateEndpointRegistration(
    endpointId: string,
    updates: Partial<EndpointRegistration>
  ): Promise<void> {
    try {
      const existingRegistration = this.endpointRegistrations.get(endpointId)
      if (!existingRegistration) {
        throw new Error(`Endpoint registration not found: ${endpointId}`)
      }

      const updatedRegistration: EndpointRegistration = {
        ...existingRegistration,
        ...updates,
      }

      this.endpointRegistrations.set(endpointId, updatedRegistration)

      // Update registered endpoint if needed
      if (updates.isActive !== undefined) {
        const registeredEndpoint = this.registeredEndpoints.get(endpointId)
        if (registeredEndpoint) {
          const updatedRegisteredEndpoint: RegisteredEndpoint = {
            ...registeredEndpoint,
            isActive: updates.isActive,
            updatedAt: new Date().toISOString(),
          }
          this.registeredEndpoints.set(endpointId, updatedRegisteredEndpoint)
        }
      }

      console.log(`Updated endpoint registration: ${endpointId}`)
    } catch (error) {
      console.error(`Error updating endpoint registration ${endpointId}:`, error)
      throw error
    }
  }

  /**
   * Get all registered endpoints
   */
  getAllEndpoints(): RegisteredEndpoint[] {
    return Array.from(this.registeredEndpoints.values())
  }

  /**
   * Get endpoints for a specific table
   */
  getTableEndpoints(tableName: string): RegisteredEndpoint[] {
    return Array.from(this.registeredEndpoints.values()).filter(
      endpoint => endpoint.tableName === tableName
    )
  }

  /**
   * Get endpoints for a specific project
   */
  getProjectEndpoints(projectId: string): RegisteredEndpoint[] {
    return Array.from(this.registeredEndpoints.values()).filter(
      endpoint => endpoint.projectId === projectId
    )
  }

  /**
   * Get endpoint by ID
   */
  getEndpoint(endpointId: string): RegisteredEndpoint | null {
    return this.registeredEndpoints.get(endpointId) || null
  }

  /**
   * Get endpoint registration by ID
   */
  getEndpointRegistration(endpointId: string): EndpointRegistration | null {
    return this.endpointRegistrations.get(endpointId) || null
  }

  /**
   * Find endpoint by path and method
   */
  findEndpoint(path: string, method: string): RegisteredEndpoint | null {
    const normalizedPath = this.normalizePath(path)

    for (const endpoint of this.registeredEndpoints.values()) {
      if (
        endpoint.path === normalizedPath &&
        endpoint.method.toUpperCase() === method.toUpperCase()
      ) {
        return endpoint
      }
    }

    return null
  }

  /**
   * Check if endpoint exists
   */
  endpointExists(path: string, method: string): boolean {
    return this.findEndpoint(path, method) !== null
  }

  /**
   * Activate/deactivate endpoint
   */
  async setEndpointActive(endpointId: string, isActive: boolean): Promise<void> {
    await this.updateEndpointRegistration(endpointId, { isActive })
  }

  /**
   * Get endpoint statistics
   */
  getEndpointStats(): {
    totalEndpoints: number
    activeEndpoints: number
    endpointsByMethod: Record<string, number>
    endpointsByTable: Record<string, number>
    endpointsByProject: Record<string, number>
  } {
    const endpoints = Array.from(this.registeredEndpoints.values())

    const endpointsByMethod: Record<string, number> = {}
    const endpointsByTable: Record<string, number> = {}
    const endpointsByProject: Record<string, number> = {}

    for (const endpoint of endpoints) {
      endpointsByMethod[endpoint.method] = (endpointsByMethod[endpoint.method] || 0) + 1
      endpointsByTable[endpoint.tableName] = (endpointsByTable[endpoint.tableName] || 0) + 1
      endpointsByProject[endpoint.projectId] = (endpointsByProject[endpoint.projectId] || 0) + 1
    }

    return {
      totalEndpoints: endpoints.length,
      activeEndpoints: endpoints.filter(e => e.isActive).length,
      endpointsByMethod,
      endpointsByTable,
      endpointsByProject,
    }
  }

  /**
   * Export endpoint registry as OpenAPI spec
   */
  exportToOpenAPI(): OpenAPISpec {
    const openAPISpec: OpenAPISpec = {
      openapi: '3.0.0',
      info: {
        title: 'Dynamic Data Model API',
        version: this.config.apiVersion,
        description: 'Auto-generated API for dynamic data model tables',
      },
      servers: [
        {
          url: this.config.basePath,
          description: 'Dynamic API endpoints',
        },
      ],
      paths: {},
      components: {
        schemas: {
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              requestId: { type: 'string' },
            },
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: this.config.enableAuthentication ? [{ bearerAuth: [] }] : [],
    }

    // Add endpoints to OpenAPI spec
    for (const endpoint of this.registeredEndpoints.values()) {
      if (!endpoint.isActive) continue

      if (!openAPISpec.paths[endpoint.path]) {
        openAPISpec.paths[endpoint.path] = {}
      }

      const registration = this.endpointRegistrations.get(endpoint.id)

      openAPISpec.paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        description: endpoint.description,
        tags: endpoint.metadata.tags,
        operationId: endpoint.handler,
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
        parameters: [],
        security: this.config.enableAuthentication ? [{ bearerAuth: [] }] : [],
      }

      // Add rate limiting information
      if (registration?.rateLimiting) {
        const methodSpec = openAPISpec.paths[endpoint.path][endpoint.method.toLowerCase()]
        if (methodSpec) {
          methodSpec['x-rateLimit'] = {
            requests: registration.rateLimiting.requests,
            window: registration.rateLimiting.window,
          }
        }
      }

      // Add caching information
      if (registration?.caching?.enabled) {
        const methodSpec = openAPISpec.paths[endpoint.path][endpoint.method.toLowerCase()]
        if (methodSpec) {
          methodSpec['x-cache'] = {
            enabled: true,
            ttl: registration.caching.ttl,
          }
        }
      }
    }

    return openAPISpec
  }

  /**
   * Sync registry with database tables
   */
  async syncWithDatabase(projectId?: string): Promise<{
    added: number
    updated: number
    removed: number
  }> {
    try {
      let tables: DataTableWithFields[] = []

      if (projectId) {
        tables = await tableRegistry.getProjectTables(projectId)
      } else {
        // TODO: Implement proper cross-project table fetching
        // For now, return empty tables array when no project specified
        tables = []
      }

      let added = 0
      let updated = 0
      let removed = 0

      const currentTableNames = new Set(tables.map(t => t.table_name))
      const registeredTableNames = new Set(
        Array.from(this.registeredEndpoints.values()).map(e => e.tableName)
      )

      // Add new tables
      for (const table of tables) {
        if (!registeredTableNames.has(table.table_name)) {
          await this.registerTableEndpoints(table)
          added++
        } else {
          // TODO: Check if table schema has changed and update endpoints
          updated++
        }
      }

      // Remove tables that no longer exist
      for (const tableName of registeredTableNames) {
        if (!currentTableNames.has(tableName)) {
          await this.unregisterTableEndpoints(tableName)
          removed++
        }
      }

      console.log(`Registry sync completed: +${added} ~${updated} -${removed}`)

      return { added, updated, removed }
    } catch (error) {
      console.error('Error syncing registry with database:', error)
      throw error
    }
  }

  // Private helper methods
  private generateEndpointId(tableName: string, method: string, path: string): string {
    const normalizedPath = path.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '')
    return `${tableName}_${method.toLowerCase()}_${normalizedPath}`
  }

  private buildFullPath(path: string): string {
    return `${this.config.basePath}${path}`
  }

  private normalizePath(path: string): string {
    // Remove query parameters and normalize
    const [pathWithoutQuery] = path.split('?')
    return pathWithoutQuery.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  }

  private getDefaultEndpointSettings(): Partial<EndpointRegistration> {
    return {
      middlewares: [],
      rateLimiting: this.config.enableRateLimiting ? this.config.defaultRateLimit : undefined,
      authentication: this.config.enableAuthentication
        ? {
            required: true,
            roles: [],
            permissions: [],
          }
        : undefined,
      caching: this.config.enableCaching
        ? {
            enabled: true,
            ttl: this.config.defaultCacheTTL,
          }
        : undefined,
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.registeredEndpoints.clear()
    this.endpointRegistrations.clear()
  }
}

// Singleton instance
const endpointRegistry = new EndpointRegistry()

// Export convenience functions
export const registerTableEndpoints = (
  table: DataTableWithFields,
  relationships?: TableRelationship[]
) => endpointRegistry.registerTableEndpoints(table, relationships)

export const unregisterTableEndpoints = (tableName: string) =>
  endpointRegistry.unregisterTableEndpoints(tableName)

export const updateEndpointRegistration = (
  endpointId: string,
  updates: Partial<EndpointRegistration>
) => endpointRegistry.updateEndpointRegistration(endpointId, updates)

export const getAllEndpoints = () => endpointRegistry.getAllEndpoints()

export const getTableEndpoints = (tableName: string) =>
  endpointRegistry.getTableEndpoints(tableName)

export const getProjectEndpoints = (projectId: string) =>
  endpointRegistry.getProjectEndpoints(projectId)

export const findEndpoint = (path: string, method: string) =>
  endpointRegistry.findEndpoint(path, method)

export const endpointExists = (path: string, method: string) =>
  endpointRegistry.endpointExists(path, method)

export const setEndpointActive = (endpointId: string, isActive: boolean) =>
  endpointRegistry.setEndpointActive(endpointId, isActive)

export const getEndpointStats = () => endpointRegistry.getEndpointStats()

export const exportToOpenAPI = () => endpointRegistry.exportToOpenAPI()

export const syncWithDatabase = (projectId?: string) => endpointRegistry.syncWithDatabase(projectId)

export const clearCache = () => endpointRegistry.clearCache()

// Export the registry instance for advanced usage
export { endpointRegistry }
export default endpointRegistry
