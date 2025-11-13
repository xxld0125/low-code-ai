/**
 * 选择器编辑器
 *
 * 下拉选择和多项选择编辑器
 */

import React, { useCallback, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { PropertyEditorProps } from '../property-editor-registry'
import { RegisterEditor } from '../property-editor-registry'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  description?: string
}

interface SelectEditorProps extends PropertyEditorProps {
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
  placeholder?: string
  emptyText?: string
}

export const SelectEditor: React.FC<SelectEditorProps> = ({
  value,
  onChange,
  schema,
  disabled = false,
  placeholder,
  className,
  error,
  onBlur,
  onFocus,
  options = [],
  multiple = false,
  searchable = false,
  emptyText = 'No options available',
}) => {
  // 解析选项，支持从schema.ui.options中获取
  const parsedOptions = useMemo(() => {
    if (schema.ui?.options) {
      if (Array.isArray(schema.ui.options)) {
        return schema.ui.options.map((opt, index) => {
          if (typeof opt === 'string' || typeof opt === 'number') {
            return {
              label: String(opt),
              value: opt,
            }
          }
          return opt as SelectOption
        })
      }
    }
    return options
  }, [options, schema.ui?.options])

  // 处理多选值
  const selectedValues = useMemo(() => {
    if (multiple) {
      if (Array.isArray(value)) {
        return value.map(String)
      } else if (value) {
        return [String(value)]
      }
      return []
    }
    return value ? String(value) : ''
  }, [value, multiple])

  const handleSingleChange = useCallback((newValue: string) => {
    const option = parsedOptions.find(opt => String(opt.value) === newValue)
    onChange(option?.value || '')
  }, [onChange, parsedOptions])

  const handleMultiChange = useCallback((optionValue: string, checked: boolean) => {
    const option = parsedOptions.find(opt => String(opt.value) === optionValue)
    if (!option) return

    const currentValues = Array.isArray(value) ? [...value] : value ? [value] : []

    if (checked) {
      if (!currentValues.includes(option.value)) {
        onChange([...currentValues, option.value])
      }
    } else {
      onChange(currentValues.filter(v => v !== option.value))
    }
  }, [value, onChange, parsedOptions])

  const removeMultiValue = useCallback((valueToRemove: string | number) => {
    const currentValues = Array.isArray(value) ? [...value] : value ? [value] : []
    onChange(currentValues.filter(v => v !== valueToRemove))
  }, [value, onChange])

  // 单选模式
  if (!multiple) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {schema.title || 'Select'}
          </CardTitle>
          {schema.description && (
            <p className="text-xs text-muted-foreground">
              {schema.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Label className="text-xs">Value</Label>
            <Select
              value={selectedValues}
              onValueChange={handleSingleChange}
              disabled={disabled}
            >
              <SelectTrigger onBlur={onBlur} onFocus={onFocus}>
                <SelectValue placeholder={placeholder || schema.ui?.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {parsedOptions.length === 0 ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    {emptyText}
                  </div>
                ) : (
                  parsedOptions.map((option) => (
                    <SelectItem
                      key={String(option.value)}
                      value={String(option.value)}
                      disabled={option.disabled}
                    >
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* 错误提示 */}
            {error && (
              <div className="text-xs text-destructive">
                {error}
              </div>
            )}

            {/* 帮助文本 */}
            {schema.ui?.help && (
              <div className="text-xs text-muted-foreground">
                {schema.ui?.help}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 多选模式
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {schema.title || 'Multi Select'}
        </CardTitle>
        {schema.description && (
          <p className="text-xs text-muted-foreground">
            {schema.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Label className="text-xs">Selected Values</Label>

          {/* 已选择的值 */}
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((val) => {
                const option = parsedOptions.find(opt => String(opt.value) === val)
                return (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {option?.label || val}
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeMultiValue(option?.value || val)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Badge>
                )
              })}
            </div>
          )}

          {/* 选项列表 */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {parsedOptions.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              parsedOptions.map((option) => {
                const isChecked = selectedValues.includes(String(option.value))
                return (
                  <div key={String(option.value)} className="flex items-center space-x-2">
                    <Checkbox
                      id={`checkbox-${String(option.value)}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleMultiChange(String(option.value), checked as boolean)
                      }
                      disabled={disabled || option.disabled}
                    />
                    <Label
                      htmlFor={`checkbox-${String(option.value)}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </Label>
                  </div>
                )
              })
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="text-xs text-destructive">
              {error}
            </div>
          )}

          {/* 帮助文本 */}
          {schema.ui?.help && (
            <div className="text-xs text-muted-foreground">
              {schema.ui?.help}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 注册单选编辑器
RegisterEditor({
  type: 'select',
  name: 'Select Editor',
  description: 'Single selection dropdown editor',
  supportedTypes: ['select', 'choice', 'enum'],
  category: 'basic',
  tags: ['input', 'select', 'dropdown', 'single'],
})(SelectEditor)

// 注册多选编辑器
RegisterEditor({
  type: 'multiselect',
  name: 'Multi Select Editor',
  description: 'Multiple selection checkbox editor',
  supportedTypes: ['multiselect', 'tags', 'array'],
  category: 'basic',
  tags: ['input', 'select', 'multiple', 'checkbox'],
})(function MultiSelectEditor(props: SelectEditorProps) {
  return <SelectEditor {...props} multiple={true} />
})

// 注册布尔编辑器（使用select实现）
RegisterEditor({
  type: 'boolean',
  name: 'Boolean Editor',
  description: 'Boolean selection editor',
  supportedTypes: ['boolean', 'bool'],
  category: 'basic',
  tags: ['input', 'boolean', 'toggle'],
})(function BooleanEditor(props: PropertyEditorProps) {
  const booleanOptions: SelectOption[] = [
    { label: 'True', value: true },
    { label: 'False', value: false },
  ]

  return (
    <SelectEditor
      {...props}
      options={booleanOptions}
      placeholder={props.placeholder || 'Select boolean value'}
    />
  )
})