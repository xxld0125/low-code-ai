/**
 * 字符串字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PropertyDefinition } from '@/types/lowcode/property'
import { cn } from '@/lib/utils'

interface StringFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
  placeholder?: string
  multiline?: boolean
  rows?: number
  maxLength?: number
}

export const StringFieldEditor: React.FC<StringFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
  placeholder,
  multiline = false,
  rows = 3,
}) => {
  const handleChange = (newValue: string) => {
    // 处理空值
    if (newValue.trim() === '') {
      onChange(definition.default || '')
      return
    }

    // 应用验证规则
    const { validation } = definition
    if (validation) {
      // 最小长度验证
      const minLengthRule = validation.find(rule => rule.type === 'min_length')
      if (minLengthRule && newValue.length < (minLengthRule.params?.minLength as number)) {
        return // 不更新值，显示错误
      }

      // 最大长度验证
      const maxLengthRule = validation.find(rule => rule.type === 'max_length')
      if (maxLengthRule && newValue.length > (maxLengthRule.params?.maxLength as number)) {
        newValue = newValue.slice(0, maxLengthRule.params?.maxLength as number)
      }

      // 正则表达式验证
      const patternRule = validation.find(rule => rule.type === 'pattern')
      if (patternRule) {
        const pattern = new RegExp(patternRule.params?.pattern as string)
        if (!pattern.test(newValue)) {
          return // 不更新值，显示错误
        }
      }
    }

    onChange(newValue)
  }

  const currentValue = String(value || '')
  const placeholderText = placeholder || `输入${definition.label}`

  // 获取最大长度
  const maxLengthRule = definition.validation?.find(rule => rule.type === 'max_length')
  const maxLength = maxLengthRule?.params?.maxLength as number

  if (multiline) {
    return (
      <Textarea
        value={currentValue}
        onChange={e => handleChange(e.target.value)}
        disabled={disabled}
        readOnly={readonly}
        placeholder={placeholderText}
        rows={rows}
        className={cn('resize-none', maxLength && 'text-sm')}
        maxLength={maxLength}
      />
    )
  }

  return (
    <Input
      value={currentValue}
      onChange={e => handleChange(e.target.value)}
      disabled={disabled}
      readOnly={readonly}
      placeholder={placeholderText}
      maxLength={maxLength}
      className={cn(maxLength && 'text-sm')}
    />
  )
}
