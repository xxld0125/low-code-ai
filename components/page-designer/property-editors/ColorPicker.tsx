/**
 * 颜色选择器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  PropertyEditorProps,
  ColorPropertyConfig,
  PropertyValidationResult,
  PRESET_COLORS,
} from '@/types/page-designer/properties'
import {
  Palette,
  Droplets,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react'

interface ColorPickerProps extends Omit<PropertyEditorProps, 'value'> {
  value: string
  config?: Partial<ColorPropertyConfig>
  validation?: PropertyValidationResult
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  definition,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  placeholder,
  size = 'md',
  config = {},
  validation,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(value || '#000000')
  const [isValid, setIsValid] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState('preset')
  const [copiedColor, setCopiedColor] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 合并默认配置
  const colorConfig: ColorPropertyConfig = {
    value: '#000000',
    preset: PRESET_COLORS,
    opacity: true,
    gradient: false,
    ...config,
  }

  // 验证颜色值
  const validateColor = useCallback(
    (color: string): PropertyValidationResult => {
      if (definition.validation?.required && !color.trim()) {
        return {
          isValid: false,
          error: `${definition.label}不能为空`,
        }
      }

      // 验证颜色格式
      const colorRegex =
        /^(#([0-9A-Fa-f]{3}){1,2}|[rR][gG][Bb][Aa]?\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)?\s*\)|[hH][sS][Ll][Aa]?\(\s*(\d{1,3}%?\s*,\s*){2}\d{1,3}%?\s*(,\s*(1|0?\.\d+)?\s*)?\))$/
      if (!colorRegex.test(color.trim())) {
        return {
          isValid: false,
          error: `${definition.label}格式不正确`,
        }
      }

      return { isValid: true }
    },
    [definition]
  )

  // 处理值变化
  const handleChange = useCallback(
    (newColor: string) => {
      setLocalValue(newColor)

      const validationResult = validateColor(newColor)
      setIsValid(validationResult.isValid)

      onChange(newColor)
    },
    [onChange, validateColor]
  )

  // 处理焦点事件
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  // 处理输入框变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e.target.value)
    },
    [handleChange]
  )

  // 处理预设颜色选择
  const handlePresetColorSelect = useCallback(
    (color: string) => {
      handleChange(color)
      setActiveTab('input')
    },
    [handleChange]
  )

  // 处理透明度变化
  const handleOpacityChange = useCallback(
    (opacity: number) => {
      // 如果当前颜色有透明度，更新透明度
      if (localValue.includes('rgba')) {
        const rgbaMatch = localValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (rgbaMatch) {
          const newColor = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`
          handleChange(newColor)
        }
      } else {
        // 转换为RGBA格式
        const hexToRgba = (hex: string, alpha: number) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          if (result) {
            const r = parseInt(result[1], 16)
            const g = parseInt(result[2], 16)
            const b = parseInt(result[3], 16)
            return `rgba(${r}, ${g}, ${b}, ${alpha})`
          }
          return hex
        }
        handleChange(hexToRgba(localValue, opacity))
      }
    },
    [handleChange, localValue]
  )

  // 获取当前透明度
  const getCurrentOpacity = useCallback((): number => {
    if (localValue.includes('rgba')) {
      const match = localValue.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)/)
      return match ? parseFloat(match[1]) : 1
    }
    return 1
  }, [localValue])

  // 复制颜色值
  const handleCopyColor = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localValue)
      setCopiedColor(true)
      setTimeout(() => setCopiedColor(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }, [localValue])

  // 处理吸管工具
  const handleEyeDropper = useCallback(async () => {
    if (!('EyeDropper' in window)) {
      return
    }

    try {
      const eyeDropper = new (window as any).EyeDropper()
      const result = await eyeDropper.open()
      if (result.sRGBHex) {
        handleChange(result.sRGBHex)
      }
    } catch (err) {
      console.error('吸管工具失败:', err)
    }
  }, [handleChange])

  // 同步外部值变化
  useEffect(() => {
    setLocalValue(value || '#000000')
  }, [value])

  // 渲染预设颜色网格
  const renderPresetColors = () => {
    return (
      <div className="grid grid-cols-8 gap-2">
        {colorConfig.preset?.map((color, index) => (
          <button
            key={index}
            className={cn(
              'h-8 w-8 rounded border-2 transition-all hover:scale-110',
              localValue.toLowerCase() === color.toLowerCase()
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-300'
            )}
            style={{ backgroundColor: color }}
            onClick={() => handlePresetColorSelect(color)}
            disabled={disabled}
            title={color}
          />
        ))}
      </div>
    )
  }

  // 渲染RGB滑块
  const renderRGBSliders = () => {
    const parseRGB = (color: string) => {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      return match
        ? {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
          }
        : { r: 0, g: 0, b: 0 }
    }

    const rgb = parseRGB(localValue)
    const opacity = getCurrentOpacity()

    const handleRGBChange = (channel: 'r' | 'g' | 'b', value: number) => {
      const newColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
      const colorObj = { ...rgb, [channel]: value }
      handleChange(`rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${opacity})`)
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">红色 (R)</Label>
            <span className="text-sm text-gray-500">{rgb.r}</span>
          </div>
          <Slider
            value={[rgb.r]}
            onValueChange={([value]: number[]) => handleRGBChange('r', value)}
            max={255}
            min={0}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">绿色 (G)</Label>
            <span className="text-sm text-gray-500">{rgb.g}</span>
          </div>
          <Slider
            value={[rgb.g]}
            onValueChange={([value]: number[]) => handleRGBChange('g', value)}
            max={255}
            min={0}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">蓝色 (B)</Label>
            <span className="text-sm text-gray-500">{rgb.b}</span>
          </div>
          <Slider
            value={[rgb.b]}
            onValueChange={([value]: number[]) => handleRGBChange('b', value)}
            max={255}
            min={0}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {colorConfig.opacity && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">透明度</Label>
              <span className="text-sm text-gray-500">{Math.round(opacity * 100)}%</span>
            </div>
            <Slider
              value={[opacity]}
              onValueChange={([value]: number[]) => handleOpacityChange(value)}
              max={1}
              min={0}
              step={0.01}
              disabled={disabled}
              className="w-full"
            />
          </div>
        )}
      </div>
    )
  }

  // 渲染颜色预览
  const renderColorPreview = () => {
    return (
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            'h-12 w-12 rounded-lg border-2 transition-all',
            isFocused && 'ring-2 ring-blue-500 ring-offset-2',
            disabled && 'opacity-50'
          )}
          style={{ backgroundColor: localValue }}
        />

        <div className="flex-1">
          <Input
            ref={inputRef}
            value={localValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder || '#000000'}
            className={cn(
              'font-mono text-sm',
              !isValid && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
          />

          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {getCurrentOpacity() < 1
                ? `透明度: ${Math.round(getCurrentOpacity() * 100)}%`
                : '不透明'}
            </span>

            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCopyColor}
                disabled={disabled}
                title="复制颜色"
              >
                {copiedColor ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>

              {'EyeDropper' in window && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={handleEyeDropper}
                  disabled={disabled}
                  title="吸管工具"
                >
                  <Droplets className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染高级选项
  const renderAdvancedOptions = () => {
    return (
      <div className="space-y-4 rounded-lg bg-gray-50 p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">颜色格式</Label>
          <Select defaultValue="hex">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">HEX (#RRGGBB)</SelectItem>
              <SelectItem value="rgb">RGB (rgb(r, g, b))</SelectItem>
              <SelectItem value="rgba">RGBA (rgba(r, g, b, a))</SelectItem>
              <SelectItem value="hsl">HSL (hsl(h, s%, l%))</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enable-opacity"
            checked={colorConfig.opacity || false}
            onCheckedChange={checked => {
              // 这里可以触发配置更新事件
            }}
            disabled={disabled}
          />
          <Label htmlFor="enable-opacity" className="text-sm">
            启用透明度
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enable-gradient"
            checked={colorConfig.gradient || false}
            onCheckedChange={checked => {
              // 这里可以触发配置更新事件
            }}
            disabled={disabled}
          />
          <Label htmlFor="enable-gradient" className="text-sm">
            启用渐变
          </Label>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">快速颜色</Label>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChange('#000000')}
              disabled={disabled}
              className="h-8 w-8 bg-black p-0 text-white"
              title="黑色"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChange('#FFFFFF')}
              disabled={disabled}
              className="h-8 w-8 border-gray-300 bg-white p-0"
              title="白色"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChange('#EF4444')}
              disabled={disabled}
              className="h-8 w-8 bg-red-500 p-0 text-white"
              title="红色"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChange('#3B82F6')}
              disabled={disabled}
              className="h-8 w-8 bg-blue-500 p-0 text-white"
              title="蓝色"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleChange('#10B981')}
              disabled={disabled}
              className="h-8 w-8 bg-emerald-500 p-0 text-white"
              title="绿色"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 标签和必填标识 */}
      <div className="flex items-center justify-between">
        <Label className={cn('text-sm font-medium', disabled && 'text-gray-400')}>
          {definition.label}
          {definition.required && <span className="ml-1 text-red-500">*</span>}
        </Label>

        {/* 验证状态图标 */}
        {!isValid && (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* 描述信息 */}
      {definition.description && <p className="text-xs text-gray-500">{definition.description}</p>}

      {/* 颜色选择器主体 */}
      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preset" className="text-xs">
              <Palette className="mr-1 h-3 w-3" />
              预设
            </TabsTrigger>
            <TabsTrigger value="rgb" className="text-xs">
              <Sparkles className="mr-1 h-3 w-3" />
              RGB
            </TabsTrigger>
            <TabsTrigger value="input" className="text-xs">
              <Droplets className="mr-1 h-3 w-3" />
              输入
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preset" className="mt-3">
            <Card className="p-3">{renderPresetColors()}</Card>
          </TabsContent>

          <TabsContent value="rgb" className="mt-3">
            <Card className="p-3">{renderRGBSliders()}</Card>
          </TabsContent>

          <TabsContent value="input" className="mt-3">
            <Card className="p-3">{renderColorPreview()}</Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 错误信息 */}
      {!isValid && validation?.error && (
        <div className="flex items-center space-x-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{validation.error}</span>
        </div>
      )}

      {/* 警告信息 */}
      {validation?.warning && (
        <div className="flex items-center space-x-2 text-sm text-yellow-600">
          <AlertCircle className="h-4 w-4" />
          <span>{validation.warning}</span>
        </div>
      )}

      {/* 高级选项 */}
      {showAdvanced && renderAdvancedOptions()}
    </div>
  )
}

// 专门用于背景色的编辑器
export const BackgroundColorPicker: React.FC<ColorPickerProps> = props => {
  return (
    <ColorPicker
      {...props}
      config={{
        ...props.config,
        opacity: true,
        preset: [
          '#FFFFFF',
          '#F3F4F6',
          '#E5E7EB',
          '#D1D5DB',
          '#EF4444',
          '#F87171',
          '#FBBF24',
          '#FDE047',
          '#10B981',
          '#34D399',
          '#06B6D4',
          '#3B82F6',
          '#8B5CF6',
          '#A855F7',
          '#EC4899',
          '#F43F5E',
          '#000000',
          '#1F2937',
          '#374151',
          '#4B5563',
        ],
      }}
    />
  )
}

// 专门用于文字色的编辑器
export const TextColorPicker: React.FC<ColorPickerProps> = props => {
  return (
    <ColorPicker
      {...props}
      config={{
        ...props.config,
        opacity: false,
        preset: [
          '#000000',
          '#1F2937',
          '#374151',
          '#4B5563',
          '#6B7280',
          '#EF4444',
          '#F87171',
          '#FBBF24',
          '#FDE047',
          '#10B981',
          '#34D399',
          '#06B6D4',
          '#3B82F6',
          '#8B5CF6',
          '#A855F7',
          '#EC4899',
          '#F43F5E',
          '#FFFFFF',
          '#F9FAFB',
          '#F3F4F6',
          '#E5E7EB',
        ],
      }}
    />
  )
}

// 专门用于边框色的编辑器
export const BorderColorPicker: React.FC<ColorPickerProps> = props => {
  return (
    <ColorPicker
      {...props}
      config={{
        ...props.config,
        opacity: false,
        preset: [
          '#000000',
          '#1F2937',
          '#374151',
          '#6B7280',
          '#9CA3AF',
          '#EF4444',
          '#F87171',
          '#F59E0B',
          '#FBBF24',
          '#10B981',
          '#34D399',
          '#06B6D4',
          '#3B82F6',
          '#8B5CF6',
          '#A855F7',
          '#EC4899',
          '#F43F5E',
          '#E5E7EB',
          '#D1D5DB',
          '#9CA3AF',
          '#6B7280',
        ],
      }}
    />
  )
}

export default ColorPicker
