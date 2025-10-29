/**
 * 选择字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyDefinition, PropertyOption } from '@/types/lowcode/property'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface SelectFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
}

export const SelectFieldEditor: React.FC<SelectFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
}) => {
  const isMultiSelect = definition.type === 'multiselect'
  const options = definition.options || []

  // 获取选项分组
  const groupedOptions = options.reduce(
    (groups, option) => {
      const group = option.group || '默认'
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(option)
      return groups
    },
    {} as Record<string, PropertyOption[]>
  )

  // 处理单选变更
  const handleSingleSelectChange = (selectedValue: string) => {
    onChange(selectedValue)
  }

  // 处理多选变更
  const handleMultiSelectChange = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : []

    if (checked) {
      onChange([...currentValues, optionValue])
    } else {
      onChange(currentValues.filter((v: string) => v !== optionValue))
    }
  }

  // 清除多选值
  const clearMultiSelectValue = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : []
    onChange(currentValues.filter((v: string) => v !== optionValue))
  }

  // 只读模式显示
  if (readonly) {
    if (isMultiSelect) {
      const selectedValues = Array.isArray(value) ? value : []
      const selectedOptions = options.filter(option =>
        selectedValues.includes(String(option.value))
      )

      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <Badge key={String(option.value)} variant="secondary" className="text-xs">
              {option.label}
            </Badge>
          ))}
          {selectedOptions.length === 0 && (
            <span className="text-sm text-muted-foreground">未选择</span>
          )}
        </div>
      )
    } else {
      const selectedOption = options.find(option => String(option.value) === String(value))
      return (
        <div className="text-sm text-muted-foreground">{selectedOption?.label || '未选择'}</div>
      )
    }
  }

  // 多选模式
  if (isMultiSelect) {
    const selectedValues = Array.isArray(value) ? value : []

    return (
      <div className="space-y-3">
        {/* 已选择的值 */}
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedValues.map(selectedValue => {
              const option = options.find(opt => String(opt.value) === String(selectedValue))
              return (
                <Badge key={String(selectedValue)} variant="default" className="gap-1 pr-1">
                  {option?.label || String(selectedValue)}
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 hover:bg-transparent"
                      onClick={() => clearMultiSelectValue(String(selectedValue))}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  )}
                </Badge>
              )
            })}
          </div>
        )}

        {/* 选项列表 */}
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
          {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
            <div key={groupName}>
              {groupName !== '默认' && (
                <div className="mb-1 text-xs font-medium text-muted-foreground">{groupName}</div>
              )}
              {groupOptions.map(option => {
                const isSelected = selectedValues.includes(String(option.value))
                return (
                  <div key={String(option.value)} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`option-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={checked =>
                        handleMultiSelectChange(String(option.value), checked as boolean)
                      }
                      disabled={disabled || option.disabled}
                    />
                    <label
                      htmlFor={`option-${option.value}`}
                      className={cn(
                        'flex-1 cursor-pointer text-sm',
                        option.disabled && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {option.label}
                    </label>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 单选模式
  return (
    <Select
      value={String(value || '')}
      onValueChange={handleSingleSelectChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={`选择${definition.label}`} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
          <div key={groupName}>
            {groupName !== '默认' && (
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {groupName}
              </div>
            )}
            {groupOptions.map(option => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}
