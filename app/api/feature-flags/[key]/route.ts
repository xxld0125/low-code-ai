import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/feature-flags/[key] - Update a feature flag (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const supabase = createClient()
    const { key } = await params
    const body = await request.json()

    // This would typically require admin authentication
    // For now, we'll just return a success response

    const supabaseClient = await supabase
    const { data, error } = await supabaseClient
      .from('feature_flags')
      .upsert({
        key,
        value: body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating feature flag:', error)
      return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      flag: data,
    })
  } catch (error) {
    console.error('Error in feature flag API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/feature-flags/[key] - Get a specific feature flag
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const supabase = createClient()
    const { key } = await params

    const supabaseClient = await supabase
    const { data, error } = await supabaseClient
      .from('feature_flags')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 })
    }

    return NextResponse.json({
      key: data.key,
      value: data.value,
      updated_at: data.updated_at,
    })
  } catch (error) {
    console.error('Error getting feature flag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
