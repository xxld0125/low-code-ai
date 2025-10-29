/**
 * 间距字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PropertyDefinition } from '@/types/lowcode/property'
import { SpacingValue } from '@/types/lowcode/style'
import { cn } from '@/lib/utils'
import { Link2, Unlink } from 'lucide-react'

interface SpacingFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
  showLinkedControl?: boolean
}

interface SpacingInput {
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
  x?: string | number
  y?: string | number
}

// 预设间距值
const PRESET_SPACING = [
  { label: '无', value: 0 },
  { label: 'XS', value: '0.25rem' },
  { label: 'SM', value: '0.5rem' },
  { label: 'MD', value: '1rem' },
  { label: 'LG', value: '1.5rem' },
  { label: 'XL', value: '2rem' },
  { label: '2XL', value: '3rem' },
]

export const SpacingFieldEditor: React.FC<SpacingFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
  showLinkedControl = true,
}) => {
  const [linked, setLinked] = useState(true)
  const [spacingValue, setSpacingValue] = useState<SpacingInput>(() => {
    return parseSpacingValue(value)
  })

  // 解析间距值
  function parseSpacingValue(value: unknown): SpacingInput {
    if (typeof value === 'string' || typeof value === 'number') {
      return { top: value, right: value, bottom: value, left: value }
    }

    if (typeof value === 'object' && value !== null) {
      return {
        top: (value as any).top,
        right: (value as any).right,
        bottom: (value as any).bottom,
        left: (value as any).left,
        x: (value as any).x,
        y: (value as any).y,
      }
    }

    return {}
  }

  // 格式化间距值
  function formatSpacingValue(input: SpacingInput): SpacingValue {
    if (linked) {
      // 链接模式下，所有值相同
      const uniformValue = input.top || input.right || input.bottom || input.left || 0
      return uniformValue
    }

    const result: SpacingInput = {}

    // 如果有 x/y 值，优先使用
    if (input.x !== undefined) {
      result.left = result.right = input.x
    }
    if (input.y !== undefined) {
      result.top = result.bottom = input.y
    }

    // 否则使用单独的值
    if (input.top !== undefined) result.top = input.top
    if (input.right !== undefined) result.right = input.right
    if (input.bottom !== undefined) result.bottom = input.bottom
    if (input.left !== undefined) result.left = input.left

    return result
  }

  // 更新间距值
  const updateSpacingValue = (updates: Partial<SpacingInput>) => {
    const newValue = { ...spacingValue, ...updates }
    setSpacingValue(newValue)

    if (linked && updates.top !== undefined) {
      // 链接模式下，同步所有值
      newValue.right = newValue.bottom = newValue.left = updates.top
      setSpacingValue(newValue)
    }

    onChange(formatSpacingValue(newValue))
  }

  // 应用预设值
  const applyPreset = (presetValue: string | number) => {
    if (linked) {
      updateSpacingValue({ top: presetValue })
    } else {
      updateSpacingValue({
        top: Number(presetValue) || presetValue,
        right: Number(presetValue) || presetValue,
        bottom: Number(presetValue) || presetValue,
        left: Number(presetValue) || presetValue,
      })
    }
  }

  // 处理链接切换
  const handleLinkToggle = () => {
    const newLinked = !linked
    setLinked(newLinked)

    if (newLinked) {
      // 切换到链接模式，使用第一个值作为统一值
      const firstValue =
        spacingValue.top || spacingValue.right || spacingValue.bottom || spacingValue.left || 0
      setSpacingValue({ top: firstValue })
      onChange(firstValue)
    } else {
      // 切换到非链接模式，复制统一值到所有方向
      const uniformValue = spacingValue.top || 0
      setSpacingValue({
        top: uniformValue,
        right: uniformValue,
        bottom: uniformValue,
        left: uniformValue,
      })
      onChange({
        top: uniformValue,
        right: uniformValue,
        bottom: uniformValue,
        left: uniformValue,
      })
    }
  }

  // 只读模式显示
  if (readonly) {
    const displayValue = formatSpacingValue(spacingValue)
    return (
      <div className="text-sm text-muted-foreground">
        {typeof displayValue === 'object'
          ? JSON.stringify(displayValue)
          : String(displayValue || '无间距')}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 链接控制 */}
      {showLinkedControl && (
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">统一间距</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLinkToggle}
            disabled={disabled}
            className="h-6 w-6 p-0"
          >
            {linked ? <Link2 className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
          </Button>
        </div>
      )}

      {/* 间距输入区域 */}
      {linked ? (
        // 链接模式 - 单个输入框
        <div className="flex items-center gap-2">
          <Input
            value={String(spacingValue.top || '')}
            onChange={e => updateSpacingValue({ top: e.target.value })}
            disabled={disabled}
            placeholder="0"
            className="flex-1"
          />
          <select
            value={String(spacingValue.top || '')}
            onChange={e => updateSpacingValue({ top: e.target.value })}
            disabled={disabled}
            className="rounded border bg-background px-2 py-1 text-xs"
          >
            <option value="">选择预设</option>
            {PRESET_SPACING.map(preset => (
              <option key={preset.label} value={String(preset.value)}>
                {preset.label} ({preset.value})
              </option>
            ))}
          </select>
        </div>
      ) : (
        // 非链接模式 - 四个方向输入框
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">上 (Top)</Label>
            <Input
              value={String(spacingValue.top || '')}
              onChange={e => updateSpacingValue({ top: e.target.value })}
              disabled={disabled}
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">右 (Right)</Label>
            <Input
              value={String(spacingValue.right || '')}
              onChange={e => updateSpacingValue({ right: e.target.value })}
              disabled={disabled}
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">下 (Bottom)</Label>
            <Input
              value={String(spacingValue.bottom || '')}
              onChange={e => updateSpacingValue({ bottom: e.target.value })}
              disabled={disabled}
              placeholder="0"
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">左 (Left)</Label>
            <Input
              value={String(spacingValue.left || '')}
              onChange={e => updateSpacingValue({ left: e.target.value })}
              disabled={disabled}
              placeholder="0"
              className="h-8"
            />
          </div>
        </div>
      )}

      {/* 快速预设 */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">快速设置</Label>
        <div className="flex flex-wrap gap-1">
          {PRESET_SPACING.map(preset => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset.value)}
              disabled={disabled}
              className="h-auto px-2 py-1 text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 值预览 */}
      <div className="rounded bg-muted/30 p-2 text-xs text-muted-foreground">
        当前值: {JSON.stringify(formatSpacingValue(spacingValue))}
      </div>
    </div>
  )
}
