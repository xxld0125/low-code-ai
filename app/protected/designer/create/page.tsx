'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

export default function CreatePageDesign() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title: '',
    tags: [] as string[],
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: '验证失败',
        description: '页面名称不能为空',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/page-designer/page-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          config: {
            title: formData.title || formData.name,
            meta: {
              description: formData.description,
            },
          },
          tags: formData.tags,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '创建失败')
      }

      const newDesign = await response.json()

      toast({
        title: '创建成功',
        description: '页面设计已成功创建',
      })

      // 跳转到编辑页面
      router.push(`/protected/designer/page/${newDesign.id}`)
    } catch (error) {
      console.error('创建页面设计失败:', error)
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '无法创建页面设计',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-6">
      <div className="mb-6 flex items-center">
        <Link href="/protected/designer/list">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">创建页面设计</h1>
          <p className="text-muted-foreground">开始创建一个新的页面设计</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>填写页面的基本信息，创建后可以在设计器中继续编辑</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">页面名称 *</Label>
              <Input
                id="name"
                placeholder="输入页面名称"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">页面标题</Label>
              <Input
                id="title"
                placeholder="输入页面标题（可选）"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">如果不填写，将使用页面名称作为标题</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">页面描述</Label>
              <Textarea
                id="description"
                placeholder="输入页面描述（可选）"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                placeholder="输入标签，用逗号分隔"
                onChange={e => {
                  const tags = e.target.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0)
                  setFormData(prev => ({ ...prev, tags }))
                }}
              />
              <p className="text-sm text-muted-foreground">
                使用逗号分隔多个标签，例如：首页, 营销, 产品介绍
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    创建中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    创建页面设计
                  </>
                )}
              </Button>
              <Link href="/protected/designer/list">
                <Button variant="outline" type="button">
                  取消
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
