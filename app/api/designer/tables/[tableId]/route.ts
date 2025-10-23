import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const supabase = await createClient()
    const { tableId } = await params

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    const { data: table, error } = await supabase
      .from('data_tables')
      .select(
        `
        *,
        data_fields (*)
      `
      )
      .eq('id', tableId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ table })
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const supabase = await createClient()
    const { tableId } = await params
    const body = await request.json()

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    const { name, description, tableName, status } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (tableName !== undefined) updateData.table_name = tableName
    if (status !== undefined) updateData.status = status

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: table, error } = await supabase
      .from('data_tables')
      .update(updateData)
      .eq('id', tableId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ table })
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const supabase = await createClient()
    const { tableId } = await params

    if (!tableId) {
      return NextResponse.json({ error: 'Table ID is required' }, { status: 400 })
    }

    // Soft delete by setting status to 'deleted'
    const { data: table, error } = await supabase
      .from('data_tables')
      .update({ status: 'deleted' })
      .eq('id', tableId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Table not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Table deleted successfully',
      table,
    })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
