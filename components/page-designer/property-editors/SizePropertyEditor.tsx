/**
 * 尺寸属性编辑器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  PropertyEditorProps,
  SizePropertyConfig,
  PropertyValidationResult,
  PropertyValue,
} from '@/types/page-designer/properties'
import { AlertCircle, RotateCcw, Link2Icon, Unlink, Maximize2, Minimize2 } from 'lucide-react'

interface SizePropertyEditorProps extends Omit<PropertyEditorProps, 'value'> {
  value: number | string
  config?: Partial<SizePropertyConfig>
  validation?: PropertyValidationResult
  showUnitSelector?: boolean
  showQuickPresets?: boolean
  showLockToggle?: boolean
}

// 预设尺寸值
const SIZE_PRESETS = [
  { label: '自动', value: 'auto' },
  { label: '0', value: 0 },
  { label: '4px', value: 4 },
  { label: '8px', value: 8 },
  { label: '16px', value: 16 },
  { label: '24px', value: 24 },
  { label: '32px', value: 32 },
  { label: '48px', value: 48 },
  { label: '64px', value: 64 },
  { label: '96px', value: 96 },
  { label: '128px', value: 128 },
]

// 单位选项
const UNITS = [
  { value: 'px', label: 'px (像素)' },
  { value: '%', label: '% (百分比)' },
  { value: 'em', label: 'em (相对字体大小)' },
  { value: 'rem', label: 'rem (根字体大小)' },
  { value: 'vh', label: 'vh (视窗高度)' },
  { value: 'vw', label: 'vw (视窗宽度)' },
  { value: 'auto', label: 'auto (自动)' },
]

export const SizePropertyEditor: React.FC<SizePropertyEditorProps> = ({
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
  showUnitSelector = true,
  showQuickPresets = true,
  showLockToggle = false,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState<string>('')
  const [unit, setUnit] = useState<string>('px')
  const [isValid, setIsValid] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 解析输入值
  const parseValue = useCallback(
    (input: string | number | undefined): { number: number; unit: string; isAuto: boolean } => {
      if (input === undefined || input === null || input === 'auto') {
        return { number: 0, unit: 'auto', isAuto: true }
      }

      if (typeof input === 'number') {
        return { number: input, unit: 'px', isAuto: false }
      }

      const str = String(input).trim()

      // 检查是否为auto
      if (str === 'auto') {
        return { number: 0, unit: 'auto', isAuto: true }
      }

      // 提取数字和单位
      const match = str.match(/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/)
      if (match) {
        const number = parseFloat(match[1])
        const unit = match[2] || 'px'
        return { number, unit, isAuto: false }
      }

      return { number: 0, unit: 'px', isAuto: false }
    },
    []
  )

  // 格式化输出值
  const formatValue = useCallback(
    (number: number, unit: string, isAuto: boolean): string | number => {
      if (isAuto || unit === 'auto') {
        return 'auto'
      }
      return `${number}${unit}`
    },
    []
  )

  // 初始化本地值
  useEffect(() => {
    const parsed = parseValue(value)
    setLocalValue(parsed.isAuto ? 'auto' : String(parsed.number))
    setUnit(parsed.unit)
  }, [value, parseValue])

  // 验证输入值
  const validateInput = useCallback(
    (input: string): boolean => {
      if (input === 'auto') return true

      const num = parseFloat(input)
      if (isNaN(num)) return false

      const { min, max } = config
      if (min !== undefined && num < min) return false
      if (max !== undefined && num > max) return false

      return true
    },
    [config]
  )

  // 处理值变化
  const handleValueChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue)

      const isValid = validateInput(newValue)
      setIsValid(isValid)

      if (isValid) {
        const parsed = parseValue(newValue === 'auto' ? 'auto' : parseFloat(newValue))
        const formattedValue = formatValue(parsed.number, unit, parsed.isAuto)
        onChange(formattedValue)
      }
    },
    [validateInput, parseValue, formatValue, unit, onChange]
  )

  // 处理单位变化
  const handleUnitChange = useCallback(
    (newUnit: string) => {
      setUnit(newUnit)

      if (localValue !== 'auto') {
        const num = parseFloat(localValue)
        if (!isNaN(num)) {
          const formattedValue = formatValue(num, newUnit, false)
          onChange(formattedValue)
        }
      }
    },
    [localValue, formatValue, onChange]
  )

  // 处理预设选择
  const handlePresetSelect = useCallback(
    (presetValue: number | string) => {
      if (presetValue === 'auto') {
        setLocalValue('auto')
        onChange('auto')
      } else {
        setLocalValue(String(presetValue))
        const formattedValue = formatValue(Number(presetValue), unit, false)
        onChange(formattedValue)
      }
    },
    [unit, formatValue, onChange]
  )

  // 处理滑块变化
  const handleSliderChange = useCallback(
    (values: number[]) => {
      const newValue = values[0]
      setLocalValue(String(newValue))
      const formattedValue = formatValue(newValue, unit, false)
      onChange(formattedValue)
    },
    [unit, formatValue, onChange]
  )

  // 获取滑块值
  const sliderValue = useMemo(() => {
    if (localValue === 'auto') return 0
    const num = parseFloat(localValue)
    return isNaN(num) ? 0 : num
  }, [localValue])

  // 计算滑块范围
  const sliderRange = useMemo(() => {
    const { min = 0, max = 500 } = config
    return [min, max]
  }, [config])

  const inputSizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  }

  return (
    <div className="space-y-3">
      {/* 标签和开关 */}
      <div className="flex items-center justify-between">
        <Label
          className={cn('text-sm font-medium', validation?.isValid === false && 'text-destructive')}
        >
          {definition.label}
          {definition.required && <span className="ml-1 text-destructive">*</span>}
        </Label>

        {showLockToggle && <Switch checked={!isValid} onCheckedChange={() => {}} />}
      </div>

      {/* 主要输入区域 */}
      <div className={cn('flex items-center space-x-2', showUnitSelector && 'space-x-2')}>
        {/* 数值输入 */}
        <div className="flex-1">
          <Input
            value={localValue}
            onChange={e => handleValueChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              onFocus?.()
            }}
            onBlur={() => {
              setIsFocused(false)
              onBlur?.()
            }}
            placeholder={placeholder || '输入尺寸值'}
            disabled={disabled}
            className={cn(
              inputSizeClasses[size],
              !isValid && 'border-destructive focus:border-destructive',
              'font-mono'
            )}
          />
        </div>

        {/* 单位选择器 */}
        {showUnitSelector && (
          <Select value={unit} onValueChange={handleUnitChange} disabled={disabled}>
            <SelectTrigger className={cn('w-32', inputSizeClasses[size])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map(unitOption => (
                <SelectItem key={unitOption.value} value={unitOption.value}>
                  {unitOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* 重置按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePresetSelect((definition.defaultValue as number | string) || 0)}
          disabled={disabled}
          className="px-2"
          title="重置为默认值"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* 验证错误信息 */}
      {validation?.isValid === false && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{validation.error}</span>
        </div>
      )}

      {/* 快速预设 */}
      {showQuickPresets && !disabled && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">快速选择</Label>
          <div className="grid grid-cols-4 gap-1">
            {SIZE_PRESETS.slice(0, 8).map(preset => (
              <Button
                key={preset.value}
                variant={localValue === String(preset.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetSelect(preset.value)}
                className="h-8 text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 滑块控制 */}
      {localValue !== 'auto' &&
        !disabled &&
        config.min !== undefined &&
        config.max !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">精确调节</Label>
              <span className="text-xs text-muted-foreground">
                {sliderRange[0]} - {sliderRange[1]}
                {unit}
              </span>
            </div>
            <Slider
              value={[sliderValue]}
              onValueChange={handleSliderChange}
              min={sliderRange[0]}
              max={sliderRange[1]}
              step={config.step || 1}
              disabled={disabled}
              className="w-full"
            />
          </div>
        )}

      {/* 高级选项 */}
      {showAdvanced && (
        <Card className="space-y-3 p-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">高级选项</Label>
          </div>

          {/* 最小/最大值约束 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">最小值</Label>
              <Input
                type="number"
                value={config.min || ''}
                onChange={() => {}}
                placeholder="无限制"
                className="h-8 text-xs"
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">最大值</Label>
              <Input
                type="number"
                value={config.max || ''}
                onChange={() => {}}
                placeholder="无限制"
                className="h-8 text-xs"
                disabled
              />
            </div>
          </div>
        </Card>
      )}

      {/* 描述信息 */}
      {definition.description && (
        <p className="text-xs text-muted-foreground">{definition.description}</p>
      )}
    </div>
  )
}

// 像素尺寸编辑器（特化版本）
export const PixelSizeEditor: React.FC<
  Omit<SizePropertyEditorProps, 'config' | 'showUnitSelector'> & {
    config?: Partial<SizePropertyConfig>
  }
> = props => {
  return (
    <SizePropertyEditor
      {...props}
      config={{ unit: 'px', ...props.config }}
      showUnitSelector={false}
    />
  )
}

// 百分比尺寸编辑器
export const PercentSizeEditor: React.FC<
  Omit<SizePropertyEditorProps, 'config' | 'showUnitSelector'> & {
    config?: Partial<SizePropertyConfig>
  }
> = props => {
  return (
    <SizePropertyEditor
      {...props}
      config={{ unit: '%', min: 0, max: 100, ...props.config }}
      showUnitSelector={false}
    />
  )
}

// 间距编辑器（支持四个方向）
export const SpacingSizeEditor: React.FC<{
  value: number | { top?: number; right?: number; bottom?: number; left?: number }
  onChange: (value: any) => void
  config?: Partial<SizePropertyConfig>
  label?: string
  disabled?: boolean
}> = ({ value, onChange, config = {}, label = '间距', disabled }) => {
  const [isLinked, setIsLinked] = useState(true)

  // 检查是否为统一值
  const isUniformValue = typeof value === 'number'

  // 获取统一的间距值
  const uniformValue = isUniformValue ? value : 0

  // 获取各方向的值
  const spacingValues = useMemo(() => {
    if (isUniformValue) {
      return { top: uniformValue, right: uniformValue, bottom: uniformValue, left: uniformValue }
    }
    return {
      top: (value as any)?.top || 0,
      right: (value as any)?.right || 0,
      bottom: (value as any)?.bottom || 0,
      left: (value as any)?.left || 0,
    }
  }, [value, isUniformValue, uniformValue])

  // 处理统一值变化
  const handleUniformChange = (newValue: number) => {
    if (isLinked) {
      onChange(newValue as any)
    } else {
      onChange({
        top: newValue,
        right: newValue,
        bottom: newValue,
        left: newValue,
      } as any)
    }
  }

  // 处理单个方向变化
  const handleDirectionChange = (direction: string, newValue: number) => {
    if (isLinked) {
      // 如果是锁定状态，更新所有方向
      onChange(newValue as any)
    } else {
      // 否则只更新当前方向
      onChange({
        ...spacingValues,
        [direction]: newValue,
      } as any)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button
          variant={isLinked ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsLinked(!isLinked)}
          className="h-7 px-2"
          title={isLinked ? '点击解锁各方向独立设置' : '点击锁定所有方向使用相同值'}
        >
          {isLinked ? <Link2Icon className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
        </Button>
      </div>

      {isLinked ? (
        // 统一设置模式
        <PixelSizeEditor
          definition={{
            name: 'spacing',
            type: 'size',
            label: '统一间距',
            ...config,
          }}
          value={uniformValue}
          onChange={(value: PropertyValue) => handleUniformChange(value as number)}
          disabled={disabled}
          showQuickPresets={true}
          config={config}
        />
      ) : (
        // 分别设置模式
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(spacingValues).map(([direction, val]) => (
            <div key={direction} className="space-y-1">
              <Label className="text-xs font-medium capitalize">
                {direction === 'top'
                  ? '上'
                  : direction === 'right'
                    ? '右'
                    : direction === 'bottom'
                      ? '下'
                      : '左'}
              </Label>
              <PixelSizeEditor
                definition={{
                  name: `spacing-${direction}`,
                  type: 'size',
                  label: `${direction} 间距`,
                }}
                value={val}
                onChange={(value: PropertyValue) =>
                  handleDirectionChange(direction, value as number)
                }
                disabled={disabled}
                showQuickPresets={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SizePropertyEditor
