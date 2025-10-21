/**
 * Create Project Page
 * Dedicated page for creating a new project
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { validateProjectData } from '@/types/projects'
import { useProjectStore } from '@/stores/project-store'
import { ArrowLeft, Plus, X, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CreateProjectPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const { createProject } = useProjectStore()

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
      const newProject = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })

      setIsSuccess(true)

      // Redirect to the new project after a short delay
      setTimeout(() => {
        router.push(`/protected/projects/${newProject.id}`)
      }, 1500)
    } catch (error) {
      console.error('Failed to create project:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Project Created Successfully!</CardTitle>
              <CardDescription>
                Your new project &quot;{formData.name}&quot; has been created and you&apos;ll be
                redirected to it shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href={`/protected/projects`}>Go to Projects</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
            <p className="mt-2 text-muted-foreground">
              Set up a new project for your low-code development
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Project Details
            </CardTitle>
            <CardDescription>Provide the basic information for your new project</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <p className="text-xs text-muted-foreground">
                  {formData.name.length}/100 characters
                </p>
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
                  rows={4}
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

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Project...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                1
              </div>
              <div>
                <p className="font-medium">Give your project a name</p>
                <p className="text-sm text-muted-foreground">
                  Choose a descriptive name that helps you identify the project&apos;s purpose
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                2
              </div>
              <div>
                <p className="font-medium">Add a description (optional)</p>
                <p className="text-sm text-muted-foreground">
                  Provide context about what this project will accomplish
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                3
              </div>
              <div>
                <p className="font-medium">Start building</p>
                <p className="text-sm text-muted-foreground">
                  Once created, you can start designing your low-code application
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
