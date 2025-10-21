/**
 * Database query functions for project management
 * Provides optimized and reusable query functions
 */

import { createClient } from '@/lib/supabase/server'
import type {
  Project,
  ProjectWithUserRole,
  Collaborator,
  Invitation,
  PaginationParams,
  GetProjectsRequest,
  GetCollaboratorsRequest,
} from '@/types/projects'

// Database query result types
interface DbProject extends Project {
  owner?: {
    id: string
    name?: string | null
    email: string
  }
}

interface DbCollaborator {
  id: string
  project_id: string
  user_id: string
  role: string
  invited_at: string
  joined_at?: string | null
  last_accessed_at?: string | null
  user?: {
    id: string
    email: string
    name?: string | null
    avatar_url?: string | null
  }
}

interface DbInvitation {
  id: string
  project_id: string
  invited_by: string
  invited_email: string
  role: string
  token: string
  expires_at: string
  accepted_at?: string | null
  declined_at?: string | null
  created_at: string
  project?: Project
  inviter?: {
    id: string
    email: string
    name?: string | null
    avatar_url?: string | null
  }
}

interface ActivityLogEntry {
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
}

/**
 * Get projects for a user with their role in each project
 */
export async function getUserProjects(
  userId: string,
  params: GetProjectsRequest = {}
): Promise<ProjectWithUserRole[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_user_projects', {
    p_user_id: userId,
    p_include_archived: params.include_archived || false,
    p_limit: params.limit || 50,
    p_offset: params.offset || 0,
  })

  if (error) {
    throw new Error(`Failed to fetch user projects: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single project by ID with permission check
 */
export async function getProjectById(projectId: string, userId: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('is_deleted', false)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Project not found
    }
    throw new Error(`Failed to fetch project: ${error.message}`)
  }

  // Check if user has access to this project
  const hasAccess = await checkProjectAccess(projectId, userId)
  if (!hasAccess) {
    throw new Error('Access denied to this project')
  }

  return data
}

/**
 * Get project details with additional information
 */
export async function getProjectDetails(
  projectId: string,
  userId: string
): Promise<
  Project & {
    owner_name?: string
    owner_email?: string
    collaborators_count?: number
    last_activity?: string | null
  }
> {
  const supabase = await createClient()

  // Check access first
  const hasAccess = await checkProjectAccess(projectId, userId)
  if (!hasAccess) {
    throw new Error('Access denied to this project')
  }

  // Get project with owner information
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(
      `
      *,
      owner:auth.users(
        id,
        email,
        raw_user_meta_data->>'name' as name
      )
    `
    )
    .eq('id', projectId)
    .eq('is_deleted', false)
    .single()

  if (projectError) {
    throw new Error(`Failed to fetch project details: ${projectError.message}`)
  }

  // Get collaborators count
  const { count: collaboratorsCount } = await supabase
    .from('project_collaborators')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('joined_at', null)

  // Get latest activity
  const { data: latestActivity } = await supabase
    .from('project_activity_log')
    .select('created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return {
    ...(project as DbProject),
    owner_name: (project as DbProject)?.owner?.name || (project as DbProject)?.owner?.email,
    owner_email: (project as DbProject)?.owner?.email,
    collaborators_count: collaboratorsCount || 0,
    last_activity: latestActivity?.created_at || null,
  }
}

/**
 * Get collaborators for a project with user details
 */
export async function getProjectCollaborators(
  projectId: string,
  userId: string,
  params: GetCollaboratorsRequest = { project_id: projectId, limit: 50, offset: 0 }
): Promise<Collaborator[]> {
  const supabase = await createClient()

  // Check access first
  const hasAccess = await checkProjectAccess(projectId, userId)
  if (!hasAccess) {
    throw new Error('Access denied to this project')
  }

  const { data, error } = await supabase
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
    .order('joined_at', { ascending: false })
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1)

  if (error) {
    throw new Error(`Failed to fetch collaborators: ${error.message}`)
  }

  return data.map(
    (collaborator: DbCollaborator): Collaborator => ({
      ...collaborator,
      role: collaborator.role as Collaborator['role'],
      user: collaborator.user
        ? {
            id: collaborator.user.id,
            email: collaborator.user.email,
            name: collaborator.user.name,
            avatar_url: collaborator.user.avatar_url,
          }
        : undefined,
    })
  )
}

/**
 * Get invitations for a project
 */
export async function getProjectInvitations(
  projectId: string,
  userId: string,
  params: PaginationParams = {}
): Promise<Invitation[]> {
  const supabase = await createClient()

  // Check if user is project owner
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single()

  if (!project || project.owner_id !== userId) {
    throw new Error('Only project owners can view invitations')
  }

  const { data, error } = await supabase
    .from('project_invitations')
    .select(
      `
      *,
      inviter:auth.users(
        id,
        email,
        raw_user_meta_data->>'name' as name
      )
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1)

  if (error) {
    throw new Error(`Failed to fetch invitations: ${error.message}`)
  }

  return data.map(
    (invitation: DbInvitation): Invitation => ({
      ...invitation,
      role: invitation.role as Invitation['role'],
      inviter: invitation.inviter
        ? {
            id: invitation.inviter.id,
            email: invitation.inviter.email,
            name: invitation.inviter.name,
          }
        : undefined,
    })
  )
}

/**
 * Get user's pending invitations
 */
export async function getUserInvitations(
  userId: string,
  params: PaginationParams = {}
): Promise<Invitation[]> {
  const supabase = await createClient()

  // Get user email first
  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  if (!userData.user) {
    throw new Error('User not found')
  }

  const userEmail = userData.user.email

  const { data, error } = await supabase
    .from('project_invitations')
    .select(
      `
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
    `
    )
    .eq('invited_email', userEmail!)
    .eq('accepted_at', null)
    .eq('declined_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1)

  if (error) {
    throw new Error(`Failed to fetch user invitations: ${error.message}`)
  }

  return data.map(
    (invitation: DbInvitation): Invitation => ({
      ...invitation,
      role: invitation.role as Invitation['role'],
      project: invitation.project || undefined,
      inviter: invitation.inviter
        ? {
            id: invitation.inviter.id,
            email: invitation.inviter.email,
            name: invitation.inviter.name,
          }
        : undefined,
    })
  )
}

/**
 * Get activity log for a project
 */
export async function getProjectActivityLog(
  projectId: string,
  userId: string,
  params: PaginationParams = {}
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
  const supabase = await createClient()

  // Check access first
  const hasAccess = await checkProjectAccess(projectId, userId)
  if (!hasAccess) {
    throw new Error('Access denied to this project')
  }

  const { data, error } = await supabase
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
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1)

  if (error) {
    throw new Error(`Failed to fetch activity log: ${error.message}`)
  }

  return data as unknown as ActivityLogEntry[]
}

/**
 * Check if user has access to a project
 */
export async function checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_user_projects', {
    p_user_id: userId,
    p_include_archived: false,
    p_limit: 1,
    p_offset: 0,
  })

  if (error || !data) {
    return false
  }

  return data.some((project: ProjectWithUserRole) => project.id === projectId)
}

/**
 * Get user's role in a project
 */
export async function getUserProjectRole(
  projectId: string,
  userId: string
): Promise<string | null> {
  const supabase = await createClient()

  // Check if user is owner
  const { data: project } = await supabase
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .single()

  if (project && project.owner_id === userId) {
    return 'owner'
  }

  // Check collaborator role
  const { data: collaborator } = await supabase
    .from('project_collaborators')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('joined_at', null)
    .single()

  return collaborator?.role || null
}

/**
 * Search projects by name or description
 */
export async function searchProjects(
  userId: string,
  query: string,
  params: GetProjectsRequest = {}
): Promise<ProjectWithUserRole[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      project_collaborators!inner(
        user_id,
        role
      )
    `
    )
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_deleted', false)
    .or(`owner_id.eq.${userId},project_collaborators.user_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1)

  if (error) {
    throw new Error(`Failed to search projects: ${error.message}`)
  }

  // Transform data to include user role
  return data.map(project => {
    const isOwner = project.owner_id === userId
    const collaboratorRole = project.project_collaborators?.[0]?.role

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
      status: project.status,
      is_deleted: project.is_deleted,
      settings: project.settings,
      user_role: isOwner ? 'owner' : collaboratorRole || 'viewer',
    }
  })
}

/**
 * Get project statistics
 */
export async function getProjectStatistics(
  projectId: string,
  userId: string
): Promise<{
  collaborators_count: number
  pending_invitations_count: number
  total_activities_count: number
  recent_activities_count: number
}> {
  const supabase = await createClient()

  // Check access first
  const hasAccess = await checkProjectAccess(projectId, userId)
  if (!hasAccess) {
    throw new Error('Access denied to this project')
  }

  // Get various counts
  const [
    { count: collaboratorsCount },
    { count: pendingInvitationsCount },
    { count: totalActivitiesCount },
  ] = await Promise.all([
    supabase
      .from('project_collaborators')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('joined_at', null),

    supabase
      .from('project_invitations')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('accepted_at', null)
      .eq('declined_at', null)
      .gt('expires_at', new Date().toISOString()),

    supabase
      .from('project_activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId),
  ])

  // Get recent activity count (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: recentActivitiesCount } = await supabase
    .from('project_activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  return {
    collaborators_count: collaboratorsCount || 0,
    pending_invitations_count: pendingInvitationsCount || 0,
    total_activities_count: totalActivitiesCount || 0,
    recent_activities_count: recentActivitiesCount || 0,
  }
}
