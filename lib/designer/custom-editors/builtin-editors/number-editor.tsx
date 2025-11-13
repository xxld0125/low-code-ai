/**
 * 数字编辑器
 *
 * 数字输入、范围和滑块编辑器
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'
import { PropertyEditorProps } from '../property-editor-registry'
import { RegisterEditor } from '../property-editor-registry'

interface NumberEditorProps extends PropertyEditorProps {
  min?: number
  max?: number
  step?: number
  precision?: number
  unit?: string
  showControls?: boolean
  showSlider?: boolean
  sliderStep?: number
}

export const NumberEditor: React.FC<NumberEditorProps> = ({
  value,
  onChange,
  schema,
  disabled = false,
  placeholder,
  className,
  error,
  onBlur,
  onFocus,
  min,
  max,
  step = 1,
  precision = 2,
  unit,
  showControls = true,
  showSlider = false,
  sliderStep,
}) => {
  const [inputValue, setInputValue] = useState<string>('')

  // 获取实际值
  const currentValue = useMemo(() => {
    const numValue = typeof value === 'number' ? value : parseFloat(value as string)
    return isNaN(numValue) ? 0 : numValue
  }, [value])

  // 获取范围限制
  const range = useMemo(() => {
    const schemaMin = schema.validation?.find(rule => rule.type === 'min')?.value as number
    const schemaMax = schema.validation?.find(rule => rule.type === 'max')?.value as number

    return {
      min: min ?? schemaMin ?? Number.MIN_SAFE_INTEGER,
      max: max ?? schemaMax ?? Number.MAX_SAFE_INTEGER,
    }
  }, [min, max, schema.validation])

  // 格式化数字显示
  const formatNumber = useCallback((num: number): string => {
    const formatted = num.toFixed(precision)
    return formatted.replace(/\.?0+$/, '') // 移除末尾的零
  }, [precision])

  // 验证输入值
  const validateInput = useCallback((input: string): number | null => {
    const numValue = parseFloat(input)

    if (isNaN(numValue)) return null
    if (numValue < range.min) return null
    if (numValue > range.max) return null

    return numValue
  }, [range])

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value
    setInputValue(newInput)

    const validatedValue = validateInput(newInput)
    if (validatedValue !== null) {
      onChange(validatedValue)
    }
  }, [onChange, validateInput])

  // 处理失去焦点
  const handleBlur = useCallback(() => {
    const validatedValue = validateInput(inputValue)
    if (validatedValue !== null) {
      onChange(validatedValue)
      setInputValue('')
    } else {
      setInputValue(formatNumber(currentValue))
    }
    onBlur?.()
  }, [inputValue, currentValue, onChange, onBlur, validateInput, formatNumber])

  // 处理滑块变化
  const handleSliderChange = useCallback((values: number[]) => {
    onChange(values[0])
  }, [onChange])

  // 增加数值
  const handleIncrement = useCallback(() => {
    const newValue = Math.min(currentValue + step, range.max)
    onChange(newValue)
  }, [currentValue, step, range.max, onChange])

  // 减少数值
  const handleDecrement = useCallback(() => {
    const newValue = Math.max(currentValue - step, range.min)
    onChange(newValue)
  }, [currentValue, step, range.min, onChange])

  // 获取滑块步长
  const actualSliderStep = useMemo(() => {
    if (sliderStep) return sliderStep
    const rangeSpan = range.max - range.min
    return rangeSpan / 100 // 默认分为100份
  }, [sliderStep, range])

  // 检查值是否在有效范围内
  const isValidValue = useMemo(() => {
    return currentValue >= range.min && currentValue <= range.max
  }, [currentValue, range])

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {schema.title || 'Number Input'}
        </CardTitle>
        {schema.description && (
          <p className="text-xs text-muted-foreground">
            {schema.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 数字输入控件 */}
          <div className="flex items-center gap-2">
            <Label className="text-xs">Value</Label>
            {showControls && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecrement}
                  disabled={disabled || currentValue <= range.min}
                  className="h-6 w-6 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleIncrement}
                  disabled={disabled || currentValue >= range.max}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {formatNumber(range.min)} - {formatNumber(range.max)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputValue || formatNumber(currentValue)}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={onFocus}
              disabled={disabled}
              placeholder={placeholder || schema.ui?.placeholder}
              step={step}
              min={range.min}
              max={range.max}
              className="text-sm"
            />
            {unit && (
              <span className="text-sm text-muted-foreground">
                {unit}
              </span>
            )}
          </div>

          {/* 滑块 */}
          {showSlider && (
            <div className="space-y-2">
              <Label className="text-xs">Slider</Label>
              <Slider
                value={[currentValue]}
                onValueChange={handleSliderChange}
                min={range.min}
                max={range.max}
                step={actualSliderStep}
                disabled={disabled}
                className="w-full"
              />
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="text-xs text-destructive">
              {error}
            </div>
          )}

          {/* 范围验证错误 */}
          {!isValidValue && (
            <div className="text-xs text-destructive">
              Value must be between {formatNumber(range.min)} and {formatNumber(range.max)}
            </div>
          )}

          {/* 帮助文本 */}
          {schema.ui?.help && (
            <div className="text-xs text-muted-foreground">
              {schema.ui?.help}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 注册数字编辑器
RegisterEditor({
  type: 'number',
  name: 'Number Editor',
  description: 'Basic number input editor with controls',
  supportedTypes: ['number', 'integer', 'float'],
  category: 'basic',
  tags: ['input', 'number', 'numeric'],
})(NumberEditor)

// 注册范围编辑器
RegisterEditor({
  type: 'range',
  name: 'Range Editor',
  description: 'Range slider editor for numeric values',
  supportedTypes: ['range', 'slider'],
  category: 'basic',
  tags: ['input', 'range', 'slider'],
})(function RangeEditor(props: NumberEditorProps) {
  return <NumberEditor {...props} showSlider={true} showControls={false} />
})

// 注册百分比编辑器
RegisterEditor({
  type: 'percentage',
  name: 'Percentage Editor',
  description: 'Percentage input editor (0-100)',
  supportedTypes: ['percentage', 'percent'],
  category: 'basic',
  tags: ['input', 'percentage', 'percent'],
})(function PercentageEditor(props: NumberEditorProps) {
  return (
    <NumberEditor
      {...props}
      min={0}
      max={100}
      unit="%"
      precision={0}
      showSlider={true}
      placeholder={props.placeholder || 'Enter percentage'}
    />
  )
})

// 注册尺寸编辑器
RegisterEditor({
  type: 'size',
  name: 'Size Editor',
  description: 'Size editor for CSS dimensions',
  supportedTypes: ['size', 'dimension', 'length'],
  category: 'style',
  tags: ['input', 'size', 'css', 'dimension'],
})(function SizeEditor(props: NumberEditorProps) {
  return (
    <NumberEditor
      {...props}
      min={0}
      max={9999}
      unit="px"
      placeholder={props.placeholder || 'Enter size in pixels'}
    />
  )
})