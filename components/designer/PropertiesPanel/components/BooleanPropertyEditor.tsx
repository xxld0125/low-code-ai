import React from 'react'
import { PropertyEditor, PropertyEditorProps } from './PropertyEditor'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export interface BooleanPropertyEditorProps extends Omit<PropertyEditorProps, 'type'> {
  trueLabel?: string
  falseLabel?: string
  showToggle?: boolean
}

/**
 * 布尔属性编辑器组件
 * 专门用于编辑布尔类型的属性，提供开关控件
 */
export function BooleanPropertyEditor({
  trueLabel = '启用',
  falseLabel = '禁用',
  showToggle = true,
  value,
  onChange,
  disabled,
  ...props
}: BooleanPropertyEditorProps) {
  const handleToggleChange = (checked: boolean) => {
    onChange(checked)
  }

  return (
    <div className="space-y-2">
      <PropertyEditor
        {...props}
        type="boolean"
        value={value}
        onChange={handleToggleChange}
        disabled={disabled}
      />

      {showToggle && (
        <div className="flex items-center space-x-2">
          <Label className="text-sm text-muted-foreground">{falseLabel}</Label>
          <Switch
            checked={Boolean(value)}
            onCheckedChange={handleToggleChange}
            disabled={disabled}
          />
          <Label className="text-sm text-muted-foreground">{trueLabel}</Label>
        </div>
      )}
    </div>
  )
}

export default BooleanPropertyEditor
