/**
 * API Route: /api/projects/[projectId]
 * Handles individual project operations (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProject, deleteProject } from '@/lib/projects/mutations'
import { getProjectDetails, getUserProjectRole } from '@/lib/projects/queries'
import type { UpdateProjectData, ProjectRole } from '@/types/projects'
import { handleAPIError } from '@/lib/projects/error-handling'
import { ProjectOperationValidator } from '@/lib/projects/operation-validator'

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
      return handleAPIError(
        { message: 'Authentication required', code: 'AUTHENTICATION_ERROR' },
        'Authentication required'
      )
    }

    const { projectId } = await params

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return handleAPIError(
        { message: 'Invalid project ID', code: 'VALIDATION_ERROR' },
        'Invalid project ID'
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch {
      return handleAPIError(
        { message: 'Invalid request body', code: 'VALIDATION_ERROR' },
        'Invalid request body'
      )
    }

    const updateData: UpdateProjectData = {
      name: body.name,
      description: body.description,
      status: body.status,
    }

    // Get project details for validation
    const existingProject = await getProjectDetails(projectId, user.id)
    if (!existingProject) {
      return handleAPIError(
        { message: 'Project not found or access denied', code: 'NOT_FOUND' },
        'Project not found'
      )
    }

    // Get user role properly
    const userRoleStr = await getUserProjectRole(projectId, user.id)
    if (!userRoleStr) {
      return handleAPIError(
        { message: 'Access denied to project', code: 'AUTHORIZATION_ERROR' },
        'Access denied'
      )
    }

    // Validate and convert user role
    const validRoles: ProjectRole[] = ['owner', 'editor', 'viewer']
    if (!validRoles.includes(userRoleStr as ProjectRole)) {
      return handleAPIError(
        { message: 'Invalid user role', code: 'AUTHORIZATION_ERROR' },
        'Invalid user role'
      )
    }

    const userRole: ProjectRole = userRoleStr as ProjectRole

    // Validate operation using the comprehensive validator
    const validation = await ProjectOperationValidator.validateOperation({
      operation: 'update',
      userId: user.id,
      projectId,
      userRole,
      project: existingProject,
      data: updateData as Record<string, unknown>,
    })

    if (!validation.isValid) {
      return handleAPIError(
        validation.error || { message: 'Validation failed', code: 'VALIDATION_ERROR' },
        'Project update validation failed'
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
      return handleAPIError(
        { message: 'Authentication required', code: 'AUTHENTICATION_ERROR' },
        'Authentication required'
      )
    }

    const { projectId } = await params

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return handleAPIError(
        { message: 'Invalid project ID', code: 'VALIDATION_ERROR' },
        'Invalid project ID'
      )
    }

    // Get project details for validation
    const existingProject = await getProjectDetails(projectId, user.id)
    if (!existingProject) {
      return handleAPIError(
        { message: 'Project not found or access denied', code: 'NOT_FOUND' },
        'Project not found'
      )
    }

    // Get user role properly
    const userRoleStr = await getUserProjectRole(projectId, user.id)
    if (!userRoleStr) {
      return handleAPIError(
        { message: 'Access denied to project', code: 'AUTHORIZATION_ERROR' },
        'Access denied'
      )
    }

    // Validate and convert user role
    const validRoles: ProjectRole[] = ['owner', 'editor', 'viewer']
    if (!validRoles.includes(userRoleStr as ProjectRole)) {
      return handleAPIError(
        { message: 'Invalid user role', code: 'AUTHORIZATION_ERROR' },
        'Invalid user role'
      )
    }

    const userRole: ProjectRole = userRoleStr as ProjectRole

    // Validate operation using the comprehensive validator
    const validation = await ProjectOperationValidator.validateOperation({
      operation: 'delete',
      userId: user.id,
      projectId,
      userRole,
      project: existingProject,
    })

    if (!validation.isValid) {
      return handleAPIError(
        validation.error || { message: 'Validation failed', code: 'VALIDATION_ERROR' },
        'Project delete validation failed'
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
