/**
 * ProjectList Component
 * Displays a list of user's projects with filtering and pagination
 */

'use client'

import { useState, useEffect } from 'react'
import { ProjectCard } from './ProjectCard'
import { CreateProjectModal } from './CreateProjectModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  useProjectStore,
  useFetchProjects,
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
} from '@/stores/project-store'
import { Plus, Search, Filter } from 'lucide-react'
import type { ProjectWithUserRole, UpdateProjectData } from '@/types/projects'

interface ProjectListProps {
  className?: string
  showCreateButton?: boolean
}

export function ProjectList({ className = '', showCreateButton = true }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { projects, loading, error, pagination } = useProjectStore()

  const fetchProjects = useFetchProjects()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const updateProject = useUpdateProject()

  // Remove duplicate projects by ID, keeping the first occurrence
  const uniqueProjects = projects.filter(
    (project: ProjectWithUserRole, index: number, self: ProjectWithUserRole[]) => {
      // Skip projects without valid IDs
      if (!project.id) return false
      return index === self.findIndex((p: ProjectWithUserRole) => p.id === project.id)
    }
  )

  // Filter projects based on search and status
  const filteredProjects = uniqueProjects.filter((project: ProjectWithUserRole) => {
    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Load projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = async (data: { name: string; description?: string }) => {
    try {
      await createProject(data)
      setIsCreateModalOpen(false)

      await fetchProjects({ limit: pagination.limit, offset: 0 })
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleUpdateProject = async (projectId: string, data: UpdateProjectData) => {
    try {
      await updateProject(projectId, data)
    } catch (error) {
      console.error('Failed to update project:', error)
    }
  }

  const handleLoadMore = async () => {
    if (pagination.hasMore && !loading) {
      await fetchProjects({
        limit: pagination.limit,
        offset: pagination.offset + pagination.limit,
      })
    }
  }

  if (error) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mb-4 text-red-600">
          <p className="text-lg font-medium">Error loading projects</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
        <Button onClick={() => fetchProjects()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (loading && projects.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-muted-foreground">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? 'project' : 'projects'} total
          </p>
        </div>

        {showCreateButton && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Filters and search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project grid */}
      {filteredProjects.length === 0 && !loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No projects found</h3>
          <p className="mb-6 text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'}
          </p>
          {showCreateButton && !searchQuery && statusFilter === 'all' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project: ProjectWithUserRole, index: number) => (
            <ProjectCard
              key={project.id || `project-${index}`}
              project={project}
              onDelete={handleDeleteProject}
              onUpdate={handleUpdateProject}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {pagination.hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            className="min-w-32"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && projects.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more projects...</span>
        </div>
      )}

      {/* Create project modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}

export default ProjectList
