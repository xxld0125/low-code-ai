import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// 属性编辑器Props接口
export interface PropertyEditorProps {
  label: string
  description?: string
  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'textarea'
    | 'select'
    | 'color'
    | 'size'
    | 'spacing'
    | 'range'
  value: any
  onChange: (value: any) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  options?: Array<{ label: string; value: any }>
  min?: number
  max?: number
  step?: number
  validation?: {
    isValid: boolean
    message?: string
  }
  className?: string
}

/**
 * 通用属性编辑器组件
 * 支持多种属性类型的编辑，包括文本、数字、布尔值、选择器等
 */
export function PropertyEditor({
  label,
  description,
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  options,
  min,
  max,
  step = 1,
  validation,
  className,
}: PropertyEditorProps) {
  const handleChange = (newValue: any) => {
    if (disabled) return
    onChange(newValue)
  }

  const renderEditor = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              validation && !validation.isValid && 'border-red-500 focus:border-red-500',
              className
            )}
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className={cn(
              validation && !validation.isValid && 'border-red-500 focus:border-red-500',
              className
            )}
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={e => handleChange(Number(e.target.value))}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              validation && !validation.isValid && 'border-red-500 focus:border-red-500',
              className
            )}
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch checked={value || false} onCheckedChange={handleChange} disabled={disabled} />
            <span className="text-sm text-muted-foreground">{value ? '启用' : '禁用'}</span>
          </div>
        )

      case 'select':
        return (
          <Select value={value || ''} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger
              className={cn(
                validation && !validation.isValid && 'border-red-500 focus:border-red-500',
                className
              )}
            >
              <SelectValue placeholder={placeholder || '请选择'} />
            </SelectTrigger>
            <SelectContent>
              {options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={value || '#000000'}
              onChange={e => handleChange(e.target.value)}
              disabled={disabled}
              className="h-10 w-16 rounded border p-1"
            />
            <Input
              value={value || ''}
              onChange={e => handleChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              className="flex-1"
            />
          </div>
        )

      case 'size':
        return (
          <div className="flex items-center space-x-2">
            <Input
              value={value || ''}
              onChange={e => handleChange(e.target.value)}
              placeholder="100px 或 50%"
              disabled={disabled}
              className="flex-1"
            />
            <Select
              value={typeof value === 'string' && value.includes('%') ? '%' : 'px'}
              onValueChange={unit => {
                const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
                handleChange(`${numericValue}${unit}`)
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="%">%</SelectItem>
                <SelectItem value="rem">rem</SelectItem>
                <SelectItem value="em">em</SelectItem>
                <SelectItem value="vh">vh</SelectItem>
                <SelectItem value="vw">vw</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'spacing':
        return (
          <div className="flex items-center space-x-2">
            <Input
              value={value || ''}
              onChange={e => handleChange(e.target.value)}
              placeholder="16px"
              disabled={disabled}
              className="flex-1"
            />
            <Select
              value={typeof value === 'string' && value.includes('rem') ? 'rem' : 'px'}
              onValueChange={unit => {
                const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
                handleChange(`${numericValue}${unit}`)
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="rem">rem</SelectItem>
                <SelectItem value="em">em</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'range':
        return (
          <div className="space-y-2">
            <Slider
              value={[value || 0]}
              onValueChange={([newValue]) => handleChange(newValue)}
              min={min || 0}
              max={max || 100}
              step={step}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{min || 0}</span>
              <span className="font-medium">{value || 0}</span>
              <span>{max || 100}</span>
            </div>
          </div>
        )

      default:
        return (
          <Input
            value={value || ''}
            onChange={e => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && 'after:ml-0.5 after:text-red-500 after:content-["*"]'
          )}
        >
          {label}
        </Label>
        {required && (
          <Badge variant="destructive" className="px-1 py-0 text-xs">
            必填
          </Badge>
        )}
      </div>

      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {renderEditor()}

      {validation && !validation.isValid && validation.message && (
        <p className="text-sm text-red-500">{validation.message}</p>
      )}
    </div>
  )
}

export default PropertyEditor
