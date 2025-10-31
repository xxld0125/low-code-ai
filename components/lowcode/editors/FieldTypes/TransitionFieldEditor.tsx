/**
 * 过渡动画字段编辑器
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
import { Trash2, Plus, Clock, Zap } from 'lucide-react'

// 导入共享类型和工具
import { FieldDefinition } from '@/lib/lowcode/types/editor'

// 本地接口定义
interface TransitionConfig {
  duration?: {
    type: 'number'
    min?: number
    max?: number
    step?: number
    unit?: string
  }
  timing?: {
    type: 'select'
    options: Array<{ value: string; label: string; description?: string }>
  }
  delay?: {
    type: 'number'
    min?: number
    max?: number
    step?: number
    unit?: string
  }
  properties?: {
    type: 'select'
    options: Array<{ value: string; label: string; description?: string }>
    allowMultiple?: boolean
  }
}

interface TransitionValue {
  duration: number
  timing: string
  delay: number
  properties: string[]
}

interface TransitionFieldEditorProps {
  definition: FieldDefinition & {
    editor_config?: TransitionConfig
  }
  value?: string | TransitionValue
  error?: string
  disabled?: boolean
  readonly?: boolean
  onChange: (value: string | TransitionValue) => void
  onError?: (error: { message: string }) => void
  className?: string
}

export const TransitionFieldEditor: React.FC<TransitionFieldEditorProps> = ({
  definition,
  value: initialValue,
  error,
  disabled = false,
  readonly = false,
  onChange,
  onError,
  className,
}) => {
  const config = definition.editor_config || {}

  // 预设的缓动函数
  const timingPresets = config.timing?.options || [
    { value: 'linear', label: '线性', description: '恒定速度' },
    { value: 'ease', label: '缓动', description: '慢-快-慢' },
    { value: 'ease-in', label: '缓入', description: '慢-快' },
    { value: 'ease-out', label: '缓出', description: '快-慢' },
    { value: 'ease-in-out', label: '缓入缓出', description: '慢-快-慢' },
    { value: 'cubic-bezier(0.4, 0, 0.2, 1)', label: 'Material Design', description: 'Material设计默认' },
    { value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', label: 'iOS', description: 'iOS系统动画' },
    { value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', label: 'Android', description: 'Android系统动画' },
    { value: 'steps(4, end)', label: '步进', description: '分步动画' },
  ]

  // 可用的CSS属性
  const availableProperties = config.properties?.options || [
    { value: 'all', label: '所有属性', description: '所有可动画属性' },
    { value: 'background-color', label: '背景色' },
    { value: 'border-color', label: '边框色' },
    { value: 'color', label: '文字颜色' },
    { value: 'opacity', label: '透明度' },
    { value: 'transform', label: '变换' },
    { value: 'width', label: '宽度' },
    { value: 'height', label: '高度' },
    { value: 'margin', label: '外边距' },
    {value: 'padding', label: '内边距' },
    { value: 'top', label: '顶部位置' },
    { value: 'left', label: '左侧位置' },
    { value: 'bottom', label: '底部位置' },
    { value: 'right', label: '右侧位置' },
    { value: 'box-shadow', label: '阴影' },
  ]

  // 预设的过渡配置
  const transitionPresets = [
    {
      name: '无动画',
      value: { duration: 0, timing: 'linear', delay: 0, properties: ['none'] },
      icon: '❌',
    },
    {
      name: '快速',
      value: { duration: 150, timing: 'ease-out', delay: 0, properties: ['all'] },
      icon: '⚡',
    },
    {
      name: '标准',
      value: { duration: 300, timing: 'ease-in-out', delay: 0, properties: ['all'] },
      icon: '🎯',
    },
    {
      name: '缓慢',
      value: { duration: 500, timing: 'ease-in-out', delay: 0, properties: ['all'] },
      icon: '🐌',
    },
    {
      name: '颜色变化',
      value: { duration: 200, timing: 'ease-in-out', delay: 0, properties: ['background-color', 'color', 'border-color'] },
      icon: '🎨',
    },
    {
      name: '变换动画',
      value: { duration: 400, timing: 'cubic-bezier(0.4, 0, 0.2, 1)', delay: 0, properties: ['transform'] },
      icon: '🔄',
    },
    {
      name: '淡入淡出',
      value: { duration: 300, timing: 'ease-in-out', delay: 0, properties: ['opacity'] },
      icon: '👻',
    },
    {
      name: '弹性',
      value: { duration: 600, timing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', delay: 0, properties: ['transform', 'opacity'] },
      icon: '🌊',
    },
  ]

  // 解析初始值
  const parseValue = useCallback((val: string | TransitionValue): TransitionValue => {
    if (typeof val === 'string') {
      // 尝试解析CSS transition字符串
      const transitionRegex = /all\s+(\d+(?:\.\d+)?)(?:ms|s)\s+(\w+)\s*(?:\d+(?:\.\d+)?)(?:ms|s)?(?:\s+(.+))?/
      const match = val.match(transitionRegex)

      if (match) {
        const duration = parseFloat(match[1])
        const durationUnit = match[1].includes('ms') ? 1 : 1000
        const timing = match[3]
        const delay = match[4] ? parseFloat(match[4]) * (match[4].includes('ms') ? 1 : 1000) : 0
        const properties = match[5] ? match[5].split(',').map(p => p.trim()) : ['all']

        return {
          duration: duration * durationUnit,
          timing,
          delay,
          properties,
        }
      }

      // 简单数字，作为持续时间
      const numMatch = val.match(/^(\d+(?:\.\d+)?)(ms|s)?$/)
      if (numMatch) {
        const num = parseFloat(numMatch[1])
        const unit = numMatch[2] === 'ms' ? 1 : 1000
        return {
          duration: num * unit,
          timing: 'ease',
          delay: 0,
          properties: ['all'],
        }
      }

      // 默认值
      return {
        duration: 300,
        timing: 'ease-in-out',
        delay: 0,
        properties: ['all'],
      }
    }

    return val as TransitionValue
  }, [])

  // 格式化为CSS字符串
  const formatValue = useCallback((val: TransitionValue): string => {
    const duration = val.duration < 1000 ? `${val.duration}ms` : `${val.duration / 1000}s`
    const delay = val.delay > 0 ? ` ${val.delay < 1000 ? `${val.delay}ms` : `${val.delay / 1000}s`}` : ''
    const properties = val.properties.join(', ')

    return `${properties} ${duration} ${val.timing}${delay}`
  }, [])

  const [value, setValue] = useState<TransitionValue>(() => {
    return initialValue ? parseValue(initialValue) : {
      duration: 300,
      timing: 'ease-in-out',
      delay: 0,
      properties: ['all'],
    }
  })

  const [customMode, setCustomMode] = useState(false)

  // 更新值的函数
  const updateValue = useCallback((updates: Partial<TransitionValue>) => {
    const newValue = { ...value, ...updates }
    setValue(newValue)
    onChange(formatValue(newValue))
  }, [value, onChange, formatValue])

  // 应用预设
  const applyPreset = useCallback((preset: typeof transitionPresets[0]) => {
    setValue(preset.value)
    onChange(formatValue(preset.value))
    setCustomMode(false)
  }, [onChange, formatValue])

  // 渲染预设按钮
  const renderPresetButtons = () => (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {transitionPresets.map((preset, index) => (
        <Button
          key={index}
          variant={
            !customMode &&
            value.duration === preset.value.duration &&
            value.timing === preset.value.timing &&
            value.delay === preset.value.delay &&
            JSON.stringify(value.properties.sort()) === JSON.stringify(preset.value.properties.sort())
              ? 'default'
              : 'outline'
          }
          size="sm"
          onClick={() => applyPreset(preset)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center justify-center h-12 text-xs',
            'hover:scale-105 transition-transform'
          )}
        >
          <span className="text-lg mb-1">{preset.icon}</span>
          <span>{preset.name}</span>
        </Button>
      ))}
    </div>
  )

  // 渲染自定义编辑器
  const renderCustomEditor = () => (
    <div className="space-y-4">
      {/* 持续时间 */}
      <div>
        <Label className="text-sm font-medium">持续时间 (ms)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value.duration}
            min={0}
            max={5000}
            step={50}
            onChange={(e) => updateValue({ duration: Number(e.target.value) })}
            disabled={disabled}
            readOnly={readonly}
            className="flex-1"
          />
          <Badge variant="outline" className="text-xs">
            {value.duration < 1000 ? `${value.duration}ms` : `${value.duration / 1000}s`}
          </Badge>
        </div>
      </div>

      {/* 缓动函数 */}
      <div>
        <Label className="text-sm font-medium">缓动函数</Label>
        <Select
          value={value.timing}
          onValueChange={(timing) => updateValue({ timing })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择缓动函数" />
          </SelectTrigger>
          <SelectContent>
            {timingPresets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                <div>
                  <div className="font-medium">{preset.label}</div>
                  {preset.description && (
                    <div className="text-xs text-muted-foreground">{preset.description}</div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 延迟时间 */}
      <div>
        <Label className="text-sm font-medium">延迟时间 (ms)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value.delay}
            min={0}
            max={1000}
            step={50}
            onChange={(e) => updateValue({ delay: Number(e.target.value) })}
            disabled={disabled}
            readOnly={readonly}
            className="flex-1"
          />
          <Badge variant="outline" className="text-xs">
            {value.delay < 1000 ? `${value.delay}ms` : `${value.delay / 1000}s`}
          </Badge>
        </div>
      </div>

      {/* 动画属性 */}
      <div>
        <Label className="text-sm font-medium">动画属性</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateValue({ properties: ['all'] })}
              disabled={disabled}
            >
              全选
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateValue({ properties: [] })}
              disabled={disabled}
            >
              清空
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableProperties.map((prop) => (
              <div key={prop.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={prop.value}
                  checked={value.properties.includes(prop.value)}
                  onChange={(e) => {
                    const properties = e.target.checked
                      ? [...value.properties, prop.value]
                      : value.properties.filter(p => p !== prop.value)
                    updateValue({ properties })
                  }}
                  disabled={disabled}
                  className="rounded"
                />
                <Label
                  htmlFor={prop.value}
                  className={cn(
                    'text-sm flex-1 cursor-pointer',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {prop.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 预览 */}
      <div>
        <Label className="text-sm font-medium">CSS代码</Label>
        <div className="p-3 bg-muted rounded-md">
          <code className="text-xs text-muted-foreground break-all">
            transition: {formatValue(value)}
          </code>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {definition.label || '过渡动画'}
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant={customMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCustomMode(!customMode)}
            disabled={disabled}
          >
            {customMode ? '自定义' : '预设'}
          </Button>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 预设模式 */}
      {!customMode && renderPresetButtons()}

      {/* 自定义模式 */}
      {customMode && renderCustomEditor()}
    </div>
  )
}

export default TransitionFieldEditor