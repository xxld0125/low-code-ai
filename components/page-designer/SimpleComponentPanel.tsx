'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Type, MousePointer, Image, Square, FileText, CheckSquare } from 'lucide-react'

interface SimpleComponentPanelProps {
  onAddComponent: (componentType: string) => void
}

// MVP核心组件定义
const CORE_COMPONENTS = [
  {
    type: 'Text',
    name: '文本',
    icon: Type,
    description: '显示文本内容',
    color: 'text-blue-600',
  },
  {
    type: 'Button',
    name: '按钮',
    icon: MousePointer,
    description: '可点击的按钮',
    color: 'text-green-600',
  },
  {
    type: 'Input',
    name: '输入框',
    icon: FileText,
    description: '文本输入框',
    color: 'text-purple-600',
  },
  {
    type: 'Image',
    name: '图片',
    icon: Image,
    description: '图片显示',
    color: 'text-orange-600',
  },
  {
    type: 'Card',
    name: '卡片',
    icon: Square,
    description: '内容容器',
    color: 'text-pink-600',
  },
  {
    type: 'Checkbox',
    name: '复选框',
    icon: CheckSquare,
    description: '选择框',
    color: 'text-indigo-600',
  },
]

export function SimpleComponentPanel({ onAddComponent }: SimpleComponentPanelProps) {
  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="text-lg">组件面板</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 text-sm text-gray-600">选择组件添加到画布</div>

        <div className="grid grid-cols-2 gap-3">
          {CORE_COMPONENTS.map(component => (
            <Button
              key={component.type}
              variant="outline"
              className="h-20 flex-col items-center justify-center space-y-2 transition-shadow hover:shadow-md"
              onClick={() => onAddComponent(component.type)}
            >
              <div className={`rounded-lg p-2 ${component.color}`}>
                <component.icon size={20} />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{component.name}</div>
                <div className="mt-1 text-xs text-gray-500">{component.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
