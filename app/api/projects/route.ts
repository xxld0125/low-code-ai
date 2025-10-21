/**
 * API Route: /api/projects
 * Handles project listing and creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProject } from '@/lib/projects/mutations'
import { getUserProjects as queryUserProjects } from '@/lib/projects/queries'
import type { CreateProjectData, GetProjectsRequest } from '@/types/projects'
import { handleAPIError } from '@/lib/projects/error-handling'

/**
 * GET /api/projects - List user's projects
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'Authentication required' } }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const params: GetProjectsRequest = {
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      include_archived: searchParams.get('include_archived') === 'true',
    }

    // Validate parameters
    if ((params.limit || 50) < 1 || (params.limit || 50) > 100) {
      return NextResponse.json(
        { error: { message: 'Limit must be between 1 and 100' } },
        { status: 400 }
      )
    }

    if ((params.offset || 0) < 0) {
      return NextResponse.json(
        { error: { message: 'Offset must be non-negative' } },
        { status: 400 }
      )
    }

    // Get projects
    const projects = await queryUserProjects(user.id, params)

    // Get total count for pagination
    const allProjects = await queryUserProjects(user.id, {
      include_archived: params.include_archived,
    })

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: {
          total: allProjects.length,
          limit: params.limit,
          offset: params.offset,
          hasMore: params.offset + params.limit < allProjects.length,
        },
      },
    })
  } catch (error) {
    return handleAPIError(error, 'Failed to fetch projects')
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'Authentication required' } }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const projectData: CreateProjectData = {
      name: body.name,
      description: body.description,
    }

    // Validate input
    if (!projectData.name || projectData.name.trim().length === 0) {
      return NextResponse.json({ error: { message: 'Project name is required' } }, { status: 400 })
    }

    if (projectData.name.length > 100) {
      return NextResponse.json(
        { error: { message: 'Project name must be 100 characters or less' } },
        { status: 400 }
      )
    }

    if (projectData.description && projectData.description.length > 500) {
      return NextResponse.json(
        { error: { message: 'Project description must be 500 characters or less' } },
        { status: 400 }
      )
    }

    // Create project
    const project = await createProject(projectData, user.id)

    return NextResponse.json(
      {
        success: true,
        data: { project },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleAPIError(error, 'Failed to create project')
  }
}
