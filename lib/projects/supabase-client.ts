/**
 * Supabase client extensions for project management operations
 * Provides typed wrappers around database functions and common operations
 */

import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type {
  Project,
  ProjectWithUserRole,
  Collaborator,
  Invitation,
  CreateProjectData,
  UpdateProjectData,
  GetProjectsRequest,
  CreateInvitationRequest,
  GetCollaboratorsRequest,
  PaginationParams,
} from '@/types/projects'

export class ProjectSupabaseClient {
  private supabase: ReturnType<typeof createSupabaseClient>

  constructor() {
    this.supabase = createSupabaseClient()
  }

  // Project Operations
  async createProject(data: CreateProjectData): Promise<Project> {
    const { data: result, error } = await this.supabase.rpc('create_project', {
      p_name: data.name,
      p_description: data.description || null,
      p_owner_id: (await this.getCurrentUser()).id,
    })

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    // Fetch the created project to return full details
    const { data: project } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', result)
      .single()

    return project
  }

  async getProjects(params?: GetProjectsRequest): Promise<ProjectWithUserRole[]> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase.rpc('get_user_projects', {
      p_user_id: user.user.id,
      p_include_archived: params?.include_archived || false,
      p_limit: params?.limit || 50,
      p_offset: params?.offset || 0,
    })

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`)
    }

    return data || []
  }

  async getProject(id: string): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`)
    }

    return data
  }

  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase.rpc('update_project', {
      p_project_id: id,
      p_name: data.name || null,
      p_description: data.description || null,
      p_status: data.status || null,
      p_user_id: user.user.id,
    })

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    // Fetch updated project
    return this.getProject(id)
  }

  async deleteProject(id: string): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase.rpc('delete_project', {
      p_project_id: id,
      p_user_id: user.user.id,
    })

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }
  }

  // Collaborator Operations
  async getCollaborators(
    projectId: string,
    params?: GetCollaboratorsRequest
  ): Promise<Collaborator[]> {
    const { data, error } = await this.supabase
      .from('project_collaborators')
      .select(
        `
        *,
        user:auth.users(
          id,
          email,
          raw_user_meta_data->>'name' as name,
          raw_user_meta_data->>'avatar_url' as avatar_url
        )
      `
      )
      .eq('project_id', projectId)
      .eq('joined_at', null) // Only active collaborators
      .order('joined_at', { ascending: false })
      .range(params?.offset || 0, (params?.offset || 0) + (params?.limit || 50) - 1)

    if (error) {
      throw new Error(`Failed to fetch collaborators: ${error.message}`)
    }

    return data.map(collaborator => ({
      ...collaborator,
      user: collaborator.user
        ? {
            id: collaborator.user.id,
            email: collaborator.user.email,
            name: collaborator.user.name,
            avatar_url: collaborator.user.avatar_url,
          }
        : undefined,
    }))
  }

  async inviteCollaborator(projectId: string, data: CreateInvitationRequest): Promise<Invitation> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { data: result, error } = await this.supabase.rpc('invite_collaborator', {
      p_project_id: projectId,
      p_invited_email: data.invited_email,
      p_role: data.role,
      p_invited_by: user.user.id,
    })

    if (error) {
      throw new Error(`Failed to invite collaborator: ${error.message}`)
    }

    // Fetch the created invitation
    const { data: invitation } = await this.supabase
      .from('project_invitations')
      .select('*')
      .eq('id', result)
      .single()

    return invitation
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase.rpc('remove_collaborator', {
      p_project_id: projectId,
      p_collaborator_user_id: userId,
      p_removed_by: user.user.id,
    })

    if (error) {
      throw new Error(`Failed to remove collaborator: ${error.message}`)
    }
  }

  // Invitation Operations
  async getInvitations(projectId?: string, params?: PaginationParams): Promise<Invitation[]> {
    let query = this.supabase.from('project_invitations').select(`
        *,
        project:projects(
          id,
          name,
          owner_id
        ),
        inviter:auth.users(
          id,
          email,
          raw_user_meta_data->>'name' as name
        )
      `)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(params?.offset || 0, (params?.offset || 0) + (params?.limit || 50) - 1)

    if (error) {
      throw new Error(`Failed to fetch invitations: ${error.message}`)
    }

    return data.map(invitation => ({
      ...invitation,
      project: invitation.project || undefined,
      inviter: invitation.inviter
        ? {
            id: invitation.inviter.id,
            email: invitation.inviter.email,
            name: invitation.inviter.name,
          }
        : undefined,
    }))
  }

  async acceptInvitation(token: string): Promise<string> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { data: projectId, error } = await this.supabase.rpc('accept_invitation', {
      p_token: token,
      p_user_id: user.user.id,
    })

    if (error) {
      throw new Error(`Failed to accept invitation: ${error.message}`)
    }

    return projectId
  }

  async declineInvitation(token: string): Promise<void> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase
      .from('project_invitations')
      .update({ declined_at: new Date().toISOString() })
      .eq('token', token)
      .eq('invited_email', user.user.email)

    if (error) {
      throw new Error(`Failed to decline invitation: ${error.message}`)
    }
  }

  // Utility Methods
  private async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser()
    if (error || !user) {
      throw new Error('User not authenticated')
    }
    return user
  }

  // Activity Log Operations
  async getActivityLog(
    projectId: string,
    params?: PaginationParams
  ): Promise<
    Array<{
      id: string
      project_id: string
      user_id: string
      action: string
      details: Record<string, unknown>
      created_at: string
      user?: {
        id: string
        email: string
        name?: string | null
      }
    }>
  > {
    const { data, error } = await this.supabase
      .from('project_activity_log')
      .select(
        `
        *,
        user:auth.users(
          id,
          email,
          raw_user_meta_data->>'name' as name
        )
      `
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(params?.offset || 0, (params?.offset || 0) + (params?.limit || 50) - 1)

    if (error) {
      throw new Error(`Failed to fetch activity log: ${error.message}`)
    }

    return data
  }

  // Permission checking
  async hasProjectAccess(projectId: string, requiredRole?: string): Promise<boolean> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      return false
    }

    const { data, error } = await this.supabase.rpc('get_user_projects', {
      p_user_id: user.user.id,
      p_include_archived: false,
      p_limit: 1,
      p_offset: 0,
    })

    if (error || !data || data.length === 0) {
      return false
    }

    const project = data.find((p: ProjectWithUserRole) => p.id === projectId)
    if (!project) {
      return false
    }

    if (requiredRole) {
      // Implement role hierarchy checking if needed
      const roleHierarchy = { owner: 3, editor: 2, viewer: 1 }
      const userRoleLevel = roleHierarchy[project.user_role as keyof typeof roleHierarchy] || 0
      const requiredRoleLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
      return userRoleLevel >= requiredRoleLevel
    }

    return true
  }
}

// Export singleton instance
export const projectSupabaseClient = new ProjectSupabaseClient()

// Export convenience functions
export const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getCollaborators,
  inviteCollaborator,
  removeCollaborator,
  getInvitations,
  acceptInvitation,
  declineInvitation,
  getActivityLog,
  hasProjectAccess,
} = {
  createProject: (data: CreateProjectData) => projectSupabaseClient.createProject(data),
  getProjects: (params?: GetProjectsRequest) => projectSupabaseClient.getProjects(params),
  getProject: (id: string) => projectSupabaseClient.getProject(id),
  updateProject: (id: string, data: UpdateProjectData) =>
    projectSupabaseClient.updateProject(id, data),
  deleteProject: (id: string) => projectSupabaseClient.deleteProject(id),
  getCollaborators: (projectId: string, params?: GetCollaboratorsRequest) =>
    projectSupabaseClient.getCollaborators(projectId, params),
  inviteCollaborator: (projectId: string, data: CreateInvitationRequest) =>
    projectSupabaseClient.inviteCollaborator(projectId, data),
  removeCollaborator: (projectId: string, userId: string) =>
    projectSupabaseClient.removeCollaborator(projectId, userId),
  getInvitations: (projectId?: string, params?: PaginationParams) =>
    projectSupabaseClient.getInvitations(projectId, params),
  acceptInvitation: (token: string) => projectSupabaseClient.acceptInvitation(token),
  declineInvitation: (token: string) => projectSupabaseClient.declineInvitation(token),
  getActivityLog: (projectId: string, params?: PaginationParams) =>
    projectSupabaseClient.getActivityLog(projectId, params),
  hasProjectAccess: (projectId: string, requiredRole?: string) =>
    projectSupabaseClient.hasProjectAccess(projectId, requiredRole),
}
