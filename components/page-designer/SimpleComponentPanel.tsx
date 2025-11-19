'use client'

import React from 'react'
import { Type, MousePointer, Image, Square, FileText, CheckSquare, Layout } from 'lucide-react'

interface SimpleComponentPanelProps {
  onAddComponent: (componentType: string) => void
}

// MVP核心组件定义 - 基于高保真设计的颜色方案
const CORE_COMPONENTS = [
  {
    type: 'Text',
    name: '文本',
    icon: Type,
    description: '显示文本内容',
    bgGradient: 'from-blue-100 to-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    type: 'Button',
    name: '按钮',
    icon: MousePointer,
    description: '点击操作',
    bgGradient: 'from-green-100 to-green-50',
    iconColor: 'text-green-600',
  },
  {
    type: 'Input',
    name: '输入框',
    icon: FileText,
    description: '文本输入',
    bgGradient: 'from-purple-100 to-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    type: 'Image',
    name: '图片',
    icon: Image,
    description: '显示图片',
    bgGradient: 'from-orange-100 to-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    type: 'Card',
    name: '卡片',
    icon: Square,
    description: '内容容器',
    bgGradient: 'from-cyan-100 to-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    type: 'Checkbox',
    name: '复选框',
    icon: CheckSquare,
    description: '选择选项',
    bgGradient: 'from-red-100 to-red-50',
    iconColor: 'text-red-600',
  },
]

export function SimpleComponentPanel({ onAddComponent }: SimpleComponentPanelProps) {
  return (
    <div className="h-full bg-card">
      {/* 面板头部 */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold text-foreground">组件面板</h2>
        <p className="mt-1 text-sm text-muted-foreground">拖拽组件到画布</p>
      </div>

      {/* 组件列表 */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">基础组件</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CORE_COMPONENTS.map((component, index) => (
            <div
              key={component.type}
              className="component-card animate-slideInScale group cursor-pointer rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/50 hover:shadow-lg"
              style={{
                animationDelay: `${index * 100}ms`,
                opacity: 0,
                animationFillMode: 'forwards',
              }}
              onClick={() => onAddComponent(component.type)}
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('componentType', component.type)
                e.currentTarget.classList.add('dragging')
              }}
              onDragEnd={e => {
                e.currentTarget.classList.remove('dragging')
              }}
            >
              {/* 组件图标 */}
              <div
                className={`component-icon mx-auto mb-2 rounded-lg bg-gradient-to-br ${component.bgGradient} p-2`}
              >
                <component.icon size={20} className={component.iconColor} />
              </div>

              {/* 组件信息 */}
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {component.name}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{component.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
