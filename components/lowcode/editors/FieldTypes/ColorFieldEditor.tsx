/**
 * 颜色字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyDefinition } from '@/types/lowcode/property'
import { cn } from '@/lib/utils'
import { Palette, Eye, EyeOff } from 'lucide-react'

interface ColorFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
  showPresets?: boolean
}

// 预设颜色
const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#64748b',
  '#f1f5f9',
  '#fef3c7',
]

export const ColorFieldEditor: React.FC<ColorFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
  showPresets = true,
}) => {
  const [inputValue, setInputValue] = useState(String(value || definition.default || '#000000'))
  const [showPresetsList, setShowPresetsList] = useState(false)

  // 验证颜色值
  const isValidColor = (color: string): boolean => {
    // 检查十六进制颜色
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true
    }

    // 检查 RGB/RGBA 颜色
    if (/^rgba?\((\s*\d+\s*,\s*){2}\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
      return true
    }

    // 检查 HSL/HSLA 颜色
    if (/^hsla?\((\s*\d+\s*,\s*){2}\s*[\d.]+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
      return true
    }

    // 检查 CSS 颜色名称
    const cssColors = [
      'transparent',
      'inherit',
      'initial',
      'unset',
      'red',
      'green',
      'blue',
      'yellow',
      'orange',
      'purple',
      'pink',
      'gray',
      'black',
      'white',
      'brown',
      'cyan',
      'magenta',
      'lime',
    ]
    return cssColors.includes(color.toLowerCase())
  }

  // 处理颜色变更
  const handleColorChange = (color: string) => {
    setInputValue(color)
    if (isValidColor(color)) {
      onChange(color)
    }
  }

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputValue(newColor)
    if (isValidColor(newColor)) {
      onChange(newColor)
    }
  }

  // 处理颜色选择器变化
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setInputValue(color)
    onChange(color)
  }

  // 应用预设颜色
  const applyPresetColor = (color: string) => {
    handleColorChange(color)
    setShowPresetsList(false)
  }

  const isValid = isValidColor(inputValue)
  const isHexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(inputValue)

  // 只读模式显示
  if (readonly) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 rounded border border-border"
          style={{
            backgroundColor: isValid ? inputValue : 'transparent',
            backgroundImage: isValid
              ? 'none'
              : 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px',
          }}
        />
        <span className="text-sm text-muted-foreground">{inputValue}</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 颜色输入区域 */}
      <div className="flex gap-2">
        {/* 颜色选择器 */}
        <div className="relative">
          <input
            type="color"
            value={isHexColor ? inputValue : '#000000'}
            onChange={handleColorPickerChange}
            disabled={disabled}
            className="h-10 w-10 cursor-pointer rounded border border-border disabled:opacity-50"
          />
        </div>

        {/* 颜色值输入框 */}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="#000000 或 rgb(0,0,0)"
          className={cn(
            'flex-1 font-mono text-sm',
            !isValid && 'border-destructive focus:border-destructive'
          )}
        />

        {/* 预设颜色按钮 */}
        {showPresets && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPresetsList(!showPresetsList)}
            disabled={disabled}
            className="px-2"
          >
            <Palette className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 颜色预览和状态 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border border-border"
            style={{
              backgroundColor: isValid ? inputValue : 'transparent',
              backgroundImage: isValid
                ? 'none'
                : 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px',
            }}
          />
          <Badge variant={isValid ? 'secondary' : 'destructive'} className="text-xs">
            {isValid ? '有效' : '无效'}
          </Badge>
        </div>

        {/* 颜色格式提示 */}
        <div className="text-xs text-muted-foreground">支持: HEX, RGB, HSL, CSS颜色名称</div>
      </div>

      {/* 预设颜色列表 */}
      {showPresets && showPresetsList && (
        <div className="rounded-md border bg-background p-3">
          <div className="mb-2 text-xs font-medium text-muted-foreground">预设颜色</div>
          <div className="grid grid-cols-10 gap-1">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                className={cn(
                  'aspect-square w-full rounded border border-border transition-all hover:scale-110',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                style={{ backgroundColor: color }}
                onClick={() => applyPresetColor(color)}
                disabled={disabled}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {!isValid && <div className="text-xs text-destructive">请输入有效的颜色值</div>}
    </div>
  )
}
