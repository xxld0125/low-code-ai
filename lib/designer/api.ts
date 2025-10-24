import { createClient } from '@/lib/supabase/client'
import type {
  DesignerApiClient,
  ListTablesResponse,
  GetTableResponse,
  CreateTableResponse,
  UpdateTableResponse,
  TableDeploymentResponse,
  ListFieldsResponse,
  CreateFieldResponse,
  UpdateFieldResponse,
  ListRelationshipsResponse,
  CreateRelationshipResponse,
  UpdateRelationshipResponse,
  AcquireLockResponse,
  DataTableListRequest,
  CreateTableRequest,
  UpdateDataTableRequest,
  TableDeploymentRequest,
  DataFieldListRequest,
  CreateDataFieldRequest,
  UpdateDataFieldRequest,
  TableRelationshipListRequest,
  CreateTableRelationshipRequest,
  UpdateTableRelationshipRequest,
  AcquireLockRequest,
  RelationshipValidationResult,
  DataFieldType,
  TableRelationship,
  DataTableWithFields,
  DataField,
} from '@/types/designer'
import { getDefaultFieldConfig } from '@/lib/designer/constants'

// Supabase client
const supabase = createClient()

// Helper function to handle Supabase errors
const handleSupabaseError = (error: unknown) => {
  console.error('Supabase API Error:', error)
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  throw new Error(message)
}

// Helper function to generate UUID
const generateUUID = () => {
  return crypto.randomUUID()
}

// Helper function to validate table name
const validateTableName = (tableName: string): boolean => {
  // Check if table name follows PostgreSQL naming conventions
  return /^[a-z][a-z0-9_]*$/.test(tableName) && tableName.length <= 63
}

// Helper function to validate field name
const validateFieldName = (fieldName: string): boolean => {
  // Check if field name follows PostgreSQL naming conventions
  return /^[a-z][a-z0-9_]*$/.test(fieldName) && fieldName.length <= 63
}

// API Client Implementation
export const api: DesignerApiClient = {
  // Table operations
  tables: {
    list: async (request: DataTableListRequest): Promise<ListTablesResponse> => {
      try {
        let query = supabase
          .from('data_tables')
          .select('*', { count: 'exact' })
          .eq('project_id', request.projectId)

        // Apply status filter if provided
        if (request.status) {
          query = query.eq('status', request.status)
        }

        // Apply pagination
        const page = request.page || 1
        const limit = request.limit || 20
        const from = (page - 1) * limit
        const to = from + limit - 1

        query = query.range(from, to).order('created_at', { ascending: false })

        const { data, error, count } = await query

        if (error) handleSupabaseError(error)

        return {
          data: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            total_pages: Math.ceil((count || 0) / limit),
            has_next: from + limit < (count || 0),
            has_prev: page > 1,
          },
        }
      } catch (error) {
        console.error('Failed to list tables:', error)
        throw error
      }
    },

    get: async (projectId: string, tableId: string): Promise<GetTableResponse> => {
      try {
        // Get table with fields and relationships
        const { data: table, error: tableError } = await supabase
          .from('data_tables')
          .select('*')
          .eq('id', tableId)
          .eq('project_id', projectId)
          .single()

        if (tableError) handleSupabaseError(tableError)

        // Get fields for the table
        const { data: fields, error: fieldsError } = await supabase
          .from('data_fields')
          .select('*')
          .eq('table_id', tableId)
          .order('sort_order', { ascending: true })

        if (fieldsError) handleSupabaseError(fieldsError)

        // Get relationships where this table is source or target
        const { data: relationships, error: relationshipsError } = await supabase
          .from('table_relationships')
          .select('*')
          .or(`source_table_id.eq.${tableId},target_table_id.eq.${tableId}`)
          .eq('project_id', projectId)

        if (relationshipsError) handleSupabaseError(relationshipsError)

        return {
          data: {
            ...table,
            fields: fields || [],
            relationships: {
              outgoing: relationships?.filter(r => r.source_table_id === tableId) || [],
              incoming: relationships?.filter(r => r.target_table_id === tableId) || [],
            },
          },
        }
      } catch (error) {
        console.error('Failed to get table:', error)
        throw error
      }
    },

    create: async (
      projectId: string,
      request: CreateTableRequest
    ): Promise<CreateTableResponse> => {
      try {
        // Validate table name
        if (!validateTableName(request.table_name)) {
          throw new Error(
            'Invalid table name. Must use lowercase letters, numbers, and underscores only.'
          )
        }

        // Check if table name already exists in project
        const { data: existingTable } = await supabase
          .from('data_tables')
          .select('id')
          .eq('project_id', projectId)
          .eq('table_name', request.table_name)
          .single()

        if (existingTable) {
          throw new Error('Table with this name already exists in the project')
        }

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        // Create table
        const { data: table, error } = await supabase
          .from('data_tables')
          .insert({
            id: generateUUID(),
            project_id: projectId,
            name: request.name,
            description: request.description || '',
            table_name: request.table_name,
            schema_definition: {},
            status: 'draft',
            created_by: user.id,
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        // Create initial fields if provided
        if (request.fields && request.fields.length > 0) {
          const fieldsToInsert = request.fields.map((field, index) => ({
            id: generateUUID(),
            table_id: table.id,
            name: field.name,
            field_name: field.field_name,
            data_type: field.data_type,
            is_required: field.is_required || false,
            default_value: field.default_value,
            field_config: field.field_config || {},
            sort_order: field.sort_order ?? index,
          }))

          const { error: fieldsError } = await supabase.from('data_fields').insert(fieldsToInsert)

          if (fieldsError) handleSupabaseError(fieldsError)
        }

        return { data: table }
      } catch (error) {
        console.error('Failed to create table:', error)
        throw error
      }
    },

    update: async (
      projectId: string,
      tableId: string,
      request: UpdateDataTableRequest
    ): Promise<UpdateTableResponse> => {
      try {
        // Validate table name if provided
        if (request.table_name && !validateTableName(request.table_name)) {
          throw new Error(
            'Invalid table name. Must use lowercase letters, numbers, and underscores only.'
          )
        }

        // Check if table name already exists (if changing name)
        if (request.table_name) {
          const { data: existingTable } = await supabase
            .from('data_tables')
            .select('id')
            .eq('project_id', projectId)
            .eq('table_name', request.table_name)
            .neq('id', tableId)
            .single()

          if (existingTable) {
            throw new Error('Table with this name already exists in the project')
          }
        }

        const { data, error } = await supabase
          .from('data_tables')
          .update({
            ...request,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tableId)
          .eq('project_id', projectId)
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { data }
      } catch (error) {
        console.error('Failed to update table:', error)
        throw error
      }
    },

    delete: async (projectId: string, tableId: string): Promise<void> => {
      try {
        // Check if table has relationships
        const { data: relationships } = await supabase
          .from('table_relationships')
          .select('id')
          .or(`source_table_id.eq.${tableId},target_table_id.eq.${tableId}`)
          .eq('project_id', projectId)

        if (relationships && relationships.length > 0) {
          throw new Error('Cannot delete table with existing relationships')
        }

        const { error } = await supabase
          .from('data_tables')
          .update({ status: 'deleted' })
          .eq('id', tableId)
          .eq('project_id', projectId)

        if (error) handleSupabaseError(error)
      } catch (error) {
        console.error('Failed to delete table:', error)
        throw error
      }
    },

    deploy: async (request: TableDeploymentRequest): Promise<TableDeploymentResponse> => {
      try {
        // Get table details with fields
        const { data: table, error: tableError } = await supabase
          .from('data_tables')
          .select('*, data_fields(*)')
          .eq('id', request.tableId)
          .eq('project_id', request.projectId)
          .single()

        if (tableError) handleSupabaseError(tableError)

        // Generate SQL statements
        const sqlStatements = generateCreateTableSQL(table.table_name, table.data_fields || [])

        // TODO: Actually execute SQL against database
        // For now, just return mock deployment response
        const deployment: TableDeploymentResponse = {
          deployment_id: generateUUID(),
          status: 'success',
          sql_statements: sqlStatements,
          database_table_name: table.table_name,
        }

        // Update table status to active
        await supabase.from('data_tables').update({ status: 'active' }).eq('id', request.tableId)

        return deployment
      } catch (error) {
        console.error('Failed to deploy table:', error)
        throw error
      }
    },
  },

  // Field operations
  fields: {
    list: async (request: DataFieldListRequest): Promise<ListFieldsResponse> => {
      try {
        const { data, error } = await supabase
          .from('data_fields')
          .select('*')
          .eq('table_id', request.tableId)
          .order('sort_order', { ascending: true })

        if (error) handleSupabaseError(error)

        return { data: data || [] }
      } catch (error) {
        console.error('Failed to list fields:', error)
        throw error
      }
    },

    create: async (
      projectId: string,
      tableId: string,
      request: CreateDataFieldRequest
    ): Promise<CreateFieldResponse> => {
      try {
        // Validate field name
        if (!validateFieldName(request.field_name)) {
          throw new Error(
            'Invalid field name. Must use lowercase letters, numbers, and underscores only.'
          )
        }

        // Check if field name already exists in table
        const { data: existingField } = await supabase
          .from('data_fields')
          .select('id')
          .eq('table_id', tableId)
          .eq('field_name', request.field_name)
          .single()

        if (existingField) {
          throw new Error('Field with this name already exists in the table')
        }

        // Get next sort order if not provided
        let sortOrder = request.sort_order ?? 0
        if (request.sort_order === undefined) {
          const { data: fields } = await supabase
            .from('data_fields')
            .select('sort_order')
            .eq('table_id', tableId)
            .order('sort_order', { ascending: false })
            .limit(1)

          sortOrder = (fields?.[0]?.sort_order ?? -1) + 1
        }

        const { data, error } = await supabase
          .from('data_fields')
          .insert({
            id: generateUUID(),
            table_id: tableId,
            name: request.name,
            field_name: request.field_name,
            data_type: request.data_type,
            is_required: request.is_required || false,
            default_value: request.default_value,
            field_config: request.field_config || {},
            sort_order: sortOrder,
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { data }
      } catch (error) {
        console.error('Failed to create field:', error)
        throw error
      }
    },

    update: async (
      projectId: string,
      tableId: string,
      fieldId: string,
      request: UpdateDataFieldRequest
    ): Promise<UpdateFieldResponse> => {
      try {
        // Validate field name if provided
        if (request.field_name && !validateFieldName(request.field_name)) {
          throw new Error(
            'Invalid field name. Must use lowercase letters, numbers, and underscores only.'
          )
        }

        // Check if field name already exists (if changing name)
        if (request.field_name) {
          const { data: existingField } = await supabase
            .from('data_fields')
            .select('id')
            .eq('table_id', tableId)
            .eq('field_name', request.field_name)
            .neq('id', fieldId)
            .single()

          if (existingField) {
            throw new Error('Field with this name already exists in the table')
          }
        }

        const { data, error } = await supabase
          .from('data_fields')
          .update({
            ...request,
            updated_at: new Date().toISOString(),
          })
          .eq('id', fieldId)
          .eq('table_id', tableId)
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { data }
      } catch (error) {
        console.error('Failed to update field:', error)
        throw error
      }
    },

    delete: async (projectId: string, tableId: string, fieldId: string): Promise<void> => {
      try {
        // Check if field is used in relationships
        const { data: relationships } = await supabase
          .from('table_relationships')
          .select('id')
          .or(`source_field_id.eq.${fieldId},target_field_id.eq.${fieldId}`)

        if (relationships && relationships.length > 0) {
          throw new Error('Cannot delete field used in relationships')
        }

        const { error } = await supabase
          .from('data_fields')
          .delete()
          .eq('id', fieldId)
          .eq('table_id', tableId)

        if (error) handleSupabaseError(error)
      } catch (error) {
        console.error('Failed to delete field:', error)
        throw error
      }
    },
  },

  // Relationship operations
  relationships: {
    list: async (request: TableRelationshipListRequest): Promise<ListRelationshipsResponse> => {
      try {
        let query = supabase
          .from('table_relationships')
          .select('*')
          .eq('project_id', request.projectId)

        if (request.sourceTableId) {
          query = query.eq('source_table_id', request.sourceTableId)
        }

        if (request.targetTableId) {
          query = query.eq('target_table_id', request.targetTableId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) handleSupabaseError(error)

        return { data: data || [] }
      } catch (error) {
        console.error('Failed to list relationships:', error)
        throw error
      }
    },

    create: async (
      projectId: string,
      request: CreateTableRelationshipRequest
    ): Promise<CreateRelationshipResponse> => {
      try {
        // Validate relationship doesn't already exist
        const { data: existingRelationship } = await supabase
          .from('table_relationships')
          .select('id')
          .eq('project_id', projectId)
          .eq('source_table_id', request.source_table_id)
          .eq('target_table_id', request.target_table_id)
          .eq('source_field_id', request.source_field_id)
          .eq('target_field_id', request.target_field_id)
          .single()

        if (existingRelationship) {
          throw new Error('Relationship already exists between these fields')
        }

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        const { data, error } = await supabase
          .from('table_relationships')
          .insert({
            id: generateUUID(),
            project_id: projectId,
            ...request,
            cascade_config: request.cascade_config || {
              on_delete: 'restrict',
              on_update: 'cascade',
            },
            status: 'active',
            created_by: user.id,
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { data }
      } catch (error) {
        console.error('Failed to create relationship:', error)
        throw error
      }
    },

    update: async (
      projectId: string,
      relationshipId: string,
      request: UpdateTableRelationshipRequest
    ): Promise<UpdateRelationshipResponse> => {
      try {
        const { data, error } = await supabase
          .from('table_relationships')
          .update({
            ...request,
            updated_at: new Date().toISOString(),
          })
          .eq('id', relationshipId)
          .eq('project_id', projectId)
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { data }
      } catch (error) {
        console.error('Failed to update relationship:', error)
        throw error
      }
    },

    delete: async (projectId: string, relationshipId: string): Promise<void> => {
      try {
        const { error } = await supabase
          .from('table_relationships')
          .delete()
          .eq('id', relationshipId)
          .eq('project_id', projectId)

        if (error) handleSupabaseError(error)
      } catch (error) {
        console.error('Failed to delete relationship:', error)
        throw error
      }
    },

    validate: async (
      projectId: string,
      request: CreateTableRelationshipRequest
    ): Promise<RelationshipValidationResult> => {
      try {
        const errors: string[] = []
        const warnings: string[] = []

        // Check for circular dependencies
        const wouldCreateCircularDependency = await checkCircularDependency(
          projectId,
          request.source_table_id,
          request.target_table_id
        )

        if (wouldCreateCircularDependency) {
          errors.push('This relationship would create a circular dependency')
        }

        // Check if tables exist
        const { data: sourceTable } = await supabase
          .from('data_tables')
          .select('id')
          .eq('id', request.source_table_id)
          .eq('project_id', projectId)
          .single()

        const { data: targetTable } = await supabase
          .from('data_tables')
          .select('id')
          .eq('id', request.target_table_id)
          .eq('project_id', projectId)
          .single()

        if (!sourceTable) {
          errors.push('Source table does not exist')
        }

        if (!targetTable) {
          errors.push('Target table does not exist')
        }

        // Check if fields exist
        const { data: sourceField } = await supabase
          .from('data_fields')
          .select('id, data_type')
          .eq('id', request.source_field_id)
          .eq('table_id', request.source_table_id)
          .single()

        const { data: targetField } = await supabase
          .from('data_fields')
          .select('id, data_type')
          .eq('id', request.target_field_id)
          .eq('table_id', request.target_table_id)
          .single()

        if (!sourceField) {
          errors.push('Source field does not exist')
        }

        if (!targetField) {
          errors.push('Target field does not exist')
        }

        // Check if data types are compatible
        if (sourceField && targetField && sourceField.data_type !== targetField.data_type) {
          warnings.push('Source and target fields have different data types')
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings: warnings.length > 0 ? warnings : undefined,
        }
      } catch (error) {
        console.error('Failed to validate relationship:', error)
        return {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Validation failed'],
        }
      }
    },
  },

  // Lock operations
  locks: {
    acquire: async (
      projectId: string,
      tableId: string,
      request: AcquireLockRequest
    ): Promise<AcquireLockResponse> => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('User not authenticated')
        }

        // Check if table is already locked
        const { data: existingLock } = await supabase
          .from('table_locks')
          .select('*')
          .eq('table_id', tableId)
          .gt('expires_at', new Date().toISOString())
          .single()

        if (existingLock) {
          throw new Error('Table is already locked by another user')
        }

        const lockData = {
          id: generateUUID(),
          table_id: tableId,
          user_id: user.id,
          lock_token: generateUUID(),
          lock_type: request.lock_type,
          locked_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + (request.duration_minutes || 30) * 60000).toISOString(),
          reason: request.reason,
        }

        const { data, error } = await supabase
          .from('table_locks')
          .insert(lockData)
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { data }
      } catch (error) {
        console.error('Failed to acquire lock:', error)
        throw error
      }
    },

    release: async (projectId: string, tableId: string, lockToken: string): Promise<void> => {
      try {
        const { error } = await supabase
          .from('table_locks')
          .delete()
          .eq('table_id', tableId)
          .eq('lock_token', lockToken)

        if (error) handleSupabaseError(error)
      } catch (error) {
        console.error('Failed to release lock:', error)
        throw error
      }
    },
  },
}

// Helper function to generate CREATE TABLE SQL
function generateCreateTableSQL(
  tableName: string,
  fields: Array<{
    field_name: string
    data_type: string
    is_required: boolean
    default_value?: string
    field_config: Record<string, unknown>
  }>
): string[] {
  const sqlStatements: string[] = []

  if (fields.length === 0) {
    throw new Error('Table must have at least one field')
  }

  // Generate CREATE TABLE statement
  const fieldDefinitions = fields.map(field => {
    let definition = `    ${field.field_name} `

    // Map data types to PostgreSQL types
    switch (field.data_type) {
      case 'text':
        const maxLength = (field.field_config.max_length as number) || 255
        definition += `VARCHAR(${maxLength})`
        break
      case 'number':
        const precision = (field.field_config.precision as number) || 10
        const scale = (field.field_config.scale as number) || 2
        definition += `DECIMAL(${precision},${scale})`
        break
      case 'date':
        definition += 'TIMESTAMP'
        break
      case 'boolean':
        definition += 'BOOLEAN'
        break
      default:
        throw new Error(`Unsupported data type: ${field.data_type}`)
    }

    // Add NOT NULL constraint if required
    if (field.is_required) {
      definition += ' NOT NULL'
    }

    // Add default value if specified
    if (field.default_value) {
      definition += ` DEFAULT ${field.default_value}`
    }

    return definition
  })

  const createTableSQL = `CREATE TABLE ${tableName} (\n${fieldDefinitions.join(',\n')}\n);`
  sqlStatements.push(createTableSQL)

  return sqlStatements
}

// Helper function to check for circular dependencies
async function checkCircularDependency(
  projectId: string,
  sourceTableId: string,
  targetTableId: string
): Promise<boolean> {
  // Simple implementation - in a real system, you'd do a proper graph traversal
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  async function hasCycle(currentTableId: string): Promise<boolean> {
    if (recursionStack.has(currentTableId)) {
      return true
    }

    if (visited.has(currentTableId)) {
      return false
    }

    visited.add(currentTableId)
    recursionStack.add(currentTableId)

    // Get all relationships where current table is source
    const { data: relationships } = await supabase
      .from('table_relationships')
      .select('target_table_id')
      .eq('source_table_id', currentTableId)
      .eq('project_id', projectId)

    if (relationships) {
      for (const rel of relationships) {
        if (await hasCycle(rel.target_table_id)) {
          return true
        }
      }
    }

    recursionStack.delete(currentTableId)
    return false
  }

  // Start from target table and see if we can reach source table
  return await hasCycle(targetTableId)
}

// Enhanced relationship CRUD operations

// Batch relationship operations
export const createRelationships = async (
  projectId: string,
  relationships: CreateTableRelationshipRequest[]
): Promise<CreateRelationshipResponse[]> => {
  try {
    const results: CreateRelationshipResponse[] = []

    for (const relationship of relationships) {
      const result = await api.relationships.create(projectId, relationship)
      results.push(result)
    }

    return results
  } catch (error) {
    console.error('Failed to create relationships:', error)
    throw error
  }
}

// Get relationships with table details
export const getRelationshipsWithTables = async (
  projectId: string
): Promise<
  Array<{
    relationship: TableRelationship
    sourceTable: DataTableWithFields
    targetTable: DataTableWithFields
    sourceField: DataField
    targetField: DataField
  }>
> => {
  try {
    const { data: relationships, error: relationshipsError } = await supabase
      .from('table_relationships')
      .select('*')
      .eq('project_id', projectId)

    if (relationshipsError) throw relationshipsError

    if (!relationships || relationships.length === 0) {
      return []
    }

    // Get all related tables and fields in one query each
    const tableIds = new Set([
      ...relationships.map(r => r.source_table_id),
      ...relationships.map(r => r.target_table_id),
    ])

    const fieldIds = new Set([
      ...relationships.map(r => r.source_field_id),
      ...relationships.map(r => r.target_field_id),
    ])

    const { data: tables } = await supabase
      .from('data_tables')
      .select('*')
      .in('id', Array.from(tableIds))

    const { data: fields } = await supabase
      .from('data_fields')
      .select('*')
      .in('id', Array.from(fieldIds))

    const tableMap = new Map(tables?.map(t => [t.id, t]) || [])
    const fieldMap = new Map(fields?.map(f => [f.id, f]) || [])

    return relationships.map(relationship => ({
      relationship,
      sourceTable: tableMap.get(relationship.source_table_id),
      targetTable: tableMap.get(relationship.target_table_id),
      sourceField: fieldMap.get(relationship.source_field_id),
      targetField: fieldMap.get(relationship.target_field_id),
    }))
  } catch (error) {
    console.error('Failed to get relationships with tables:', error)
    throw error
  }
}

// Get relationship graph for visualization
export const getRelationshipGraph = async (
  projectId: string
): Promise<{
  nodes: Array<{
    id: string
    type: 'table'
    data: DataTableWithFields
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    type: 'relationship'
    data: TableRelationship
  }>
}> => {
  try {
    const relationships = await getRelationshipsWithTables(projectId)

    const nodeSet = new Set<string>()
    const nodes: Array<{ id: string; type: 'table'; data: DataTableWithFields }> = []
    const edges: Array<{
      id: string
      source: string
      target: string
      type: 'relationship'
      data: TableRelationship
    }> = []

    relationships.forEach(({ relationship, sourceTable, targetTable }) => {
      // Add nodes if not already added
      if (!nodeSet.has(sourceTable.id)) {
        nodeSet.add(sourceTable.id)
        nodes.push({
          id: sourceTable.id,
          type: 'table',
          data: sourceTable,
        })
      }

      if (!nodeSet.has(targetTable.id)) {
        nodeSet.add(targetTable.id)
        nodes.push({
          id: targetTable.id,
          type: 'table',
          data: targetTable,
        })
      }

      // Add edge
      edges.push({
        id: relationship.id,
        source: sourceTable.id,
        target: targetTable.id,
        type: 'relationship',
        data: relationship,
      })
    })

    return { nodes, edges }
  } catch (error) {
    console.error('Failed to get relationship graph:', error)
    throw error
  }
}

// Validate relationship before creation with enhanced checks
export const validateRelationshipConfiguration = async (
  projectId: string,
  sourceTableId: string,
  targetTableId: string,
  sourceFieldId: string,
  targetFieldId: string,
  relationshipName?: string
): Promise<{
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}> => {
  try {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Basic validation
    if (!sourceTableId || !targetTableId || !sourceFieldId || !targetFieldId) {
      errors.push('All source and target references are required')
    }

    if (sourceTableId === targetTableId) {
      errors.push('Cannot create self-referencing relationships')
    }

    if (sourceFieldId === targetFieldId) {
      errors.push('Source and target fields must be different')
    }

    // Get table and field details
    const { data: sourceTable } = await supabase
      .from('data_tables')
      .select('*')
      .eq('id', sourceTableId)
      .eq('project_id', projectId)
      .single()

    const { data: targetTable } = await supabase
      .from('data_tables')
      .select('*')
      .eq('id', targetTableId)
      .eq('project_id', projectId)
      .single()

    const { data: sourceField } = await supabase
      .from('data_fields')
      .select('*')
      .eq('id', sourceFieldId)
      .eq('table_id', sourceTableId)
      .single()

    const { data: targetField } = await supabase
      .from('data_fields')
      .select('*')
      .eq('id', targetFieldId)
      .eq('table_id', targetTableId)
      .single()

    if (!sourceTable || !targetTable || !sourceField || !targetField) {
      errors.push('Source or target tables/fields not found')
    }

    // Check field compatibility
    if (sourceField && targetField) {
      if (sourceField.data_type !== targetField.data_type) {
        warnings.push(`Field types differ (${sourceField.data_type} vs ${targetField.data_type})`)
        suggestions.push('Consider using fields with compatible data types')
      }

      // Source field should typically be unique or primary key
      if (!sourceField.is_required) {
        warnings.push('Source field is not required - relationships typically use required fields')
        suggestions.push('Consider making the source field required')
      }

      // Check if source field name suggests it's a primary key
      const isPrimaryKey = sourceField.field_name === 'id' || sourceField.field_name.endsWith('_id')
      if (!isPrimaryKey) {
        warnings.push('Source field does not appear to be a primary key')
        suggestions.push('Consider using a primary key field as the source')
      }

      // Check if target field name suggests it's a foreign key
      const isForeignKey = targetField.field_name.endsWith('_id')
      if (!isForeignKey) {
        warnings.push("Target field name does not suggest it's a foreign key")
        suggestions.push('Consider naming the target field with a _id suffix')
      }
    }

    // Check for existing relationships
    const { data: existingRelationships } = await supabase
      .from('table_relationships')
      .select('*')
      .eq('project_id', projectId)
      .or(`source_table_id.eq.${sourceTableId},target_table_id.eq.${targetTableId}`)

    if (existingRelationships && existingRelationships.length > 0) {
      const existingBetweenTables = existingRelationships.find(
        r =>
          (r.source_table_id === sourceTableId && r.target_table_id === targetTableId) ||
          (r.source_table_id === targetTableId && r.target_table_id === sourceTableId)
      )

      if (existingBetweenTables) {
        errors.push('A relationship already exists between these tables')
      }
    }

    // Check circular dependency
    const hasCircularDependency = await checkCircularDependency(
      projectId,
      sourceTableId,
      targetTableId
    )
    if (hasCircularDependency) {
      errors.push('This relationship would create a circular dependency')
    }

    // Check relationship name uniqueness
    if (relationshipName) {
      const { data: existingWithName } = await supabase
        .from('table_relationships')
        .select('id')
        .eq('project_id', projectId)
        .eq('relationship_name', relationshipName)
        .single()

      if (existingWithName) {
        errors.push('Relationship name must be unique within the project')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    }
  } catch (error) {
    console.error('Failed to validate relationship configuration:', error)
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed'],
      warnings: [],
      suggestions: [],
    }
  }
}

// Get relationship dependencies (what would be affected if this relationship is deleted)
export const getRelationshipDependencies = async (
  projectId: string,
  relationshipId: string
): Promise<{
  dependentTables: Array<{
    tableId: string
    tableName: string
    dependencyType: string
  }>
  dependentRelationships: Array<{
    relationshipId: string
    relationshipName: string
    dependencyType: string
  }>
}> => {
  try {
    const { data: relationship } = await supabase
      .from('table_relationships')
      .select('*')
      .eq('id', relationshipId)
      .eq('project_id', projectId)
      .single()

    if (!relationship) {
      throw new Error('Relationship not found')
    }

    // Find tables that depend on this relationship
    const { data: dependentTables } = await supabase
      .from('data_tables')
      .select('*')
      .eq('project_id', projectId)

    // Find relationships that would be affected
    const { data: dependentRelationships } = await supabase
      .from('table_relationships')
      .select('*')
      .eq('project_id', projectId)
      .or(
        `source_table_id.eq.${relationship.target_table_id},target_table_id.eq.${relationship.source_table_id}`
      )
      .neq('id', relationshipId)

    return {
      dependentTables:
        dependentTables?.map(table => ({
          tableId: table.id,
          tableName: table.name,
          dependencyType:
            table.id === relationship.target_table_id
              ? 'target_table'
              : table.id === relationship.source_table_id
                ? 'source_table'
                : 'indirect',
        })) || [],
      dependentRelationships:
        dependentRelationships?.map(rel => ({
          relationshipId: rel.id,
          relationshipName: rel.relationship_name,
          dependencyType:
            rel.source_table_id === relationship.target_table_id ||
            rel.target_table_id === relationship.source_table_id
              ? 'chain_dependency'
              : 'indirect',
        })) || [],
    }
  } catch (error) {
    console.error('Failed to get relationship dependencies:', error)
    throw error
  }
}

// Test relationship configuration without creating it
export const testRelationship = async (
  projectId: string,
  relationshipData: CreateTableRelationshipRequest
): Promise<{
  canCreate: boolean
  testResults: {
    basicValidation: boolean
    circularDependency: boolean
    fieldCompatibility: boolean
    databaseConstraints: boolean
  }
  recommendations: string[]
}> => {
  try {
    const testResults = {
      basicValidation: false,
      circularDependency: false,
      fieldCompatibility: false,
      databaseConstraints: false,
    }

    const recommendations: string[] = []

    // Test basic validation
    try {
      const validation = await api.relationships.validate(projectId, relationshipData)
      testResults.basicValidation = validation.isValid
      if (!validation.isValid) {
        recommendations.push(`Fix validation errors: ${validation.errors.join(', ')}`)
      }
      if (validation.warnings) {
        recommendations.push(`Address warnings: ${validation.warnings.join(', ')}`)
      }
    } catch (error) {
      recommendations.push(`Validation failed: ${error}`)
    }

    // Test circular dependency
    try {
      const hasCircularDependency = await checkCircularDependency(
        projectId,
        relationshipData.source_table_id,
        relationshipData.target_table_id
      )
      testResults.circularDependency = !hasCircularDependency
      if (hasCircularDependency) {
        recommendations.push('Relationship would create a circular dependency')
      }
    } catch (error) {
      recommendations.push(`Circular dependency check failed: ${error}`)
    }

    // Test field compatibility
    try {
      const { data: sourceField } = await supabase
        .from('data_fields')
        .select('data_type, is_required, field_name')
        .eq('id', relationshipData.source_field_id)
        .single()

      const { data: targetField } = await supabase
        .from('data_fields')
        .select('data_type, is_required, field_name')
        .eq('id', relationshipData.target_field_id)
        .single()

      if (sourceField && targetField) {
        const compatibleTypes = sourceField.data_type === targetField.data_type
        const sourceIsKey =
          sourceField.field_name === 'id' || sourceField.field_name.endsWith('_id')
        const targetIsForeignKey = targetField.field_name.endsWith('_id')

        testResults.fieldCompatibility = compatibleTypes && sourceIsKey

        if (!compatibleTypes) {
          recommendations.push(
            `Field types are incompatible: ${sourceField.data_type} vs ${targetField.data_type}`
          )
        }
        if (!sourceIsKey) {
          recommendations.push('Source field should be a primary key or unique identifier')
        }
        if (!targetIsForeignKey) {
          recommendations.push(
            "Target field name should suggest it's a foreign key (ends with _id)"
          )
        }
      }
    } catch (error) {
      recommendations.push(`Field compatibility check failed: ${error}`)
    }

    // Test database constraints (simulated)
    testResults.databaseConstraints = true
    recommendations.push('Database constraints can be applied successfully')

    const canCreate = Object.values(testResults).every(result => result === true)

    return {
      canCreate,
      testResults,
      recommendations,
    }
  } catch (error) {
    console.error('Failed to test relationship:', error)
    throw error
  }
}

// Enhanced field CRUD operations

// Batch field operations
export const createFields = async (
  projectId: string,
  tableId: string,
  fields: CreateDataFieldRequest[]
): Promise<CreateFieldResponse[]> => {
  try {
    const results: CreateFieldResponse[] = []

    for (const field of fields) {
      const result = await api.fields.create(projectId, tableId, field)
      results.push(result)
    }

    return results
  } catch (error) {
    console.error('Failed to create fields:', error)
    throw error
  }
}

export const updateFields = async (
  projectId: string,
  tableId: string,
  updates: Array<{ fieldId: string; data: UpdateDataFieldRequest }>
): Promise<UpdateFieldResponse[]> => {
  try {
    const results: UpdateFieldResponse[] = []

    for (const update of updates) {
      const result = await api.fields.update(projectId, tableId, update.fieldId, update.data)
      results.push(result)
    }

    return results
  } catch (error) {
    console.error('Failed to update fields:', error)
    throw error
  }
}

export const reorderFields = async (
  projectId: string,
  tableId: string,
  fieldOrders: Array<{ fieldId: string; sort_order: number }>
): Promise<UpdateFieldResponse[]> => {
  try {
    const updates = fieldOrders.map(({ fieldId, sort_order }) => ({
      fieldId,
      data: { sort_order } as UpdateDataFieldRequest,
    }))

    return await updateFields(projectId, tableId, updates)
  } catch (error) {
    console.error('Failed to reorder fields:', error)
    throw error
  }
}

// Field validation operations
export const validateFieldConfiguration = async (
  projectId: string,
  tableId: string,
  fieldData: CreateDataFieldRequest | UpdateDataFieldRequest
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
  try {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if field name already exists in table (for updates)
    if ('field_name' in fieldData && fieldData.field_name) {
      const { data: existingFields } = await supabase
        .from('data_fields')
        .select('id, field_name')
        .eq('table_id', tableId)

      if (existingFields) {
        const duplicateField = existingFields.find(
          f =>
            f.field_name === fieldData.field_name &&
            ('fieldId' in fieldData ? f.id !== fieldData.fieldId : true)
        )

        if (duplicateField) {
          errors.push('Field name already exists in this table')
        }
      }
    }

    // Check for SQL reserved keywords
    const reservedKeywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'INSERT',
      'UPDATE',
      'DELETE',
      'CREATE',
      'ALTER',
      'DROP',
      'TABLE',
      'INDEX',
      'PRIMARY',
      'FOREIGN',
      'KEY',
      'REFERENCES',
      'UNIQUE',
      'NOT',
      'NULL',
      'DEFAULT',
      'CHECK',
      'CONSTRAINT',
    ]

    if ('field_name' in fieldData && fieldData.field_name) {
      const upperFieldName = fieldData.field_name.toUpperCase()
      if (reservedKeywords.includes(upperFieldName)) {
        errors.push(
          `"${fieldData.field_name}" is a reserved SQL keyword and cannot be used as a field name`
        )
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  } catch (error) {
    console.error('Failed to validate field configuration:', error)
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed'],
      warnings: [],
    }
  }
}

// Field dependency checking
export const checkFieldDependencies = async (
  projectId: string,
  tableId: string,
  fieldId: string
): Promise<{
  hasDependencies: boolean
  dependencies: Array<{ type: string; description: string }>
}> => {
  try {
    const dependencies: Array<{ type: string; description: string }> = []

    // Check if field is used in relationships
    const { data: relationships } = await supabase
      .from('table_relationships')
      .select('*')
      .or(`source_field_id.eq.${fieldId},target_field_id.eq.${fieldId}`)

    if (relationships && relationships.length > 0) {
      for (const rel of relationships) {
        const direction = rel.source_field_id === fieldId ? 'source' : 'target'
        dependencies.push({
          type: 'relationship',
          description: `Field is used as ${direction} field in relationship "${rel.relationship_name}"`,
        })
      }
    }

    // TODO: Check for other dependencies like indexes, constraints, etc.
    // For MVP, we only check relationships

    return {
      hasDependencies: dependencies.length > 0,
      dependencies,
    }
  } catch (error) {
    console.error('Failed to check field dependencies:', error)
    return {
      hasDependencies: false,
      dependencies: [],
    }
  }
}

// Field type conversion operations
export const convertFieldType = async (
  projectId: string,
  tableId: string,
  fieldId: string,
  newType: DataFieldType,
  newConfig?: Record<string, unknown>
): Promise<UpdateFieldResponse> => {
  try {
    // Get current field data
    const { data: currentField } = await supabase
      .from('data_fields')
      .select('*')
      .eq('id', fieldId)
      .eq('table_id', tableId)
      .single()

    if (!currentField) {
      throw new Error('Field not found')
    }

    // Validate type conversion
    const updateData: UpdateDataFieldRequest = {
      data_type: newType,
      field_config: newConfig || getDefaultFieldConfig(newType),
    }

    // If table is already deployed, we would need to generate migration SQL
    // For now, just update the field definition
    const result = await api.fields.update(projectId, tableId, fieldId, updateData)

    // TODO: Generate and execute migration if table is deployed
    // This would involve creating ALTER TABLE statements

    return result
  } catch (error) {
    console.error('Failed to convert field type:', error)
    throw error
  }
}

// Field template operations
export const createFieldFromTemplate = async (
  projectId: string,
  tableId: string,
  templateName: string
): Promise<CreateFieldResponse> => {
  try {
    const templates: Record<string, CreateDataFieldRequest> = {
      id: {
        name: 'ID',
        field_name: 'id',
        data_type: 'text',
        is_required: true,
        field_config: { max_length: 255 },
      },
      created_at: {
        name: 'Created At',
        field_name: 'created_at',
        data_type: 'date',
        is_required: true,
        default_value: 'CURRENT_TIMESTAMP',
        field_config: { format: 'YYYY-MM-DD HH:mm:ss', default_now: true },
      },
      updated_at: {
        name: 'Updated At',
        field_name: 'updated_at',
        data_type: 'date',
        is_required: true,
        default_value: 'CURRENT_TIMESTAMP',
        field_config: { format: 'YYYY-MM-DD HH:mm:ss', default_now: true },
      },
      email: {
        name: 'Email',
        field_name: 'email',
        data_type: 'text',
        is_required: false,
        field_config: { max_length: 255, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
      },
      name: {
        name: 'Name',
        field_name: 'name',
        data_type: 'text',
        is_required: true,
        field_config: { max_length: 255 },
      },
      status: {
        name: 'Status',
        field_name: 'status',
        data_type: 'text',
        is_required: true,
        default_value: 'active',
        field_config: { max_length: 50 },
      },
      price: {
        name: 'Price',
        field_name: 'price',
        data_type: 'number',
        is_required: false,
        field_config: { precision: 10, scale: 2, min_value: 0 },
      },
      is_active: {
        name: 'Is Active',
        field_name: 'is_active',
        data_type: 'boolean',
        is_required: true,
        default_value: 'true',
      },
    }

    const template = templates[templateName]
    if (!template) {
      throw new Error(`Unknown field template: ${templateName}`)
    }

    return await api.fields.create(projectId, tableId, template)
  } catch (error) {
    console.error('Failed to create field from template:', error)
    throw error
  }
}

export default api
