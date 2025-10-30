/**
 * 阴影字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Plus } from 'lucide-react'

// 导入共享类型和工具
import { FieldDefinition } from '@/lib/lowcode/types/editor'
import { parseSizeValue, formatSizeValue, validateSizeValue } from '@/lib/lowcode/utils/style-utils'
import { SHADOW_PRESETS } from '@/lib/lowcode/constants/style-presets'

// 本地接口定义
interface ShadowConfig {
  presets?: Array<{ value: string; label: string }>
  custom?: boolean
}

interface ShadowValue {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

interface ShadowFieldEditorProps {
  definition: FieldDefinition & {
    default_value?: string | ShadowValue
    editor_config: ShadowConfig
  }
  value?: string | ShadowValue
  error?: string
  disabled?: boolean
  readonly?: boolean
  onChange: (value: string | ShadowValue) => void
  onError?: (error: { message: string }) => void
  onBlur?: () => void
  onFocus?: () => void
  className?: string
}

// 解析阴影值
const parseShadowValue = (value: string | ShadowValue | undefined): ShadowValue => {
  if (!value) {
    return {
      x: 0,
      y: 2,
      blur: 4,
      spread: 0,
      color: 'rgba(0, 0, 0, 0.1)',
      inset: false,
    }
  }

  if (typeof value === 'object') {
    return value
  }

  // 解析字符串形式的阴影值
  if (value === 'none') {
    return {
      x: 0,
      y: 0,
      blur: 0,
      spread: 0,
      color: 'transparent',
      inset: false,
    }
  }

  const strValue = String(value).trim()

  // 处理 inset 阴影
  const insetMatch = strValue.match(/^inset\s+(.+)$/)
  const shadowStr = insetMatch ? insetMatch[1] : strValue
  const inset = !!insetMatch

  // 解析阴影参数
  const match = shadowStr.match(
    /(-?\d+px|-?\d+rem|-?\d+em)\s+(-?\d+px|-?\d+rem|-?\d+em)\s+(-?\d+px|-?\d+rem|-?\d+em)\s*(?:(-?\d+px|-?\d+rem|-?\d+em)\s*)?(.+)$/
  )
  if (match) {
    return {
      x: parseSizeValue(match[1])?.value || 0,
      y: parseSizeValue(match[2])?.value || 0,
      blur: parseSizeValue(match[3])?.value || 0,
      spread: parseSizeValue(match[4])?.value || 0,
      color: match[5] || 'rgba(0, 0, 0, 0.1)',
      inset,
    }
  }

  return {
    x: 0,
    y: 2,
    blur: 4,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.1)',
    inset: false,
  }
}

// 格式化阴影值
const formatShadowValue = (shadow: ShadowValue): string => {
  if (shadow.x === 0 && shadow.y === 0 && shadow.blur === 0 && shadow.spread === 0) {
    return 'none'
  }

  const parts = []
  if (shadow.inset) parts.push('inset')
  parts.push(`${shadow.x}px`)
  parts.push(`${shadow.y}px`)
  parts.push(`${shadow.blur}px`)
  if (shadow.spread !== 0) parts.push(`${shadow.spread}px`)
  parts.push(shadow.color)

  return parts.join(' ')
}

// 转换颜色格式（支持 rgba 到 hex 的转换）
const normalizeColor = (color: string): string => {
  // 如果已经是标准格式，直接返回
  if (/^#[0-9a-f]{3,8}$/i.test(color) || /^rgba?\(/.test(color)) {
    return color
  }

  // 简单的颜色映射
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#ffffff',
    red: '#ef4444',
    green: '#10b981',
    blue: '#3b82f6',
    yellow: '#eab308',
    purple: '#8b5cf6',
    pink: '#ec4899',
  }

  return colorMap[color.toLowerCase()] || color
}

export const ShadowFieldEditor: React.FC<ShadowFieldEditorProps> = ({
  definition,
  value,
  error,
  disabled = false,
  readonly = false,
  onChange,
  onError,
}) => {
  const [shadow, setShadow] = useState<ShadowValue>(parseShadowValue(value))
  const [activeTab, setActiveTab] = useState('basic')

  // 阴影配置
  const config = useMemo(() => definition.editor_config || {}, [definition.editor_config])
  const presets = useMemo(() => {
    return config.presets || SHADOW_PRESETS
  }, [config.presets])

  // 处理参数变更
  const handleParameterChange = useCallback(
    (parameter: keyof ShadowValue, newValue: unknown) => {
      const newShadow = { ...shadow, [parameter]: newValue }
      setShadow(newShadow)
      onChange(formatShadowValue(newShadow))
    },
    [shadow, onChange]
  )

  // 处理颜色变更
  const handleColorChange = useCallback(
    (color: string) => {
      const normalizedColor = normalizeColor(color)
      handleParameterChange('color', normalizedColor)
    },
    [handleParameterChange]
  )

  // 应用预设值
  const applyPreset = useCallback(
    (presetValue: string) => {
      const newShadow = parseShadowValue(presetValue)
      setShadow(newShadow)
      onChange(formatShadowValue(newShadow))
    },
    [onChange]
  )

  // 重置为默认值
  const resetToDefault = useCallback(() => {
    const defaultShadow = parseShadowValue(definition.default_value)
    setShadow(defaultShadow)
    onChange(formatShadowValue(defaultShadow))
  }, [definition.default_value, onChange])

  // 清除阴影
  const clearShadow = useCallback(() => {
    const emptyShadow = {
      x: 0,
      y: 0,
      blur: 0,
      spread: 0,
      color: 'transparent',
      inset: false,
    }
    setShadow(emptyShadow)
    onChange('none')
  }, [onChange])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{definition.label}</Label>
        {definition.required && (
          <Badge variant="secondary" className="text-xs">
            必填
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">基础设置</TabsTrigger>
          <TabsTrigger value="preset">预设样式</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* 阴影开关 */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">启用阴影</Label>
            <Switch
              checked={shadow.x !== 0 || shadow.y !== 0 || shadow.blur !== 0}
              onCheckedChange={enabled => {
                if (!enabled) {
                  clearShadow()
                } else {
                  const defaultShadow = parseShadowValue('0 2px 4px rgba(0, 0, 0, 0.1)')
                  setShadow(defaultShadow)
                  onChange(formatShadowValue(defaultShadow))
                }
              }}
              disabled={disabled || readonly}
            />
          </div>

          {/* 水平偏移 */}
          <div className="space-y-2">
            <Label className="text-sm">水平偏移 (X)</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[shadow.x]}
                onValueChange={([value]) => handleParameterChange('x', value)}
                min={-50}
                max={50}
                step={1}
                disabled={disabled || readonly}
                className="flex-1"
              />
              <Input
                type="number"
                value={shadow.x}
                onChange={e => handleParameterChange('x', parseInt(e.target.value) || 0)}
                className="w-16 text-center"
                disabled={disabled || readonly}
              />
            </div>
          </div>

          {/* 垂直偏移 */}
          <div className="space-y-2">
            <Label className="text-sm">垂直偏移 (Y)</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[shadow.y]}
                onValueChange={([value]) => handleParameterChange('y', value)}
                min={-50}
                max={50}
                step={1}
                disabled={disabled || readonly}
                className="flex-1"
              />
              <Input
                type="number"
                value={shadow.y}
                onChange={e => handleParameterChange('y', parseInt(e.target.value) || 0)}
                className="w-16 text-center"
                disabled={disabled || readonly}
              />
            </div>
          </div>

          {/* 模糊度 */}
          <div className="space-y-2">
            <Label className="text-sm">模糊度</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[shadow.blur]}
                onValueChange={([value]) => handleParameterChange('blur', value)}
                min={0}
                max={100}
                step={1}
                disabled={disabled || readonly}
                className="flex-1"
              />
              <Input
                type="number"
                value={shadow.blur}
                onChange={e => handleParameterChange('blur', parseInt(e.target.value) || 0)}
                className="w-16 text-center"
                disabled={disabled || readonly}
              />
            </div>
          </div>

          {/* 扩散度 */}
          <div className="space-y-2">
            <Label className="text-sm">扩散度</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[shadow.spread]}
                onValueChange={([value]) => handleParameterChange('spread', value)}
                min={-50}
                max={50}
                step={1}
                disabled={disabled || readonly}
                className="flex-1"
              />
              <Input
                type="number"
                value={shadow.spread}
                onChange={e => handleParameterChange('spread', parseInt(e.target.value) || 0)}
                className="w-16 text-center"
                disabled={disabled || readonly}
              />
            </div>
          </div>

          {/* 颜色 */}
          <div className="space-y-2">
            <Label className="text-sm">颜色</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={shadow.color.startsWith('#') ? shadow.color : '#000000'}
                onChange={e => handleColorChange(e.target.value)}
                disabled={disabled || readonly}
                className="h-10 w-16 p-1"
              />
              <Input
                type="text"
                value={shadow.color}
                onChange={e => handleColorChange(e.target.value)}
                placeholder="rgba(0, 0, 0, 0.1)"
                disabled={disabled || readonly}
                className="flex-1"
              />
            </div>
          </div>

          {/* 内阴影 */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">内阴影</Label>
            <Switch
              checked={shadow.inset}
              onCheckedChange={inset => handleParameterChange('inset', inset)}
              disabled={disabled || readonly}
            />
          </div>
        </TabsContent>

        <TabsContent value="preset" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {presets.map(preset => (
              <Button
                key={preset.value}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.value)}
                disabled={disabled || readonly}
                className="h-8 text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* 当前值预览 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex h-16 items-center justify-center rounded bg-background"
                style={{
                  boxShadow: formatShadowValue(shadow),
                }}
              >
                <span className="text-center text-xs text-muted-foreground">
                  {formatShadowValue(shadow)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 工具按钮 */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearShadow}
          disabled={disabled || readonly}
          className="text-xs"
        >
          清除
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefault}
          disabled={disabled || readonly}
          className="text-xs"
        >
          重置
        </Button>
      </div>

      {/* 错误提示 */}
      {error && <div className="text-xs text-destructive">{error}</div>}

      {/* 配置信息 */}
      {definition.description && (
        <div className="text-xs text-muted-foreground">{definition.description}</div>
      )}
    </div>
  )
}

export default ShadowFieldEditor
