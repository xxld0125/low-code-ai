import React, { useState, useCallback } from 'react'
import { PropertyEditor, PropertyEditorProps } from './PropertyEditor'
import { TextPropertyEditor } from './TextPropertyEditor'
import { BooleanPropertyEditor } from './BooleanPropertyEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Save, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

// 属性定义接口
export interface PropertyDefinition {
  key: string
  label: string
  type: PropertyEditorProps['type']
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  step?: number
  defaultValue?: any
  group?: string
  multiline?: boolean
  maxLength?: number
  showCharCount?: boolean
  trueLabel?: string
  falseLabel?: string
}

// 属性表单Props接口
export interface PropertyFormProps {
  properties: PropertyDefinition[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
  onReset?: () => void
  onSave?: () => void
  isDirty?: boolean
  isSaving?: boolean
  validation?: Record<
    string,
    {
      isValid: boolean
      message?: string
    }
  >
  className?: string
  grouped?: boolean
  collapsible?: boolean
}

/**
 * 动态属性表单组件
 * 根据属性定义动态生成表单，支持分组和折叠功能
 */
export function PropertyForm({
  properties,
  values,
  onChange,
  onReset,
  onSave,
  isDirty = false,
  isSaving = false,
  validation,
  className,
  grouped = true,
  collapsible = true,
}: PropertyFormProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // 按分组组织属性
  const groupedProperties = properties.reduce(
    (acc, prop) => {
      const group = prop.group || '基础属性'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(prop)
      return acc
    },
    {} as Record<string, PropertyDefinition[]>
  )

  // 切换分组折叠状态
  const toggleGroup = useCallback((group: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(group)) {
        newSet.delete(group)
      } else {
        newSet.add(group)
      }
      return newSet
    })
  }, [])

  // 渲染单个属性编辑器
  const renderPropertyEditor = (prop: PropertyDefinition) => {
    const currentValue = values[prop.key] ?? prop.defaultValue
    const validationError = validation?.[prop.key]

    const commonProps: Omit<PropertyEditorProps, 'type'> = {
      label: prop.label,
      description: prop.description,
      value: currentValue,
      onChange: value => onChange(prop.key, value),
      placeholder: prop.placeholder,
      disabled: prop.disabled,
      required: prop.required,
      options: prop.options,
      min: prop.min,
      max: prop.max,
      step: prop.step,
      validation: validationError,
    }

    // 根据类型选择合适的编辑器
    switch (prop.type) {
      case 'text':
      case 'textarea':
        return (
          <TextPropertyEditor
            {...commonProps}
            type={prop.type}
            multiline={prop.multiline}
            maxLength={prop.maxLength}
            showCharCount={prop.showCharCount}
          />
        )

      case 'boolean':
        return (
          <BooleanPropertyEditor
            {...commonProps}
            trueLabel={prop.trueLabel}
            falseLabel={prop.falseLabel}
          />
        )

      default:
        return <PropertyEditor {...commonProps} type={prop.type} />
    }
  }

  // 渲染属性分组
  const renderGroup = (groupName: string, groupProperties: PropertyDefinition[]) => {
    const isCollapsed = collapsedGroups.has(groupName)
    const hasError = groupProperties.some(prop => validation?.[prop.key]?.isValid === false)

    return (
      <Card key={groupName} className={hasError ? 'border-red-200' : ''}>
        <Collapsible
          open={!isCollapsed}
          onOpenChange={() => toggleGroup(groupName)}
          disabled={!collapsible}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  {collapsible &&
                    (isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                  {groupName}
                  {hasError && (
                    <Badge variant="destructive" className="text-xs">
                      错误
                    </Badge>
                  )}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {groupProperties.filter(prop => prop.required).length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {groupProperties.filter(prop => prop.required).length} 必填
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-4">
              {groupProperties.map(prop => (
                <div key={prop.key}>{renderPropertyEditor(prop)}</div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <ScrollArea className="h-full max-h-[80vh]">
        <div className="space-y-4 p-4">
          {grouped ? (
            Object.entries(groupedProperties).map(([groupName, groupProperties]) =>
              renderGroup(groupName, groupProperties)
            )
          ) : (
            <Card>
              <CardContent className="space-y-4 p-4">
                {properties.map(prop => (
                  <div key={prop.key}>
                    {renderPropertyEditor(prop)}
                    <Separator className="my-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* 操作按钮区域 */}
      {(onSave || onReset) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {isDirty ? '存在未保存的更改' : '所有更改已保存'}
              </div>
              <div className="flex items-center gap-2">
                {onReset && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    disabled={!isDirty || isSaving}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重置
                  </Button>
                )}
                {onSave && (
                  <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? '保存中...' : '保存更改'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PropertyForm
