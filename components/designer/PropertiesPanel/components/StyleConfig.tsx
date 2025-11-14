/**
 * 专业版样式配置组件
 * 参考阿里低代码引擎设计理念
 * 提供更专业、紧凑、功能完整的样式配置体验
 */

'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Palette,
  Layout,
  Save,
  RotateCcw,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Type,
  Box,
  Move,
  Square
} from 'lucide-react'
import { usePropertyStore } from '@/stores/property-store/property-store'

interface StyleConfigProps {
  componentId: string
  componentType?: string
  showPresets?: boolean
  showResponsive?: boolean
  showAdvanced?: boolean
  compact?: boolean
}

interface StyleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  compact?: boolean
}

function StyleSection({
  title,
  children,
  defaultOpen = true,
  compact = false,
  icon
}: StyleSectionProps & { icon?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn(
      "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800",
      compact && "border-dashed"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-3 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  )
}

function ResponsiveSelector({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void
}) {
  const devices = [
    { id: 'default', icon: Monitor, label: '默认' },
    { id: 'sm', icon: Smartphone, label: '小屏' },
    { id: 'md', icon: Tablet, label: '中屏' },
    { id: 'lg', icon: Monitor, label: '大屏' },
    { id: 'xl', icon: Monitor, label: '超大' },
  ]

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {devices.map((device) => (
        <Button
          key={device.id}
          variant={value === device.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(device.id)}
          className={cn(
            "flex-1 h-7 text-xs",
            value === device.id && "shadow-sm"
          )}
        >
          <device.icon className="w-3 h-3" />
        </Button>
      ))}
    </div>
  )
}

// 专业数值输入组件 - 参考阿里低代码引擎设计
function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
  placeholder = '0',
  showSlider = false
}: {
  label: string
  value: number | string
  onChange: (value: number | string) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  placeholder?: string
  showSlider?: boolean
}) {
  const [inputValue, setInputValue] = useState(String(value || ''))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue === '' || newValue === 'auto') {
      onChange(newValue)
      return
    }

    const numValue = parseFloat(newValue)
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) return
      if (max !== undefined && numValue > max) return
      onChange(numValue)
    }
  }

  const handleIncrement = () => {
    const current = typeof value === 'number' ? value : parseFloat(value) || 0
    const newValue = current + step
    if (max === undefined || newValue <= max) {
      onChange(newValue)
      setInputValue(String(newValue))
    }
  }

  const handleDecrement = () => {
    const current = typeof value === 'number' ? value : parseFloat(value) || 0
    const newValue = current - step
    if (min === undefined || newValue >= min) {
      onChange(newValue)
      setInputValue(String(newValue))
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          className="h-6 w-6 p-0 border border-gray-300 dark:border-gray-600"
          disabled={(min !== undefined && typeof value === 'number' && value <= min)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <div className="relative flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="h-6 text-xs px-2 border border-gray-300 dark:border-gray-600 rounded-none"
          />
          {unit && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          className="h-6 w-6 p-0 border border-gray-300 dark:border-gray-600"
          disabled={(max !== undefined && typeof value === 'number' && value >= max)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {showSlider && typeof value === 'number' && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value)
            onChange(newValue)
            setInputValue(String(newValue))
          }}
          className="w-full h-1"
        />
      )}
    </div>
  )
}

// 四方向间距输入组件
function SpacingInput({
  label,
  value,
  onChange,
  unit = 'px'
}: {
  label: string
  value: { top: number; right: number; bottom: number; left: number }
  onChange: (value: { top: number; right: number; bottom: number; left: number }) => void
  unit?: string
}) {
  const handleValueChange = (direction: keyof typeof value, newValue: number | string) => {
    const numValue = typeof newValue === 'number' ? newValue : parseFloat(newValue) || 0
    onChange({
      ...value,
      [direction]: numValue
    })
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="上"
          value={value.top}
          onChange={(val) => handleValueChange('top', val)}
          unit={unit}
        />
        <NumberInput
          label="右"
          value={value.right}
          onChange={(val) => handleValueChange('right', val)}
          unit={unit}
        />
        <NumberInput
          label="下"
          value={value.bottom}
          onChange={(val) => handleValueChange('bottom', val)}
          unit={unit}
        />
        <NumberInput
          label="左"
          value={value.left}
          onChange={(val) => handleValueChange('left', val)}
          unit={unit}
        />
      </div>
    </div>
  )
}

// 颜色选择组件
function ColorInput({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [inputValue, setInputValue] = useState(value || '')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => {
            onChange(e.target.value)
            setInputValue(e.target.value)
          }}
          className="w-6 h-6 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
        />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className="h-6 text-xs px-2 flex-1 border border-gray-300 dark:border-gray-600"
        />
      </div>
    </div>
  )
}

function ColorEditor({
  label,
  value,
  onChange
}: {
  label: string
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [inputValue, setInputValue] = useState(value || '')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onChange(e.target.value || null)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 border border-border rounded cursor-pointer"
        />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className="flex-1 h-8 text-xs px-2 border border-border rounded bg-background"
        />
      </div>
    </div>
  )
}

export function StyleConfig({
  componentId,
  componentType,
  showPresets = true,
  showResponsive = true,
  showAdvanced = true,
  compact = false
}: StyleConfigProps) {
  const [activeTab, setActiveTab] = useState('properties')
  const [breakpoint, setBreakpoint] = useState('default')
  const [styleChanges, setStyleChanges] = useState(0)

  // 使用propertyStore获取组件属性
  const { selectedComponent } = usePropertyStore()

  // 模拟样式数据 - 重新设计为更专业的结构
  const mockStyles = {
    // 布局属性
    display: 'block',
    width: 'auto',
    height: 'auto',
    position: 'static',
    zIndex: 'auto',

    // 间距属性
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    padding: { top: 8, right: 8, bottom: 8, left: 8 },

    // 文字属性
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 'normal',
    fontFamily: 'inherit',
    color: '#000000',
    textAlign: 'left',

    // 背景属性
    backgroundColor: 'transparent',
    opacity: 100,

    // 边框属性
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none'
  }

  // 处理样式更新
  const handleStyleUpdate = useCallback((property: string, value: any) => {
    console.log('Style update:', property, value)
    setStyleChanges(prev => prev + 1)
  }, [])

  // 重置样式
  const handleResetStyles = useCallback(() => {
    console.log('Reset styles')
    setStyleChanges(0)
  }, [])

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* 顶部功能区 - 参考阿里低代码引擎设计 */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-3">
          {/* 类名绑定区域 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">类名绑定</span>
            <Input
              placeholder="输入CSS类名"
              className="h-6 text-xs flex-1 border-gray-300 dark:border-gray-600"
            />
          </div>

          {/* 行内样式区域 */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">行内样式</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetStyles}
                disabled={styleChanges === 0}
                className="h-6 px-2 text-xs border-gray-300 dark:border-gray-600"
              >
                重置
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={styleChanges === 0}
                className="h-6 px-2 text-xs"
              >
                应用
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要编辑区域 */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">

          {/* 组件信息 */}
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            组件ID: {componentId}
            {componentType && ` • 类型: ${componentType}`}
          </div>

          {/* 布局分组 */}
          <StyleSection title="布局" icon={<Layout className="w-4 h-4" />} defaultOpen={true}>
            <div className="space-y-3">
              {/* 显示模式 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">显示模式</label>
                <Select value={mockStyles.display} onValueChange={(value) => handleStyleUpdate('display', value)}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">块级</SelectItem>
                    <SelectItem value="inline">行内</SelectItem>
                    <SelectItem value="inline-block">行内块</SelectItem>
                    <SelectItem value="flex">弹性</SelectItem>
                    <SelectItem value="grid">网格</SelectItem>
                    <SelectItem value="none">隐藏</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 尺寸 */}
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="宽度"
                  value={mockStyles.width}
                  onChange={(value) => handleStyleUpdate('width', value)}
                  placeholder="auto"
                />
                <NumberInput
                  label="高度"
                  value={mockStyles.height}
                  onChange={(value) => handleStyleUpdate('height', value)}
                  placeholder="auto"
                />
              </div>

              {/* 位置 */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">定位</label>
                <Select value={mockStyles.position} onValueChange={(value) => handleStyleUpdate('position', value)}>
                  <SelectTrigger className="h-6 text-xs border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">静态</SelectItem>
                    <SelectItem value="relative">相对</SelectItem>
                    <SelectItem value="absolute">绝对</SelectItem>
                    <SelectItem value="fixed">固定</SelectItem>
                    <SelectItem value="sticky">粘性</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 层级 */}
              <NumberInput
                label="zIndex"
                value={mockStyles.zIndex}
                onChange={(value) => handleStyleUpdate('zIndex', value)}
                placeholder="auto"
              />
            </div>
          </StyleSection>

          {/* 间距分组 */}
          <StyleSection title="间距" icon={<Box className="w-4 h-4" />} defaultOpen={true}>
            <div className="space-y-4">
              {/* 外边距 */}
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">MARGIN</div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="上"
                    value={mockStyles.margin.top}
                    onChange={(value) => handleStyleUpdate('margin.top', value)}
                    unit="px"
                  />
                  <NumberInput
                    label="右"
                    value={mockStyles.margin.right}
                    onChange={(value) => handleStyleUpdate('margin.right', value)}
                    unit="px"
                  />
                  <NumberInput
                    label="下"
                    value={mockStyles.margin.bottom}
                    onChange={(value) => handleStyleUpdate('margin.bottom', value)}
                    unit="px"
                  />
                  <NumberInput
                    label="左"
                    value={mockStyles.margin.left}
                    onChange={(value) => handleStyleUpdate('margin.left', value)}
                    unit="px"
                  />
                </div>
              </div>

              {/* 内边距 */}
              <div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">PADDING</div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="上"
                    value={mockStyles.padding.top}
                    onChange={(value) => handleStyleUpdate('padding.top', value)}
                    unit="px"
                  />
                  <NumberInput
                    label="右"
                    value={mockStyles.padding.right}
                    onChange={(value) => handleStyleUpdate('padding.right', value)}
                    unit="px"
                  />
                  <NumberInput
                    label="下"
                    value={mockStyles.padding.bottom}
                    onChange={(value) => handleStyleUpdate('padding.bottom', value)}
                    unit="px"
                  />
                  <NumberInput
                    label="左"
                    value={mockStyles.padding.left}
                    onChange={(value) => handleStyleUpdate('padding.left', value)}
                    unit="px"
                  />
                </div>
              </div>
            </div>
          </StyleSection>

          {/* 文字分组 */}
          <StyleSection title="文字" icon={<Type className="w-4 h-4" />} defaultOpen={true}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NumberInput
                  label="字号"
                  value={mockStyles.fontSize}
                  onChange={(value) => handleStyleUpdate('fontSize', value)}
                  unit="px"
                  min={8}
                  max={72}
                />
                <NumberInput
                  label="行高"
                  value={mockStyles.lineHeight}
                  onChange={(value) => handleStyleUpdate('lineHeight', value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">字重</label>
                  <Select value={mockStyles.fontWeight} onValueChange={(value) => handleStyleUpdate('fontWeight', value)}>
                    <SelectTrigger className="h-6 text-xs border-gray-300 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">正常</SelectItem>
                      <SelectItem value="bold">粗体</SelectItem>
                      <SelectItem value="lighter">细体</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                      <SelectItem value="400">400</SelectItem>
                      <SelectItem value="500">500</SelectItem>
                      <SelectItem value="600">600</SelectItem>
                      <SelectItem value="700">700</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">对齐</label>
                  <Select value={mockStyles.textAlign} onValueChange={(value) => handleStyleUpdate('textAlign', value)}>
                    <SelectTrigger className="h-6 text-xs border-gray-300 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">左对齐</SelectItem>
                      <SelectItem value="center">居中</SelectItem>
                      <SelectItem value="right">右对齐</SelectItem>
                      <SelectItem value="justify">两端对齐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ColorInput
                label="文字颜色"
                value={mockStyles.color}
                onChange={(value) => handleStyleUpdate('color', value)}
              />

              <NumberInput
                label="透明度"
                value={mockStyles.opacity}
                onChange={(value) => handleStyleUpdate('opacity', value)}
                min={0}
                max={100}
                unit="%"
                showSlider={true}
              />
            </div>
          </StyleSection>

          {/* 背景分组 */}
          <StyleSection title="背景" icon={<Palette className="w-4 h-4" />} defaultOpen={true}>
            <div className="space-y-3">
              <ColorInput
                label="背景颜色"
                value={mockStyles.backgroundColor}
                onChange={(value) => handleStyleUpdate('backgroundColor', value)}
              />
            </div>
          </StyleSection>

          {/* 边框分组 */}
          <StyleSection title="边框" icon={<Square className="w-4 h-4" />} defaultOpen={false}>
            <div className="space-y-3">
              <NumberInput
                label="圆角"
                value={mockStyles.borderRadius}
                onChange={(value) => handleStyleUpdate('borderRadius', value)}
                unit="px"
                min={0}
                max={50}
              />
            </div>
          </StyleSection>

        </div>
      </ScrollArea>
    </div>
  )
}

// 默认导出
export default StyleConfig