/**
 * 项目列表组件
 * 显示用户的项目列表，包含筛选和分页功能
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

  // 根据 ID 移除重复项目，保留第一次出现
  const uniqueProjects = projects.filter(
    (project: ProjectWithUserRole, index: number, self: ProjectWithUserRole[]) => {
      // 跳过没有有效 ID 的项目
      if (!project.id) return false
      return index === self.findIndex((p: ProjectWithUserRole) => p.id === project.id)
    }
  )

  // 根据搜索和状态筛选项目
  const filteredProjects = uniqueProjects.filter((project: ProjectWithUserRole) => {
    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // 组件挂载时加载项目
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
          <p className="text-lg font-medium">加载项目出错</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
        <Button onClick={() => fetchProjects()} variant="outline">
          重试
        </Button>
      </div>
    )
  }

  if (loading && projects.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-muted-foreground">正在加载项目...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 带控件的页头 */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">项目</h2>
          <p className="text-muted-foreground">共 {pagination.total} 个项目</p>
        </div>

        {showCreateButton && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新建项目
          </Button>
        )}
      </div>

      {/* 筛选器和搜索 */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="按状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有项目</SelectItem>
            <SelectItem value="active">活跃</SelectItem>
            <SelectItem value="archived">已归档</SelectItem>
            <SelectItem value="suspended">已暂停</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 项目网格 */}
      {filteredProjects.length === 0 && !loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">未找到项目</h3>
          <p className="mb-6 text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? '请尝试调整您的搜索或筛选条件'
              : '通过创建您的第一个项目来开始'}
          </p>
          {showCreateButton && !searchQuery && statusFilter === 'all' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              创建项目
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

      {/* 加载更多按钮 */}
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
                加载中...
              </>
            ) : (
              '加载更多'
            )}
          </Button>
        </div>
      )}

      {/* 分页加载覆盖层 */}
      {loading && projects.length > 0 && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-muted-foreground">正在加载更多项目...</span>
        </div>
      )}

      {/* 创建项目模态框 */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  )
}

export default ProjectList
