/**
 * 项目卡片组件
 * 以卡片格式显示单个项目并包含操作按钮
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ProjectStatus, ProjectRole, UpdateProjectData } from '@/types/projects'
import { formatRelativeTime } from '@/lib/utils/date'
import {
  MoreHorizontal,
  Settings,
  Users,
  Archive,
  Trash2,
  ExternalLink,
  Edit,
  Eye,
} from 'lucide-react'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string | null
    status: ProjectStatus
    user_role: ProjectRole
    created_at: string
    updated_at: string
    collaborators_count?: number
    last_accessed_at?: string | null
  }
  onDelete?: (projectId: string) => Promise<void>
  onUpdate?: (projectId: string, data: UpdateProjectData) => Promise<void>
  onRename?: (projectId: string, newName: string) => Promise<void>
  className?: string
}

export function ProjectCard({
  project,
  onDelete,
  onUpdate,
  onRename,
  className = '',
}: ProjectCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newName, setNewName] = useState(project.name || '')
  const [isRenaming, setIsRenaming] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(project.id)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleArchive = async () => {
    if (!onUpdate) return

    setIsUpdating(true)
    try {
      const newStatus = project.status === 'archived' ? 'active' : 'archived'
      await onUpdate(project.id, { status: newStatus })
    } catch (error) {
      console.error('Failed to archive project:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRename = async () => {
    if (!onRename || !newName.trim()) return

    setIsRenaming(true)
    try {
      await onRename(project.id, newName.trim())
      setIsRenameDialogOpen(false)
    } catch (error) {
      console.error('Failed to rename project:', error)
    } finally {
      setIsRenaming(false)
    }
  }

  const openRenameDialog = () => {
    setNewName(project.name)
    setIsRenameDialogOpen(true)
  }

  const canManageProject = project.user_role === 'owner' || project.user_role === 'editor'

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getRoleColor = (role: ProjectRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'editor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <>
      <Card className={`relative transition-shadow hover:shadow-md ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-lg font-semibold">
                <Link
                  href={`/protected/projects/${project.id}`}
                  className="transition-colors hover:text-primary"
                >
                  {project.name}
                </Link>
              </CardTitle>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={getStatusColor(project.status)} variant="secondary">
                  {project.status}
                </Badge>
                <Badge className={getRoleColor(project.user_role)} variant="secondary">
                  {project.user_role}
                </Badge>
              </div>
            </div>

            {canManageProject && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/protected/projects/${project.id}`} className="flex items-center">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      打开项目
                    </Link>
                  </DropdownMenuItem>

                  {canManageProject && (
                    <>
                      <DropdownMenuItem onClick={openRenameDialog} className="flex items-center">
                        <Edit className="mr-2 h-4 w-4" />
                        重命名项目
                      </DropdownMenuItem>
                    </>
                  )}

                  {project.user_role === 'owner' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/protected/projects/${project.id}/settings`}
                          className="flex items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          设置
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={handleArchive}
                        disabled={isUpdating}
                        className="flex items-center"
                      >
                        {isUpdating ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Archive className="mr-2 h-4 w-4" />
                        )}
                        {project.status === 'archived' ? '取消归档' : '归档'}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="flex items-center text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除项目
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {project.description && (
            <CardDescription className="mt-2 line-clamp-2">{project.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="pb-3">
          <div className="space-y-2">
            {/* 协作者数量 */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              {project.collaborators_count || 1}{' '}
              {project.collaborators_count === 1 ? '个协作者' : '个协作者'}
            </div>

            {/* 最后更新 */}
            <div className="text-xs text-muted-foreground">
              更新于 {formatRelativeTime(project.updated_at)}
            </div>

            {/* 最后访问 */}
            {project.last_accessed_at && (
              <div className="text-xs text-muted-foreground">
                最后访问于 {formatRelativeTime(project.last_accessed_at)}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Link href={`/protected/projects/${project.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              {project.user_role === 'viewer' ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  查看项目
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  {project.status === 'archived' ? '管理项目' : '打开项目'}
                </>
              )}
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除项目 &quot;
              {project.name}&quot; 和所有相关数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  删除中...
                </>
              ) : (
                '删除项目'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 重命名对话框 */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名项目</DialogTitle>
            <DialogDescription>
              为 &quot;{project.name}&quot; 输入新名称。项目名称必须为 100 个字符或更少。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">项目名称</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="输入项目名称"
                maxLength={100}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newName.trim()) {
                    handleRename()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">{newName.length}/100 字符</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              取消
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || isRenaming}>
              {isRenaming ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  重命名中...
                </>
              ) : (
                '重命名项目'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProjectCard
