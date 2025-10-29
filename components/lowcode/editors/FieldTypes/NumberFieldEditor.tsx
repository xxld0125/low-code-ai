/**
 * 数字字段编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PropertyDefinition } from '@/types/lowcode/property'
import { cn } from '@/lib/utils'
import { Minus, Plus } from 'lucide-react'

interface NumberFieldEditorProps {
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
  readonly?: boolean
  definition: PropertyDefinition
  useSlider?: boolean
  step?: number
  min?: number
  max?: number
}

export const NumberFieldEditor: React.FC<NumberFieldEditorProps> = ({
  value,
  onChange,
  disabled = false,
  readonly = false,
  definition,
  useSlider = false,
  step,
  min,
  max,
}) => {
  const [inputValue, setInputValue] = useState(String(value || definition.default || 0))

  // 获取步长值
  const getStep = () => {
    if (step) return step
    const stepRule = definition.validation?.find(
      rule => rule.type === 'custom' && rule.params?.step
    )
    if (stepRule) return stepRule.params?.step as number
    return 1
  }

  // 获取最小值
  const getMin = () => {
    if (min !== undefined) return min
    const minRule = definition.validation?.find(rule => rule.type === 'min_value')
    if (minRule) return minRule.params?.min as number
    return Number.MIN_SAFE_INTEGER
  }

  // 获取最大值
  const getMax = () => {
    if (max !== undefined) return max
    const maxRule = definition.validation?.find(rule => rule.type === 'max_value')
    if (maxRule) return maxRule.params?.max as number
    return Number.MAX_SAFE_INTEGER
  }

  // 验证并更新值
  const updateValue = (newValue: number) => {
    const minValue = getMin()
    const maxValue = getMax()
    const stepValue = getStep()

    // 限制在最小最大值范围内
    newValue = Math.max(minValue, Math.min(maxValue, newValue))

    // 应用步长
    if (stepValue !== 0) {
      newValue = Math.round(newValue / stepValue) * stepValue
    }

    onChange(newValue)
    setInputValue(String(newValue))
  }

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // 尝试解析为数字
    const parsedValue = parseFloat(newValue)
    if (!isNaN(parsedValue)) {
      updateValue(parsedValue)
    }
  }

  // 处理失去焦点
  const handleInputBlur = () => {
    const parsedValue = parseFloat(inputValue)
    if (isNaN(parsedValue)) {
      const defaultValue = definition.default || 0
      updateValue(defaultValue as number)
    } else {
      updateValue(parsedValue)
    }
  }

  // 处理滑块变化
  const handleSliderChange = (values: number[]) => {
    if (values.length > 0) {
      updateValue(values[0])
    }
  }

  // 增加值
  const handleIncrement = () => {
    const current = parseFloat(inputValue) || (definition.default as number) || 0
    updateValue(current + getStep())
  }

  // 减少值
  const handleDecrement = () => {
    const current = parseFloat(inputValue) || (definition.default as number) || 0
    updateValue(current - getStep())
  }

  const currentValue = parseFloat(String(value || definition.default || 0))
  const minValue = getMin()
  const maxValue = getMax()
  const stepValue = getStep()

  // 如果范围较小，使用滑块模式
  const shouldUseSlider = useSlider || (maxValue - minValue <= 100 && maxValue - minValue > 0)

  if (shouldUseSlider && !readonly) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">{currentValue}</Label>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleDecrement}
              disabled={disabled || currentValue <= minValue}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleIncrement}
              disabled={disabled || currentValue >= maxValue}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <Slider
          value={[currentValue]}
          onValueChange={handleSliderChange}
          min={minValue}
          max={maxValue}
          step={stepValue}
          disabled={disabled}
          className={cn('w-full', disabled && 'opacity-50')}
        />
        {minValue !== Number.MIN_SAFE_INTEGER && maxValue !== Number.MAX_SAFE_INTEGER && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minValue}</span>
            <span>{maxValue}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        readOnly={readonly}
        placeholder={`输入${definition.label}`}
        min={minValue !== Number.MIN_SAFE_INTEGER ? minValue : undefined}
        max={maxValue !== Number.MAX_SAFE_INTEGER ? maxValue : undefined}
        step={stepValue}
        className="flex-1"
      />
      {!readonly && (
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleIncrement}
            disabled={disabled || currentValue >= maxValue}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleDecrement}
            disabled={disabled || currentValue <= minValue}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
