/**
 * 布尔属性编辑器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  PropertyEditorProps,
  BooleanPropertyConfig,
  PropertyValidationResult,
} from '@/types/page-designer/properties'
import { AlertCircle, ToggleLeft, ToggleRight, Check, X } from 'lucide-react'

interface BooleanPropertyEditorProps extends Omit<PropertyEditorProps, 'value'> {
  value: boolean
  config?: Partial<BooleanPropertyConfig>
  validation?: PropertyValidationResult
  displayMode?: 'switch' | 'radio' | 'checkbox' | 'button' | 'toggle'
}

export const BooleanPropertyEditor: React.FC<BooleanPropertyEditorProps> = ({
  definition,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  size = 'md',
  config = {},
  validation,
  displayMode = 'switch',
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [localValue, setLocalValue] = useState(value || false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 合并默认配置
  const booleanConfig: BooleanPropertyConfig = {
    value: false,
    label: definition.label,
    description: definition.description,
    ...config,
  }

  // 处理值变化
  const handleChange = useCallback(
    (newValue: boolean) => {
      setLocalValue(newValue)
      onChange(newValue)
    },
    [onChange]
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

  // 同步外部值变化
  useEffect(() => {
    setLocalValue(value !== undefined ? value : false)
  }, [value])

  // 渲染开关模式
  const renderSwitchMode = () => {
    return (
      <div
        className={cn(
          'flex items-center space-x-3',
          isFocused && 'rounded-md p-1 ring-2 ring-blue-500 ring-offset-2',
          disabled && 'opacity-50'
        )}
      >
        <Switch
          checked={localValue}
          onCheckedChange={handleChange}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <Label
          className={cn(
            'cursor-pointer text-sm font-medium',
            disabled && 'cursor-not-allowed text-gray-400'
          )}
        >
          {booleanConfig.label}
          {localValue && (
            <span className="ml-2 rounded bg-green-50 px-2 py-1 text-xs text-green-600">
              已启用
            </span>
          )}
        </Label>
      </div>
    )
  }

  // 渲染单选按钮模式
  const renderRadioMode = () => {
    return (
      <RadioGroup
        value={localValue.toString()}
        onValueChange={value => handleChange(value === 'true')}
        disabled={disabled}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id={`${definition.name}-true`} />
          <Label
            htmlFor={`${definition.name}-true`}
            className="flex cursor-pointer items-center space-x-2"
          >
            <Check className="h-4 w-4 text-green-600" />
            <span>是</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id={`${definition.name}-false`} />
          <Label
            htmlFor={`${definition.name}-false`}
            className="flex cursor-pointer items-center space-x-2"
          >
            <X className="h-4 w-4 text-red-600" />
            <span>否</span>
          </Label>
        </div>
      </RadioGroup>
    )
  }

  // 渲染复选框模式
  const renderCheckboxMode = () => {
    return (
      <div
        className={cn(
          'flex items-center space-x-2 rounded-md border p-2',
          isFocused && 'ring-2 ring-blue-500 ring-offset-2',
          disabled && 'opacity-50'
        )}
      >
        <Checkbox
          id={definition.name}
          checked={localValue}
          onCheckedChange={handleChange}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <Label
          htmlFor={definition.name}
          className={cn(
            'cursor-pointer text-sm font-medium',
            disabled && 'cursor-not-allowed text-gray-400'
          )}
        >
          {booleanConfig.label}
        </Label>
      </div>
    )
  }

  // 渲染按钮模式
  const renderButtonMode = () => {
    return (
      <div className="flex space-x-2">
        <Button
          variant={localValue ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleChange(true)}
          disabled={disabled}
          className={cn(
            'flex items-center space-x-2',
            localValue && 'bg-green-600 hover:bg-green-700'
          )}
        >
          <Check className="h-4 w-4" />
          <span>是</span>
        </Button>
        <Button
          variant={!localValue ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleChange(false)}
          disabled={disabled}
          className={cn(
            'flex items-center space-x-2',
            !localValue && 'bg-red-600 hover:bg-red-700'
          )}
        >
          <X className="h-4 w-4" />
          <span>否</span>
        </Button>
      </div>
    )
  }

  // 渲染切换卡片模式
  const renderToggleCardMode = () => {
    return (
      <Card
        className={cn(
          'cursor-pointer p-4 transition-all duration-200',
          localValue ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50',
          isFocused && 'ring-2 ring-blue-500 ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div
          className="flex items-center justify-between"
          onClick={() => !disabled && handleChange(!localValue)}
        >
          <div className="flex items-center space-x-3">
            <div className={cn('rounded-full p-2', localValue ? 'bg-green-600' : 'bg-gray-400')}>
              {localValue ? (
                <ToggleRight className="h-4 w-4 text-white" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">{booleanConfig.label}</Label>
              {booleanConfig.description && (
                <p className="mt-1 text-xs text-gray-500">{booleanConfig.description}</p>
              )}
            </div>
          </div>
          <div
            className={cn(
              'rounded px-2 py-1 text-xs',
              localValue ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
            )}
          >
            {localValue ? '已启用' : '已禁用'}
          </div>
        </div>
      </Card>
    )
  }

  // 渲染高级选项
  const renderAdvancedOptions = () => {
    return (
      <div className="space-y-4 rounded-lg bg-gray-50 p-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">显示模式</Label>
          <RadioGroup
            value={displayMode}
            onValueChange={(value: any) => {
              // 这里可以触发显示模式变更事件
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="switch" id="mode-switch" />
                <Label htmlFor="mode-switch" className="text-xs">
                  开关
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="radio" id="mode-radio" />
                <Label htmlFor="mode-radio" className="text-xs">
                  单选
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="checkbox" id="mode-checkbox" />
                <Label htmlFor="mode-checkbox" className="text-xs">
                  复选框
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="button" id="mode-button" />
                <Label htmlFor="mode-button" className="text-xs">
                  按钮
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">自定义标签</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="是标签"
              defaultValue="是"
              // 这里可以处理自定义标签变更
            />
            <Input
              placeholder="否标签"
              defaultValue="否"
              // 这里可以处理自定义标签变更
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-description"
            defaultChecked={!!booleanConfig.description}
            // 这里可以处理描述显示切换
          />
          <Label htmlFor="show-description" className="text-sm">
            显示描述信息
          </Label>
        </div>
      </div>
    )
  }

  // 根据显示模式渲染不同的组件
  const renderEditor = () => {
    switch (displayMode) {
      case 'radio':
        return renderRadioMode()
      case 'checkbox':
        return renderCheckboxMode()
      case 'button':
        return renderButtonMode()
      case 'toggle':
        return renderToggleCardMode()
      default:
        return renderSwitchMode()
    }
  }

  return (
    <div className="space-y-2">
      {/* 标签和必填标识（仅在非开关模式下显示） */}
      {displayMode !== 'switch' && (
        <div className="flex items-center justify-between">
          <Label className={cn('text-sm font-medium', disabled && 'text-gray-400')}>
            {definition.label}
            {definition.required && <span className="ml-1 text-red-500">*</span>}
          </Label>

          {/* 验证状态图标 */}
          {validation?.isValid === false && (
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>
      )}

      {/* 描述信息 */}
      {definition.description && displayMode !== 'toggle' && (
        <p className="text-xs text-gray-500">{definition.description}</p>
      )}

      {/* 编辑器主体 */}
      <div onFocus={handleFocus} onBlur={handleBlur}>
        {renderEditor()}
      </div>

      {/* 错误信息 */}
      {validation?.isValid === false && validation?.error && (
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

// 专门用于启用/禁用的编辑器
export const EnableDisableEditor: React.FC<BooleanPropertyEditorProps> = props => {
  return (
    <BooleanPropertyEditor
      {...props}
      displayMode="switch"
      config={{
        ...props.config,
        label: `${props.definition.label}（启用/禁用）`,
      }}
    />
  )
}

// 专门用于显示/隐藏的编辑器
export const VisibleHiddenEditor: React.FC<BooleanPropertyEditorProps> = props => {
  return (
    <BooleanPropertyEditor
      {...props}
      displayMode="toggle"
      config={{
        ...props.config,
        label: `${props.definition.label}（显示/隐藏）`,
      }}
    />
  )
}

// 专门用于必需/可选的编辑器
export const RequiredOptionalEditor: React.FC<BooleanPropertyEditorProps> = props => {
  return (
    <BooleanPropertyEditor
      {...props}
      displayMode="radio"
      config={{
        ...props.config,
        label: `${props.definition.label}（必需/可选）`,
      }}
    />
  )
}

export default BooleanPropertyEditor
