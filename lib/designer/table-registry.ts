/**
 * Table Registry for Dynamic Tables
 *
 * Purpose: Registry and schema management for dynamically generated tables
 * Author: Data Model Designer System
 * Version: 1.0.0
 */

import { createClient } from '@/lib/supabase/server'
import type { DataTableWithFields } from '@/types/designer/table'

// Table Schema Interface
export interface TableSchema {
  tableName: string
  projectId: string
  fields: TableFieldSchema[]
  relationships: TableRelationshipSchema[]
  searchableFields: string[]
  defaultSort: string
  defaultOrder: 'asc' | 'desc'
  createdAt: string
  updatedAt: string
}

export interface TableFieldSchema {
  id: string
  name: string
  field_name: string
  data_type: 'text' | 'number' | 'integer' | 'date' | 'boolean'
  is_required: boolean
  is_primary_key: boolean
  immutable: boolean
  default_value?: string
  field_config: Record<string, unknown>
  order: number
}

export interface TableRelationshipSchema {
  id: string
  source_table: string
  target_table: string
  source_field: string
  target_field: string
  relationship_type: 'one_to_many' | 'many_to_many' | 'one_to_one'
  cascade_config: {
    on_delete: 'cascade' | 'restrict' | 'set_null'
    on_update: 'cascade' | 'restrict'
  }
}

// Registry Cache
interface RegistryCache {
  schemas: Map<string, TableSchema>
  tables: Map<string, DataTableWithFields>
  lastUpdated: Map<string, number>
  ttl: number
}

class TableRegistry {
  private cache: RegistryCache = {
    schemas: new Map(),
    tables: new Map(),
    lastUpdated: new Map(),
    ttl: 5 * 60 * 1000, // 5 minutes
  }

  /**
   * Check if a table exists and is active
   */
  async validateTableExists(tableName: string): Promise<{
    isValid: boolean
    error?: string
    table?: DataTableWithFields
  }> {
    try {
      // Check cache first
      const cachedTable = this.cache.tables.get(tableName)
      const lastUpdated = this.cache.lastUpdated.get(tableName) || 0

      if (cachedTable && Date.now() - lastUpdated < this.cache.ttl) {
        if (cachedTable.status === 'active') {
          return { isValid: true, table: cachedTable }
        } else {
          return { isValid: false, error: `Table '${tableName}' is not active` }
        }
      }

      // Fetch from database
      const supabase = await createClient()

      const { data: table, error } = await supabase
        .from('data_tables')
        .select(
          `
          *,
          fields:data_fields(*)
        `
        )
        .eq('table_name', tableName)
        .eq('status', 'active')
        .single()

      if (error || !table) {
        return { isValid: false, error: `Table '${tableName}' not found or is not active` }
      }

      // Cache the result
      this.cache.tables.set(tableName, table)
      this.cache.lastUpdated.set(tableName, Date.now())

      return { isValid: true, table }
    } catch (error) {
      console.error('Error validating table exists:', error)
      return { isValid: false, error: 'Failed to validate table' }
    }
  }

  /**
   * Check if a record exists in a table
   */
  async validateRecordExists(
    tableName: string,
    recordId: string
  ): Promise<{
    isValid: boolean
    error?: string
  }> {
    try {
      const supabase = await createClient()

      const { data: record, error } = await supabase
        .from(tableName)
        .select('id')
        .eq('id', recordId)
        .single()

      if (error || !record) {
        return { isValid: false, error: 'Record not found' }
      }

      return { isValid: true }
    } catch (error) {
      console.error('Error validating record exists:', error)
      return { isValid: false, error: 'Failed to validate record' }
    }
  }

  /**
   * Get table schema for API operations
   */
  async getTableSchema(tableName: string): Promise<TableSchema> {
    try {
      // Check cache first
      const cachedSchema = this.cache.schemas.get(tableName)
      const lastUpdated = this.cache.lastUpdated.get(`${tableName}_schema`) || 0

      if (cachedSchema && Date.now() - lastUpdated < this.cache.ttl) {
        return cachedSchema
      }

      // Fetch table definition
      const tableValidation = await this.validateTableExists(tableName)
      if (!tableValidation.isValid || !tableValidation.table) {
        throw new Error(tableValidation.error || 'Table not found')
      }

      const table = tableValidation.table

      // Fetch relationships
      const supabase = await createClient()
      const { data: relationships, error: relError } = await supabase
        .from('table_relationships')
        .select('*')
        .or(`source_table_id.eq.${table.id},target_table_id.eq.${table.id}`)
        .eq('status', 'active')

      if (relError) {
        console.error('Error fetching relationships:', relError)
      }

      // Transform fields to schema format
      const fields: TableFieldSchema[] = (table.fields || []).map(
        field =>
          ({
            id: field.id,
            name: field.name,
            field_name: field.field_name,
            data_type: field.data_type as 'text' | 'number' | 'integer' | 'date' | 'boolean',
            is_required: field.is_required,
            is_primary_key: field.field_name === 'id' || field.is_primary_key,
            immutable: field.field_name === 'id' || field.field_name === 'created_at',
            default_value: field.default_value,
            field_config: field.field_config || {},
            order: field.order || 0,
          }) as TableFieldSchema
      )

      // Transform relationships to schema format
      const relationshipSchemas: TableRelationshipSchema[] = (relationships || []).map(rel => ({
        id: rel.id,
        source_table: rel.source_table_id === table.id ? tableName : 'other_table',
        target_table: rel.target_table_id === table.id ? tableName : 'other_table',
        source_field: rel.source_field_id,
        target_field: rel.target_field_id,
        relationship_type: rel.relationship_type,
        cascade_config: rel.cascade_config || {
          on_delete: 'restrict',
          on_update: 'cascade',
        },
      }))

      // Determine searchable fields
      const searchableFields = fields
        .filter(field => field.data_type === 'text' && !field.field_name.includes('id'))
        .map(field => field.field_name)

      // Create schema
      const schema: TableSchema = {
        tableName,
        projectId: table.project_id,
        fields,
        relationships: relationshipSchemas,
        searchableFields,
        defaultSort: 'created_at',
        defaultOrder: 'desc',
        createdAt: table.created_at,
        updatedAt: table.updated_at,
      }

      // Cache the schema
      this.cache.schemas.set(tableName, schema)
      this.cache.lastUpdated.set(`${tableName}_schema`, Date.now())

      return schema
    } catch (error) {
      console.error('Error getting table schema:', error)
      throw error
    }
  }

  /**
   * Get all active tables for a project
   */
  async getProjectTables(projectId: string): Promise<DataTableWithFields[]> {
    try {
      const supabase = await createClient()

      const { data: tables, error } = await supabase
        .from('data_tables')
        .select(
          `
          *,
          fields:data_fields(*)
        `
        )
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return tables || []
    } catch (error) {
      console.error('Error getting project tables:', error)
      throw error
    }
  }

  /**
   * Register a new table in the registry
   */
  async registerTable(table: DataTableWithFields): Promise<void> {
    try {
      // Update cache
      this.cache.tables.set(table.table_name, table)
      this.cache.lastUpdated.set(table.table_name, Date.now())

      // Invalidate schema cache to force refresh
      this.cache.schemas.delete(table.table_name)
      this.cache.lastUpdated.delete(`${table.table_name}_schema`)
    } catch (error) {
      console.error('Error registering table:', error)
      throw error
    }
  }

  /**
   * Update table registration
   */
  async updateTable(tableName: string, updates: Partial<DataTableWithFields>): Promise<void> {
    try {
      const cachedTable = this.cache.tables.get(tableName)
      if (cachedTable) {
        const updatedTable = { ...cachedTable, ...updates }
        this.cache.tables.set(tableName, updatedTable)
        this.cache.lastUpdated.set(tableName, Date.now())

        // Invalidate schema cache
        this.cache.schemas.delete(tableName)
        this.cache.lastUpdated.delete(`${tableName}_schema`)
      }
    } catch (error) {
      console.error('Error updating table registration:', error)
      throw error
    }
  }

  /**
   * Remove table from registry
   */
  async unregisterTable(tableName: string): Promise<void> {
    try {
      this.cache.tables.delete(tableName)
      this.cache.schemas.delete(tableName)
      this.cache.lastUpdated.delete(tableName)
      this.cache.lastUpdated.delete(`${tableName}_schema`)
    } catch (error) {
      console.error('Error unregistering table:', error)
      throw error
    }
  }

  /**
   * Clear cache for a specific table
   */
  clearTableCache(tableName: string): void {
    this.cache.tables.delete(tableName)
    this.cache.schemas.delete(tableName)
    this.cache.lastUpdated.delete(tableName)
    this.cache.lastUpdated.delete(`${tableName}_schema`)
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.schemas.clear()
    this.cache.tables.clear()
    this.cache.lastUpdated.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    tablesCount: number
    schemasCount: number
    lastUpdatedEntries: number
    ttl: number
  } {
    return {
      tablesCount: this.cache.tables.size,
      schemasCount: this.cache.schemas.size,
      lastUpdatedEntries: this.cache.lastUpdated.size,
      ttl: this.cache.ttl,
    }
  }

  /**
   * Check if a field is searchable
   */
  isFieldSearchable(tableName: string, fieldName: string): boolean {
    const schema = this.cache.schemas.get(tableName)
    return schema ? schema.searchableFields.includes(fieldName) : false
  }

  /**
   * Get default pagination settings
   */
  getDefaultPagination(): {
    defaultLimit: number
    maxLimit: number
    defaultSort: string
    defaultOrder: 'asc' | 'desc'
  } {
    return {
      defaultLimit: 20,
      maxLimit: 100,
      defaultSort: 'created_at',
      defaultOrder: 'desc',
    }
  }

  /**
   * Validate sort field
   */
  validateSortField(tableName: string, sortField: string): boolean {
    const schema = this.cache.schemas.get(tableName)
    if (!schema) return false

    return schema.fields.some(field => field.field_name === sortField)
  }

  /**
   * Get table fields by type
   */
  getFieldsByType(tableName: string, dataType: string): TableFieldSchema[] {
    const schema = this.cache.schemas.get(tableName)
    if (!schema) return []

    return schema.fields.filter(field => field.data_type === dataType)
  }

  /**
   * Get primary key field
   */
  getPrimaryKeyField(tableName: string): TableFieldSchema | null {
    const schema = this.cache.schemas.get(tableName)
    if (!schema) return null

    return schema.fields.find(field => field.is_primary_key) || null
  }

  /**
   * Get required fields
   */
  getRequiredFields(tableName: string): TableFieldSchema[] {
    const schema = this.cache.schemas.get(tableName)
    if (!schema) return []

    return schema.fields.filter(field => field.is_required && !field.is_primary_key)
  }

  /**
   * Get relationships for table
   */
  getTableRelationships(tableName: string): TableRelationshipSchema[] {
    const schema = this.cache.schemas.get(tableName)
    if (!schema) return []

    return schema.relationships
  }

  /**
   * Check if table has foreign key constraints
   */
  hasForeignKeyConstraints(tableName: string): boolean {
    const relationships = this.getTableRelationships(tableName)
    return relationships.length > 0
  }
}

// Singleton instance
const tableRegistry = new TableRegistry()

// Export convenience functions
export const validateTableExists = (tableName: string) =>
  tableRegistry.validateTableExists(tableName)

export const validateRecordExists = (tableName: string, recordId: string) =>
  tableRegistry.validateRecordExists(tableName, recordId)

export const getTableSchema = (tableName: string) => tableRegistry.getTableSchema(tableName)

export const getProjectTables = (projectId: string) => tableRegistry.getProjectTables(projectId)

export const registerTable = (table: DataTableWithFields) => tableRegistry.registerTable(table)

export const updateTable = (tableName: string, updates: Partial<DataTableWithFields>) =>
  tableRegistry.updateTable(tableName, updates)

export const unregisterTable = (tableName: string) => tableRegistry.unregisterTable(tableName)

export const clearTableCache = (tableName: string) => tableRegistry.clearTableCache(tableName)

export const clearAllCache = () => tableRegistry.clearCache()

export const getCacheStats = () => tableRegistry.getCacheStats()

// Export the registry instance for advanced usage
export { tableRegistry }
export default tableRegistry
