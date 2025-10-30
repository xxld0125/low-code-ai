/**
 * 边框字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Trash2, Plus } from 'lucide-react'

// 导入共享类型和工具
import { FieldDefinition } from '@/lib/lowcode/types/editor'
import { parseSizeValue, formatSizeValue, validateSizeValue } from '@/lib/lowcode/utils/style-utils'
import { BORDER_STYLE_PRESETS, BORDER_RADIUS_PRESETS } from '@/lib/lowcode/constants/style-presets'

// 本地接口定义
interface BorderConfig {
  style?: {
    type: 'select'
    options: Array<{ value: string; label: string }>
  }
  width?: {
    type: 'number'
    min?: number
    max?: number
  }
  color?: {
    type: 'color'
    presets?: string[]
  }
}

interface BorderValue {
  style: string
  width: string
  color: string
}

interface BorderFieldEditorProps {
  definition: FieldDefinition & {
    default_value?: string | BorderValue
    editor_config: BorderConfig
  }
  value?: string | BorderValue
  error?: string
  disabled?: boolean
  readonly?: boolean
  onChange: (value: string | BorderValue) => void
  onError?: (error: { message: string }) => void
  onBlur?: () => void
  onFocus?: () => void
  className?: string
}

// 解析边框值
const parseBorderValue = (value: string | BorderValue | undefined): BorderValue => {
  if (!value) {
    return {
      style: 'solid',
      width: '1px',
      color: '#000000',
    }
  }

  if (typeof value === 'object') {
    return value
  }

  // 解析字符串形式的边框值 "style width color"
  const match = String(value).match(
    /^(none|solid|dashed|dotted|double|hidden|groove|ridge|inset|outset)\s+(\d+px|\d+rem|\d+em)\s+(.+)$/
  )
  if (match) {
    return {
      style: match[1],
      width: match[2],
      color: match[3],
    }
  }

  return {
    style: 'solid',
    width: '1px',
    color: '#000000',
  }
}

// 格式化边框值
const formatBorderValue = (border: BorderValue): string => {
  if (border.style === 'none') {
    return 'none'
  }
  return `${border.style} ${border.width} ${border.color}`
}

export const BorderFieldEditor: React.FC<BorderFieldEditorProps> = ({
  definition,
  value,
  error,
  disabled = false,
  readonly = false,
  onChange,
  onError,
}) => {
  const [border, setBorder] = useState<BorderValue>(parseBorderValue(value))
  const [activeTab, setActiveTab] = useState('basic')

  // 边框样式配置
  const config = useMemo(() => definition.editor_config || {}, [definition.editor_config])
  const borderStyles = useMemo(() => {
    return config.style?.options || BORDER_STYLE_PRESETS
  }, [config.style?.options])

  // 处理样式变更
  const handleStyleChange = useCallback(
    (style: string) => {
      const newBorder = { ...border, style }
      setBorder(newBorder)
      onChange(formatBorderValue(newBorder))
    },
    [border, onChange]
  )

  // 处理宽度变更
  const handleWidthChange = useCallback(
    (width: string) => {
      const newBorder = { ...border, width }
      setBorder(newBorder)
      onChange(formatBorderValue(newBorder))
    },
    [border, onChange]
  )

  // 处理颜色变更
  const handleColorChange = useCallback(
    (color: string) => {
      const newBorder = { ...border, color }
      setBorder(newBorder)
      onChange(formatBorderValue(newBorder))
    },
    [border, onChange]
  )

  // 应用预设值
  const applyPreset = useCallback(
    (presetValue: string) => {
      const newBorder = parseBorderValue(presetValue)
      setBorder(newBorder)
      onChange(formatBorderValue(newBorder))
    },
    [onChange]
  )

  // 重置为默认值
  const resetToDefault = useCallback(() => {
    const defaultBorder = parseBorderValue(definition.default_value)
    setBorder(defaultBorder)
    onChange(formatBorderValue(defaultBorder))
  }, [definition.default_value, onChange])

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
          {/* 边框样式 */}
          <div className="space-y-2">
            <Label className="text-sm">样式</Label>
            <Select
              value={border.style}
              onValueChange={handleStyleChange}
              disabled={disabled || readonly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {borderStyles.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 边框宽度 */}
          <div className="space-y-2">
            <Label className="text-sm">宽度</Label>
            <Input
              type="text"
              value={border.width}
              onChange={e => handleWidthChange(e.target.value)}
              placeholder="如: 1px, 2px, 0.5rem"
              disabled={disabled || readonly}
            />
          </div>

          {/* 边框颜色 */}
          <div className="space-y-2">
            <Label className="text-sm">颜色</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={border.color}
                onChange={e => handleColorChange(e.target.value)}
                disabled={disabled || readonly}
                className="h-10 w-16 p-1"
              />
              <Input
                type="text"
                value={border.color}
                onChange={e => handleColorChange(e.target.value)}
                placeholder="#000000"
                disabled={disabled || readonly}
                className="flex-1"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preset" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {/* 常用预设 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('none')}
              disabled={disabled || readonly}
              className="h-8"
            >
              无边框
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('solid 1px #e5e7eb')}
              disabled={disabled || readonly}
              className="h-8"
            >
              细边框
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('solid 2px #374151')}
              disabled={disabled || readonly}
              className="h-8"
            >
              中边框
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('solid 4px #000000')}
              disabled={disabled || readonly}
              className="h-8"
            >
              粗边框
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('dashed 1px #3b82f6')}
              disabled={disabled || readonly}
              className="h-8"
            >
              虚线蓝
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset('dotted 2px #ef4444')}
              disabled={disabled || readonly}
              className="h-8"
            >
              点线红
            </Button>
          </div>

          {/* 当前值预览 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex h-12 items-center justify-center rounded border-2 bg-background"
                style={{
                  borderStyle: border.style as any,
                  borderWidth: border.width,
                  borderColor: border.color,
                }}
              >
                <span className="text-xs text-muted-foreground">{formatBorderValue(border)}</span>
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

export default BorderFieldEditor
