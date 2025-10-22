/**
 * 项目操作按钮组件
 * 跨不同组件的项目操作共享按钮
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { MoreHorizontal, Edit, Trash2, Archive, ExternalLink, Settings } from 'lucide-react'
import { projectAPI, logError } from '@/lib/projects/api-client'
import type { ProjectRole } from '@/types/projects'

interface ProjectActionButtonsProps {
  projectId: string
  projectName: string
  userRole: ProjectRole
  className?: string
  showSettings?: boolean
  onActionComplete?: () => void
}

interface ActionState {
  isDeleting: boolean
  isArchiving: boolean
  isEditing: boolean
  deleteDialogOpen: boolean
  archiveDialogOpen: boolean
}

export function ProjectActionButtons({
  projectId,
  projectName,
  userRole,
  className,
  showSettings = false,
  onActionComplete,
}: ProjectActionButtonsProps) {
  const [actionState, setActionState] = useState<ActionState>({
    isDeleting: false,
    isArchiving: false,
    isEditing: false,
    deleteDialogOpen: false,
    archiveDialogOpen: false,
  })

  const updateActionState = (updates: Partial<ActionState>) => {
    setActionState(prev => ({ ...prev, ...updates }))
  }

  const handleDeleteProject = async () => {
    try {
      updateActionState({ isDeleting: true })
      const result = await projectAPI.delete(projectId)

      if (result.success) {
        updateActionState({ deleteDialogOpen: false })
        onActionComplete?.()
      } else {
        logError('Delete Project', result.error, { projectId, projectName })
      }
    } catch (error) {
      logError('Delete Project', error, { projectId, projectName })
    } finally {
      updateActionState({ isDeleting: false })
    }
  }

  const handleArchiveProject = async () => {
    try {
      updateActionState({ isArchiving: true })
      const result = await projectAPI.archive(projectId)

      if (result.success) {
        updateActionState({ archiveDialogOpen: false })
        onActionComplete?.()
      } else {
        logError('Archive Project', result.error, { projectId, projectName })
      }
    } catch (error) {
      logError('Archive Project', error, { projectId, projectName })
    } finally {
      updateActionState({ isArchiving: false })
    }
  }

  const isOwner = userRole === 'owner'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showSettings && (
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              设置
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            重命名
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            在设计器中打开
            <span className="ml-2 rounded bg-muted px-2 py-1 text-xs">即将推出</span>
          </DropdownMenuItem>

          {isOwner && <DropdownMenuSeparator />}

          {isOwner && (
            <DropdownMenuItem onClick={() => updateActionState({ archiveDialogOpen: true })}>
              <Archive className="mr-2 h-4 w-4" />
              归档
            </DropdownMenuItem>
          )}

          {isOwner && (
            <DropdownMenuItem
              onClick={() => updateActionState({ deleteDialogOpen: true })}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={actionState.deleteDialogOpen}
        onOpenChange={open => updateActionState({ deleteDialogOpen: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除项目</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除 &quot;{projectName}&quot; 吗？此操作无法 撤销，所有项目数据将永久丢失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionState.isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={actionState.isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {actionState.isDeleting ? '删除中...' : '删除项目'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog
        open={actionState.archiveDialogOpen}
        onOpenChange={open => updateActionState({ archiveDialogOpen: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>归档项目</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要归档 &quot;{projectName}&quot; 吗？项目将从 主视图隐藏，但以后可以恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionState.isArchiving}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveProject} disabled={actionState.isArchiving}>
              {actionState.isArchiving ? '归档中...' : '归档项目'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
