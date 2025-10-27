/**
 * 数值属性编辑器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import {
  PropertyEditorProps,
  NumberPropertyConfig,
  PropertyValidationResult,
} from '@/types/page-designer/properties'
import { AlertCircle, Minus, Plus, RotateCcw } from 'lucide-react'

interface NumberPropertyEditorProps extends Omit<PropertyEditorProps, 'value'> {
  value: number
  config?: Partial<NumberPropertyConfig>
  validation?: PropertyValidationResult
}

export const NumberPropertyEditor: React.FC<NumberPropertyEditorProps> = ({
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
  const [localValue, setLocalValue] = useState(value || 0)
  const [isValid, setIsValid] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [inputMode, setInputMode] = useState<'input' | 'slider'>('input')

  // 合并默认配置
  const numberConfig: NumberPropertyConfig = useMemo(
    () => ({
      value: 0,
      min: definition.validation?.min,
      max: definition.validation?.max,
      step: 1,
      unit: '',
      precision: 0,
      ...config,
    }),
    [definition.validation?.min, definition.validation?.max, config]
  )

  // 验证输入值
  const validateValue = useCallback(
    (newValue: number): PropertyValidationResult => {
      if (definition.validation?.required && (newValue === undefined || newValue === null)) {
        return {
          isValid: false,
          error: `${definition.label}不能为空`,
        }
      }

      if (definition.validation?.min !== undefined && newValue < definition.validation.min) {
        return {
          isValid: false,
          error: `${definition.label}不能小于${definition.validation.min}`,
        }
      }

      if (definition.validation?.max !== undefined && newValue > definition.validation.max) {
        return {
          isValid: false,
          error: `${definition.label}不能大于${definition.validation.max}`,
        }
      }

      return { isValid: true }
    },
    [definition]
  )

  // 处理值变化
  const handleChange = useCallback(
    (newValue: number) => {
      // 应用精度限制
      if (numberConfig.precision !== undefined) {
        const factor = Math.pow(10, numberConfig.precision)
        newValue = Math.round(newValue * factor) / factor
      }

      // 应用范围限制
      if (numberConfig.min !== undefined) {
        newValue = Math.max(newValue, numberConfig.min)
      }
      if (numberConfig.max !== undefined) {
        newValue = Math.min(newValue, numberConfig.max)
      }

      setLocalValue(newValue)

      const validationResult = validateValue(newValue)
      setIsValid(validationResult.isValid)

      onChange(newValue)
    },
    [onChange, validateValue, numberConfig]
  )

  // 处理输入框变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      if (inputValue === '' || inputValue === '-') {
        setLocalValue(0)
        return
      }

      const numValue = parseFloat(inputValue)
      if (!isNaN(numValue)) {
        handleChange(numValue)
      }
    },
    [handleChange]
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

  // 处理增减按钮
  const handleIncrement = useCallback(() => {
    handleChange(localValue + (numberConfig.step || 1))
  }, [handleChange, localValue, numberConfig.step])

  const handleDecrement = useCallback(() => {
    handleChange(localValue - (numberConfig.step || 1))
  }, [handleChange, localValue, numberConfig.step])

  // 处理重置
  const handleReset = useCallback(() => {
    const defaultValue = (definition.defaultValue as number) || 0
    handleChange(defaultValue)
  }, [handleChange, definition.defaultValue])

  // 同步外部值变化
  useEffect(() => {
    setLocalValue(value !== undefined && value !== null ? value : 0)
  }, [value])

  // 格式化显示值
  const formatDisplayValue = (val: number): string => {
    if (numberConfig.precision !== undefined && numberConfig.precision > 0) {
      return val.toFixed(numberConfig.precision)
    }
    return val.toString()
  }

  // 获取百分比信息
  const getPercentageInfo = () => {
    if (numberConfig.min === undefined || numberConfig.max === undefined) {
      return null
    }
    const percentage =
      ((localValue - numberConfig.min) / (numberConfig.max - numberConfig.min)) * 100
    return Math.round(percentage)
  }

  // 渲染输入框模式
  const renderInputMode = () => {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="number"
            value={formatDisplayValue(localValue)}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            min={numberConfig.min}
            max={numberConfig.max}
            step={numberConfig.step}
            className={cn(
              'w-full',
              !isValid && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              isFocused && 'ring-2 ring-blue-500 ring-offset-2',
              disabled && 'cursor-not-allowed bg-gray-50',
              numberConfig.unit && 'pr-12'
            )}
          />

          {/* 单位显示 */}
          {numberConfig.unit && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform text-sm text-gray-500">
              {numberConfig.unit}
            </div>
          )}
        </div>

        {/* 增减按钮 */}
        <div className="flex flex-col">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 rounded-b-none rounded-t-sm border-b p-0"
            onClick={handleIncrement}
            disabled={
              disabled || (numberConfig.max !== undefined && localValue >= numberConfig.max)
            }
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 rounded-b-sm rounded-t-none p-0"
            onClick={handleDecrement}
            disabled={
              disabled || (numberConfig.min !== undefined && localValue <= numberConfig.min)
            }
          >
            <Minus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  // 渲染滑块模式
  const renderSliderMode = () => {
    if (numberConfig.min === undefined || numberConfig.max === undefined) {
      return (
        <div className="py-4 text-center text-sm text-gray-500">滑块模式需要设置最小值和最大值</div>
      )
    }

    return (
      <div className="space-y-4">
        <Slider
          value={[localValue]}
          onValueChange={([value]: number[]) => handleChange(value)}
          min={numberConfig.min}
          max={numberConfig.max}
          step={numberConfig.step}
          disabled={disabled}
          className="w-full"
        />

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{numberConfig.min}</span>
          <span className="font-medium">
            {formatDisplayValue(localValue)}
            {numberConfig.unit && ` ${numberConfig.unit}`}
          </span>
          <span className="text-gray-500">{numberConfig.max}</span>
        </div>

        {/* 百分比显示 */}
        {getPercentageInfo() !== null && (
          <div className="text-center">
            <span className="text-xs text-gray-500">{getPercentageInfo()}%</span>
          </div>
        )}
      </div>
    )
  }

  // 渲染高级选项
  const renderAdvancedOptions = () => {
    return (
      <div className="space-y-4 rounded-lg bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">最小值</Label>
            <Input
              type="number"
              value={numberConfig.min || ''}
              onChange={e => {
                const newMin = e.target.value ? parseFloat(e.target.value) : undefined
                // 这里可以触发配置更新事件
              }}
              placeholder="无限制"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">最大值</Label>
            <Input
              type="number"
              value={numberConfig.max || ''}
              onChange={e => {
                const newMax = e.target.value ? parseFloat(e.target.value) : undefined
                // 这里可以触发配置更新事件
              }}
              placeholder="无限制"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">步长</Label>
            <Input
              type="number"
              value={numberConfig.step || 1}
              onChange={e => {
                const newStep = parseFloat(e.target.value) || 1
                // 这里可以触发配置更新事件
              }}
              min={0.01}
              step={0.01}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">精度</Label>
            <Input
              type="number"
              value={numberConfig.precision || 0}
              onChange={e => {
                const newPrecision = parseInt(e.target.value) || 0
                // 这里可以触发配置更新事件
              }}
              min={0}
              max={10}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">单位</Label>
          <Input
            type="text"
            value={numberConfig.unit || ''}
            onChange={e => {
              // 这里可以触发配置更新事件
            }}
            placeholder="例如: px, %, em"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">默认值</Label>
          <Button size="sm" variant="outline" onClick={handleReset} disabled={disabled}>
            <RotateCcw className="mr-1 h-4 w-4" />
            重置为默认值
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* 标签和必填标识 */}
      <div className="flex items-center justify-between">
        <Label className={cn('text-sm font-medium', disabled && 'text-gray-400')}>
          {definition.label}
          {definition.required && <span className="ml-1 text-red-500">*</span>}
        </Label>

        {/* 模式切换 */}
        <div className="flex items-center space-x-2">
          <Label className="text-xs text-gray-500">模式</Label>
          <Select
            value={inputMode}
            onValueChange={(value: 'input' | 'slider') => setInputMode(value)}
          >
            <SelectTrigger className="h-6 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="input">输入</SelectItem>
              <SelectItem value="slider">滑块</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 验证状态图标 */}
        {!isValid && (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* 描述信息 */}
      {definition.description && <p className="text-xs text-gray-500">{definition.description}</p>}

      {/* 编辑器主体 */}
      {inputMode === 'input' ? renderInputMode() : renderSliderMode()}

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

// 专门用于像素值的编辑器
export const PixelNumberEditor: React.FC<NumberPropertyEditorProps> = props => {
  return (
    <NumberPropertyEditor
      {...props}
      config={{
        ...props.config,
        unit: 'px',
        min: 0,
        step: 1,
        precision: 0,
      }}
    />
  )
}

// 专门用于百分比的编辑器
export const PercentageNumberEditor: React.FC<NumberPropertyEditorProps> = props => {
  return (
    <NumberPropertyEditor
      {...props}
      config={{
        ...props.config,
        unit: '%',
        min: 0,
        max: 100,
        step: 1,
        precision: 0,
      }}
    />
  )
}

// 专门用于透明度的编辑器
export const OpacityNumberEditor: React.FC<NumberPropertyEditorProps> = props => {
  return (
    <NumberPropertyEditor
      {...props}
      config={{
        ...props.config,
        unit: '',
        min: 0,
        max: 1,
        step: 0.01,
        precision: 2,
      }}
    />
  )
}

// 专门用于字体大小的编辑器
export const FontSizeNumberEditor: React.FC<NumberPropertyEditorProps> = props => {
  return (
    <NumberPropertyEditor
      {...props}
      config={{
        ...props.config,
        unit: 'px',
        min: 8,
        max: 120,
        step: 1,
        precision: 0,
      }}
    />
  )
}

export default NumberPropertyEditor
