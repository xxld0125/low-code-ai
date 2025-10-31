/**
 * 页面设计器属性面板
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ComponentInstance } from '@/types/page-designer/component'
import { PropertyPanelProps } from '@/types/page-designer/properties'
import {
  Settings,
  Palette,
  Zap,
  Code,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Star,
  Clock,
  Copy,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'

// 导入属性编辑器
import {
  TextPropertyEditor,
  ButtonTextEditor,
  HeadingTextEditor,
} from './property-editors/TextPropertyEditor'
import {
  NumberPropertyEditor,
  PixelNumberEditor,
  FontSizeNumberEditor,
} from './property-editors/NumberPropertyEditor'
import {
  BooleanPropertyEditor,
  EnableDisableEditor,
} from './property-editors/BooleanPropertyEditor'
import { ColorPicker, BackgroundColorPicker, TextColorPicker } from './property-editors/ColorPicker'
import { SizePropertyEditor, SpacingSizeEditor } from './property-editors/SizePropertyEditor'

// 导入低代码组件编辑器
import { PropertyEditor } from '@/components/lowcode/editors/PropertyEditor'
import { StyleEditor } from '@/components/lowcode/editors/StyleEditor'
import { ValidationEditor } from '@/components/lowcode/editors/ValidationEditor'

// 导入自动保存Hook
import { useComponentAutoSave } from '@/hooks/use-page-auto-save'

// 组件类型映射辅助函数
const getComponentCategory = (componentType: string): string => {
  const categoryMap: Record<string, string> = {
    button: 'basic',
    input: 'basic',
    textarea: 'basic',
    select: 'basic',
    checkbox: 'basic',
    radio: 'basic',
    text: 'display',
    heading: 'display',
    image: 'display',
    card: 'display',
    badge: 'display',
    container: 'layout',
    row: 'layout',
    col: 'layout',
    divider: 'layout',
    spacer: 'layout',
  }
  return categoryMap[componentType] || 'basic'
}

const getComponentPropertyType = (componentType: string): 'string' | 'number' | 'email' | 'url' => {
  const textTypes = ['input', 'textarea', 'text', 'heading']
  const emailTypes = ['input']
  const urlTypes = ['input']
  const numberTypes = ['input']

  if (textTypes.includes(componentType)) return 'string'
  if (emailTypes.includes(componentType)) return 'email'
  if (urlTypes.includes(componentType)) return 'url'
  if (numberTypes.includes(componentType)) return 'number'
  return 'string'
}

const getComponentPropertyDefinitions = (componentType: string): any[] => {
  // 根据组件类型返回对应的属性定义
  // 这里简化处理，实际应该从组件注册系统获取
  const definitions: Record<string, any[]> = {
    button: [
      {
        key: 'text',
        type: 'string',
        label: '按钮文字',
        required: true,
        default: '按钮',
        group: '基础',
        order: 1,
      },
      {
        key: 'variant',
        type: 'select',
        label: '按钮样式',
        required: false,
        default: 'default',
        group: '样式',
        order: 2,
        options: [
          { value: 'default', label: '默认' },
          { value: 'destructive', label: '危险' },
          { value: 'outline', label: '轮廓' },
          { value: 'secondary', label: '次要' },
          { value: 'ghost', label: '幽灵' },
          { value: 'link', label: '链接' },
        ],
      },
      {
        key: 'disabled',
        type: 'boolean',
        label: '禁用状态',
        required: false,
        default: false,
        group: '状态',
        order: 3,
      },
    ],
    input: [
      {
        key: 'placeholder',
        type: 'string',
        label: '占位符',
        required: false,
        default: '',
        group: '基础',
        order: 1,
      },
      {
        key: 'required',
        type: 'boolean',
        label: '必填字段',
        required: false,
        default: false,
        group: '验证',
        order: 2,
      },
    ],
    text: [
      {
        key: 'content',
        type: 'string',
        label: '文本内容',
        required: true,
        default: '文本内容',
        group: '基础',
        order: 1,
      },
    ],
  }

  return definitions[componentType] || []
}

const getComponentStyleDefinition = (componentType: string): any => {
  // 根据组件类型返回对应的样式定义
  const styleDefinitions: Record<string, any> = {
    button: {
      id: `style-${componentType}`,
      name: componentType.charAt(0).toUpperCase() + componentType.slice(1),
      category: 'basic',
      style_schema: {
        groups: [
          {
            id: 'typography',
            name: '文字',
            order: 1,
            properties: [
              {
                id: 'color',
                name: 'color',
                type: 'color',
                label: '文字颜色',
                required: false,
                editor_config: {
                  type: 'color',
                  presets: ['#000000', '#ffffff', '#ef4444', '#3b82f6', '#22c55e'],
                },
              },
              {
                id: 'fontSize',
                name: 'fontSize',
                type: 'size',
                label: '字体大小',
                required: false,
                editor_config: {
                  type: 'size',
                  units: ['px', 'rem', 'em'],
                  min: 8,
                  max: 72,
                },
              },
            ],
          },
          {
            id: 'layout',
            name: '布局',
            order: 2,
            properties: [
              {
                id: 'padding',
                name: 'padding',
                type: 'spacing',
                label: '内边距',
                required: false,
                editor_config: {
                  type: 'spacing',
                  directions: ['top', 'right', 'bottom', 'left'],
                  units: ['px', 'rem', 'em'],
                },
              },
            ],
          },
          {
            id: 'borders',
            name: '边框',
            order: 3,
            properties: [
              {
                id: 'borderRadius',
                name: 'borderRadius',
                type: 'size',
                label: '圆角',
                required: false,
                editor_config: {
                  type: 'size',
                  units: ['px', '%', 'rem'],
                  min: 0,
                },
              },
            ],
          },
        ],
      },
    },
  }

  return (
    styleDefinitions[componentType] || {
      id: `style-${componentType}`,
      name: componentType.charAt(0).toUpperCase() + componentType.slice(1),
      category: 'basic',
      style_schema: {
        groups: [],
      },
    }
  )
}

interface PagePropertiesPanelProps extends PropertyPanelProps {
  selectedComponent: ComponentInstance | null
  onComponentUpdate: (id: string, updates: Partial<ComponentInstance>) => void
  onComponentDelete: (id: string) => void
  onComponentDuplicate: (id: string) => void
  className?: string
}

export const PagePropertiesPanel: React.FC<PagePropertiesPanelProps> = ({
  componentId,
  selectedComponent,
  properties,
  styles,
  events,
  onChange,
  onComponentUpdate,
  onComponentDelete,
  onComponentDuplicate,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<'properties' | 'styles' | 'events'>('properties')

  // 自动保存功能
  const autoSave = useComponentAutoSave(
    componentId || '',
    async (id: string, changes: any) => {
      onComponentUpdate(id, changes)
    },
    {
      interval: 30000, // 30秒自动保存
      debounceDelay: 1000, // 1秒防抖
      maxRetries: 3,
    }
  )

  // 处理属性变更（使用自动保存）
  const handlePropertyChange = useCallback(
    (property: string, value: any, type: 'props' | 'styles' | 'events') => {
      if (!componentId) return

      // 使用自动保存处理属性变更
      autoSave.handlePropertyChange(property, value, type)
      onChange(property, value, type)
    },
    [componentId, autoSave, onChange]
  )

  // 手动保存
  const handleManualSave = useCallback(async () => {
    try {
      await autoSave.triggerSave()
    } catch (error) {
      console.error('Manual save failed:', error)
    }
  }, [autoSave])

  // 获取保存状态显示
  const getSaveStatusDisplay = useCallback(() => {
    const status = autoSave.getSaveStatus()
    const { lastSaved, pendingChanges, error } = autoSave.autoSaveState

    switch (status) {
      case 'saving':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />,
          text: '保存中...',
          color: 'text-blue-600',
        }
      case 'saved':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: lastSaved ? `已保存 ${lastSaved.toLocaleTimeString()}` : '已保存',
          color: 'text-green-600',
        }
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: `保存失败: ${error}`,
          color: 'text-red-600',
        }
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4 text-orange-500" />,
          text: pendingChanges > 0 ? `待保存 (${pendingChanges})` : '待保存',
          color: 'text-orange-600',
        }
      default:
        return {
          icon: <Save className="h-4 w-4 text-gray-500" />,
          text: '未开始',
          color: 'text-gray-600',
        }
    }
  }, [autoSave])

  // 切换折叠状态
  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }, [])

  // 渲染组件信息头部
  const renderComponentHeader = () => {
    if (!selectedComponent) {
      return (
        <div className="p-4 text-center text-gray-500">
          <Settings className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p className="text-sm">请选择一个组件来编辑属性</p>
        </div>
      )
    }

    return (
      <div className="border-b p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {selectedComponent.component_type}
            </Badge>
            <h3 className="text-sm font-medium">
              {selectedComponent.meta.custom_name || selectedComponent.component_type}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onComponentDuplicate(selectedComponent.id)}
              title="复制组件"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onComponentDelete(selectedComponent.id)}
              title="删除组件"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>ID: {selectedComponent.id.slice(0, 8)}...</span>
            <span>•</span>
            <span>创建于 {new Date(selectedComponent.created_at).toLocaleDateString()}</span>
          </div>

          {/* 保存状态显示 */}
          <div className="flex items-center space-x-2">
            <div
              className={cn('flex items-center space-x-1 text-xs', getSaveStatusDisplay().color)}
            >
              {getSaveStatusDisplay().icon}
              <span>{getSaveStatusDisplay().text}</span>
            </div>

            {/* 手动保存按钮 */}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleManualSave}
              disabled={autoSave.autoSaveState.isSaving}
              title="手动保存"
            >
              <Save className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 渲染属性分组
  const renderPropertyGroup = (
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode,
    sectionKey: string
  ) => {
    const isCollapsed = collapsedSections.has(sectionKey)

    return (
      <div className="border-b">
        <Button
          variant="ghost"
          className="h-auto w-full justify-between p-3 hover:bg-gray-50"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {!isCollapsed && <div className="space-y-4 p-3">{children}</div>}
      </div>
    )
  }

  // 渲染基础属性
  const renderBasicProperties = () => {
    if (!selectedComponent) return null

    const componentType = selectedComponent.component_type

    // 根据组件类型渲染不同的属性
    const renderComponentSpecificProps = () => {
      switch (componentType) {
        case 'button':
          return (
            <>
              <ButtonTextEditor
                definition={{
                  name: 'text',
                  type: 'text',
                  label: '按钮文字',
                  required: true,
                }}
                value={selectedComponent.props.button?.text || ''}
                onChange={value =>
                  handlePropertyChange(
                    'button',
                    { ...selectedComponent.props.button, text: value },
                    'props'
                  )
                }
              />

              <BooleanPropertyEditor
                definition={{
                  name: 'disabled',
                  type: 'boolean',
                  label: '禁用状态',
                }}
                value={selectedComponent.props.button?.disabled || false}
                onChange={value =>
                  handlePropertyChange(
                    'button',
                    { ...selectedComponent.props.button, disabled: value },
                    'props'
                  )
                }
              />
            </>
          )

        case 'text':
          return (
            <TextPropertyEditor
              definition={{
                name: 'content',
                type: 'text',
                label: '文本内容',
                required: true,
                validation: { maxLength: 500 },
              }}
              value={selectedComponent.props.text?.content || ''}
              onChange={value =>
                handlePropertyChange(
                  'text',
                  { ...selectedComponent.props.text, content: value },
                  'props'
                )
              }
            />
          )

        case 'input':
          return (
            <>
              <TextPropertyEditor
                definition={{
                  name: 'placeholder',
                  type: 'text',
                  label: '占位符',
                }}
                value={selectedComponent.props.input?.placeholder || ''}
                onChange={value =>
                  handlePropertyChange(
                    'input',
                    { ...selectedComponent.props.input, placeholder: value },
                    'props'
                  )
                }
              />

              <BooleanPropertyEditor
                definition={{
                  name: 'required',
                  type: 'boolean',
                  label: '必填字段',
                }}
                value={selectedComponent.props.input?.required || false}
                onChange={value =>
                  handlePropertyChange(
                    'input',
                    { ...selectedComponent.props.input, required: value },
                    'props'
                  )
                }
              />
            </>
          )

        default:
          return (
            <div className="py-4 text-center text-sm text-gray-500">该组件类型暂无可编辑属性</div>
          )
      }
    }

    return renderComponentSpecificProps()
  }

  // 渲染样式属性
  const renderStyleProperties = () => {
    if (!selectedComponent) return null

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">文字颜色</label>
          <TextColorPicker
            definition={{
              name: 'color',
              type: 'color',
              label: '文字颜色',
            }}
            value={selectedComponent.styles.color || '#000000'}
            onChange={value => handlePropertyChange('color', value, 'styles')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">背景颜色</label>
          <BackgroundColorPicker
            definition={{
              name: 'backgroundColor',
              type: 'color',
              label: '背景颜色',
            }}
            value={selectedComponent.styles.backgroundColor || 'transparent'}
            onChange={value => handlePropertyChange('backgroundColor', value, 'styles')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">字体大小</label>
          <FontSizeNumberEditor
            definition={{
              name: 'fontSize',
              type: 'number',
              label: '字体大小',
              validation: { min: 8, max: 120 },
            }}
            value={parseInt(selectedComponent.styles.fontSize as string) || 16}
            onChange={value => handlePropertyChange('fontSize', `${value}px`, 'styles')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">内边距</label>
          <PixelNumberEditor
            definition={{
              name: 'padding',
              type: 'number',
              label: '内边距',
              validation: { min: 0, max: 100 },
            }}
            value={parseInt(selectedComponent.styles.padding as string) || 0}
            onChange={value => handlePropertyChange('padding', `${value}px`, 'styles')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">外边距</label>
          <PixelNumberEditor
            definition={{
              name: 'margin',
              type: 'number',
              label: '外边距',
              validation: { min: 0, max: 100 },
            }}
            value={parseInt(selectedComponent.styles.margin as string) || 0}
            onChange={value => handlePropertyChange('margin', `${value}px`, 'styles')}
          />
        </div>
      </div>
    )
  }

  // 渲染高级属性
  const renderAdvancedProperties = () => {
    if (!selectedComponent) return null

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">自定义名称</label>
          <Input
            value={selectedComponent.meta.custom_name || ''}
            onChange={e =>
              handlePropertyChange(
                'meta',
                { ...selectedComponent.meta, custom_name: e.target.value },
                'props'
              )
            }
            placeholder="输入自定义组件名称"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">组件ID</label>
          <Input value={selectedComponent.id} disabled className="bg-gray-50" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">创建时间</label>
          <Input
            value={new Date(selectedComponent.created_at).toLocaleString()}
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">最后更新</label>
          <Input
            value={new Date(selectedComponent.updated_at).toLocaleString()}
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      {renderComponentHeader()}

      {selectedComponent && (
        <>
          {/* 搜索栏 */}
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="搜索属性..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-9 text-sm"
              />
            </div>
          </div>

          {/* 属性标签页 */}
          <Tabs
            value={activeTab}
            onValueChange={(value: any) => setActiveTab(value)}
            className="flex flex-1 flex-col"
          >
            <TabsList className="m-3 grid w-full grid-cols-3">
              <TabsTrigger value="properties" className="text-xs">
                <Settings className="mr-1 h-3 w-3" />
                属性
              </TabsTrigger>
              <TabsTrigger value="styles" className="text-xs">
                <Palette className="mr-1 h-3 w-3" />
                样式
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                事件
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="px-3 pb-3">
                <TabsContent value="properties" className="mt-0 space-y-0">
                  {selectedComponent && (
                    <div className="p-4">
                      {/* 使用新的PropertyEditor组件 */}
                      <PropertyEditor
                        componentType={selectedComponent.component_type}
                        componentId={selectedComponent.id}
                        componentCategory={getComponentCategory(selectedComponent.component_type)}
                        properties={(selectedComponent.props as any) || {}}
                        propertyDefinitions={getComponentPropertyDefinitions(
                          selectedComponent.component_type
                        )}
                        onPropertyChange={event => {
                          handlePropertyChange(event.property_key || '', event.value, 'props')
                        }}
                        onPropertiesChange={newProps => {
                          handlePropertyChange('props', newProps, 'props')
                        }}
                      />

                      {/* 验证规则编辑器 */}
                      {showAdvanced && (
                        <div className="mt-6">
                          <ValidationEditor
                            componentType={selectedComponent.component_type}
                            propertyName="validation"
                            propertyType={getComponentPropertyType(
                              selectedComponent.component_type
                            )}
                            validationRules={(selectedComponent as any).validation || []}
                            onValidationRulesChange={rules => {
                              handlePropertyChange('validation', rules, 'props')
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="styles" className="mt-0">
                  {selectedComponent && (
                    <div className="p-4">
                      {/* 使用新的StyleEditor组件 */}
                      <StyleEditor
                        component={{
                          id: selectedComponent.id,
                          name: selectedComponent.component_type || '未命名组件',
                          category: selectedComponent.component_type,
                          styleDefinitions: getComponentStyleDefinition(
                            selectedComponent.component_type
                          )
                        }}
                        value={(selectedComponent.styles as any) || {}}
                        onChange={styles => {
                          handlePropertyChange('styles', styles, 'styles')
                        }}
                        onPreviewStyle={previewStyles => {
                          handlePropertyChange('preview', previewStyles, 'styles')
                        }}
                        config={{
                          showPreview: true,
                          showValidation: true,
                          showReset: true,
                          groups: ['layout', 'typography', 'spacing', 'visual', 'effects'],
                          collapsible: true,
                        }}
                        previewConfig={{
                          enabled: true,
                          width: 300,
                          height: 200,
                          showBorder: true,
                          backgroundColor: '#f8fafc',
                        }}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  <div className="py-8 text-center text-gray-500">
                    <Zap className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p className="text-sm">事件配置功能开发中...</p>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </>
      )}
    </Card>
  )
}

export default PagePropertiesPanel
