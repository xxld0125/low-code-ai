/**
 * 边框字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PropertyDefinition } from '@/types/lowcode/property'
import { BorderValue } from '@/types/lowcode/style'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface BorderFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
}

interface BorderConfig {
  enabled: boolean
  width: number
  color: string
  style: 'solid' | 'dashed' | 'dotted' | 'double'
  side: 'all' | 'top' | 'right' | 'bottom' | 'left' | 'x' | 'y'
}

// 预设边框样式
const PRESET_BORDER_STYLES: BorderConfig[] = [
  { enabled: true, width: 1, color: '#e5e7eb', style: 'solid', side: 'all' },
  { enabled: true, width: 2, color: '#d1d5db', style: 'solid', side: 'all' },
  { enabled: true, width: 1, color: '#3b82f6', style: 'solid', side: 'all' },
  { enabled: true, width: 2, color: '#ef4444', style: 'solid', side: 'all' },
  { enabled: true, width: 1, color: '#6b7280', style: 'dashed', side: 'all' },
  { enabled: true, width: 1, color: '#6b7280', style: 'dotted', side: 'all' },
]

// 常用颜色
const COMMON_COLORS = [
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
  '#e5e7eb',
]

export const BorderFieldEditor: React.FC<BorderFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
}) => {
  const [borderConfig, setBorderConfig] = useState<BorderConfig>(() => {
    return parseBorderValue(value)
  })

  // 解析边框值
  function parseBorderValue(value: unknown): BorderConfig {
    // 简单布尔值
    if (typeof value === 'boolean') {
      return {
        enabled: value,
        width: 1,
        color: '#e5e7eb',
        style: 'solid',
        side: 'all',
      }
    }

    // 字符串边框值
    if (typeof value === 'string') {
      // 简单边框字符串，如 "1px solid #ccc"
      const match = value.match(/^(\d+px|\d+)\s+(solid|dashed|dotted|double)\s+(.+)$/)
      if (match) {
        return {
          enabled: true,
          width: parseInt(match[1]),
          color: match[3],
          style: match[2] as BorderConfig['style'],
          side: 'all',
        }
      }

      // 默认边框
      return {
        enabled: true,
        width: 1,
        color: value,
        style: 'solid',
        side: 'all',
      }
    }

    // 对象边框值
    if (typeof value === 'object' && value !== null) {
      const borderObj = value as any
      return {
        enabled: true,
        width: borderObj.width || 1,
        color: borderObj.color || '#e5e7eb',
        style: borderObj.style || 'solid',
        side: borderObj.side || 'all',
      }
    }

    // 默认值
    return {
      enabled: false,
      width: 1,
      color: '#e5e7eb',
      style: 'solid',
      side: 'all',
    }
  }

  // 格式化边框值
  function formatBorderValue(config: BorderConfig): BorderValue {
    if (!config.enabled) {
      return false
    }

    if (config.side === 'all') {
      // 简单字符串格式
      return `${config.width}px ${config.style} ${config.color}`
    }

    // 对象格式
    return {
      width: config.width,
      color: config.color,
      style: config.style,
      side: config.side,
    }
  }

  // 更新边框配置
  const updateBorderConfig = (updates: Partial<BorderConfig>) => {
    const newConfig = { ...borderConfig, ...updates }
    setBorderConfig(newConfig)
    onChange(formatBorderValue(newConfig))
  }

  // 应用预设
  const applyPreset = (preset: BorderConfig) => {
    setBorderConfig(preset)
    onChange(formatBorderValue(preset))
  }

  // 清除边框
  const clearBorder = () => {
    const config = { ...borderConfig, enabled: false }
    setBorderConfig(config)
    onChange(false)
  }

  // 只读模式显示
  if (readonly) {
    if (!borderConfig.enabled) {
      return <div className="text-sm text-muted-foreground">无边框</div>
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {borderConfig.width}px
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {borderConfig.style}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {borderConfig.side}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border-2"
            style={{
              borderColor: borderConfig.color,
              borderStyle: borderConfig.style,
            }}
          />
          <span className="text-xs text-muted-foreground">{borderConfig.color}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 启用/禁用边框 */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">启用边框</Label>
        <Switch
          checked={borderConfig.enabled}
          onCheckedChange={enabled => updateBorderConfig({ enabled })}
          disabled={disabled}
        />
      </div>

      {borderConfig.enabled && (
        <>
          {/* 预设样式 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">预设样式</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_BORDER_STYLES.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  disabled={disabled}
                  className="h-auto p-2"
                >
                  <div
                    className="h-4 w-full rounded border-2"
                    style={{
                      borderColor: preset.color,
                      borderStyle: preset.style,
                    }}
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* 边框宽度 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">宽度</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={borderConfig.width}
                onChange={e => updateBorderConfig({ width: parseInt(e.target.value) || 0 })}
                disabled={disabled}
                min="0"
                max="20"
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>

          {/* 边框样式 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">样式</Label>
            <Select
              value={borderConfig.style}
              onValueChange={(style: BorderConfig['style']) => updateBorderConfig({ style })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">实线</SelectItem>
                <SelectItem value="dashed">虚线</SelectItem>
                <SelectItem value="dotted">点线</SelectItem>
                <SelectItem value="double">双线</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 边框方向 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">方向</Label>
            <Select
              value={borderConfig.side}
              onValueChange={(side: BorderConfig['side']) => updateBorderConfig({ side })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="top">上边</SelectItem>
                <SelectItem value="right">右边</SelectItem>
                <SelectItem value="bottom">下边</SelectItem>
                <SelectItem value="left">左边</SelectItem>
                <SelectItem value="x">水平</SelectItem>
                <SelectItem value="y">垂直</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 边框颜色 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">颜色</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderConfig.color}
                onChange={e => updateBorderConfig({ color: e.target.value })}
                disabled={disabled}
                className="h-10 w-10 cursor-pointer rounded border border-border disabled:opacity-50"
              />
              <Input
                value={borderConfig.color}
                onChange={e => updateBorderConfig({ color: e.target.value })}
                disabled={disabled}
                placeholder="#000000"
                className="flex-1 font-mono text-sm"
              />
            </div>
            {/* 预设颜色 */}
            <div className="flex flex-wrap gap-1">
              {COMMON_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className="h-6 w-6 rounded border border-border transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  onClick={() => updateBorderConfig({ color })}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>

          {/* 预览 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">预览</Label>
            <div
              className="flex h-12 w-full items-center justify-center rounded bg-background"
              style={{
                border: `${borderConfig.width}px ${borderConfig.style} ${borderConfig.color}`,
              }}
            >
              <span className="text-xs text-muted-foreground">边框预览</span>
            </div>
          </div>
        </>
      )}

      {/* 清除按钮 */}
      {borderConfig.enabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearBorder}
          disabled={disabled}
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          清除边框
        </Button>
      )}
    </div>
  )
}
