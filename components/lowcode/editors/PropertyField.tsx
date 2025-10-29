/**
 * 属性字段组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { PropertyDefinition } from '@/types/lowcode/property'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

// 导入各种字段类型编辑器
import { StringFieldEditor } from './FieldTypes/StringFieldEditor'
import { NumberFieldEditor } from './FieldTypes/NumberFieldEditor'
import { BooleanFieldEditor } from './FieldTypes/BooleanFieldEditor'
import { SelectFieldEditor } from './FieldTypes/SelectFieldEditor'
import { ColorFieldEditor } from './FieldTypes/ColorFieldEditor'
import { ImageFieldEditor } from './FieldTypes/ImageFieldEditor'
import { SpacingFieldEditor } from './FieldTypes/SpacingFieldEditor'
import { BorderFieldEditor } from './FieldTypes/BorderFieldEditor'
import { ShadowFieldEditor } from './FieldTypes/ShadowFieldEditor'

interface PropertyFieldProps {
  definition: PropertyDefinition
  value: unknown
  error?: string
  touched?: boolean
  disabled?: boolean
  readonly?: boolean
  onChange: (value: unknown) => void
}

export const PropertyField: React.FC<PropertyFieldProps> = ({
  definition,
  value,
  error,
  touched,
  disabled = false,
  readonly = false,
  onChange,
}) => {
  const { key, type, label, description, required, default: defaultValue } = definition

  // 渲染字段编辑器
  const renderFieldEditor = () => {
    const commonProps = {
      value,
      onChange,
      disabled,
      readonly,
      definition,
    }

    switch (type) {
      case 'string':
        return <StringFieldEditor {...commonProps} />

      case 'number':
        return <NumberFieldEditor {...commonProps} />

      case 'boolean':
        return <BooleanFieldEditor {...commonProps} />

      case 'select':
      case 'multiselect':
        return <SelectFieldEditor {...commonProps} />

      case 'color':
        return <ColorFieldEditor {...commonProps} />

      case 'image':
        return <ImageFieldEditor {...commonProps} />

      case 'spacing':
        return <SpacingFieldEditor {...commonProps} />

      case 'border':
        return <BorderFieldEditor {...commonProps} />

      case 'shadow':
        return <ShadowFieldEditor {...commonProps} />

      case 'font':
        return <StringFieldEditor {...commonProps} placeholder="选择字体" />

      case 'icon':
        return <StringFieldEditor {...commonProps} placeholder="选择图标" />

      case 'array':
      case 'object':
        return (
          <Textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value || '')}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value)
                onChange(parsed)
              } catch {
                onChange(e.target.value)
              }
            }}
            disabled={disabled}
            readOnly={readonly}
            placeholder={`输入${type === 'array' ? '数组' : '对象'}JSON`}
            className="font-mono text-sm"
            rows={4}
          />
        )

      case 'custom':
        return <div className="text-sm text-muted-foreground">自定义字段类型: {key}</div>

      default:
        return (
          <Input
            value={String(value || '')}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            readOnly={readonly}
            placeholder={`输入${label}`}
          />
        )
    }
  }

  return (
    <div className={cn('property-field space-y-2', error && touched && 'has-error')}>
      {/* 字段标签 */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor={`field-${key}`}
          className={cn(
            'text-sm font-medium',
            required && "after:ml-0.5 after:text-destructive after:content-['*']"
          )}
        >
          {label}
        </Label>

        {/* 类型标识 */}
        <Badge variant="outline" className="text-xs">
          {type}
        </Badge>
      </div>

      {/* 字段编辑器 */}
      <div className="field-editor">{renderFieldEditor()}</div>

      {/* 字段描述 */}
      {description && <div className="text-xs text-muted-foreground">{description}</div>}

      {/* 错误提示 */}
      {error && touched && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* 默认值提示 */}
      {!touched && defaultValue !== undefined && value === undefined && (
        <div className="text-xs text-muted-foreground">默认值: {String(defaultValue)}</div>
      )}
    </div>
  )
}
