/**
 * ProjectActionButtons Component
 * Shared action buttons for project operations across different components
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
              Settings
            </DropdownMenuItem>
          )}

          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Designer
            <span className="ml-2 rounded bg-muted px-2 py-1 text-xs">Coming Soon</span>
          </DropdownMenuItem>

          {isOwner && <DropdownMenuSeparator />}

          {isOwner && (
            <DropdownMenuItem onClick={() => updateActionState({ archiveDialogOpen: true })}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}

          {isOwner && (
            <DropdownMenuItem
              onClick={() => updateActionState({ deleteDialogOpen: true })}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={actionState.deleteDialogOpen}
        onOpenChange={open => updateActionState({ deleteDialogOpen: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projectName}&quot;? This action cannot be
              undone and all project data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionState.isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={actionState.isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {actionState.isDeleting ? 'Deleting...' : 'Delete Project'}
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
            <AlertDialogTitle>Archive Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive &quot;{projectName}&quot;? The project will be hidden
              from the main view but can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionState.isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveProject} disabled={actionState.isArchiving}>
              {actionState.isArchiving ? 'Archiving...' : 'Archive Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
