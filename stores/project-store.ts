/**
 * Project Store
 * Zustand store for managing project state
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  ProjectState,
  ProjectActions,
  CreateProjectData,
  UpdateProjectData,
  GetProjectsRequest,
  ProjectDetails,
} from '@/types/projects'

interface ProjectStore extends ProjectState, ProjectActions {}

export const useProjectStore = create<ProjectStore>()(
  devtools(
    set => ({
      // Initial state
      projects: [],
      currentProject: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false,
      },

      // Actions
      fetchProjects: async (params?: GetProjectsRequest) => {
        set({ loading: true, error: null })

        try {
          const searchParams = new URLSearchParams()

          if (params?.limit) {
            searchParams.set('limit', params.limit.toString())
          } else {
            searchParams.set('limit', '20')
          }

          if (params?.offset) {
            searchParams.set('offset', params.offset.toString())
          } else {
            searchParams.set('offset', '0')
          }

          if (params?.include_archived) {
            searchParams.set('include_archived', 'true')
          }

          const response = await fetch(`/api/projects?${searchParams.toString()}`)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Failed to fetch projects')
          }

          const result = await response.json()
          const { projects: newProjects, pagination } = result.data

          set(state => ({
            projects: params?.offset === 0 ? newProjects : [...state.projects, ...newProjects],
            pagination: {
              total: pagination.total,
              limit: pagination.limit,
              offset: pagination.offset,
              hasMore: pagination.hasMore,
            },
            loading: false,
            error: null,
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects'
          set({ loading: false, error: errorMessage })
          throw error
        }
      },

      createProject: async (data: CreateProjectData) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Failed to create project')
          }

          const result = await response.json()
          const newProject = result.data.project

          // Add the new project to the beginning of the list
          set(state => ({
            projects: [newProject, ...state.projects],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
            loading: false,
            error: null,
          }))

          return newProject
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create project'
          set({ loading: false, error: errorMessage })
          throw error
        }
      },

      updateProject: async (projectId: string, data: UpdateProjectData) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Failed to update project')
          }

          const result = await response.json()
          const updatedProject = result.data.project

          // Update project in the list
          set(state => ({
            projects: state.projects.map(project =>
              project.id === projectId ? updatedProject : project
            ),
            currentProject:
              state.currentProject?.id === projectId ? updatedProject : state.currentProject,
            loading: false,
            error: null,
          }))

          return updatedProject
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update project'
          set({ loading: false, error: errorMessage })
          throw error
        }
      },

      deleteProject: async (projectId: string) => {
        set({ loading: true, error: null })

        try {
          const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Failed to delete project')
          }

          // Remove project from the list
          set(state => ({
            projects: state.projects.filter(project => project.id !== projectId),
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
            currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            loading: false,
            error: null,
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
          set({ loading: false, error: errorMessage })
          throw error
        }
      },

      getProject: async (projectId: string): Promise<ProjectDetails> => {
        set({ loading: true, error: null })

        try {
          const response = await fetch(`/api/projects/${projectId}`)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'Failed to fetch project')
          }

          const result = await response.json()
          const projectDetails = result.data.project

          set({
            currentProject: projectDetails,
            loading: false,
            error: null,
          })

          return projectDetails
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project'
          set({ loading: false, error: errorMessage })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setCurrentProject: (project: ProjectDetails | null) => {
        set({ currentProject: project })
      },

      reset: () => {
        set({
          projects: [],
          currentProject: null,
          loading: false,
          error: null,
          pagination: {
            total: 0,
            limit: 20,
            offset: 0,
            hasMore: false,
          },
        })
      },
    }),
    {
      name: 'project-store',
    }
  )
)

// Selectors for optimized re-renders
export const useProjects = () => useProjectStore(state => state.projects)
export const useCurrentProject = () => useProjectStore(state => state.currentProject)
export const useProjectsLoading = () => useProjectStore(state => state.loading)
export const useProjectsError = () => useProjectStore(state => state.error)
export const useProjectsPagination = () => useProjectStore(state => state.pagination)

// Individual action selectors to prevent infinite re-renders
export const useFetchProjects = () => useProjectStore(state => state.fetchProjects)
export const useCreateProject = () => useProjectStore(state => state.createProject)
export const useUpdateProject = () => useProjectStore(state => state.updateProject)
export const useDeleteProject = () => useProjectStore(state => state.deleteProject)
export const useGetProject = () => useProjectStore(state => state.getProject)
export const useClearError = () => useProjectStore(state => state.clearError)
export const useSetCurrentProject = () => useProjectStore(state => state.setCurrentProject)
export const useResetProjects = () => useProjectStore(state => state.reset)
