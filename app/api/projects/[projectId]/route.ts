/**
 * API Route: /api/projects/[projectId]
 * Handles individual project operations (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProject, deleteProject } from '@/lib/projects/mutations'
import { getProjectById, getProjectDetails } from '@/lib/projects/queries'
import type { UpdateProjectData } from '@/types/projects'
import { handleAPIError } from '@/lib/projects/error-handling'

/**
 * GET /api/projects/[projectId] - Get project details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'Authentication required' } }, { status: 401 })
    }

    const { projectId } = await params

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: { message: 'Invalid project ID' } }, { status: 400 })
    }

    // Get project details
    const project = await getProjectDetails(projectId, user.id)

    return NextResponse.json({
      success: true,
      data: { project },
    })
  } catch (error) {
    return handleAPIError(error, 'Failed to fetch project')
  }
}

/**
 * PUT /api/projects/[projectId] - Update project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'Authentication required' } }, { status: 401 })
    }

    const { projectId } = await params

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: { message: 'Invalid project ID' } }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const updateData: UpdateProjectData = {
      name: body.name,
      description: body.description,
      status: body.status,
    }

    // Validate input
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length === 0) {
        return NextResponse.json(
          { error: { message: 'Project name cannot be empty' } },
          { status: 400 }
        )
      }

      if (updateData.name.length > 100) {
        return NextResponse.json(
          { error: { message: 'Project name must be 100 characters or less' } },
          { status: 400 }
        )
      }
    }

    if (
      updateData.description !== undefined &&
      updateData.description &&
      updateData.description.length > 500
    ) {
      return NextResponse.json(
        { error: { message: 'Project description must be 500 characters or less' } },
        { status: 400 }
      )
    }

    if (updateData.status && !['active', 'archived', 'suspended'].includes(updateData.status)) {
      return NextResponse.json({ error: { message: 'Invalid project status' } }, { status: 400 })
    }

    // Check if project exists and user has access
    const existingProject = await getProjectById(projectId, user.id)
    if (!existingProject) {
      return NextResponse.json(
        { error: { message: 'Project not found or access denied' } },
        { status: 404 }
      )
    }

    // Update project
    const updatedProject = await updateProject(projectId, updateData, user.id)

    return NextResponse.json({
      success: true,
      data: { project: updatedProject },
    })
  } catch (error) {
    return handleAPIError(error, 'Failed to update project')
  }
}

/**
 * DELETE /api/projects/[projectId] - Delete project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: { message: 'Authentication required' } }, { status: 401 })
    }

    const { projectId } = await params

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: { message: 'Invalid project ID' } }, { status: 400 })
    }

    // Check if project exists and user has access
    const existingProject = await getProjectById(projectId, user.id)
    if (!existingProject) {
      return NextResponse.json(
        { error: { message: 'Project not found or access denied' } },
        { status: 404 }
      )
    }

    // Delete project
    await deleteProject(projectId, user.id)

    return NextResponse.json({
      success: true,
      data: { message: 'Project deleted successfully' },
    })
  } catch (error) {
    return handleAPIError(error, 'Failed to delete project')
  }
}
