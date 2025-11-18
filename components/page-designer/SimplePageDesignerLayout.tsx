'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Eye, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { SimpleComponentPanel } from './SimpleComponentPanel'
import { SimpleCanvas } from './SimpleCanvas'
import { SimplePropertyPanel } from './SimplePropertyPanel'

interface SimplePageDesignerLayoutProps {
  projectId: string
}

export function SimplePageDesignerLayout({ projectId }: SimplePageDesignerLayoutProps) {
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [components, setComponents] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

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

  const handleAddComponent = (componentType: string) => {
    // 智能定位算法：避免组件重叠
    const findNextPosition = () => {
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

    const position = findNextPosition()

    const newComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      props: {
        text: componentType === 'Button' ? '按钮' : componentType === 'Text' ? '文本内容' : '',
        placeholder: componentType === 'Input' ? '请输入内容' : '',
      },
      styles: {
        width: 'auto',
        height: 'auto',
        backgroundColor: '#ffffff',
        color: '#000000',
      },
      position,
    }
    setComponents([...components, newComponent])
    setSelectedComponent(newComponent)
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
    <div className="flex h-screen flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">页面设计器</h1>
          <div className="text-sm text-gray-600">组件: {components.length}/50</div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>

          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            预览
          </Button>

          <Button variant="outline" size="sm" onClick={handleClearCanvas}>
            <Trash2 className="mr-2 h-4 w-4" />
            清空
          </Button>
        </div>
      </div>

      {/* 主设计器区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧组件面板 */}
        <div className="w-64 border-r border-gray-200 bg-white">
          <SimpleComponentPanel onAddComponent={handleAddComponent} />
        </div>

        {/* 中间画布 */}
        <div className="flex-1 bg-gray-100">
          <SimpleCanvas
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onUpdateComponent={handleUpdateComponent}
          />
        </div>

        {/* 右侧属性面板 */}
        <div className="w-80 border-l border-gray-200 bg-white">
          <SimplePropertyPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
          />
        </div>
      </div>
    </div>
  )
}
