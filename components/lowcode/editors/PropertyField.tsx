/**
 * 属性字段组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 更新日期: 2025-10-30 (支持新的FieldDefinition类型)
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  HelpCircle,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'

// 导入共享类型和工具
import { FieldDefinition } from '@/lib/lowcode/types/editor'

interface PropertyFieldProps {
  // 字段定义
  definition: FieldDefinition

  // 当前值
  value?: unknown

  // 默认值
  defaultValue?: unknown

  // 验证相关
  error?: string
  touched?: boolean
  validationState?: 'valid' | 'invalid' | 'warning'

  // 事件处理
  onChange?: (value: unknown) => void
  onBlur?: () => void
  onFocus?: () => void

  // 配置选项
  config?: {
    showLabel?: boolean
    showDescription?: boolean
    showReset?: boolean
    showPreview?: boolean
    showType?: boolean
    inline?: boolean
    compact?: boolean
    disabled?: boolean
    readonly?: boolean
  }

  // 样式
  className?: string
  containerClassName?: string
}

export const PropertyField: React.FC<PropertyFieldProps> = ({
  definition,
  value,
  defaultValue,
  error,
  touched,
  validationState,
  onChange,
  onBlur,
  onFocus,
  config = {},
  className,
  containerClassName,
}) => {
  const [showPreview, setShowPreview] = useState(config.showPreview ?? false)

  // 合并配置
  const fieldConfig = useMemo(() => ({
    showLabel: true,
    showDescription: true,
    showReset: true,
    showPreview: false,
    showType: true,
    inline: false,
    compact: false,
    disabled: false,
    readonly: false,
    ...config,
  }), [config])

  // 处理值变化
  const handleChange = useCallback((newValue: unknown) => {
    if (onChange) {
      onChange(newValue)
    }
  }, [onChange])

  // 重置到默认值
  const handleReset = useCallback(() => {
    if (onChange && defaultValue !== undefined) {
      onChange(defaultValue)
    }
  }, [onChange, defaultValue])

  // 切换预览
  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview)
  }, [showPreview])

  // 渲染字段编辑器
  const renderFieldEditor = () => {
    switch (definition.type) {
      case 'text':
        return (
          <Input
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={fieldConfig.disabled}
            readOnly={fieldConfig.readonly}
            placeholder={definition.placeholder}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={String(value || '')}
            onChange={(e) => handleChange(Number(e.target.value))}
            disabled={fieldConfig.disabled}
            readOnly={fieldConfig.readonly}
            placeholder={definition.placeholder}
          />
        )

      case 'switch':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={handleChange}
            disabled={fieldConfig.disabled}
          />
        )

      case 'select':
        return (
          <Select
            value={String(value || '')}
            onValueChange={handleChange}
            disabled={fieldConfig.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={definition.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {definition.options?.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={handleChange}
            disabled={fieldConfig.disabled}
          />
        )

      case 'radio':
        return (
          <Select
            value={String(value || '')}
            onValueChange={handleChange}
            disabled={fieldConfig.disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={definition.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {definition.options?.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'textarea':
        return (
          <Textarea
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={fieldConfig.disabled}
            readOnly={fieldConfig.readonly}
            placeholder={definition.placeholder}
            rows={4}
          />
        )

      case 'slider':
        return (
          <Input
            type="range"
            value={String(value || '')}
            onChange={(e) => handleChange(Number(e.target.value))}
            disabled={fieldConfig.disabled}
            readOnly={fieldConfig.readonly}
          />
        )

      default:
        // 未知类型使用文本编辑器
        return (
          <Input
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            disabled={fieldConfig.disabled}
            readOnly={fieldConfig.readonly}
            placeholder={definition.placeholder}
          />
        )
    }
  }

  // 渲染标签
  const renderLabel = () => {
    if (!fieldConfig.showLabel) return null

    return (
      <div className="flex items-center gap-2">
        <Label
          htmlFor={definition.name}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            definition.required && 'after:content-["*"] after:ml-1 after:text-destructive'
          )}
        >
          {definition.label || definition.name}
        </Label>

        {definition.description && (
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            <div className="absolute z-10 invisible group-hover:visible bg-popover text-popover-foreground border rounded-md shadow-md p-2 w-64 -top-1 left-6">
              <p className="text-xs">{definition.description}</p>
            </div>
          </div>
        )}

        {fieldConfig.showType && (
          <Badge variant="outline" className="text-xs">
            {definition.type}
          </Badge>
        )}

        {validationState && (
          <Badge
            variant={validationState === 'valid' ? 'default' :
                    validationState === 'invalid' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {validationState === 'valid' ? '✓' :
             validationState === 'invalid' ? '✗' : '!'}
          </Badge>
        )}
      </div>
    )
  }

  // 渲染操作按钮
  const renderActions = () => {
    const hasActions = fieldConfig.showReset || fieldConfig.showPreview

    if (!hasActions) return null

    return (
      <div className="flex items-center gap-1">
        {fieldConfig.showReset && defaultValue !== undefined && value !== defaultValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={fieldConfig.disabled || fieldConfig.readonly}
            className="h-6 w-6 p-0"
            title="重置到默认值"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}

        {fieldConfig.showPreview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            disabled={fieldConfig.disabled || fieldConfig.readonly}
            className="h-6 w-6 p-0"
            title={showPreview ? '隐藏预览' : '显示预览'}
          >
            {showPreview ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
        )}
      </div>
    )
  }

  // 渲染描述
  const renderDescription = () => {
    if (!fieldConfig.showDescription || !definition.description) return null

    return (
      <p className="text-xs text-muted-foreground mt-1">
        {definition.description}
      </p>
    )
  }

  // 渲染错误信息
  const renderError = () => {
    if (!error || !touched) return null

    return (
      <div className="text-xs text-destructive mt-1">
        {error}
      </div>
    )
  }

  // 渲染预览
  const renderPreview = () => {
    if (!showPreview) return null

    return (
      <div className="mt-2 p-2 bg-muted rounded-md">
        <div className="text-xs text-muted-foreground mb-1">预览:</div>
        <div className="text-sm font-mono">
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '未设置')}
        </div>
      </div>
    )
  }

  // 内联布局
  if (fieldConfig.inline) {
    return (
      <div className={cn('flex items-center gap-3', containerClassName)}>
        {renderLabel()}
        <div className="flex-1">
          {renderFieldEditor()}
        </div>
        {renderActions()}
      </div>
    )
  }

  // 标准布局
  return (
    <div
      className={cn(
        'property-field space-y-2',
        fieldConfig.compact && 'space-y-1',
        error && touched && 'has-error',
        containerClassName
      )}
    >
      {/* 标签和操作按钮 */}
      <div className="flex items-center justify-between">
        {renderLabel()}
        {renderActions()}
      </div>

      {/* 字段编辑器 */}
      <div className={cn('relative', className)}>
        {renderFieldEditor()}
      </div>

      {/* 描述 */}
      {renderDescription()}

      {/* 错误信息 */}
      {renderError()}

      {/* 预览 */}
      {renderPreview()}

      {/* 默认值提示 */}
      {!touched && defaultValue !== undefined && value === undefined && (
        <div className="text-xs text-muted-foreground">默认值: {String(defaultValue)}</div>
      )}
    </div>
  )
}

export default PropertyField