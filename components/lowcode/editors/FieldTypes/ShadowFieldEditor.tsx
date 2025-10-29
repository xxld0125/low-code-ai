/**
 * 阴影字段编辑器
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
import { Card, CardContent } from '@/components/ui/card'
import { PropertyDefinition } from '@/types/lowcode/property'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface ShadowFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
}

interface ShadowConfig {
  enabled: boolean
  preset?: string
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

// 预设阴影样式
const PRESET_SHADOWS: Record<string, Omit<ShadowConfig, 'enabled'>> = {
  none: { x: 0, y: 0, blur: 0, spread: 0, color: 'transparent', inset: false },
  sm: { x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0, 0, 0, 0.05)', inset: false },
  md: { x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0, 0, 0, 0.1)', inset: false },
  lg: { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0, 0, 0, 0.1)', inset: false },
  xl: { x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0, 0, 0, 0.1)', inset: false },
  '2xl': { x: 0, y: 25, blur: 50, spread: -12, color: 'rgba(0, 0, 0, 0.25)', inset: false },
  inner: { x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0, 0, 0, 0.06)', inset: true },
  outline: { x: 0, y: 0, blur: 0, spread: 1, color: 'rgba(0, 0, 0, 0.1)', inset: false },
}

// 常用阴影颜色
const SHADOW_COLORS = [
  { label: '黑色', value: 'rgba(0, 0, 0, 0.1)' },
  { label: '深黑', value: 'rgba(0, 0, 0, 0.25)' },
  { label: '灰色', value: 'rgba(107, 114, 128, 0.1)' },
  { label: '蓝色', value: 'rgba(59, 130, 246, 0.1)' },
  { label: '红色', value: 'rgba(239, 68, 68, 0.1)' },
  { label: '绿色', value: 'rgba(34, 197, 94, 0.1)' },
  { label: '紫色', value: 'rgba(139, 92, 246, 0.1)' },
]

export const ShadowFieldEditor: React.FC<ShadowFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
}) => {
  const [shadowConfig, setShadowConfig] = useState<ShadowConfig>(() => {
    return parseShadowValue(value)
  })

  // 解析阴影值
  function parseShadowValue(value: unknown): ShadowConfig {
    // 布尔值
    if (typeof value === 'boolean') {
      return {
        enabled: value,
        ...PRESET_SHADOWS.md,
      }
    }

    // 字符串预设值
    if (typeof value === 'string') {
      // 检查是否是预设值
      if (value in PRESET_SHADOWS) {
        return {
          enabled: true,
          preset: value,
          ...PRESET_SHADOWS[value as keyof typeof PRESET_SHADOWS],
        }
      }

      // 尝试解析CSS阴影字符串
      const match = value.match(
        /^(\-?\d+)px\s+(\-?\d+)px\s+(\d+)px\s*(\d+px)?\s*(rgba?\([^)]+\)|#[a-fA-F0-9]+)\s*(inset)?$/i
      )
      if (match) {
        return {
          enabled: true,
          x: parseInt(match[1]),
          y: parseInt(match[2]),
          blur: parseInt(match[3]),
          spread: match[4] ? parseInt(match[4]) : 0,
          color: match[5],
          inset: match[6] === 'inset',
        }
      }

      // 默认阴影
      return {
        enabled: true,
        ...PRESET_SHADOWS.md,
      }
    }

    // 默认值
    return {
      enabled: false,
      ...PRESET_SHADOWS.none,
    }
  }

  // 格式化阴影值
  function formatShadowValue(config: ShadowConfig): string {
    if (!config.enabled) {
      return 'none'
    }

    if (config.preset && Object.keys(PRESET_SHADOWS).includes(config.preset)) {
      return config.preset
    }

    const parts = [
      `${config.x}px`,
      `${config.y}px`,
      `${config.blur}px`,
      config.spread !== 0 ? `${config.spread}px` : '',
      config.color,
      config.inset ? 'inset' : '',
    ].filter(Boolean)

    return parts.join(' ')
  }

  // 更新阴影配置
  const updateShadowConfig = (updates: Partial<ShadowConfig>) => {
    const newConfig = { ...shadowConfig, ...updates }

    // 如果更新了预设，同步预设的参数
    if (updates.preset && updates.preset in PRESET_SHADOWS) {
      const presetConfig = PRESET_SHADOWS[updates.preset]
      Object.assign(newConfig, presetConfig)
    }

    // 如果手动修改了参数，清除预设
    if (
      updates.x !== undefined ||
      updates.y !== undefined ||
      updates.blur !== undefined ||
      updates.spread !== undefined ||
      updates.color !== undefined ||
      updates.inset !== undefined
    ) {
      newConfig.preset = undefined
    }

    setShadowConfig(newConfig)
    onChange(formatShadowValue(newConfig))
  }

  // 应用预设
  const applyPreset = (presetName: string) => {
    const preset = PRESET_SHADOWS[presetName as keyof typeof PRESET_SHADOWS]
    if (preset) {
      const config = {
        enabled: true,
        preset: presetName,
        ...preset,
      }
      setShadowConfig(config)
      onChange(formatShadowValue(config))
    }
  }

  // 清除阴影
  const clearShadow = () => {
    const config = { ...shadowConfig, enabled: false, preset: undefined }
    setShadowConfig(config)
    onChange('none')
  }

  // 只读模式显示
  if (readonly) {
    if (!shadowConfig.enabled) {
      return <div className="text-sm text-muted-foreground">无阴影</div>
    }

    return (
      <div className="space-y-2">
        {shadowConfig.preset && (
          <Badge variant="secondary" className="text-xs">
            预设: {shadowConfig.preset}
          </Badge>
        )}
        <div className="font-mono text-xs text-muted-foreground">
          {formatShadowValue(shadowConfig)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 启用/禁用阴影 */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">启用阴影</Label>
        <Switch
          checked={shadowConfig.enabled}
          onCheckedChange={enabled => updateShadowConfig({ enabled })}
          disabled={disabled}
        />
      </div>

      {shadowConfig.enabled && (
        <>
          {/* 预设样式 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">预设样式</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRESET_SHADOWS).map(([name, config]) => (
                <Button
                  key={name}
                  type="button"
                  variant={shadowConfig.preset === name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset(name)}
                  disabled={disabled}
                  className="h-auto p-2"
                >
                  <div
                    className="h-6 w-full rounded bg-background"
                    style={{
                      boxShadow: formatShadowValue({ enabled: true, ...config }),
                    }}
                  />
                  <div className="mt-1 text-xs">{name}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* 自定义阴影参数 */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">自定义参数</Label>

            <div className="grid grid-cols-2 gap-2">
              {/* X偏移 */}
              <div className="space-y-1">
                <Label className="text-xs">X偏移</Label>
                <Input
                  type="number"
                  value={shadowConfig.x}
                  onChange={e => updateShadowConfig({ x: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>

              {/* Y偏移 */}
              <div className="space-y-1">
                <Label className="text-xs">Y偏移</Label>
                <Input
                  type="number"
                  value={shadowConfig.y}
                  onChange={e => updateShadowConfig({ y: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>

              {/* 模糊 */}
              <div className="space-y-1">
                <Label className="text-xs">模糊</Label>
                <Input
                  type="number"
                  value={shadowConfig.blur}
                  onChange={e => updateShadowConfig({ blur: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                  min="0"
                  className="text-sm"
                />
              </div>

              {/* 扩展 */}
              <div className="space-y-1">
                <Label className="text-xs">扩展</Label>
                <Input
                  type="number"
                  value={shadowConfig.spread}
                  onChange={e => updateShadowConfig({ spread: parseInt(e.target.value) || 0 })}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
            </div>

            {/* 阴影颜色 */}
            <div className="space-y-2">
              <Label className="text-xs">颜色</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={shadowConfig.color.startsWith('rgba') ? '#000000' : shadowConfig.color}
                  onChange={e => {
                    const hex = e.target.value
                    // 将hex转换为rgba格式，保持透明度
                    const rgba = hex + '1a' // 添加10%透明度
                    updateShadowConfig({ color: rgba })
                  }}
                  disabled={disabled}
                  className="h-10 w-10 cursor-pointer rounded border border-border disabled:opacity-50"
                />
                <Input
                  value={shadowConfig.color}
                  onChange={e => updateShadowConfig({ color: e.target.value })}
                  disabled={disabled}
                  placeholder="rgba(0, 0, 0, 0.1)"
                  className="flex-1 font-mono text-sm"
                />
              </div>
              {/* 预设颜色 */}
              <div className="flex flex-wrap gap-1">
                {SHADOW_COLORS.map(color => (
                  <Button
                    key={color.value}
                    type="button"
                    variant={shadowConfig.color === color.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateShadowConfig({ color: color.value })}
                    disabled={disabled}
                    className="h-auto px-2 py-1 text-xs"
                  >
                    {color.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 内阴影 */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={shadowConfig.inset}
                onCheckedChange={inset => updateShadowConfig({ inset })}
                disabled={disabled}
              />
              <Label className="text-sm">内阴影</Label>
            </div>
          </div>

          {/* 预览 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">预览</Label>
            <Card>
              <CardContent className="p-4">
                <div
                  className="flex h-16 w-full items-center justify-center rounded bg-background"
                  style={{
                    boxShadow: formatShadowValue(shadowConfig),
                  }}
                >
                  <span className="text-xs text-muted-foreground">阴影预览</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CSS值显示 */}
          <div className="rounded bg-muted/30 p-2 font-mono text-xs text-muted-foreground">
            {formatShadowValue(shadowConfig)}
          </div>
        </>
      )}

      {/* 清除按钮 */}
      {shadowConfig.enabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearShadow}
          disabled={disabled}
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          清除阴影
        </Button>
      )}
    </div>
  )
}
