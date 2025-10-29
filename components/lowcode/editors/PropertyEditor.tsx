/**
 * 属性编辑器主组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useState, useCallback, useMemo } from 'react'
import {
  PropertyDefinition,
  PropertyEditorState,
  PropertyUpdateEvent,
} from '@/types/lowcode/property'
import { ComponentProps } from '@/types/lowcode/component'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PropertyField } from './PropertyField'
import { cn } from '@/lib/utils'

interface PropertyEditorProps {
  // 组件信息
  componentType: string
  componentId: string
  componentCategory?: string

  // 属性数据
  properties: ComponentProps
  propertyDefinitions: PropertyDefinition[]

  // 事件处理
  onPropertyChange: (event: PropertyUpdateEvent) => void
  onPropertiesChange?: (properties: ComponentProps) => void

  // 状态
  loading?: boolean
  disabled?: boolean
  readonly?: boolean

  // 配置选项
  showGroups?: boolean
  collapsibleGroups?: boolean
  showValidation?: boolean
  showAdvancedToggle?: boolean
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  componentType,
  componentId,
  componentCategory,
  properties,
  propertyDefinitions,
  onPropertyChange,
  onPropertiesChange,
  loading = false,
  disabled = false,
  readonly = false,
  showGroups = true,
  collapsibleGroups = true,
  showValidation = true,
  showAdvancedToggle = true,
}) => {
  // 编辑器状态
  const [state, setState] = useState<PropertyEditorState>({
    component_type: componentType,
    properties,
    errors: {},
    touched: {},
    loading: false,
  })

  // 高级属性显示状态
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 折叠状态
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  // 按组分类属性定义
  const groupedProperties = useMemo(() => {
    const groups: Record<string, PropertyDefinition[]> = {}

    propertyDefinitions.forEach(def => {
      const group = def.group || '基础属性'
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(def)
    })

    // 对每个组内的属性按order排序
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => (a.order || 0) - (b.order || 0))
    })

    return groups
  }, [propertyDefinitions])

  // 基础属性和高级属性分组
  const { basicProperties, advancedProperties } = useMemo(() => {
    const basic: PropertyDefinition[] = []
    const advanced: PropertyDefinition[] = []

    propertyDefinitions.forEach(def => {
      // 如果属性没有组或者是基础属性，归为基础属性
      if (!def.group || def.group === '基础属性' || !showAdvancedToggle) {
        basic.push(def)
      } else if (def.group?.includes('高级') || def.group?.includes('Advanced')) {
        advanced.push(def)
      } else {
        // 其他属性根据order判断
        if ((def.order || 0) < 100) {
          basic.push(def)
        } else {
          advanced.push(def)
        }
      }
    })

    return { basicProperties: basic, advancedProperties: advanced }
  }, [propertyDefinitions, showAdvancedToggle])

  // 处理属性值变更
  const handlePropertyChange = useCallback(
    (propertyKey: string, value: unknown, propertyPath?: string) => {
      const fullPath = propertyPath || propertyKey
      const previousValue = (state.properties as any)[fullPath]

      // 更新本地状态
      const newProperties = {
        ...state.properties,
        [fullPath]: value,
      }

      setState(prev => ({
        ...prev,
        properties: newProperties,
        touched: {
          ...prev.touched,
          [fullPath]: true,
        },
      }))

      // 触发变更事件
      const updateEvent: PropertyUpdateEvent = {
        component_id: componentId,
        property_key: fullPath,
        value,
        previous_value: previousValue,
      }

      onPropertyChange(updateEvent)
      onPropertiesChange?.(newProperties)
    },
    [componentId, onPropertyChange, onPropertiesChange, state.properties]
  )

  // 处理组折叠状态
  const handleGroupToggle = useCallback((groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }))
  }, [])

  // 清除错误
  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: {} }))
  }, [])

  // 重置属性为默认值
  const resetToDefaults = useCallback(() => {
    const defaultProperties: ComponentProps = {}

    propertyDefinitions.forEach(def => {
      if (def.default !== undefined) {
        ;(defaultProperties as any)[def.key] = def.default
      }
    })

    setState(prev => ({
      ...prev,
      properties: defaultProperties,
      errors: {},
      touched: {},
    }))

    onPropertiesChange?.(defaultProperties)
  }, [propertyDefinitions, onPropertiesChange])

  // 渲染属性字段
  const renderPropertyField = useCallback(
    (def: PropertyDefinition) => {
      const value = (state.properties as any)[def.key]
      const error = state.errors[def.key]?.[0]
      const touched = state.touched[def.key]

      // 检查条件显示
      if (def.conditional) {
        const { property, operator, value: conditionValue } = def.conditional
        const conditionalValue = (state.properties as any)[property]

        let shouldShow = false
        switch (operator) {
          case 'equals':
            shouldShow = conditionalValue === conditionValue
            break
          case 'not_equals':
            shouldShow = conditionalValue !== conditionValue
            break
          case 'contains':
            shouldShow = String(conditionalValue).includes(String(conditionValue))
            break
          case 'greater_than':
            shouldShow = Number(conditionalValue) > Number(conditionValue)
            break
          case 'less_than':
            shouldShow = Number(conditionalValue) < Number(conditionValue)
            break
        }

        if (!shouldShow) {
          return null
        }
      }

      return (
        <PropertyField
          key={def.key}
          definition={def}
          value={value}
          error={error}
          touched={touched}
          disabled={disabled}
          readonly={readonly}
          onChange={value => handlePropertyChange(def.key, value)}
        />
      )
    },
    [state.properties, state.errors, state.touched, disabled, readonly, handlePropertyChange]
  )

  // 渲染属性组
  const renderPropertyGroup = useCallback(
    (groupName: string, properties: PropertyDefinition[]) => {
      const isCollapsed = collapsibleGroups && collapsedGroups[groupName]
      const hasErrors = properties.some(def => state.errors[def.key]?.length > 0)

      return (
        <Card key={groupName} className="mb-4">
          <CardHeader
            className={cn(
              'cursor-pointer pb-3 transition-colors',
              collapsibleGroups && 'hover:bg-muted/50'
            )}
            onClick={() => collapsibleGroups && handleGroupToggle(groupName)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                {groupName}
                {hasErrors && (
                  <Badge variant="destructive" className="text-xs">
                    有错误
                  </Badge>
                )}
              </CardTitle>
              {collapsibleGroups && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={!collapsibleGroups}
                >
                  <span
                    className={cn(
                      'transition-transform duration-200',
                      isCollapsed ? 'rotate-0' : 'rotate-180'
                    )}
                  >
                    ▼
                  </span>
                </Button>
              )}
            </div>
          </CardHeader>
          {!isCollapsed && (
            <CardContent className="space-y-4">{properties.map(renderPropertyField)}</CardContent>
          )}
        </Card>
      )
    },
    [collapsibleGroups, collapsedGroups, state.errors, handleGroupToggle, renderPropertyField]
  )

  if (loading || state.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">加载属性编辑器...</div>
      </div>
    )
  }

  return (
    <div className="property-editor flex h-full flex-col">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">组件属性</span>
          <Badge variant="outline" className="text-xs">
            {componentType}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {showAdvancedToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs"
            >
              {showAdvanced ? '隐藏高级' : '显示高级'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs"
            disabled={disabled}
          >
            重置
          </Button>
        </div>
      </div>

      {/* 属性编辑区域 */}
      <div className="flex-1 overflow-auto p-4">
        {showGroups && Object.keys(groupedProperties).length > 1 ? (
          // 分组显示模式
          Object.entries(groupedProperties).map(([groupName, properties]) => {
            // 过滤掉不应该在此模式下显示的属性
            const filteredProperties = properties.filter(def => {
              if (!showAdvanced && def.group?.includes('高级')) {
                return false
              }
              return true
            })

            if (filteredProperties.length === 0) {
              return null
            }

            return renderPropertyGroup(groupName, filteredProperties)
          })
        ) : (
          // 简单列表模式
          <div className="space-y-4">
            {basicProperties.map(renderPropertyField)}
            {showAdvanced && advancedProperties.map(renderPropertyField)}
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {showValidation && Object.keys(state.errors).length > 0 && (
        <div className="border-t bg-destructive/5 p-4">
          <Alert variant="destructive">
            <AlertDescription>
              <div className="mb-2 text-sm font-medium">属性验证错误:</div>
              <ul className="space-y-1 text-sm">
                {Object.entries(state.errors).map(([key, errors]) =>
                  errors.map((error, index) => (
                    <li key={`${key}-${index}`}>
                      <span className="font-medium">{key}:</span> {error}
                    </li>
                  ))
                )}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
