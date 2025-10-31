/**
 * 样式编辑器主组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React, { useState, useCallback, useMemo } from 'react'
import { ComponentStyles } from '@/lib/lowcode/types/editor'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { ColorFieldEditor } from '../FieldTypes/ColorFieldEditor'
import { SizeFieldEditor } from '../FieldTypes/SizeFieldEditor'
import { SpacingFieldEditor } from '../FieldTypes/SpacingFieldEditor'
import { SelectFieldEditor } from '../FieldTypes/SelectFieldEditor'
import { BorderFieldEditor } from '../FieldTypes/BorderFieldEditor'
import { ShadowFieldEditor } from '../FieldTypes/ShadowFieldEditor'
import { NumberFieldEditor } from '../FieldTypes/NumberFieldEditor'
import { AnimationEditor, generateAnimationCSS, type AnimationConfig } from '../AnimationEditor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// 导入共享类型和常量
import {
  ComponentStyleDefinition,
  StylePropertyDefinition,
  StyleGroup,
  DebounceConfig,
  FieldType,
  SizeConfig,
} from '@/lib/lowcode/types/editor'
import { PropertyDefinition, PropertyType } from '@/types/lowcode/property'
import { ValidationError } from '@/lib/lowcode/validation/style-validator'
import {
  BREAKPOINTS,
  BREAKPOINT_ARRAY,
  DEFAULT_BREAKPOINT,
  BreakpointId,
} from '@/lib/lowcode/constants/breakpoints'
import { formatValidationErrors } from '@/lib/lowcode/utils/error-handling'
import { removeEmptyStyles, mergeStyles } from '@/lib/lowcode/utils/style-utils'

// 本地类型定义
interface StyleGroupWithOrder extends StyleGroup {
  order: number
}

export interface StyleEditorProps {
  // 组件信息
  componentDefinition: ComponentStyleDefinition
  componentStyles: ComponentStyles

  // 事件处理
  onStyleChange: (property: string, value: unknown, options?: { breakpoint?: string }) => void
  onValidationError?: (property: string, error: ValidationError) => void
  onPreviewStyle?: (styles: ComponentStyles) => void

  // 状态
  loading?: boolean
  disabled?: boolean
  readonly?: boolean

  // 配置选项
  showResponsive?: boolean
  showPreview?: boolean
  showReset?: boolean

  // 防抖配置
  debounceConfig?: DebounceConfig
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
  componentDefinition,
  componentStyles,
  onStyleChange,
  onValidationError,
  onPreviewStyle,
  loading = false,
  disabled = false,
  readonly = false,
  showResponsive = true,
  showPreview = true,
  showReset = true,
  debounceConfig = { delay: 300 },
}) => {
  // 当前响应式断点
  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointId>('desktop')

  // 错误状态
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 预览状态
  const [previewStyles, setPreviewStyles] = useState<ComponentStyles>({})

  // 动画配置状态
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>(() => {
    // 从现有样式中提取动画配置
    const animationCSS = componentStyles.animation as string
    if (animationCSS) {
      // 简单解析CSS动画配置（实际项目中可能需要更复杂的解析器）
      return {
        animations: [],
      }
    }
    return { animations: [] }
  })

  // 当前编辑的标签页
  const [activeTab, setActiveTab] = useState('styles')

  // 获取所有样式分组并排序
  const styleGroups = useMemo(() => {
    const groups = componentDefinition?.style_schema?.groups || []
    return groups.sort(
      (a, b) => (a as StyleGroupWithOrder).order - (b as StyleGroupWithOrder).order
    )
  }, [componentDefinition])

  // 获取默认样式
  const defaultStyles = useMemo(() => {
    const styles: ComponentStyles = {}
    styleGroups.forEach(group => {
      group.properties.forEach(prop => {
        if (prop.default_value !== undefined) {
          styles[prop.name] = prop.default_value
        }
      })
    })
    return styles
  }, [styleGroups])

  // 处理动画配置变更
  const handleAnimationChange = useCallback(
    (config: AnimationConfig) => {
      setAnimationConfig(config)

      // 生成CSS并应用到样式
      const animationCSS = generateAnimationCSS(config)
      if (animationCSS) {
        // 解析CSS动画属性并应用到样式
        const animationStyle = { animation: animationCSS }

        // 更新预览样式
        if (showPreview) {
          const newPreviewStyles = mergeStyles(previewStyles, animationStyle)
          setPreviewStyles(newPreviewStyles)
          onPreviewStyle?.(newPreviewStyles)
        }

        // 应用样式
        onStyleChange('animation', animationCSS)
      } else {
        // 移除动画样式
        onStyleChange('animation', '')
      }
    },
    [showPreview, previewStyles, onPreviewStyle, onStyleChange]
  )

  // 处理样式值变更
  const handleStyleChange = useCallback(
    (property: string, value: unknown) => {
      // 清除该属性的验证错误
      if (errors[property]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[property]
          return newErrors
        })
      }

      // 更新预览样式
      if (showPreview) {
        const newPreviewStyles = mergeStyles(previewStyles, { [property]: value })
        setPreviewStyles(newPreviewStyles)
        onPreviewStyle?.(newPreviewStyles)
      }

      // 应用样式（带响应式断点信息）
      const options =
        showResponsive && currentBreakpoint !== 'desktop'
          ? { breakpoint: currentBreakpoint }
          : undefined

      onStyleChange(property, value, options)
    },
    [
      errors,
      previewStyles,
      showPreview,
      onPreviewStyle,
      onStyleChange,
      showResponsive,
      currentBreakpoint,
    ]
  )

  // 处理验证错误
  const handleValidationError = useCallback(
    (property: string, error: ValidationError) => {
      setErrors(prev => ({
        ...prev,
        [property]: error.message || '验证失败',
      }))
      onValidationError?.(property, error)
    },
    [onValidationError]
  )

  // 重置样式
  const resetStyles = useCallback(() => {
    const cleanedDefaultStyles = removeEmptyStyles(defaultStyles)
    setPreviewStyles(cleanedDefaultStyles)
    onPreviewStyle?.(cleanedDefaultStyles)
    onStyleChange('', cleanedDefaultStyles, undefined) // 重置所有样式
    setErrors({})
  }, [defaultStyles, onPreviewStyle, onStyleChange])

  // 渲染样式字段
  const renderStyleField = useCallback(
    (property: StylePropertyDefinition) => {
      const value = componentStyles[property.name] || property.default_value
      const error = errors[property.name]

      // 类型映射：FieldType -> PropertyType
      const mapFieldTypeToPropertyType = (fieldType: FieldType): PropertyType => {
        switch (fieldType) {
          case 'text':
          case 'textarea':
            return 'string'
          case 'number':
          case 'slider':
            return 'number'
          case 'checkbox':
          case 'switch':
            return 'boolean'
          case 'select':
          case 'radio':
            return 'select'
          case 'color':
            return 'color'
          case 'size':
          case 'font-size':
          case 'spacing':
          case 'border-radius':
            return 'spacing'
          case 'border-style':
          case 'border':
            return 'border'
          case 'shadow':
            return 'shadow'
          case 'font-weight':
            return 'string' // 字体粗细通常是字符串值
          case 'line-height':
            return 'string'
          default:
            return 'string'
        }
      }

      const fieldProps = {
        definition: {
          key: property.id,
          type: mapFieldTypeToPropertyType(property.type), // 转换类型
          label: property.label,
          description: property.description,
          required: false, // StylePropertyDefinition没有required属性
          default: property.default_value,
          validation: [], // 空验证数组
        } as PropertyDefinition,
        value,
        error,
        disabled,
        readonly,
        onChange: (newValue: unknown) => handleStyleChange(property.name, newValue),
        onError: (error: ValidationError) => handleValidationError(property.name, error),
      }

      // 根据属性类型渲染不同的字段编辑器
      switch (property.type) {
        case 'color':
          return <ColorFieldEditor key={property.id} {...fieldProps} />
        case 'size':
          return (
            <SizeFieldEditor
              key={property.id}
              definition={{
                name: property.name,
                label: property.label,
                type: property.type,
                default_value: property.default_value as string | number,
                editor_config: property.config as SizeConfig,
              }}
              value={value as string | number}
              error={error}
              disabled={disabled}
              readonly={readonly}
              onChange={(newValue: string | number) => handleStyleChange(property.name, newValue)}
              onError={(error: { message: string }) =>
                handleValidationError(property.name, error as ValidationError)
              }
            />
          )
        case 'spacing':
          return <SpacingFieldEditor key={property.id} {...fieldProps} />
        case 'select':
          return <SelectFieldEditor key={property.id} {...fieldProps} />
        case 'border':
          return (
            <BorderFieldEditor
              key={property.id}
              definition={{
                name: property.name,
                label: property.label,
                type: property.type,
                default_value: property.default_value as string,
                editor_config: property.config as any,
              }}
              value={value as string}
              error={error}
              disabled={disabled}
              readonly={readonly}
              onChange={newValue => handleStyleChange(property.name, newValue)}
              onError={error => handleValidationError(property.name, error as ValidationError)}
            />
          )
        case 'shadow':
          return (
            <ShadowFieldEditor
              key={property.id}
              definition={{
                name: property.name,
                label: property.label,
                type: property.type,
                default_value: property.default_value as string,
                editor_config: property.config as any,
              }}
              value={value as string}
              error={error}
              disabled={disabled}
              readonly={readonly}
              onChange={newValue => handleStyleChange(property.name, newValue)}
              onError={error => handleValidationError(property.name, error as ValidationError)}
            />
          )
        case 'number':
          return <NumberFieldEditor key={property.id} {...fieldProps} />
        default:
          return null
      }
    },
    [componentStyles, errors, disabled, readonly, handleStyleChange, handleValidationError]
  )

  // 渲染样式分组
  const renderStyleGroup = useCallback(
    (group: StyleGroup) => {
      const hasErrors = group.properties.some(prop => errors[prop.name])

      return (
        <Card key={group.id} className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">{group.name}</CardTitle>
              {hasErrors && (
                <Badge variant="destructive" className="text-xs">
                  {group.properties.filter(prop => errors[prop.name]).length} 个错误
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">{group.properties.map(renderStyleField)}</CardContent>
        </Card>
      )
    },
    [errors, renderStyleField]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">加载样式编辑器...</div>
      </div>
    )
  }

  if (!componentDefinition) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">该组件不支持样式配置</div>
      </div>
    )
  }

  return (
    <div className="style-editor flex h-full flex-col">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">样式配置</span>
          <Badge variant="outline" className="text-xs">
            {componentDefinition.name}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {showReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetStyles}
              className="text-xs"
              disabled={disabled}
            >
              重置
            </Button>
          )}
        </div>
      </div>

      {/* 响应式断点选择器 */}
      {showResponsive && (
        <div className="border-b bg-muted/30 p-4">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium">断点:</Label>
            <div className="flex gap-1">
              {BREAKPOINT_ARRAY.slice(0, 3).map(breakpoint => (
                <Button
                  key={breakpoint.id}
                  variant={currentBreakpoint === breakpoint.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentBreakpoint(breakpoint.id as BreakpointId)}
                  className={cn(
                    'text-xs',
                    currentBreakpoint === breakpoint.id && 'ring-2 ring-primary'
                  )}
                >
                  {breakpoint.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 样式编辑区域 */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
          <TabsList className="mx-4 mt-4 grid w-full grid-cols-2">
            <TabsTrigger value="styles">基础样式</TabsTrigger>
            <TabsTrigger value="animations">动画效果</TabsTrigger>
          </TabsList>

          <TabsContent value="styles" className="flex-1 overflow-auto p-4">
            {styleGroups.length > 0 ? (
              <div className="space-y-4">{styleGroups.map(renderStyleGroup)}</div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                该组件暂无可配置样式
              </div>
            )}
          </TabsContent>

          <TabsContent value="animations" className="flex-1 overflow-auto p-4">
            <AnimationEditor
              value={animationConfig}
              onChange={handleAnimationChange}
              onPreview={animation => {
                // 预览单个动画
                const tempConfig = { animations: [animation] }
                const animationCSS = generateAnimationCSS(tempConfig)
                if (animationCSS) {
                  const tempStyles = mergeStyles(previewStyles, { animation: animationCSS })
                  onPreviewStyle?.(tempStyles)

                  // 3秒后恢复原状
                  setTimeout(() => {
                    onPreviewStyle?.(previewStyles)
                  }, 3000)
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 错误提示 */}
      {Object.keys(errors).length > 0 && (
        <div className="border-t bg-destructive/5 p-4">
          <Alert variant="destructive">
            <AlertDescription>
              <div className="mb-2 text-sm font-medium">样式验证错误:</div>
              <ul className="space-y-1 text-sm">
                {Object.entries(errors).map(([property, message]) => (
                  <li key={property}>
                    <span className="font-medium">{property}:</span> {message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* 预览状态指示器 */}
      {showPreview && Object.keys(previewStyles).length > 0 && (
        <div className="border-t bg-muted/30 p-2">
          <div className="text-center text-xs text-muted-foreground">
            预览模式 - {Object.keys(previewStyles).length} 项已修改
          </div>
        </div>
      )}
    </div>
  )
}
