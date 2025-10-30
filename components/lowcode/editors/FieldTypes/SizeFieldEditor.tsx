/**
 * 尺寸字段编辑器
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
import { cn } from '@/lib/utils'

// 导入共享类型和工具
import { FieldDefinition, SizeConfig } from '@/lib/lowcode/types/editor'
import { SIZE_PRESETS } from '@/lib/lowcode/constants/style-presets'
import { parseSizeValue, formatSizeValue, validateSizeValue } from '@/lib/lowcode/utils/style-utils'

// 本地接口定义
interface SizeFieldEditorProps {
  definition: FieldDefinition & {
    default_value?: string | number
    editor_config: SizeConfig
  }
  value?: string | number
  error?: string
  disabled?: boolean
  readonly?: boolean
  onChange: (value: string | number) => void
  onError?: (error: { message: string }) => void
  onBlur?: () => void
  onFocus?: () => void
  className?: string
}

export const SizeFieldEditor: React.FC<SizeFieldEditorProps> = ({
  definition,
  value,
  error,
  disabled = false,
  readonly = false,
  onChange,
  onError,
}) => {
  // 默认单位配置
  const config = useMemo(() => definition.editor_config || {}, [definition.editor_config])
  const units = useMemo(() => {
    const defaultUnits = ['px', 'rem', 'em', '%', 'vw', 'vh']
    return config.units || defaultUnits
  }, [config.units])

  // 解析当前值
  const parsedValue = parseSizeValue(value)
  const currentUnit = parsedValue?.unit || 'px'
  const currentValue = parsedValue?.value ?? ''

  const [internalValue, setInternalValue] = useState(String(currentValue))
  const [selectedUnit, setSelectedUnit] = useState(currentUnit)

  // 验证数值
  const validateValue = useCallback(
    (num: number) => {
      const parsedValue = parseSizeValue(formatSizeValue(num, selectedUnit))
      const validation = validateSizeValue(parsedValue, config)

      if (!validation.isValid) {
        onError?.({ message: validation.error || '验证失败' })
        return false
      }

      return true
    },
    [config, selectedUnit, onError]
  )

  // 处理数值变更
  const handleNumberChange = useCallback(
    (numStr: string) => {
      if (numStr === '' || numStr === '-') {
        setInternalValue('')
        return
      }

      const num = parseFloat(numStr)
      if (isNaN(num)) {
        return
      }

      if (validateValue(num)) {
        setInternalValue(numStr)
        const finalValue = formatSizeValue(num, selectedUnit)
        onChange(finalValue)
      }
    },
    [validateValue, selectedUnit, onChange]
  )

  // 处理单位变更
  const handleUnitChange = useCallback(
    (newUnit: string) => {
      setSelectedUnit(newUnit)

      if (internalValue && internalValue !== '') {
        const num = parseFloat(internalValue)
        if (!isNaN(num)) {
          const finalValue = formatSizeValue(num, newUnit)
          onChange(finalValue)
        }
      }
    },
    [internalValue, onChange]
  )

  // 处理预设值点击
  const handlePresetClick = useCallback(
    (presetValue: string) => {
      const parsed = parseSizeValue(presetValue)
      if (parsed) {
        setInternalValue(String(parsed.value))
        setSelectedUnit(parsed.unit)
        onChange(presetValue)
      }
    },
    [onChange]
  )

  // 处理特殊值
  const handleSpecialValue = useCallback(
    (specialValue: string) => {
      setInternalValue('')
      setSelectedUnit(specialValue)
      onChange(specialValue)
    },
    [onChange]
  )

  // 获取过滤后的预设值
  const filteredPresets = useMemo(() => {
    return SIZE_PRESETS.filter(preset => {
      const parsed = parseSizeValue(preset.value)
      return parsed && units.includes(parsed.unit)
    })
  }, [units])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{definition.label}</Label>
        {definition.required && (
          <Badge variant="secondary" className="text-xs">
            必填
          </Badge>
        )}
      </div>

      {/* 主输入区域 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            value={internalValue}
            onChange={e => handleNumberChange(e.target.value)}
            placeholder={definition.placeholder || '请输入数值'}
            disabled={disabled || selectedUnit === 'auto'}
            readOnly={readonly}
            className={cn(error && 'border-destructive focus:ring-destructive')}
          />
        </div>

        {/* 单位选择器 */}
        <Select
          value={selectedUnit}
          onValueChange={handleUnitChange}
          disabled={disabled || readonly}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map(unit => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
            {config.allowAuto && (
              <>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="inherit">Inherit</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 快捷预设值 */}
      <div className="flex flex-wrap gap-1">
        {filteredPresets.slice(0, 8).map(preset => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            disabled={disabled || readonly}
            className="h-7 px-2 text-xs"
            title={preset.description}
          >
            {preset.label}
          </Button>
        ))}

        {/* 特殊值按钮 */}
        {config.allowAuto && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpecialValue('auto')}
              disabled={disabled || readonly}
              className={cn(
                'h-7 px-2 text-xs',
                selectedUnit === 'auto' && 'bg-primary text-primary-foreground'
              )}
            >
              Auto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpecialValue('inherit')}
              disabled={disabled || readonly}
              className={cn(
                'h-7 px-2 text-xs',
                selectedUnit === 'inherit' && 'bg-primary text-primary-foreground'
              )}
            >
              Inherit
            </Button>
          </>
        )}
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

export default SizeFieldEditor
