/**
 * API Route: /api/projects/[projectId]/collaborators
 * Handles project collaborator operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inviteCollaborator } from '@/lib/projects/mutations'
import { getProjectCollaborators } from '@/lib/projects/queries'
import type { CreateInvitationRequest } from '@/types/projects'
import { handleAPIError } from '@/lib/projects/error-handling'

/**
 * GET /api/projects/[projectId]/collaborators - List project collaborators
 */
export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'Authentication required' } }, { status: 401 })
    }

    const projectId = params.projectId

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: { message: 'Invalid project ID' } }, { status: 400 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: { message: 'Limit must be between 1 and 100' } },
        { status: 400 }
      )
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: { message: 'Offset must be non-negative' } },
        { status: 400 }
      )
    }

    // Get collaborators
    const collaborators = await getProjectCollaborators(projectId, user.id, {
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: {
        collaborators,
        pagination: {
          total: collaborators.length,
          limit,
          offset,
          hasMore: false, // Simplified for now
        },
      },
    })
  } catch (error) {
    return handleAPIError(error, 'Failed to fetch collaborators')
  }
}

/**
 * POST /api/projects/[projectId]/collaborators - Invite a collaborator
 */
export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'Authentication required' } }, { status: 401 })
    }

    const projectId = params.projectId

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: { message: 'Invalid project ID' } }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const invitationData: CreateInvitationRequest = {
      invited_email: body.invited_email,
      role: body.role,
    }

    // Validate input
    if (!invitationData.invited_email || typeof invitationData.invited_email !== 'string') {
      return NextResponse.json({ error: { message: 'Email is required' } }, { status: 400 })
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(invitationData.invited_email)) {
      return NextResponse.json({ error: { message: 'Invalid email address' } }, { status: 400 })
    }

    if (!invitationData.role || !['editor', 'viewer'].includes(invitationData.role)) {
      return NextResponse.json(
        { error: { message: 'Role must be either editor or viewer' } },
        { status: 400 }
      )
    }

    // Create invitation
    const invitation = await inviteCollaborator(projectId, invitationData, user.id)

    return NextResponse.json(
      {
        success: true,
        data: { invitation },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleAPIError(error, 'Failed to invite collaborator')
  }
}
