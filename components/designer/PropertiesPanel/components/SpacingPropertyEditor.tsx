/**
 * 间距属性编辑器组件
 * 提供margin、padding等间距属性的快捷设置和可视化编辑
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
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Square,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Circle,
  Link,
  Link2,
  RotateCcw,
  Grid,
  AlignCenter
} from 'lucide-react'
import type { PropertyEditorProps } from '@/types/designer'

// 间距预设值
const SPACING_PRESETS = [
  { value: '0', label: '无', size: 0 },
  { value: '4px', label: 'XS', size: 4 },
  { value: '8px', label: 'S', size: 8 },
  { value: '12px', label: 'M', size: 12 },
  { value: '16px', label: 'L', size: 16 },
  { value: '20px', label: 'XL', size: 20 },
  { value: '24px', label: '2XL', size: 24 },
  { value: '32px', label: '3XL', size: 32 },
  { value: '48px', label: '4XL', size: 48 },
  { value: '64px', label: '5XL', size: 64 },
]

// 间距类型
type SpacingType = 'margin' | 'padding'
type SpacingDirection = 'top' | 'right' | 'bottom' | 'left' | 'all'

interface SpacingValue {
  top: string
  right: string
  bottom: string
  left: string
}

interface SpacingPropertyEditorProps extends Omit<PropertyEditorProps, 'value' | 'onChange'> {
  value?: string | Record<string, string> | null
  onChange: (value: string | Record<string, string> | null) => void
  type: SpacingType
  showVisualEditor?: boolean
  showLinkedControl?: boolean
  defaultUnit?: string
}

export function SpacingPropertyEditor({
  value,
  onChange,
  label,
  type,
  disabled = false,
  error,
  description,
  className,
  showVisualEditor = true,
  showLinkedControl = true,
  defaultUnit = 'px',
  testId,
  ...props
}: SpacingPropertyEditorProps) {
  const [isVisualOpen, setIsVisualOpen] = useState(false)
  const [isLinked, setIsLinked] = useState(true)
  const [spacingValues, setSpacingValues] = useState<SpacingValue>({
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
  })
  const [activeDirection, setActiveDirection] = useState<SpacingDirection>('all')

  // 解析间距值
  const parseSpacingValue = useCallback((input: string | Record<string, string> | null | undefined): SpacingValue => {
    if (!input) {
      return { top: '0', right: '0', bottom: '0', left: '0' }
    }

    if (typeof input === 'string') {
      // 简写字符串，如 "16px" 或 "16px 8px"
      const parts = input.split(' ').filter(p => p)

      if (parts.length === 1) {
        const value = parts[0]
        return { top: value, right: value, bottom: value, left: value }
      } else if (parts.length === 2) {
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[0],
          left: parts[1]
        }
      } else if (parts.length === 3) {
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[2],
          left: parts[1]
        }
      } else if (parts.length === 4) {
        return {
          top: parts[0],
          right: parts[1],
          bottom: parts[2],
          left: parts[3]
        }
      }
    } else if (typeof input === 'object') {
      // 对象格式，如 { top: '8px', right: '16px', bottom: '8px', left: '16px' }
      return {
        top: input.top || '0',
        right: input.right || '0',
        bottom: input.bottom || '0',
        left: input.left || '0'
      }
    }

    return { top: '0', right: '0', bottom: '0', left: '0' }
  }, [])

  // 格式化间距值为字符串
  const formatSpacingValue = useCallback((values: SpacingValue): string => {
    if (isLinked || (values.top === values.right && values.right === values.bottom && values.bottom === values.left)) {
      return values.top
    }

    // 检查是否可以简化为2值格式
    if (values.top === values.bottom && values.right === values.left) {
      return `${values.top} ${values.right}`
    }

    // 检查是否可以简化为3值格式
    if (values.right === values.left) {
      return `${values.top} ${values.right} ${values.bottom}`
    }

    // 返回完整的4值格式
    return `${values.top} ${values.right} ${values.bottom} ${values.left}`
  }, [isLinked])

  // 同步外部值变化到内部状态
  useEffect(() => {
    const parsed = parseSpacingValue(value)
    setSpacingValues(parsed)

    // 检查是否为链接状态
    const allEqual = parsed.top === parsed.right &&
                    parsed.right === parsed.bottom &&
                    parsed.bottom === parsed.left
    setIsLinked(allEqual)
  }, [value, parseSpacingValue])

  // 处理单个方向值变化
  const handleDirectionChange = useCallback((direction: keyof SpacingValue, newValue: string) => {
    const newValues = { ...spacingValues, [direction]: newValue }

    // 如果是链接状态，更新所有方向
    if (isLinked && direction !== 'all') {
      newValues.top = newValue
      newValues.right = newValue
      newValues.bottom = newValue
      newValues.left = newValue
    }

    setSpacingValues(newValues)

    // 根据输入类型输出结果
    if (typeof value === 'object' || !isLinked) {
      onChange(newValues)
    } else {
      onChange(formatSpacingValue(newValues))
    }
  }, [spacingValues, isLinked, value, formatSpacingValue, onChange])

  // 处理预设值选择
  const handlePresetSelect = useCallback((presetValue: string) => {
    const newValues = {
      top: presetValue,
      right: presetValue,
      bottom: presetValue,
      left: presetValue
    }

    setSpacingValues(newValues)
    setIsLinked(true)

    if (typeof value === 'object') {
      onChange(newValues)
    } else {
      onChange(presetValue)
    }
  }, [value, onChange])

  // 处理链接状态切换
  const handleLinkToggle = useCallback(() => {
    const newLinked = !isLinked
    setIsLinked(newLinked)

    if (newLinked) {
      // 链接状态：使用top值应用到所有方向
      const uniformValue = spacingValues.top
      const newValues = {
        top: uniformValue,
        right: uniformValue,
        bottom: uniformValue,
        left: uniformValue
      }
      setSpacingValues(newValues)

      if (typeof value === 'object') {
        onChange(newValues)
      } else {
        onChange(formatSpacingValue(newValues))
      }
    } else {
      // 取消链接：保持当前值但允许独立编辑
      if (typeof value === 'object') {
        onChange(spacingValues)
      } else {
        onChange(spacingValues)
      }
    }
  }, [isLinked, spacingValues, value, formatSpacingValue, onChange])

  // 重置所有值
  const handleReset = useCallback(() => {
    const newValues = { top: '0', right: '0', bottom: '0', left: '0' }
    setSpacingValues(newValues)
    setIsLinked(true)

    if (typeof value === 'object') {
      onChange(newValues)
    } else {
      onChange('0')
    }
  }, [value, onChange])

  // 获取当前属性的CSS名称
  const getCSSPropertyName = useCallback(() => {
    return type
  }, [type])

  // 获取方向图标
  const getDirectionIcon = useCallback((direction: keyof SpacingValue) => {
    switch (direction) {
      case 'top':
        return <ArrowUp className="w-4 h-4" />
      case 'right':
        return <ArrowRight className="w-4 h-4" />
      case 'bottom':
        return <ArrowDown className="w-4 h-4" />
      case 'left':
        return <ArrowLeft className="w-4 h-4" />
      default:
        return <Square className="w-4 h-4" />
    }
  }, [])

  return (
    <TooltipProvider>
      <div className={cn('space-y-3', className)} data-testid={testId}>
        <div className="flex items-center justify-between">
          <Label className={cn('text-sm font-medium', error && 'text-destructive')}>
            {label}
          </Label>

          <div className="flex items-center gap-1">
            {/* 链接控制 */}
            {showLinkedControl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLinkToggle}
                    className={cn(
                      'h-6 w-6 p-0',
                      isLinked && 'bg-accent text-accent-foreground'
                    )}
                    disabled={disabled}
                  >
                    {isLinked ? <Link className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLinked ? '取消链接' : '链接所有方向'}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* 可视化编辑器 */}
            {showVisualEditor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisualOpen(!isVisualOpen)}
                    className="h-6 w-6 p-0"
                    disabled={disabled}
                  >
                    <Grid className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>可视化编辑器</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* 重置按钮 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-6 w-6 p-0"
                  disabled={disabled}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>重置为0</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 可视化编辑器 */}
        {showVisualEditor && isVisualOpen && (
          <Popover open={isVisualOpen} onOpenChange={setIsVisualOpen}>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <div className="text-sm font-medium">可视化间距编辑</div>

                {/* 间距可视化区域 */}
                <div className="relative bg-muted/30 rounded-lg p-4">
                  <div className="aspect-square relative bg-white rounded border-2 border-dashed border-muted-foreground/30">

                    {/* 顶部间距 */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Input
                        value={spacingValues.top}
                        onChange={(e) => handleDirectionChange('top', e.target.value)}
                        className="w-16 h-8 text-xs text-center"
                        placeholder="0"
                        disabled={disabled}
                      />
                    </div>

                    {/* 左侧间距 */}
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                      <Input
                        value={spacingValues.left}
                        onChange={(e) => handleDirectionChange('left', e.target.value)}
                        className="w-16 h-8 text-xs text-center"
                        placeholder="0"
                        disabled={disabled}
                      />
                    </div>

                    {/* 右侧间距 */}
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                      <Input
                        value={spacingValues.right}
                        onChange={(e) => handleDirectionChange('right', e.target.value)}
                        className="w-16 h-8 text-xs text-center"
                        placeholder="0"
                        disabled={disabled}
                      />
                    </div>

                    {/* 底部间距 */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Input
                        value={spacingValues.bottom}
                        onChange={(e) => handleDirectionChange('bottom', e.target.value)}
                        className="w-16 h-8 text-xs text-center"
                        placeholder="0"
                        disabled={disabled}
                      />
                    </div>

                    {/* 中心元素 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary/20 rounded border border-primary/50 flex items-center justify-center">
                        <AlignCenter className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 方向快速设置 */}
                <div className="grid grid-cols-2 gap-2">
                  {(['top', 'right', 'bottom', 'left'] as const).map((direction) => (
                    <Button
                      key={direction}
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveDirection(direction)}
                      className={cn(
                        'flex items-center gap-1 h-8',
                        activeDirection === direction && 'bg-accent'
                      )}
                      disabled={disabled}
                    >
                      {getDirectionIcon(direction)}
                      <span className="text-xs capitalize">{direction}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* 预设值选择 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-muted-foreground" />
            <Label className="text-xs text-muted-foreground">快速设置</Label>
          </div>
          <div className="flex flex-wrap gap-1">
            {SPACING_PRESETS.map((preset) => (
              <Badge
                key={preset.value}
                variant={spacingValues.top === preset.value && isLinked ? "default" : "secondary"}
                className="cursor-pointer hover:bg-secondary/80 text-xs"
                onClick={() => handlePresetSelect(preset.value)}
              >
                {preset.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* 方向输入 */}
        {(showVisualEditor && isVisualOpen) || !isLinked ? (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {isLinked ? '统一设置' : '分别设置'}
            </Label>

            {isLinked ? (
              <div className="flex items-center gap-2">
                <Input
                  value={spacingValues.top}
                  onChange={(e) => handleDirectionChange('top', e.target.value)}
                  placeholder="输入间距值..."
                  className="flex-1 font-mono text-sm"
                  disabled={disabled}
                />
                <Select
                  value={spacingValues.top.replace(/[\d.]/g, '') || defaultUnit}
                  onValueChange={(unit) => {
                    const currentValue = spacingValues.top.replace(/[a-z%]/gi, '')
                    handleDirectionChange('top', `${currentValue}${unit}`)
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="px">px</SelectItem>
                    <SelectItem value="rem">rem</SelectItem>
                    <SelectItem value="em">em</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {(['top', 'right', 'bottom', 'left'] as const).map((direction) => (
                  <div key={direction} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-16">
                      {getDirectionIcon(direction)}
                      <span className="text-xs capitalize">{direction}</span>
                    </div>
                    <Input
                      value={spacingValues[direction]}
                      onChange={(e) => handleDirectionChange(direction, e.target.value)}
                      placeholder="0"
                      className="flex-1 text-sm"
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 简化输入模式 */
          <div className="flex items-center gap-2">
            <Input
              value={spacingValues.top}
              onChange={(e) => handleDirectionChange('top', e.target.value)}
              placeholder="输入间距值..."
              className="flex-1 font-mono text-sm"
              disabled={disabled}
              style={{ borderColor: error ? 'hsl(var(--destructive))' : undefined }}
            />

            <Select
              value={spacingValues.top.replace(/[\d.]/g, '') || defaultUnit}
              onValueChange={(unit) => {
                const currentValue = spacingValues.top.replace(/[a-z%]/gi, '')
                handleDirectionChange('top', `${currentValue}${unit}`)
              }}
              disabled={disabled}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="rem">rem</SelectItem>
                <SelectItem value="em">em</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 当前值显示 */}
        {!isLinked && (
          <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
            {formatSpacingValue(spacingValues)}
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
    </TooltipProvider>
  )
}

// 导出预设间距供其他组件使用
export { SPACING_PRESETS }

// 默认导出
export default SpacingPropertyEditor