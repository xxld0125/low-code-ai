/**
 * CreateProjectModal Component
 * Modal for creating a new project
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { validateProjectData } from '@/types/projects'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, X } from 'lucide-react'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description?: string }) => Promise<void>
  initialData?: {
    name?: string
    description?: string
  }
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSubmit,
  initialData = {},
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Memoize initialData to prevent unnecessary re-renders
  const memoizedInitialData = useMemo(() => initialData, [initialData])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        name: memoizedInitialData.name || '',
        description: memoizedInitialData.description || '',
      })
      setErrors({})
      setSubmitError(null)
    }
  }, [open, memoizedInitialData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Clear general submit error when user makes changes
    if (submitError) {
      setSubmitError(null)
    }
  }

  const validateForm = () => {
    const validation = validateProjectData(formData)

    if (!validation.isValid) {
      const fieldErrors: Record<string, string> = {}
      validation.errors.forEach(error => {
        fieldErrors[error.field] = error.message
      })
      setErrors(fieldErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })

      // Reset form on success
      setFormData({ name: '', description: '' })
      setErrors({})

      // Parent component should close the modal
    } catch (error: unknown) {
      console.error('Failed to create project:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Create a new project to start building your low-code application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Enter project name"
              disabled={isSubmitting}
              className={errors.name ? 'border-red-500' : ''}
              maxLength={100}
              autoFocus
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            <p className="text-xs text-muted-foreground">{formData.name.length}/100 characters</p>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Describe your project (optional)"
              disabled={isSubmitting}
              className={errors.description ? 'border-red-500' : ''}
              maxLength={500}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Submit Error */}
          {submitError && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProjectModal
