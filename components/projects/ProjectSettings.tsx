/**
 * ProjectSettings Component
 * Provides a comprehensive settings interface for project management
 * Allows owners to rename, change status, and manage project details
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'
import {
  ProjectStatus,
  ProjectRole,
  ProjectDetails,
  UpdateProjectData,
  validateProjectData,
  ProjectValidationError,
} from '@/types/projects'
import { formatRelativeTime } from '@/lib/utils/date'
import {
  Save,
  ArrowLeft,
  Settings,
  Archive,
  Trash2,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

interface ProjectSettingsProps {
  project: ProjectDetails
  userRole: ProjectRole
  onUpdate?: (projectId: string, data: UpdateProjectData) => Promise<void>
  onDelete?: (projectId: string) => Promise<void>
  className?: string
}

export function ProjectSettings({
  project,
  userRole,
  onUpdate,
  onDelete,
  className = '',
}: ProjectSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status,
  })

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Check if user can make changes
  const canManageProject = userRole === 'owner'
  const canEditProject = userRole === 'owner' || userRole === 'editor'

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    setHasChanges(true)
  }

  // Validate form data
  const validateForm = (): boolean => {
    const validation = validateProjectData(formData)

    if (!validation.isValid) {
      const newErrors: Record<string, string> = {}
      validation.errors.forEach((error: ProjectValidationError) => {
        newErrors[error.field] = error.message
      })
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  // Handle form submission
  const handleSave = async () => {
    if (!canEditProject || !onUpdate) return

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const updateData: UpdateProjectData = {}

      if (formData.name !== project.name) {
        updateData.name = formData.name
      }

      if (formData.description !== (project.description || '')) {
        updateData.description = formData.description || null
      }

      if (formData.status !== project.status) {
        updateData.status = formData.status as ProjectStatus
      }

      // Only update if there are actual changes
      if (Object.keys(updateData).length > 0) {
        await onUpdate(project.id, updateData)
        setHasChanges(false)

        toast({
          title: 'Success',
          description: 'Project settings updated successfully.',
        })
      } else {
        toast({
          title: 'No Changes',
          description: 'No changes to save.',
        })
      }
    } catch (error) {
      console.error('Failed to update project:', error)
      toast({
        title: 'Error',
        description: 'Failed to update project settings.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle project deletion
  const handleDelete = async () => {
    if (!canManageProject || !onDelete) return

    setIsDeleting(true)
    try {
      await onDelete(project.id)
      toast({
        title: 'Success',
        description: 'Project deleted successfully.',
      })

      // Redirect to projects page
      router.push('/protected/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle status change
  const handleStatusChange = (newStatus: ProjectStatus) => {
    handleInputChange('status', newStatus)
  }

  // Get status badge color
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

  // Get role badge color
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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">Project Settings</h1>
          </div>
        </div>

        {hasChanges && canEditProject && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Project Overview
          </CardTitle>
          <CardDescription>Basic information and settings for your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              disabled={!canEditProject}
              placeholder="Enter project name"
              className={errors.name ? 'border-red-500' : ''}
              maxLength={100}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            <p className="text-xs text-muted-foreground">{formData.name.length}/100 characters</p>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              disabled={!canEditProject}
              placeholder="Enter project description (optional)"
              className={errors.description ? 'border-red-500' : ''}
              rows={4}
              maxLength={500}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-xs text-muted-foreground">
              {(formData.description || '').length}/500 characters
            </p>
          </div>

          {/* Project Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Project Status</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
              disabled={!canManageProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Active
                  </div>
                </SelectItem>
                <SelectItem value="archived">
                  <div className="flex items-center">
                    <Archive className="mr-2 h-4 w-4 text-yellow-600" />
                    Archived
                  </div>
                </SelectItem>
                <SelectItem value="suspended">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                    Suspended
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only project owners can change the project status
            </p>
          </div>

          {/* Current Status Display */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Current status:</span>
            <Badge className={getStatusColor(formData.status as ProjectStatus)} variant="secondary">
              {formData.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Information about this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Project ID */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Project ID</Label>
              <p className="rounded bg-muted px-2 py-1 font-mono text-sm">{project.id}</p>
            </div>

            {/* Your Role */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Your Role</Label>
              <div className="mt-1 flex items-center space-x-2">
                <Badge className={getRoleColor(userRole)} variant="secondary">
                  {userRole}
                </Badge>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Created Date */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Created</Label>
              <div className="mt-1 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {project.created_at ? formatRelativeTime(project.created_at) : 'Unknown'}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <div className="mt-1 flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {project.updated_at ? formatRelativeTime(project.updated_at) : 'Unknown'}
                </p>
              </div>
            </div>

            {/* Collaborators Count */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Collaborators</Label>
              <p className="mt-1 text-sm">{project.collaborators_count} members</p>
            </div>

            {/* Owner */}
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Project Owner</Label>
              <p className="mt-1 text-sm">{project.owner_name || 'Unknown'}</p>
              {project.owner_email && (
                <p className="text-xs text-muted-foreground">{project.owner_email}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {canManageProject && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions that will affect your project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h4 className="font-medium">Delete Project</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this project and all associated data. This action cannot be
                  undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <strong> &quot;{project.name}&quot; </strong>
              and all associated data including:
              <ul className="mt-2 list-inside list-disc text-sm">
                <li>All project files and assets</li>
                <li>Collaborator permissions</li>
                <li>Project history and activity logs</li>
                <li>Any related settings or configurations</li>
              </ul>
              <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This action is irreversible and will affect all project
                  collaborators.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ProjectSettings
