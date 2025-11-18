'use client'

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SimpleCanvasProps {
  components: any[]
  selectedComponent: any
  onSelectComponent: (component: any) => void
  onUpdateComponent: (componentId: string, updates: any) => void
}

// 简化的组件渲染器
const SimpleComponentRenderer = ({
  component,
  isSelected,
  onSelect,
  onUpdate,
}: {
  component: any
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: any) => void
}) => {
  const baseClasses = cn(
    'absolute cursor-pointer transition-all',
    isSelected && 'ring-2 ring-blue-500 ring-offset-2'
  )

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('componentId', component.id)
  }

  const renderComponent = () => {
    const { type, props, styles } = component

    const commonStyle = {
      position: 'absolute' as const,
      left: component.position.x,
      top: component.position.y,
      ...styles,
    }

    switch (type) {
      case 'Text':
        return (
          <div
            style={commonStyle}
            className={cn(baseClasses, 'px-3 py-2')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
          >
            {props.text || '文本内容'}
          </div>
        )

      case 'Button':
        return (
          <button
            style={{
              ...commonStyle,
              backgroundColor: styles.backgroundColor || '#3b82f6',
              color: styles.color || '#ffffff',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            className={cn(baseClasses, 'font-medium')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
          >
            {props.text || '按钮'}
          </button>
        )

      case 'Input':
        return (
          <input
            type="text"
            placeholder={props.placeholder || '请输入内容'}
            style={{
              ...commonStyle,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
            }}
            className={cn(baseClasses, 'focus:outline-none focus:ring-2 focus:ring-blue-500')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
            readOnly
          />
        )

      case 'Image':
        return (
          <div
            style={{
              ...commonStyle,
              width: styles.width || '200px',
              height: styles.height || '150px',
              backgroundColor: '#f3f4f6',
              border: '2px dashed #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
            }}
            className={cn(baseClasses, 'text-center')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
          >
            <div>
              <div className="mb-1 text-2xl">🖼️</div>
              <div className="text-xs">图片组件</div>
            </div>
          </div>
        )

      case 'Card':
        return (
          <div
            style={{
              ...commonStyle,
              width: styles.width || '300px',
              minHeight: styles.height || '200px',
              backgroundColor: styles.backgroundColor || '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            className={cn(baseClasses, 'shadow-sm')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
          >
            <div
              style={{ color: styles.color || '#000000', fontWeight: 'bold', marginBottom: '8px' }}
            >
              {props.title || '卡片标题'}
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              {props.content || '卡片内容区域'}
            </div>
          </div>
        )

      case 'Checkbox':
        return (
          <label
            style={{
              ...commonStyle,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            className={cn(baseClasses, 'text-sm')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
          >
            <input
              type="checkbox"
              checked={props.checked || false}
              onChange={() => {
                onUpdate({ props: { ...props, checked: !props.checked } })
              }}
              className="mr-2"
              onClick={e => e.stopPropagation()}
            />
            {props.text || '复选框选项'}
          </label>
        )

      default:
        return (
          <div
            style={commonStyle}
            className={cn(baseClasses, 'border border-gray-300 bg-gray-100 px-3 py-2')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
          >
            未知组件: {type}
          </div>
        )
    }
  }

  return renderComponent()
}

export function SimpleCanvas({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
}: SimpleCanvasProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const componentType = e.dataTransfer.getData('componentType')
      const componentId = e.dataTransfer.getData('componentId')

      if (componentType) {
        // 从组件面板添加新组件
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // 这个逻辑由父组件处理
      } else if (componentId) {
        // 移动现有组件
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        onUpdateComponent(componentId, {
          position: { x, y },
        })
      }
    },
    [onUpdateComponent]
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        // 点击画布空白区域，取消选择
        onSelectComponent(null)
      }
    },
    [onSelectComponent]
  )

  return (
    <div className="h-full w-full overflow-auto bg-gray-50">
      <div className="min-h-full min-w-full p-8">
        {/* 画布区域 */}
        <div
          className="relative mx-auto rounded-lg bg-white shadow-lg"
          style={{
            width: '1200px',
            minHeight: '800px',
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          {/* 画布标题 */}
          <div className="absolute left-0 right-0 top-0 rounded-t-lg border-b border-gray-200 bg-white bg-opacity-90 p-4">
            <div className="text-sm font-medium text-gray-700">设计画布 (1200x800)</div>
            <div className="text-xs text-gray-500">拖拽组件到此处或点击左侧组件面板添加</div>
          </div>

          {/* 渲染所有组件 */}
          {components.map(component => (
            <SimpleComponentRenderer
              key={component.id}
              component={component}
              isSelected={selectedComponent?.id === component.id}
              onSelect={() => onSelectComponent(component)}
              onUpdate={updates => onUpdateComponent(component.id, updates)}
            />
          ))}

          {/* 空状态提示 */}
          {components.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-6xl">🎨</div>
                <div className="mb-2 text-xl font-medium text-gray-700">开始设计你的页面</div>
                <div className="text-gray-500">从左侧拖拽组件到画布或点击组件添加</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
