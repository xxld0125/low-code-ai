/**
 * Database mutation functions for project management
 * Provides safe and validated mutation operations
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { createClient } from '@/lib/supabase/server'
import type {
  CreateProjectData,
  UpdateProjectData,
  CreateInvitationRequest,
  Project,
  CollaboratorRole,
  Invitation,
} from '@/types/projects'

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData, userId: string): Promise<Project> {
  const supabase = await createClient()

  // Validate input
  if (!data.name || data.name.trim().length === 0) {
    throw new Error('Project name is required')
  }

  if (data.name.length > 100) {
    throw new Error('Project name must be 100 characters or less')
  }

  if (data.description && data.description.length > 500) {
    throw new Error('Project description must be 500 characters or less')
  }

  // Use database function for creation (includes validation and logging)
  const { data: projectId, error } = await supabase.rpc('create_project', {
    p_name: data.name.trim(),
    p_description: data.description?.trim() || null,
    p_owner_id: userId,
  })

  if (error) {
    if (error.message.includes('already exists')) {
      throw new Error('You already have a project with this name')
    }
    throw new Error(`Failed to create project: ${error.message}`)
  }

  // Fetch the created project to return full details
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch created project: ${fetchError.message}`)
  }

  return project
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectData,
  userId: string
): Promise<Project> {
  const supabase = await createClient()

  // Validate input
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Project name cannot be empty')
    }

    if (data.name.length > 100) {
      throw new Error('Project name must be 100 characters or less')
    }
  }

  if (data.description !== undefined && data.description && data.description.length > 500) {
    throw new Error('Project description must be 500 characters or less')
  }

  if (data.status && !['active', 'archived', 'suspended'].includes(data.status)) {
    throw new Error('Invalid project status')
  }

  // Use database function for update (includes permission check and logging)
  const { error } = await supabase.rpc('update_project', {
    p_project_id: projectId,
    p_name: data.name?.trim() || null,
    p_description: data.description?.trim() || null,
    p_status: data.status || null,
    p_user_id: userId,
  })

  if (error) {
    if (error.message.includes('not found')) {
      throw new Error('Project not found')
    }

    if (error.message.includes('Only project owners')) {
      throw new Error('Only project owners can update projects')
    }

    if (error.message.includes('already exists')) {
      throw new Error('You already have a project with this name')
    }

    throw new Error(`Failed to update project: ${error.message}`)
  }

  // Fetch the updated project
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch updated project: ${fetchError.message}`)
  }

  return project
}

/**
 * Delete a project (soft delete)
 */
export async function deleteProject(projectId: string, userId: string): Promise<void> {
  const supabase = await createClient()

  // Use database function for deletion (includes permission check and logging)
  const { error } = await supabase.rpc('delete_project', {
    p_project_id: projectId,
    p_user_id: userId,
  })

  if (error) {
    if (error.message.includes('not found')) {
      throw new Error('Project not found')
    }

    if (error.message.includes('Only project owners')) {
      throw new Error('Only project owners can delete projects')
    }

    throw new Error(`Failed to delete project: ${error.message}`)
  }
}

/**
 * Invite a collaborator to a project
 */
export async function inviteCollaborator(
  projectId: string,
  data: CreateInvitationRequest,
  userId: string
): Promise<Invitation> {
  const supabase = await createClient()

  // Validate email format
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!emailRegex.test(data.invited_email)) {
    throw new Error('Invalid email address')
  }

  // Validate role
  if (!['editor', 'viewer'].includes(data.role)) {
    throw new Error('Invalid role. Must be editor or viewer')
  }

  // Use database function for invitation (includes validation and logging)
  const { data: invitationId, error } = await supabase.rpc('invite_collaborator', {
    p_project_id: projectId,
    p_invited_email: data.invited_email.toLowerCase().trim(),
    p_role: data.role,
    p_invited_by: userId,
  })

  if (error) {
    if (error.message.includes('not found')) {
      throw new Error('Project not found')
    }

    if (error.message.includes('Only project owners')) {
      throw new Error('Only project owners can invite collaborators')
    }

    if (error.message.includes('already a collaborator')) {
      throw new Error('This user is already a collaborator on this project')
    }

    if (error.message.includes('Cannot invite the project owner')) {
      throw new Error('Cannot invite the project owner as a collaborator')
    }

    throw new Error(`Failed to invite collaborator: ${error.message}`)
  }

  // Fetch the created invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch created invitation: ${fetchError.message}`)
  }

  return invitation
}

/**
 * Accept a project invitation
 */

export async function acceptInvitation(token: string, userId: string): Promise<string> {
  const supabase = await createClient()

  // Use database function for acceptance (includes validation and logging)
  const { data: projectId, error } = await supabase.rpc('accept_invitation', {
    p_token: token,
    p_user_id: userId,
  })

  if (error) {
    if (error.message.includes('Invalid or expired')) {
      throw new Error('Invitation is invalid or has expired')
    }

    if (error.message.includes('not sent to your email')) {
      throw new Error('This invitation was not sent to your email address')
    }

    throw new Error(`Failed to accept invitation: ${error.message}`)
  }

  return projectId
}

/**
 * Decline a project invitation
 */

export async function declineInvitation(token: string, userId: string): Promise<void> {
  const supabase = await createClient()

  // Get user email first
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user?.email) {
    throw new Error('User email not found')
  }

  const { error } = await supabase
    .from('project_invitations')
    .update({
      declined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('token', token)
    .eq('invited_email', userData.user.email)
    .is('accepted_at', null)
    .is('declined_at', null)
    .gt('expires_at', new Date().toISOString())

  if (error) {
    throw new Error(`Failed to decline invitation: ${error.message}`)
  }

  // Check if any rows were affected
  const { count } = await supabase
    .from('project_invitations')
    .select('*', { count: 'exact', head: true })
    .eq('token', token)
    .eq('declined_at', null)

  if (count === 0) {
    throw new Error('Invitation not found or already processed')
  }
}

/**
 * Remove a collaborator from a project
 */
export async function removeCollaborator(
  projectId: string,
  collaboratorUserId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  // Use database function for removal (includes permission check and logging)
  const { error } = await supabase.rpc('remove_collaborator', {
    p_project_id: projectId,
    p_collaborator_user_id: collaboratorUserId,
    p_removed_by: userId,
  })

  if (error) {
    if (error.message.includes('not found')) {
      throw new Error('Project not found')
    }

    if (error.message.includes('Only project owners')) {
      throw new Error('Only project owners can remove collaborators')
    }

    if (error.message.includes('Cannot remove the project owner')) {
      throw new Error('Cannot remove the project owner')
    }

    if (error.message.includes('Collaborator not found')) {
      throw new Error('Collaborator not found on this project')
    }

    throw new Error(`Failed to remove collaborator: ${error.message}`)
  }
}

/**
 * Update collaborator role
 */
export async function updateCollaboratorRole(
  projectId: string,
  collaboratorUserId: string,
  newRole: CollaboratorRole,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  // Validate role
  if (!['owner', 'editor', 'viewer'].includes(newRole)) {
    throw new Error('Invalid role')
  }

  // Check if user is project owner
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single()

  if (!project || project.owner_id !== userId) {
    throw new Error('Only project owners can update collaborator roles')
  }

  // Don't allow changing the owner role
  if (collaboratorUserId === project.owner_id) {
    throw new Error('Cannot change the project owner role')
  }

  const { error } = await supabase
    .from('project_collaborators')
    .update({
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq('project_id', projectId)
    .eq('user_id', collaboratorUserId)

  if (error) {
    throw new Error(`Failed to update collaborator role: ${error.message}`)
  }

  // Log the activity
  await supabase.from('project_activity_log').insert({
    project_id: projectId,
    user_id: userId,
    action: 'collaborator_role_changed',
    details: {
      collaborator_user_id: collaboratorUserId,
      new_role: newRole,
    },
  })
}

/**
 * Cancel a pending invitation
 */
export async function cancelInvitation(invitationId: string, userId: string): Promise<void> {
  const supabase = await createClient()

  // Get invitation to check permissions
  const { data: invitation } = await supabase
    .from('project_invitations')
    .select('project_id, invited_by')
    .eq('id', invitationId)
    .single()

  if (!invitation) {
    throw new Error('Invitation not found')
  }

  // Check if user is project owner or the inviter
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', invitation.project_id)
    .single()

  if (!project || (project.owner_id !== userId && invitation.invited_by !== userId)) {
    throw new Error('Only project owners or the inviter can cancel invitations')
  }

  const { error } = await supabase.from('project_invitations').delete().eq('id', invitationId)

  if (error) {
    throw new Error(`Failed to cancel invitation: ${error.message}`)
  }
}

/**
 * Resend a pending invitation
 */
export async function resendInvitation(invitationId: string, userId: string): Promise<Invitation> {
  const supabase = await createClient()

  // Get invitation to check permissions
  const { data: invitation } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('id', invitationId)
    .single()

  if (!invitation) {
    throw new Error('Invitation not found')
  }

  // Check if user is project owner or the inviter
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', invitation.project_id)
    .single()

  if (!project || (project.owner_id !== userId && invitation.invited_by !== userId)) {
    throw new Error('Only project owners or the inviter can resend invitations')
  }

  // Check if invitation is still pending
  if (invitation.accepted_at || invitation.declined_at) {
    throw new Error('Cannot resend an invitation that has been accepted or declined')
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Cannot resend an expired invitation')
  }

  // Update invitation with new expiration and token
  const newToken = generateInvitationToken()
  const newExpiration = new Date()
  newExpiration.setDate(newExpiration.getDate() + 7) // 7 days from now

  const { data: updatedInvitation, error } = await supabase
    .from('project_invitations')
    .update({
      token: newToken,
      expires_at: newExpiration.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to resend invitation: ${error.message}`)
  }

  return updatedInvitation
}

/**
 * Generate a random invitation token
 */
function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
