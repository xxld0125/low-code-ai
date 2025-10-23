import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const { data: tables, error } = await supabase
      .from('data_tables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tables })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { projectId, name, description, tableName } = body

    if (!projectId || !name || !tableName) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, name, tableName' },
        { status: 400 }
      )
    }

    const { data: table, error } = await supabase
      .from('data_tables')
      .insert([
        {
          project_id: projectId,
          name,
          description: description || '',
          table_name: tableName,
          status: 'draft',
          schema_definition: {},
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ table }, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
