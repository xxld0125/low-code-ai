'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Settings, Palette, Move } from 'lucide-react'
import { ColorPicker } from './SimpleColorPicker'

interface SimplePropertyPanelProps {
  selectedComponent: any
  onUpdateComponent: (componentId: string, updates: any) => void
  onDeleteComponent: (componentId: string) => void
}

export function SimplePropertyPanel({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent,
}: SimplePropertyPanelProps) {
  if (!selectedComponent) {
    return (
      <div className="h-full bg-card">
        {/* 空状态头部 */}
        <div className="border-b border-border p-4">
          <h3 className="text-lg font-semibold text-foreground">属性面板</h3>
          <p className="text-sm text-muted-foreground">选择组件进行配置</p>
        </div>

        {/* 空状态内容 */}
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-sm font-medium text-foreground">选择一个组件</h3>
            <p className="text-xs text-muted-foreground">点击画布中的组件以编辑其属性</p>
          </div>
        </div>
      </div>
    )
  }

  const handlePropertyChange = (property: string, value: any) => {
    onUpdateComponent(selectedComponent.id, {
      [property]: value,
    })
  }

  const handlePropsChange = (property: string, value: any) => {
    onUpdateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [property]: value,
      },
    })
  }

  const handleStylesChange = (property: string, value: any) => {
    onUpdateComponent(selectedComponent.id, {
      styles: {
        ...selectedComponent.styles,
        [property]: value,
      },
    })
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个组件吗？')) {
      onDeleteComponent(selectedComponent.id)
    }
  }

  const renderPropertyEditor = (componentType: string) => {
    const { props } = selectedComponent

    switch (componentType) {
      case 'Text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text" className="form-label">
                文本内容
              </Label>
              <textarea
                id="text"
                className="form-input w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={4}
                value={props.text || ''}
                onChange={e => handlePropsChange('text', e.target.value)}
                placeholder="输入文本内容"
              />
            </div>
          </div>
        )

      case 'Button':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="buttonText" className="form-label">
                按钮文字
              </Label>
              <Input
                id="buttonText"
                className="form-input"
                value={props.text || ''}
                onChange={e => handlePropsChange('text', e.target.value)}
                placeholder="输入按钮文字"
              />
            </div>
          </div>
        )

      case 'Input':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="placeholder" className="form-label">
                占位符
              </Label>
              <Input
                id="placeholder"
                className="form-input"
                value={props.placeholder || ''}
                onChange={e => handlePropsChange('placeholder', e.target.value)}
                placeholder="输入占位符文本"
              />
            </div>
          </div>
        )

      case 'Card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardTitle" className="form-label">
                卡片标题
              </Label>
              <Input
                id="cardTitle"
                className="form-input"
                value={props.title || ''}
                onChange={e => handlePropsChange('title', e.target.value)}
                placeholder="输入卡片标题"
              />
            </div>
            <div>
              <Label htmlFor="cardContent" className="form-label">
                卡片内容
              </Label>
              <textarea
                id="cardContent"
                className="form-input w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                value={props.content || ''}
                onChange={e => handlePropsChange('content', e.target.value)}
                placeholder="输入卡片内容"
              />
            </div>
          </div>
        )

      case 'Checkbox':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="checkboxText" className="form-label">
                选项文字
              </Label>
              <Input
                id="checkboxText"
                className="form-input"
                value={props.text || ''}
                onChange={e => handlePropsChange('text', e.target.value)}
                placeholder="输入选项文字"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="checkboxChecked"
                checked={props.checked || false}
                onChange={e => handlePropsChange('checked', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="checkboxChecked" className="text-sm font-medium text-foreground">
                默认选中
              </Label>
            </div>
          </div>
        )

      case 'Image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl" className="form-label">
                图片地址
              </Label>
              <Input
                id="imageUrl"
                className="form-input"
                value={props.src || ''}
                onChange={e => handlePropsChange('src', e.target.value)}
                placeholder="输入图片URL"
              />
            </div>
            <div>
              <Label htmlFor="imageAlt" className="form-label">
                图片描述
              </Label>
              <Input
                id="imageAlt"
                className="form-input"
                value={props.alt || ''}
                onChange={e => handlePropsChange('alt', e.target.value)}
                placeholder="输入图片描述"
              />
            </div>
          </div>
        )

      default:
        return <div className="py-4 text-center text-muted-foreground">该组件暂无可配置属性</div>
    }
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* 属性面板头部 */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{selectedComponent.type}属性</h3>
            <p className="text-sm text-muted-foreground">
              ID: <span className="font-mono text-xs">{selectedComponent.id}</span>
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 属性编辑区域 */}
      <div className="property-panel flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">
          {/* 基础属性 */}
          <div className="property-section">
            <h4 className="property-label">基础属性</h4>
            <div className="space-y-4">{renderPropertyEditor(selectedComponent.type)}</div>
          </div>

          {/* 样式属性 */}
          <div className="property-section">
            <h4 className="property-label">样式设置</h4>
            <div className="space-y-4">
              {/* 颜色设置 */}
              <div className="space-y-4">
                <div>
                  <Label className="form-label">背景颜色</Label>
                  <ColorPicker
                    value={selectedComponent.styles.backgroundColor || '#ffffff'}
                    onChange={color => handleStylesChange('backgroundColor', color)}
                  />
                </div>
                <div>
                  <Label className="form-label">文字颜色</Label>
                  <ColorPicker
                    value={selectedComponent.styles.color || '#000000'}
                    onChange={color => handleStylesChange('color', color)}
                  />
                </div>
              </div>

              {/* 字体设置 */}
              <div>
                <Label className="form-label">字体大小</Label>
                <select
                  className="form-input w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedComponent.styles.fontSize || '14px'}
                  onChange={e => handleStylesChange('fontSize', e.target.value)}
                >
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="32px">32px</option>
                </select>
              </div>

              {/* 圆角设置 */}
              <div>
                <Label className="form-label">圆角</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={parseInt(selectedComponent.styles.borderRadius) || 4}
                    onChange={e => handleStylesChange('borderRadius', e.target.value + 'px')}
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-border accent-primary"
                  />
                  <div className="min-w-[60px] rounded-md border border-border bg-background px-3 py-2 text-center">
                    <span className="text-sm font-medium">
                      {selectedComponent.styles.borderRadius || '4px'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 位置属性 */}
          <div className="property-section">
            <h4 className="property-label">位置信息</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="form-label">X 坐标</Label>
                <Input
                  type="number"
                  value={selectedComponent.position.x}
                  onChange={e =>
                    handlePropertyChange('position', {
                      ...selectedComponent.position,
                      x: parseInt(e.target.value) || 0,
                    })
                  }
                  className="form-input"
                />
              </div>
              <div>
                <Label className="form-label">Y 坐标</Label>
                <Input
                  type="number"
                  value={selectedComponent.position.y}
                  onChange={e =>
                    handlePropertyChange('position', {
                      ...selectedComponent.position,
                      y: parseInt(e.target.value) || 0,
                    })
                  }
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
