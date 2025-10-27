import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface FeatureFlag {
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  [key: string]: unknown
}

interface EvaluationContext {
  userId?: string
  userEmail?: string
  userRole?: string
  projectId?: string
  environment?: string
}

// Default feature flags (same as in the client-side implementation)
const DEFAULT_FEATURE_FLAGS = {
  DATA_MODEL_DESIGNER: {
    name: 'Data Model Designer',
    description: 'Main data model designer functionality',
    enabled: true,
    rolloutPercentage: 100,
  },
  TABLE_LOCKING: {
    name: 'Table Locking',
    description: 'Collaborative table locking mechanism',
    enabled: true,
    rolloutPercentage: 100,
  },
  CONFLICT_DETECTION: {
    name: 'Conflict Detection',
    description: 'Real-time conflict detection and resolution',
    enabled: true,
    rolloutPercentage: 100,
  },
  RELATIONSHIP_MANAGEMENT: {
    name: 'Relationship Management',
    description: 'Advanced relationship creation and management',
    enabled: true,
    rolloutPercentage: 100,
  },
  API_GENERATION: {
    name: 'API Generation',
    description: 'Automatic CRUD API endpoint generation',
    enabled: true,
    rolloutPercentage: 100,
  },
  VIRTUAL_SCROLLING: {
    name: 'Virtual Scrolling',
    description: 'Virtual scrolling for large datasets',
    enabled: true,
    rolloutPercentage: 100,
  },
  AI_SUGGESTIONS: {
    name: 'AI Suggestions',
    description: 'AI-powered field and relationship suggestions',
    enabled: false,
    rolloutPercentage: 10,
  },
  VISUAL_QUERY_BUILDER: {
    name: 'Visual Query Builder',
    description: 'Visual query builder for data exploration',
    enabled: false,
    rolloutPercentage: 0,
  },
}

/**
 * Simple hash function for rollout percentage
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Evaluate if a flag should be enabled for the current user
 */
function evaluateFlag(flag: FeatureFlag, context: EvaluationContext): boolean {
  if (!flag.enabled) {
    return false
  }

  // Check rollout percentage
  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    const hash = hashCode(`${context.userId || 'anonymous'}-${flag.name}`)
    const shouldInclude = hash % 100 < flag.rolloutPercentage

    if (!shouldInclude) {
      return false
    }
  }

  return true
}

/**
 * GET /api/feature-flags - Get all feature flags
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get user info from headers
    const userId = request.headers.get('X-User-ID')
    const userEmail = request.headers.get('X-User-Email')
    const userRole = request.headers.get('X-User-Role')
    const projectId = request.headers.get('X-Project-ID')
    const environment = request.headers.get('X-Environment') || 'production'

    const context = {
      userId,
      userEmail,
      userRole,
      projectId,
      environment,
    }

    // Try to load flags from database first
    let dbFlags: Record<string, FeatureFlag> = {}

    try {
      const supabaseClient = await supabase
      const { data: flags, error } = await supabaseClient
        .from('feature_flags')
        .select('*')
        .eq('active', true)

      if (!error && flags) {
        dbFlags = flags.reduce(
          (
            acc: Record<string, FeatureFlag>,
            flag: {
              key: string
              enabled: boolean
              rollout_percentage: number
              [key: string]: unknown
            }
          ) => {
            acc[flag.key] = {
              name: String(flag.name || flag.key),
              description: String(flag.description || `Feature flag: ${flag.key}`),
              enabled: flag.enabled,
              rolloutPercentage: flag.rollout_percentage,
            }
            return acc
          },
          {}
        )
      }
    } catch (error) {
      console.error('Error loading flags from database:', error)
    }

    // Merge with default flags
    const mergedFlags: Record<string, FeatureFlag> = {}
    const enabledFlags: Record<string, boolean> = {}

    Object.entries({ ...DEFAULT_FEATURE_FLAGS, ...dbFlags }).forEach(([key, flag]) => {
      mergedFlags[key] = flag as FeatureFlag
      enabledFlags[key] = evaluateFlag(flag as FeatureFlag, {
        userId: context.userId || undefined,
        userEmail: context.userEmail || undefined,
        userRole: context.userRole || undefined,
        projectId: context.projectId || undefined,
        environment: context.environment || undefined,
      })
    })

    return NextResponse.json({
      flags: mergedFlags,
      enabled: enabledFlags,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in feature flags API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
        ...body,
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
    console.error('Error updating feature flag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
