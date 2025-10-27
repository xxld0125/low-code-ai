/**
 * Dynamic CRUD Route Handlers for Individual Records
 *
 * Purpose: Handle individual record operations (GET, PUT, DELETE) for dynamically generated tables
 * Route: /api/designer/tables/[tableId]/data/[id]
 * Methods: GET, PUT, DELETE
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateTableRequest, formatAPIResponse, handleAPIError } from '@/lib/designer/api-utils'
import {
  getTableSchema,
  validateTableExists,
  validateRecordExists,
} from '@/lib/designer/table-registry'

// Import Supabase client type
type SupabaseClient = Awaited<ReturnType<typeof createClient>>

interface RouteContext {
  params: Promise<{
    tableId: string
    id: string
  }>
}

/**
 * GET /api/designer/tables/[tableId]/data/[id]
 * Retrieve a single record by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tableId, id } = await context.params

    // First get the table definition to get the actual table name
    const supabase = await createClient()
    const { data: tableDef, error: tableError } = await supabase
      .from('data_tables')
      .select('table_name, status')
      .eq('id', tableId)
      .eq('status', 'active')
      .single()

    if (tableError || !tableDef) {
      return NextResponse.json({ error: 'Table not found or not active' }, { status: 404 })
    }

    const tableName = tableDef.table_name

    // Validate table exists and is active
    const tableValidation = await validateTableExists(tableName)
    if (!tableValidation.isValid) {
      return NextResponse.json({ error: tableValidation.error }, { status: 404 })
    }

    // Validate ID format
    const idValidation = validateTableRequest('params', tableName, { id })
    if (!idValidation.isValid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 })
    }

    // Validate record exists
    const recordValidation = await validateRecordExists(tableName, id)
    if (!recordValidation.isValid) {
      return NextResponse.json(
        { error: recordValidation.error || 'Record not found' },
        { status: 404 }
      )
    }

    const supabase = await createClient()

    const { data: record, error } = await supabase.from(tableName).select('*').eq('id', id).single()

    if (error) {
      console.error(`Error fetching ${tableName} record:`, error)
      return handleAPIError(error, 'fetch', tableName)
    }

    // Format response
    const response = formatAPIResponse('get', {
      data: record,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error in GET by ID:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/designer/tables/[tableName]/[id]
 * Update an existing record
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { tableId, id } = await context.params
    const body = await request.json()

    // First get the table definition to get the actual table name
    const supabase = await createClient()
    const { data: tableDef, error: tableError } = await supabase
      .from('data_tables')
      .select('table_name, status')
      .eq('id', tableId)
      .eq('status', 'active')
      .single()

    if (tableError || !tableDef) {
      return NextResponse.json({ error: 'Table not found or not active' }, { status: 404 })
    }

    const tableName = tableDef.table_name

    // Validate table exists and is active
    const tableValidation = await validateTableExists(tableName)
    if (!tableValidation.isValid) {
      return NextResponse.json({ error: tableValidation.error }, { status: 404 })
    }

    // Validate ID format
    const idValidation = validateTableRequest('params', tableName, { id })
    if (!idValidation.isValid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 })
    }

    // Validate record exists
    const recordValidation = await validateRecordExists(tableName, id)
    if (!recordValidation.isValid) {
      return NextResponse.json(
        { error: recordValidation.error || 'Record not found' },
        { status: 404 }
      )
    }

    // Validate request body
    const validation = validateTableRequest('update', tableName, body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error, fieldErrors: validation.fieldErrors },
        { status: 422 }
      )
    }

    const supabase = await createClient()

    // Extract validated data
    const { data: updateData } = validation
    const tableSchema = await getTableSchema(tableName)

    // Prevent updating primary key and immutable fields
    const cleanUpdateData = { ...(updateData as Record<string, unknown>) }
    for (const field of tableSchema.fields) {
      if (field.is_primary_key || field.immutable) {
        delete cleanUpdateData[field.field_name]
      }
    }

    // Add updated timestamp
    cleanUpdateData.updated_at = new Date().toISOString()

    const { data: record, error } = await supabase
      .from(tableName)
      .update(cleanUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Error updating ${tableName} record:`, error)
      return handleAPIError(error, 'update', tableName)
    }

    // Format response
    const response = formatAPIResponse('update', {
      data: record,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error in PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/designer/tables/[tableName]/[id]
 * Delete a record
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { tableId, id } = await context.params

    // First get the table definition to get the actual table name
    const supabase = await createClient()
    const { data: tableDef, error: tableError } = await supabase
      .from('data_tables')
      .select('table_name, status')
      .eq('id', tableId)
      .eq('status', 'active')
      .single()

    if (tableError || !tableDef) {
      return NextResponse.json({ error: 'Table not found or not active' }, { status: 404 })
    }

    const tableName = tableDef.table_name

    // Validate table exists and is active
    const tableValidation = await validateTableExists(tableName)
    if (!tableValidation.isValid) {
      return NextResponse.json({ error: tableValidation.error }, { status: 404 })
    }

    // Validate ID format
    const idValidation = validateTableRequest('params', tableName, { id })
    if (!idValidation.isValid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 })
    }

    // Validate record exists
    const recordValidation = await validateRecordExists(tableName, id)
    if (!recordValidation.isValid) {
      return NextResponse.json(
        { error: recordValidation.error || 'Record not found' },
        { status: 404 }
      )
    }

    const supabase = await createClient()

    // Check for foreign key constraints before deletion
    const tableSchema = await getTableSchema(tableName)
    const hasDependentRecords = await checkForeignKeyConstraints(
      supabase,
      tableName,
      id,
      tableSchema
    )

    if (hasDependentRecords) {
      return NextResponse.json(
        {
          error: 'Cannot delete record due to foreign key constraints',
          details: 'This record is referenced by other records and cannot be deleted',
        },
        { status: 409 }
      )
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id)

    if (error) {
      console.error(`Error deleting ${tableName} record:`, error)
      return handleAPIError(error, 'delete', tableName)
    }

    // Format response (no content for successful deletion)
    const response = formatAPIResponse('delete', {
      deleted: true,
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Unexpected error in DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Check for foreign key constraints before deletion
 */
async function checkForeignKeyConstraints(
  supabase: SupabaseClient,
  tableName: string,
  recordId: string,
  tableSchema: import('@/lib/designer/table-registry').TableSchema
): Promise<boolean> {
  // This is a simplified version - in a real implementation,
  // you'd want to check the actual foreign key constraints
  // from the database schema or relationship metadata

  if (!tableSchema.relationships || tableSchema.relationships.length === 0) {
    return false
  }

  for (const relationship of tableSchema.relationships) {
    if (relationship.source_table === tableName) {
      // Check if any records reference this record
      const { count, error } = await supabase
        .from(relationship.target_table)
        .select('*', { count: 'exact', head: true })
        .eq(relationship.target_field, recordId)

      if (error) {
        console.error('Error checking foreign key constraints:', error)
        continue
      }

      if (count && count > 0) {
        return true // Has dependent records
      }
    }
  }

  return false // No dependent records found
}
