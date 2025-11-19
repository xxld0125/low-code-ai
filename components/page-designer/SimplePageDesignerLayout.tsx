'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Eye, Trash2, Layout } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { SimpleComponentPanel } from './SimpleComponentPanel'
import { SimpleCanvas } from './SimpleCanvas'
import { SimplePropertyPanel } from './SimplePropertyPanel'

// 引入设计器样式
import '@/styles/designer.css'

interface SimplePageDesignerLayoutProps {
  projectId: string
}

export function SimplePageDesignerLayout({ projectId }: SimplePageDesignerLayoutProps) {
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [components, setComponents] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  // 拖拽事件现在通过 props 直接传递，无需全局事件监听

  const handleSave = async () => {
    setSaving(true)
    try {
      // 简化的保存逻辑
      toast({
        title: '保存成功',
        description: '页面设计已保存',
      })
    } catch (error) {
      toast({
        title: '保存失败',
        description: '无法保存页面设计',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    toast({
      title: '预览功能',
      description: '预览功能正在开发中',
    })
  }

  const handleClearCanvas = () => {
    if (confirm('确定要清空画布吗？')) {
      setComponents([])
      setSelectedComponent(null)
      toast({
        title: '画布已清空',
        description: '所有组件已移除',
      })
    }
  }

  const handleAddComponent = (componentType: string, position?: { x: number; y: number }) => {
    // 智能定位算法：避免组件重叠
    const findNextPosition = () => {
      if (position) return position

      const baseX = 50
      const baseY = 120
      const stepX = 180
      const stepY = 80
      const itemsPerRow = 6

      let nextX = baseX
      let nextY = baseY

      // 查找空位置
      for (let i = 0; i < components.length; i++) {
        const row = Math.floor(i / itemsPerRow)
        const col = i % itemsPerRow

        const testX = baseX + col * stepX
        const testY = baseY + row * stepY

        // 检查该位置是否被占用
        const isOccupied = components.some(
          comp =>
            Math.abs(comp.position.x - testX) < stepX * 0.8 &&
            Math.abs(comp.position.y - testY) < stepY * 0.8
        )

        if (!isOccupied) {
          nextX = testX
          nextY = testY
          break
        }

        // 如果当前位置被占用，继续寻找
        if (i === components.length - 1) {
          nextX = baseX + (components.length % itemsPerRow) * stepX
          nextY = baseY + Math.floor(components.length / itemsPerRow) * stepY
        }
      }

      return { x: nextX, y: nextY }
    }

    const finalPosition = findNextPosition()

    const newComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      props: {
        text: componentType === 'Button' ? '按钮' : componentType === 'Text' ? '文本内容' : '',
        placeholder: componentType === 'Input' ? '请输入内容' : '',
        title: componentType === 'Card' ? '卡片标题' : '',
        content: componentType === 'Card' ? '卡片内容区域，可以放置各种文本和组件内容。' : '',
        checked: componentType === 'Checkbox' ? false : undefined,
        text: componentType === 'Checkbox' ? '复选框选项' : '',
      },
      styles: {
        width: 'auto',
        height: 'auto',
        backgroundColor: 'var(--card)',
        color: 'var(--foreground)',
        fontSize: '14px',
        fontWeight: '400',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        minWidth: '120px',
        minHeight: '40px',
      },
      position: finalPosition,
    }

    setComponents([...components, newComponent])
    setSelectedComponent(newComponent)

    toast({
      title: '组件已添加',
      description: `${getComponentDisplayName(componentType)}已添加到画布`,
    })
  }

  const getComponentDisplayName = (type: string) => {
    const names = {
      Text: '文本',
      Button: '按钮',
      Input: '输入框',
      Image: '图片',
      Card: '卡片',
      Checkbox: '复选框',
    }
    return names[type as keyof typeof names] || type
  }

  const handleUpdateComponent = (componentId: string, updates: any) => {
    setComponents(
      components.map(comp => (comp.id === componentId ? { ...comp, ...updates } : comp))
    )
    if (selectedComponent?.id === componentId) {
      setSelectedComponent({ ...selectedComponent, ...updates })
    }
  }

  const handleDeleteComponent = (componentId: string) => {
    setComponents(components.filter(comp => comp.id !== componentId))
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null)
    }
    toast({
      title: '组件已删除',
      description: '组件已从画布移除',
    })
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* 顶部工具栏 */}
      <header className="designer-header animate-slideInDown">
        <div className="flex items-center space-x-6">
          {/* Logo和标题 */}
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Layout className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">低代码设计器</h1>
          </div>

          {/* 项目信息 */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-muted-foreground">项目: 我的第一个页面</span>
            <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              已保存
            </span>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-muted-foreground">
              组件: <span className="font-medium text-foreground">{components.length}</span>/50
            </span>
            <span className="text-muted-foreground">画布: 1200x800</span>
          </div>
        </div>

        {/* 操作按钮组 */}
        <div className="flex items-center space-x-3">
          <Button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>

          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            预览
          </Button>

          <Button variant="destructive" onClick={handleClearCanvas}>
            <Trash2 className="mr-2 h-4 w-4" />
            清空
          </Button>
        </div>
      </header>

      {/* 主设计器区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧组件面板 */}
        <aside className="designer-panel animate-slideInLeft" style={{ width: '256px' }}>
          <SimpleComponentPanel onAddComponent={handleAddComponent} />
        </aside>

        {/* 中间画布 */}
        <main className="designer-canvas animate-fadeIn flex-1">
          <SimpleCanvas
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onAddComponent={handleAddComponent}
          />
        </main>

        {/* 右侧属性面板 */}
        <aside
          className="designer-panel designer-panel-right animate-slideInRight"
          style={{ width: '320px' }}
        >
          <SimplePropertyPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
          />
        </aside>
      </div>
    </div>
  )
}
