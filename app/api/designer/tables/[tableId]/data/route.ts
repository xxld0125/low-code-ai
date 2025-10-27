/**
 * Dynamic CRUD Route Handlers for Generated Tables
 *
 * Purpose: Handle CRUD operations for dynamically generated tables
 * Route: /api/designer/tables/[tableId]/data
 * Methods: GET, POST
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateTableRequest, formatAPIResponse, handleAPIError } from '@/lib/designer/api-utils'
import { getTableSchema, validateTableExists } from '@/lib/designer/table-registry'

interface RouteContext {
  params: Promise<{
    tableId: string
  }>
}

/**
 * GET /api/designer/tables/[tableId]/data
 * List records with pagination, sorting, and filtering
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { tableId } = await context.params

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
    const { searchParams } = new URL(request.url)

    // Validate table exists and is active
    const tableValidation = await validateTableExists(tableName)
    if (!tableValidation.isValid) {
      return NextResponse.json({ error: tableValidation.error }, { status: 404 })
    }

    // Parse and validate query parameters
    const queryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      sort: searchParams.get('sort') || 'created_at',
      order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
      search: searchParams.get('search') || '',
    }

    const validation = validateTableRequest('list', tableName, queryParams)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error, fieldErrors: validation.fieldErrors },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const tableSchema = await getTableSchema(tableName)

    // Build query
    let query = supabase.from(tableName).select('*', { count: 'exact' })

    // Apply search filter if provided
    if (queryParams.search && tableSchema.searchableFields.length > 0) {
      const searchConditions = tableSchema.searchableFields
        .map(field => `${field}.ilike.%${queryParams.search}%`)
        .join(',')

      query = query.or(searchConditions)
    }

    // Apply sorting
    query = query.order(queryParams.sort, { ascending: queryParams.order === 'asc' })

    // Apply pagination
    const offset = (queryParams.page - 1) * queryParams.limit
    query = query.range(offset, offset + queryParams.limit - 1)

    const { data: records, error, count } = await query

    if (error) {
      console.error(`Error fetching ${tableName}:`, error)
      return handleAPIError(error, 'fetch', tableName)
    }

    // Format response
    const response = formatAPIResponse('list', {
      data: records || [],
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / queryParams.limit),
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Unexpected error in GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/designer/tables/[tableName]
 * Create a new record
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { tableId } = await context.params
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

    // Validate request body
    const validation = validateTableRequest('create', tableName, body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error, fieldErrors: validation.fieldErrors },
        { status: 422 }
      )
    }

    const supabase = await createClient()

    // Extract validated data
    const { data: recordData } = validation
    const tableSchema = await getTableSchema(tableName)

    // Add default values for missing fields
    const createData = { ...(recordData as Record<string, unknown>) }
    for (const field of tableSchema.fields) {
      if (
        field.default_value !== undefined &&
        createData[field.field_name] === undefined &&
        !field.is_primary_key
      ) {
        createData[field.field_name] = field.default_value
      }
    }

    // Add timestamps if not present
    if (!createData.created_at) {
      createData.created_at = new Date().toISOString()
    }
    if (!createData.updated_at) {
      createData.updated_at = new Date().toISOString()
    }

    const { data: record, error } = await supabase
      .from(tableName)
      .insert(createData)
      .select()
      .single()

    if (error) {
      console.error(`Error creating ${tableName} record:`, error)
      return handleAPIError(error, 'create', tableName)
    }

    // Format response
    const response = formatAPIResponse('create', {
      data: record,
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
