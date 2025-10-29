/**
 * 布尔字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { PropertyDefinition } from '@/types/lowcode/property'
import { cn } from '@/lib/utils'

interface BooleanFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
  useSwitch?: boolean
}

export const BooleanFieldEditor: React.FC<BooleanFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
  useSwitch = false,
}) => {
  const currentValue = Boolean(value ?? definition.default ?? false)

  const handleChange = (checked: boolean) => {
    onChange(checked)
  }

  // 只读模式显示
  if (readonly) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2',
          'text-sm text-muted-foreground'
        )}
      >
        {currentValue ? '✓ 是' : '✗ 否'}
      </div>
    )
  }

  // 使用开关模式
  if (useSwitch) {
    return (
      <div className="flex items-center space-x-2">
        <Switch checked={currentValue} onCheckedChange={handleChange} disabled={disabled} />
        <span className="text-sm text-muted-foreground">{currentValue ? '是' : '否'}</span>
      </div>
    )
  }

  // 使用复选框模式
  return (
    <div className="flex items-center space-x-2">
      <Checkbox checked={currentValue} onCheckedChange={handleChange} disabled={disabled} />
      <span className="text-sm text-muted-foreground">{currentValue ? '是' : '否'}</span>
    </div>
  )
}
