/**
 * 颜色属性编辑器组件
 * 提供颜色选择、预设颜色、自定义颜色输入等功能
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Palette,
  Square,
  Droplet
} from 'lucide-react'
import type { PropertyEditorProps } from '@/types/designer'

// 预设颜色选项
const PRESET_COLORS = [
  // 基础颜色
  '#000000', '#FFFFFF', '#6B7280', '#9CA3AF', '#D1D5DB',
  // 红色系
  '#EF4444', '#F87171', '#FCA5A5', '#FEE2E2', '#DC2626',
  // 橙色系
  '#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#EA580C',
  // 黄色系
  '#EAB308', '#FACC15', '#FDE047', '#FEF3C7', '#CA8A04',
  // 绿色系
  '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#16A34A',
  // 蓝色系
  '#3B82F6', '#60A5FA', '#93BBFC', '#BFDBFE', '#2563EB',
  // 紫色系
  '#A855F7', '#C084FC', '#D8B4FE', '#E9D5FF', '#9333EA',
  // 粉色系
  '#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8', '#DB2777',
]

// 颜色名称映射
const COLOR_NAMES: Record<string, string> = {
  '#000000': '黑色',
  '#FFFFFF': '白色',
  '#6B7280': '灰色',
  '#9CA3AF': '浅灰色',
  '#D1D5DB': '极浅灰',
  '#EF4444': '红色',
  '#F87171': '浅红色',
  '#DC2626': '深红色',
  '#F97316': '橙色',
  '#FB923C': '浅橙色',
  '#EA580C': '深橙色',
  '#EAB308': '黄色',
  '#FACC15': '浅黄色',
  '#CA8A04': '深黄色',
  '#22C55E': '绿色',
  '#4ADE80': '浅绿色',
  '#16A34A': '深绿色',
  '#3B82F6': '蓝色',
  '#60A5FA': '浅蓝色',
  '#2563EB': '深蓝色',
  '#A855F7': '紫色',
  '#C084FC': '浅紫色',
  '#9333EA': '深紫色',
  '#EC4899': '粉色',
  '#F472B6': '浅粉色',
  '#DB2777': '深粉色',
  'transparent': '透明',
}

interface ColorPropertyEditorProps extends Omit<PropertyEditorProps, 'value' | 'onChange'> {
  value?: string | null
  onChange: (value: string | null) => void
  showPresets?: boolean
  showAlpha?: boolean
  showHsl?: boolean
}

export function ColorPropertyEditor({
  value,
  onChange,
  label,
  disabled = false,
  error,
  description,
  className,
  showPresets = true,
  showAlpha = true,
  showHsl = true,
  testId,
  ...props
}: ColorPropertyEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('preset')
  const inputRef = useRef<HTMLInputElement>(null)

  // 同步外部值变化到内部状态
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // 验证颜色值格式
  const isValidColor = (color: string): boolean => {
    if (color === 'transparent') return true
    if (color === '') return true

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const namedColorRegex = /^[a-zA-Z]+$/

    return hexRegex.test(color) ||
           namedColorRegex.test(color) ||
           COLOR_NAMES[color.toLowerCase()] !== undefined
  }

  // 标准化颜色值
  const normalizeColor = (color: string): string => {
    if (!color || color === 'transparent') return color

    // 如果是颜色名称，返回对应值
    const colorEntry = Object.entries(COLOR_NAMES).find(([_, name]) =>
      name.toLowerCase() === color.toLowerCase()
    )
    if (colorEntry) return colorEntry[0]

    // 标准化十六进制颜色
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (hexRegex.test(color)) {
      return color.toUpperCase()
    }

    return color
  }

  // 处理颜色值变化
  const handleColorChange = useCallback((newColor: string | null) => {
    const normalizedColor = newColor ? normalizeColor(newColor) : null
    setInputValue(normalizedColor || '')
    onChange(normalizedColor)

    // 添加到最近使用的颜色
    if (normalizedColor && isValidColor(normalizedColor)) {
      setRecentColors(prev => {
        const filtered = prev.filter(color => color !== normalizedColor)
        return [normalizedColor, ...filtered].slice(0, 12)
      })
    }
  }, [onChange])

  // 处理输入框值变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // 实时验证并更新（如果有效）
    if (isValidColor(newValue) || newValue === '') {
      handleColorChange(newValue || null)
    }
  }, [handleColorChange])

  // 处理输入框失去焦点
  const handleInputBlur = useCallback(() => {
    if (inputValue && !isValidColor(inputValue)) {
      // 如果输入无效，恢复到有效值
      setInputValue(value || '')
    }
  }, [inputValue, value])

  // 复制颜色值到剪贴板
  const copyToClipboard = useCallback(async () => {
    if (inputValue) {
      try {
        await navigator.clipboard.writeText(inputValue)
        // 可以添加提示消息
      } catch (err) {
        console.error('复制失败:', err)
      }
    }
  }, [inputValue])

  // 清除颜色值
  const clearColor = useCallback(() => {
    handleColorChange(null)
  }, [handleColorChange])

  // RGB转HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  // HEX转RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // 解析颜色值以显示更多信息
  const getColorInfo = (color: string) => {
    if (!color || color === 'transparent') return null

    const rgb = hexToRgb(color)
    if (!rgb) return null

    return {
      hex: color.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      name: COLOR_NAMES[color] || '自定义颜色'
    }
  }

  const colorInfo = getColorInfo(inputValue || '')

  return (
    <div className={cn('space-y-2', className)} data-testid={testId}>
      <Label className={cn('text-sm font-medium', error && 'text-destructive')}>
        {label}
      </Label>

      <div className="flex items-center gap-2">
        {/* 颜色预览和输入 */}
        <div className="flex-1 flex items-center gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 border-2"
                disabled={disabled}
                style={{
                  backgroundColor: inputValue || 'transparent',
                  borderColor: error ? 'hsl(var(--destructive))' : undefined
                }}
              >
                {inputValue && inputValue !== 'transparent' ? (
                  <div
                    className="w-full h-full rounded-sm"
                    style={{ backgroundColor: inputValue }}
                  />
                ) : (
                  <div className="w-full h-full rounded-sm border border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <Droplet className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="start">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="preset" className="text-xs">
                    <Square className="w-3 h-3 mr-1" />
                    预设
                  </TabsTrigger>
                  <TabsTrigger value="picker" className="text-xs">
                    <Palette className="w-3 h-3 mr-1" />
                    选择
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="text-xs">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    最近
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preset" className="p-3 space-y-3">
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <Button
                        key={color}
                        variant="outline"
                        size="sm"
                        className="w-8 h-8 p-0 border-2 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                        title={COLOR_NAMES[color] || color}
                      />
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Object.entries(COLOR_NAMES).slice(0, 8).map(([hex, name]) => (
                      <Badge
                        key={hex}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80 text-xs"
                        onClick={() => handleColorChange(hex)}
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="picker" className="p-3 space-y-3">
                  {/* 这里可以集成更高级的颜色选择器，如react-color */}
                  <div className="space-y-2">
                    <Label className="text-xs">HEX 值</Label>
                    <Input
                      ref={inputRef}
                      value={inputValue || ''}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="#000000"
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleColorChange('transparent')}
                      className="flex-1"
                    >
                      透明
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearColor}
                      className="flex-1"
                    >
                      清除
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="p-3">
                  {recentColors.length > 0 ? (
                    <div className="grid grid-cols-8 gap-2">
                      {recentColors.map((color) => (
                        <Button
                          key={color}
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 p-0 border-2 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      暂无最近使用的颜色
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

          {/* 文本输入框 */}
          <Input
            ref={inputRef}
            value={inputValue || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="选择颜色或输入值..."
            className="flex-1 font-mono text-sm"
            disabled={disabled}
            style={{ borderColor: error ? 'hsl(var(--destructive))' : undefined }}
          />

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            {inputValue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0"
                title="复制颜色值"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="h-8 w-8 p-0"
              title="打开颜色选择器"
            >
              <Palette className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* 颜色信息显示 */}
      {colorInfo && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{colorInfo.name}</span>
          <span>•</span>
          <span className="font-mono">{colorInfo.hex}</span>
          <span>•</span>
          <span className="font-mono">{colorInfo.rgb}</span>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="text-xs text-destructive">
          {error}
        </div>
      )}

      {/* 描述信息 */}
      {description && !error && (
        <div className="text-xs text-muted-foreground">
          {description}
        </div>
      )}
    </div>
  )
}

// 导出预设颜色供其他组件使用
export { PRESET_COLORS, COLOR_NAMES }

// 默认导出
export default ColorPropertyEditor