import React from 'react'
import { PropertyEditor, PropertyEditorProps } from './PropertyEditor'

export interface TextPropertyEditorProps extends Omit<PropertyEditorProps, 'type'> {
  multiline?: boolean
  maxLength?: number
  showCharCount?: boolean
  placeholder?: string
}

/**
 * 文本属性编辑器组件
 * 专门用于编辑文本类型的属性，支持单行和多行文本
 */
export function TextPropertyEditor({
  multiline = false,
  maxLength,
  showCharCount = false,
  placeholder,
  value,
  onChange,
  ...props
}: TextPropertyEditorProps) {
  const handleChange = (newValue: string) => {
    // 如果有最大长度限制，截断超出部分
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength)
    }
    onChange(newValue)
  }

  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div className="space-y-2">
      <PropertyEditor
        {...props}
        type={multiline ? 'textarea' : 'text'}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />

      {showCharCount && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>字符数</span>
          <span className={maxLength && currentLength > maxLength ? 'text-red-500' : ''}>
            {currentLength}
            {maxLength && ` / ${maxLength}`}
          </span>
        </div>
      )}
    </div>
  )
}

export default TextPropertyEditor
