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
} from '@/types/designer'

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

export default api
