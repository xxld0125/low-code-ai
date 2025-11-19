'use client'

import React, { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SimpleCanvasProps {
  components: any[]
  selectedComponent: any
  onSelectComponent: (component: any) => void
  onUpdateComponent: (componentId: string, updates: any) => void
  onAddComponent?: (componentType: string, position: { x: number; y: number }) => void
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
    'absolute cursor-pointer transition-all duration-200 hover:z-10',
    isSelected &&
      'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02] border border-primary/20'
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

    const animationClass = isSelected ? '' : 'animate-slideInScale'

    switch (type) {
      case 'Text':
        return (
          <div
            style={{
              ...commonStyle,
              backgroundColor: styles.backgroundColor || 'var(--card)',
              color: styles.color || 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: styles.borderRadius || 'var(--radius-lg)',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-xs)',
              minWidth: '120px',
            }}
            className={cn(baseClasses, animationClass, 'canvas-component')}
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
              backgroundColor: styles.backgroundColor || 'var(--primary)',
              color: styles.color || 'var(--primary-foreground)',
              padding: '8px 16px',
              border: '1px solid var(--primary)',
              borderRadius: styles.borderRadius || '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              fontWeight: '500',
              minWidth: '100px',
            }}
            className={cn(
              baseClasses,
              animationClass,
              'canvas-component font-medium transition-all hover:shadow-md'
            )}
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
              border: '2px solid var(--border)',
              borderRadius: styles.borderRadius || '6px',
              backgroundColor: styles.backgroundColor || 'var(--background)',
              color: styles.color || 'var(--foreground)',
              width: '200px',
            }}
            className={cn(
              baseClasses,
              animationClass,
              'canvas-component transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary'
            )}
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
              backgroundColor: 'var(--muted)',
              border: '2px dashed var(--border)',
              borderRadius: styles.borderRadius || 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted-foreground)',
            }}
            className={cn(baseClasses, animationClass, 'canvas-component text-center')}
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
              backgroundColor: styles.backgroundColor || 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: styles.borderRadius || 'var(--radius-xl)',
              padding: '16px',
              boxShadow: 'var(--shadow-sm)',
            }}
            className={cn(baseClasses, animationClass, 'canvas-component shadow-sm')}
            onClick={onSelect}
            draggable
            onDragStart={handleDragStart}
          >
            <div
              style={{
                color: styles.color || 'var(--foreground)',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              {props.title || '卡片标题'}
            </div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '14px', lineHeight: '1.5' }}>
              {props.content || '卡片内容区域，可以放置各种文本和组件内容。'}
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
              backgroundColor: styles.backgroundColor || 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: styles.borderRadius || 'var(--radius-lg)',
              padding: '8px 12px',
              boxShadow: 'var(--shadow-xs)',
            }}
            className={cn(baseClasses, animationClass, 'canvas-component text-sm')}
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
              className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              onClick={e => e.stopPropagation()}
            />
            {props.text || '复选框选项'}
          </label>
        )

      default:
        return (
          <div
            style={commonStyle}
            className={cn(
              baseClasses,
              animationClass,
              'canvas-component border border-border bg-muted px-3 py-2'
            )}
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
  onAddComponent,
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
        let x = e.clientX - rect.left
        let y = e.clientY - rect.top

        // 网格吸附逻辑（20px网格）
        const gridSize = 20
        x = Math.round(x / gridSize) * gridSize
        y = Math.round(y / gridSize) * gridSize

        // 确保组件不会超出画布边界
        x = Math.max(20, Math.min(x, 1160)) // 留出组件宽度空间
        y = Math.max(120, Math.min(y, 760)) // 留出组件高度空间

        // 调用父组件的添加组件函数
        if (onAddComponent) {
          onAddComponent(componentType, { x, y })
        }
      } else if (componentId) {
        // 移动现有组件
        const rect = e.currentTarget.getBoundingClientRect()
        let x = e.clientX - rect.left
        let y = e.clientY - rect.top

        // 网格吸附逻辑
        const gridSize = 20
        x = Math.round(x / gridSize) * gridSize
        y = Math.round(y / gridSize) * gridSize

        // 边界约束
        x = Math.max(20, Math.min(x, 1160))
        y = Math.max(120, Math.min(y, 760))

        onUpdateComponent(componentId, {
          position: { x, y },
        })
      }
    },
    [onUpdateComponent, onAddComponent]
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
    <div className="h-full w-full overflow-auto">
      <div className="p-6">
        {/* 画布区域 */}
        <div
          id="canvasContainer"
          className="relative mx-auto rounded-xl border border-border bg-card shadow-lg"
          style={{
            width: '1200px',
            minHeight: '800px',
            backgroundImage: 'radial-gradient(circle, hsl(0 0% 89.8%) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleCanvasClick}
        >
          {/* 画布标题栏 */}
          <div className="absolute left-0 right-0 top-0 z-10 rounded-t-xl border-b border-border bg-card/95 p-4 shadow-sm backdrop-blur-sm">
            <div className="text-sm font-medium text-foreground">设计画布</div>
            <div className="text-xs text-muted-foreground">
              拖拽组件到此处或点击左侧组件面板添加
            </div>
          </div>

          {/* 渲染所有组件 */}
          {components.map((component, index) => (
            <div key={component.id} style={{ animationDelay: `${index * 100}ms` }}>
              <SimpleComponentRenderer
                component={component}
                isSelected={selectedComponent?.id === component.id}
                onSelect={() => onSelectComponent(component)}
                onUpdate={updates => onUpdateComponent(component.id, updates)}
              />
            </div>
          ))}

          {/* 空状态提示 */}
          {components.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mb-6 text-6xl opacity-60">🎨</div>
                <div className="mb-3 text-xl font-semibold text-foreground">开始设计你的页面</div>
                <div className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  从左侧拖拽组件到画布，或点击组件快速添加。使用右侧属性面板调整组件样式和行为。
                </div>
                <div className="flex justify-center gap-2">
                  <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    拖拽添加
                  </div>
                  <div className="bg-success/10 text-success inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                    点击选择
                  </div>
                  <div className="bg-info/10 text-info inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                    属性编辑
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
