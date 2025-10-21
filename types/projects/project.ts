/**
 * Core project types for the project management feature
 */

export interface Project {
  id: string
  name: string
  description?: string | null
  owner_id: string
  created_at: string
  updated_at: string
  is_deleted: boolean
  settings: Record<string, unknown>
  status: ProjectStatus
}

export type ProjectStatus = 'active' | 'archived' | 'suspended'

export interface CreateProjectData {
  name: string
  description?: string | null
}

export interface UpdateProjectData {
  name?: string
  description?: string | null
  status?: ProjectStatus
}

export interface ProjectWithUserRole extends Project {
  user_role: ProjectRole
}

export type ProjectRole = 'owner' | 'editor' | 'viewer'

export interface ProjectListResponse {
  projects: ProjectWithUserRole[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ProjectDetails extends Project {
  collaborators_count: number
  last_activity?: string
  owner_name?: string
  owner_email?: string
}

// API Request/Response types
export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface CreateProjectResponse {
  project: Project
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: ProjectStatus
}

export interface UpdateProjectResponse {
  project: Project
}

export interface GetProjectsRequest {
  limit?: number
  offset?: number
  include_archived?: boolean
}

export interface GetProjectsResponse {
  projects: ProjectWithUserRole[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface GetProjectResponse {
  project: ProjectDetails
}

export interface DeleteProjectResponse {
  success: boolean
}

// Validation types
export interface ProjectValidationError {
  field: string
  message: string
  code?: string
}

export interface ProjectValidationResult {
  isValid: boolean
  errors: ProjectValidationError[]
}

// Form types for UI components
export interface ProjectFormData {
  name: string
  description: string
}

export interface ProjectFormState {
  data: ProjectFormData
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// Store types for state management
export interface ProjectState {
  projects: ProjectWithUserRole[]
  currentProject: ProjectDetails | null
  loading: boolean
  error: string | null
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ProjectActions {
  fetchProjects: (params?: GetProjectsRequest) => Promise<void>
  createProject: (data: CreateProjectData) => Promise<Project>
  updateProject: (id: string, data: UpdateProjectData) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  getProject: (id: string) => Promise<ProjectDetails>
  clearError: () => void
  setCurrentProject: (project: ProjectDetails | null) => void
  reset: () => void
}

// Validation function for project data
export function validateProjectData(data: Partial<ProjectFormData>): ProjectValidationResult {
  const errors: ProjectValidationError[] = []

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Project name is required',
      code: 'REQUIRED',
    })
  } else if (data.name.trim().length > 100) {
    errors.push({
      field: 'name',
      message: 'Project name must be 100 characters or less',
      code: 'TOO_LONG',
    })
  }

  // Validate description (optional but has length limit if provided)
  if (data.description && data.description.trim().length > 500) {
    errors.push({
      field: 'description',
      message: 'Description must be 500 characters or less',
      code: 'TOO_LONG',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
