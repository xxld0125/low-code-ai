/**
 * 创建项目页面
 * 用于创建新项目的专用页面
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

    // 当用户开始输入时清除该字段的错误信息
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // 当用户更改时清除一般的提交错误
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

      // 短暂延迟后重定向到新项目
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

  // 成功状态
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>项目创建成功！</CardTitle>
              <CardDescription>
                您的新项目 &quot;{formData.name}&quot; 已创建，您即将被 重定向到该项目。
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href={`/protected/projects`}>前往项目</Link>
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
        {/* 页头 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">创建新项目</h1>
            <p className="mt-2 text-muted-foreground">为您的低代码开发建立新项目</p>
          </div>
        </div>

        {/* 表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              项目详情
            </CardTitle>
            <CardDescription>提供您新项目的基本信息</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  rows={4}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 字符
                </p>
              </div>

              {/* 提交错误 */}
              {submitError && (
                <Alert variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      正在创建项目...
                    </>
                  ) : (
                    '创建项目'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 帮助卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">入门指南</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                1
              </div>
              <div>
                <p className="font-medium">为项目命名</p>
                <p className="text-sm text-muted-foreground">
                  选择一个有助于识别项目目的的描述性名称
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                2
              </div>
              <div>
                <p className="font-medium">添加描述（可选）</p>
                <p className="text-sm text-muted-foreground">提供有关此项目将完成什么的背景信息</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                3
              </div>
              <div>
                <p className="font-medium">开始构建</p>
                <p className="text-sm text-muted-foreground">
                  创建完成后，您就可以开始设计您的低代码应用程序了
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
