'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Settings } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'properties' | 'styles'>('properties')

  if (!selectedComponent) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900">属性面板</h2>
          <p className="mt-1 text-sm text-gray-600">选择组件进行配置</p>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="mb-2 text-4xl">🎯</div>
            <div>请选择一个组件</div>
            <div className="text-sm">在画布中点击组件开始配置</div>
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
              <Label htmlFor="text">文本内容</Label>
              <textarea
                id="text"
                className="w-full resize-none rounded-md border border-gray-300 p-2"
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
              <Label htmlFor="buttonText">按钮文字</Label>
              <Input
                id="buttonText"
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
              <Label htmlFor="placeholder">占位符</Label>
              <Input
                id="placeholder"
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
              <Label htmlFor="cardTitle">卡片标题</Label>
              <Input
                id="cardTitle"
                value={props.title || ''}
                onChange={e => handlePropsChange('title', e.target.value)}
                placeholder="输入卡片标题"
              />
            </div>
            <div>
              <Label htmlFor="cardContent">卡片内容</Label>
              <textarea
                id="cardContent"
                className="w-full resize-none rounded-md border border-gray-300 p-2"
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
              <Label htmlFor="checkboxText">选项文字</Label>
              <Input
                id="checkboxText"
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
              />
              <Label htmlFor="checkboxChecked">默认选中</Label>
            </div>
          </div>
        )

      case 'Image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">图片地址</Label>
              <Input
                id="imageUrl"
                value={props.src || ''}
                onChange={e => handlePropsChange('src', e.target.value)}
                placeholder="输入图片URL"
              />
            </div>
            <div>
              <Label htmlFor="imageAlt">图片描述</Label>
              <Input
                id="imageAlt"
                value={props.alt || ''}
                onChange={e => handlePropsChange('alt', e.target.value)}
                placeholder="输入图片描述"
              />
            </div>
          </div>
        )

      default:
        return <div className="py-4 text-center text-gray-500">该组件暂无可配置属性</div>
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 头部 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">属性面板</h2>
            <p className="text-sm text-gray-600">
              {selectedComponent.type} - {selectedComponent.id.slice(-8)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'properties'
              ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('properties')}
        >
          属性
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'styles'
              ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('styles')}
        >
          样式
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm font-medium">
                  <Settings className="mr-2 h-4 w-4" />
                  基础属性
                </CardTitle>
              </CardHeader>
              <CardContent>{renderPropertyEditor(selectedComponent.type)}</CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'styles' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">位置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="posX">X 坐标</Label>
                    <Input
                      id="posX"
                      type="number"
                      value={selectedComponent.position.x}
                      onChange={e =>
                        handlePropertyChange('position', {
                          ...selectedComponent.position,
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="posY">Y 坐标</Label>
                    <Input
                      id="posY"
                      type="number"
                      value={selectedComponent.position.y}
                      onChange={e =>
                        handlePropertyChange('position', {
                          ...selectedComponent.position,
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">颜色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>背景颜色</Label>
                  <ColorPicker
                    value={selectedComponent.styles.backgroundColor || '#ffffff'}
                    onChange={color => handleStylesChange('backgroundColor', color)}
                  />
                </div>
                <div>
                  <Label>文字颜色</Label>
                  <ColorPicker
                    value={selectedComponent.styles.color || '#000000'}
                    onChange={color => handleStylesChange('color', color)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">尺寸</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">宽度</Label>
                    <Input
                      id="width"
                      value={selectedComponent.styles.width || 'auto'}
                      onChange={e => handleStylesChange('width', e.target.value)}
                      placeholder="auto 或具体数值"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">高度</Label>
                    <Input
                      id="height"
                      value={selectedComponent.styles.height || 'auto'}
                      onChange={e => handleStylesChange('height', e.target.value)}
                      placeholder="auto 或具体数值"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
