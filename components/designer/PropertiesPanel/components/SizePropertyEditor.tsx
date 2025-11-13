/**
 * 尺寸属性编辑器组件
 * 提供尺寸输入、单位选择、预设值、滑块控制等功能
 */

import React, { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Slider,
  SliderContent,
  SliderItem,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Ruler,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  Zap
} from 'lucide-react'
import type { PropertyEditorProps } from '@/types/designer'

// 尺寸单位选项
const SIZE_UNITS = [
  { value: 'px', label: '像素 (px)', description: '绝对单位，适用于精确控制' },
  { value: 'rem', label: '根字体大小 (rem)', description: '相对单位，基于根元素字体大小' },
  { value: 'em', label: '字体大小 (em)', description: '相对单位，基于父元素字体大小' },
  { value: '%', label: '百分比 (%)', description: '相对单位，基于父元素尺寸' },
  { value: 'vh', label: '视口高度 (vh)', description: '相对单位，基于视口高度' },
  { value: 'vw', label: '视口宽度 (vw)', description: '相对单位，基于视口宽度' },
  { value: 'auto', label: '自动 (auto)', description: '浏览器自动计算' },
]

// 预设尺寸值
const PRESET_SIZES = {
  width: [
    { value: 'auto', label: '自动' },
    { value: '0', label: '0' },
    { value: '25%', label: '25%' },
    { value: '50%', label: '50%' },
    { value: '75%', label: '75%' },
    { value: '100%', label: '100%' },
    { value: '300px', label: '300px' },
    { value: '600px', label: '600px' },
    { value: '960px', label: '960px' },
    { value: '1200px', label: '1200px' },
  ],
  height: [
    { value: 'auto', label: '自动' },
    { value: '0', label: '0' },
    { value: '25vh', label: '25vh' },
    { value: '50vh', label: '50vh' },
    { value: '75vh', label: '75vh' },
    { value: '100vh', label: '100vh' },
    { value: '200px', label: '200px' },
    { value: '400px', label: '400px' },
    { value: '600px', label: '600px' },
    { value: '800px', label: '800px' },
  ],
  spacing: [
    { value: '0', label: '0' },
    { value: '4px', label: '4px (XS)' },
    { value: '8px', label: '8px (S)' },
    { value: '16px', label: '16px (M)' },
    { value: '24px', label: '24px (L)' },
    { value: '32px', label: '32px (XL)' },
    { value: '48px', label: '48px (2XL)' },
    { value: '64px', label: '64px (3XL)' },
  ],
  default: [
    { value: 'auto', label: '自动' },
    { value: '0', label: '0' },
    { value: '8px', label: '8px' },
    { value: '16px', label: '16px' },
    { value: '24px', label: '24px' },
    { value: '32px', label: '32px' },
    { value: '48px', label: '48px' },
    { value: '64px', label: '64px' },
    { value: '100px', label: '100px' },
    { value: '200px', label: '200px' },
  ],
}

interface SizePropertyEditorProps extends Omit<PropertyEditorProps, 'value' | 'onChange'> {
  value?: string | number | null
  onChange: (value: string | null) => void
  property?: string // 用于选择预设尺寸组
  showPresets?: boolean
  showSlider?: boolean
  showUnitSelector?: boolean
  min?: number
  max?: number
  step?: number
  defaultUnit?: string
  advanced?: boolean
}

export function SizePropertyEditor({
  value,
  onChange,
  label,
  property = 'default',
  disabled = false,
  error,
  description,
  className,
  showPresets = true,
  showSlider = true,
  showUnitSelector = true,
  min = 0,
  max = 1000,
  step = 1,
  defaultUnit = 'px',
  advanced = false,
  testId,
  ...props
}: SizePropertyEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [numberValue, setNumberValue] = useState(0)
  const [unit, setUnit] = useState(defaultUnit)
  const [sliderValue, setSliderValue] = useState([0])

  // 解析尺寸值
  const parseSizeValue = useCallback((value: string | number | null | undefined): {
    number: number
    unit: string
    isAuto: boolean
  } => {
    if (!value || value === 'auto' || value === '0') {
      return { number: 0, unit: 'px', isAuto: value === 'auto' }
    }

    const strValue = String(value)
    const numberRegex = /(\d+(?:\.\d+)?)/
    const unitRegex = /(px|rem|em|%|vh|vw|auto)/i

    const numberMatch = strValue.match(numberRegex)
    const unitMatch = strValue.match(unitRegex)

    const number = numberMatch ? parseFloat(numberMatch[1]) : 0
    const unitValue = unitMatch ? unitMatch[1].toLowerCase() : defaultUnit

    return { number, unit: unitValue, isAuto: unitValue === 'auto' }
  }, [defaultUnit])

  // 格式化尺寸值
  const formatSizeValue = useCallback((number: number, unit: string): string => {
    if (unit === 'auto') return 'auto'
    return `${number}${unit}`
  }, [])

  // 同步外部值变化到内部状态
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const parsed = parseSizeValue(value)
      setInputValue(String(value))
      setNumberValue(parsed.number)
      setUnit(parsed.unit)
      setSliderValue([parsed.number])
    } else {
      setInputValue('')
      setNumberValue(0)
      setUnit(defaultUnit)
      setSliderValue([0])
    }
  }, [value, parseSizeValue, defaultUnit])

  // 处理数值变化
  const handleNumberChange = useCallback((newNumber: number) => {
    if (newNumber < min) newNumber = min
    if (newNumber > max) newNumber = max

    const newValue = formatSizeValue(newNumber, unit)
    setInputValue(newValue)
    setNumberValue(newNumber)
    setSliderValue([newNumber])
    onChange(unit === 'auto' ? 'auto' : newValue)
  }, [unit, min, max, formatSizeValue, onChange])

  // 处理单位变化
  const handleUnitChange = useCallback((newUnit: string) => {
    setUnit(newUnit)
    const newValue = formatSizeValue(numberValue, newUnit)
    setInputValue(newValue)
    onChange(newUnit === 'auto' ? 'auto' : newValue)
  }, [numberValue, formatSizeValue, onChange])

  // 处理输入框变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    const parsed = parseSizeValue(newValue)
    setNumberValue(parsed.number)
    setUnit(parsed.unit)
    setSliderValue([parsed.number])

    // 实时更新（如果格式正确）
    if (newValue === '' || newValue === 'auto' || /^(\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|auto)?$/.test(newValue)) {
      onChange(newValue === '' ? null : newValue)
    }
  }, [parseSizeValue, onChange])

  // 处理输入框失去焦点
  const handleInputBlur = useCallback(() => {
    if (inputValue && !/^(\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|auto)?$/.test(inputValue)) {
      // 如果输入无效，恢复到有效值
      const validValue = formatSizeValue(numberValue, unit)
      setInputValue(validValue)
      onChange(validValue)
    }
  }, [inputValue, numberValue, unit, formatSizeValue, onChange])

  // 处理滑块变化
  const handleSliderChange = useCallback((values: number[]) => {
    const [newValue] = values
    handleNumberChange(newValue)
  }, [handleNumberChange])

  // 处理预设值选择
  const handlePresetSelect = useCallback((presetValue: string) => {
    setInputValue(presetValue)
    onChange(presetValue)

    const parsed = parseSizeValue(presetValue)
    setNumberValue(parsed.number)
    setUnit(parsed.unit)
    setSliderValue([parsed.number])
  }, [parseSizeValue, onChange])

  // 获取当前预设尺寸组
  const getPresetSizes = useCallback(() => {
    const propertyKey = property.toLowerCase()
    if (propertyKey.includes('width') || propertyKey === 'width') {
      return PRESET_SIZES.width
    }
    if (propertyKey.includes('height') || propertyKey === 'height') {
      return PRESET_SIZES.height
    }
    if (propertyKey.includes('margin') || propertyKey.includes('padding')) {
      return PRESET_SIZES.spacing
    }
    return PRESET_SIZES.default
  }, [property])

  // 是否显示滑块
  const shouldShowSlider = showSlider &&
    unit !== 'auto' &&
    unit !== '%' &&
    ['px', 'rem', 'em'].includes(unit)

  // 计算最大值（根据单位调整）
  const getAdjustedMax = useCallback(() => {
    switch (unit) {
      case '%':
        return 100
      case 'vh':
      case 'vw':
        return 100
      case 'rem':
        return 50
      case 'em':
        return 50
      default:
        return max
    }
  }, [unit, max])

  return (
    <div className={cn('space-y-3', className)} data-testid={testId}>
      <div className="flex items-center gap-2">
        <Label className={cn('text-sm font-medium', error && 'text-destructive')}>
          {label}
        </Label>

        {advanced && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <Settings className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
              <div className="space-y-3">
                <div className="text-sm font-medium">高级选项</div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">最小值</Label>
                    <Input
                      type="number"
                      value={min}
                      onChange={(e) => handleNumberChange(Math.max(min, Number(e.target.value)))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">最大值</Label>
                    <Input
                      type="number"
                      value={getAdjustedMax()}
                      onChange={(e) => handleNumberChange(Math.min(getAdjustedMax(), Number(e.target.value)))}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* 主要输入区域 */}
      <div className="flex items-center gap-2">
        {/* 数值输入框 */}
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="输入尺寸值..."
          className="flex-1 font-mono text-sm"
          disabled={disabled}
          style={{ borderColor: error ? 'hsl(var(--destructive))' : undefined }}
        />

        {/* 单位选择器 */}
        {showUnitSelector && (
          <Select value={unit} onValueChange={handleUnitChange} disabled={disabled}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZE_UNITS.map((unitOption) => (
                <SelectItem key={unitOption.value} value={unitOption.value}>
                  <div className="flex flex-col">
                    <span>{unitOption.label}</span>
                    {unitOption.description && (
                      <span className="text-xs text-muted-foreground">
                        {unitOption.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 快速操作按钮 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNumberChange(numberValue + step)}
            disabled={disabled || numberValue >= getAdjustedMax()}
            className="h-8 w-8 p-0"
            title="增加"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNumberChange(Math.max(0, numberValue - step))}
            disabled={disabled || numberValue <= 0}
            className="h-8 w-8 p-0"
            title="减少"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePresetSelect('auto')}
            disabled={disabled}
            className="h-8 w-8 p-0"
            title="自动"
          >
            <Zap className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 滑块控件 */}
      {shouldShowSlider && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span className="font-mono">{numberValue}{unit}</span>
            <span>{getAdjustedMax()}</span>
          </div>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            max={getAdjustedMax()}
            min={min}
            step={step}
            disabled={disabled}
            className="w-full"
          />
        </div>
      )}

      {/* 预设值选择 */}
      {showPresets && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Ruler className="w-3 h-3 text-muted-foreground" />
            <Label className="text-xs text-muted-foreground">预设值</Label>
          </div>
          <div className="flex flex-wrap gap-1">
            {getPresetSizes().map((preset) => (
              <Badge
                key={preset.value}
                variant={inputValue === preset.value ? "default" : "secondary"}
                className="cursor-pointer hover:bg-secondary/80 text-xs"
                onClick={() => handlePresetSelect(preset.value)}
              >
                {preset.label}
              </Badge>
            ))}
          </div>
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

// 导出预设尺寸供其他组件使用
export { PRESET_SIZES, SIZE_UNITS }

// 默认导出
export default SizePropertyEditor