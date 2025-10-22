/**
 * 创建项目模态框组件
 * 用于创建新项目的模态框
 */

'use client'

import { useState, useEffect } from 'react'
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

const EMPTY_INITIAL_DATA = {}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSubmit,
  initialData = EMPTY_INITIAL_DATA,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // 模态框打开/关闭时重置表单
  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
      })
      setErrors({})
      setSubmitError(null)
    }
  }, [open, initialData.name, initialData.description])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // 用户开始输入时清除该字段的错误信息
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // 用户更改时清除一般的提交错误
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

      // 成功时重置表单
      setFormData({ name: '', description: '' })
      setErrors({})

      // 父组件应该关闭模态框
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
            创建新项目
          </DialogTitle>
          <DialogDescription>创建一个新项目来开始构建您的低代码应用程序。</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 项目名称 */}
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称 *</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="输入项目名称"
              disabled={isSubmitting}
              className={errors.name ? 'border-red-500' : ''}
              maxLength={100}
              autoFocus
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            <p className="text-xs text-muted-foreground">{formData.name.length}/100 字符</p>
          </div>

          {/* 项目描述 */}
          <div className="space-y-2">
            <Label htmlFor="project-description">描述</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="描述您的项目（可选）"
              disabled={isSubmitting}
              className={errors.description ? 'border-red-500' : ''}
              maxLength={500}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            <p className="text-xs text-muted-foreground">{formData.description.length}/500 字符</p>
          </div>

          {/* 提交错误 */}
          {submitError && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  创建中...
                </>
              ) : (
                '创建项目'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateProjectModal
