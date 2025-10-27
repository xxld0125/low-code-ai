/**
 * 文本属性编辑器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  PropertyEditorProps,
  TextPropertyConfig,
  PropertyValidationResult,
} from '@/types/page-designer/properties'
import {
  AlertCircle,
  CheckCircle,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react'

interface TextPropertyEditorProps extends Omit<PropertyEditorProps, 'value'> {
  value: string
  config?: Partial<TextPropertyConfig>
  validation?: PropertyValidationResult
}

export const TextPropertyEditor: React.FC<TextPropertyEditorProps> = ({
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
  const [localValue, setLocalValue] = useState(value || '')
  const [isValid, setIsValid] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 合并默认配置
  const textConfig: TextPropertyConfig = {
    value: '',
    placeholder: `请输入${definition.label}`,
    maxLength: definition.validation?.maxLength,
    multiline: false,
    rows: 3,
    richText: false,
    ...config,
  }

  // 验证输入值
  const validateValue = useCallback(
    (newValue: string): PropertyValidationResult => {
      if (definition.validation?.required && !newValue.trim()) {
        return {
          isValid: false,
          error: `${definition.label}不能为空`,
        }
      }

      if (definition.validation?.minLength && newValue.length < definition.validation.minLength) {
        return {
          isValid: false,
          error: `${definition.label}至少需要${definition.validation.minLength}个字符`,
        }
      }

      if (definition.validation?.maxLength && newValue.length > definition.validation.maxLength) {
        return {
          isValid: false,
          error: `${definition.label}不能超过${definition.validation.maxLength}个字符`,
        }
      }

      if (definition.validation?.pattern) {
        const regex = new RegExp(definition.validation.pattern)
        if (!regex.test(newValue)) {
          return {
            isValid: false,
            error: `${definition.label}格式不正确`,
          }
        }
      }

      return { isValid: true }
    },
    [definition]
  )

  // 处理值变化
  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue)

      const validationResult = validateValue(newValue)
      setIsValid(validationResult.isValid)

      onChange(newValue)
    },
    [onChange, validateValue]
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
    setLocalValue(value || '')
  }, [value])

  // 获取字符计数信息
  const getCharacterCount = () => {
    const current = localValue.length
    const max = textConfig.maxLength
    return { current, max }
  }

  const { current: charCount, max: maxChars } = getCharacterCount()

  // 基础文本输入组件
  const renderBasicInput = () => {
    const inputProps = {
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleChange(e.target.value)
      },
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled,
      placeholder: textConfig.placeholder,
      maxLength: textConfig.maxLength,
      className: cn(
        'w-full',
        !isValid && 'border-red-300 focus:border-red-500 focus:ring-red-500',
        isFocused && 'ring-2 ring-blue-500 ring-offset-2',
        disabled && 'bg-gray-50 cursor-not-allowed'
      ),
    }

    if (textConfig.multiline) {
      return (
        <Textarea
          {...inputProps}
          rows={textConfig.rows}
          className={cn(inputProps.className, 'resize-none')}
        />
      )
    }

    return <Input {...inputProps} />
  }

  // 富文本编辑器（简化版）
  const renderRichTextEditor = () => {
    return (
      <Card className="border-2 border-dashed border-gray-300 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              富文本编辑器
            </Badge>
            <span className="text-xs text-gray-500">{definition.label}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
            高级选项
          </Button>
        </div>

        <Textarea
          value={localValue}
          onChange={e => handleChange(e.target.value)}
          placeholder={textConfig.placeholder}
          className="min-h-[100px] border-0 bg-transparent p-0 focus:ring-0"
          disabled={disabled}
        />

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" disabled>
              <Type className="h-4 w-4" />
            </Button>
            <div className="h-4 w-px bg-gray-300" />
            <Button size="sm" variant="ghost" disabled>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" disabled>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" disabled>
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" disabled>
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {textConfig.maxLength && (
            <span
              className={cn(
                'text-xs',
                maxChars && charCount > maxChars * 0.9 ? 'text-orange-500' : 'text-gray-500'
              )}
            >
              {charCount}/{maxChars || '∞'}
            </span>
          )}
        </div>
      </Card>
    )
  }

  // 高级选项面板
  const renderAdvancedOptions = () => {
    return (
      <div className="space-y-4 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">启用富文本</Label>
          <Switch
            checked={textConfig.richText || false}
            onCheckedChange={checked => {
              const newConfig = { ...textConfig, richText: checked }
              // 这里可以触发配置更新事件
            }}
            disabled={disabled}
          />
        </div>

        {textConfig.multiline && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">行数</Label>
            <Slider
              value={[textConfig.rows || 3]}
              onValueChange={([value]: number[]) => {
                const newConfig = { ...textConfig, rows: value }
                // 这里可以触发配置更新事件
              }}
              max={10}
              min={1}
              step={1}
              disabled={disabled}
              className="w-full"
            />
            <div className="text-center text-xs text-gray-500">{textConfig.rows || 3} 行</div>
          </div>
        )}

        {definition.validation?.maxLength && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">最大字符数</Label>
            <Input
              type="number"
              value={definition.validation.maxLength}
              onChange={e => {
                const newMaxLength = parseInt(e.target.value)
                // 这里可以触发验证规则更新
              }}
              min={1}
              max={10000}
              disabled={disabled}
            />
          </div>
        )}
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
      {textConfig.richText ? renderRichTextEditor() : renderBasicInput()}

      {/* 字符计数 */}
      {textConfig.maxLength && !textConfig.richText && (
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <span
            className={cn(
              'text-xs',
              maxChars && charCount > maxChars * 0.9 ? 'text-orange-500' : 'text-gray-500'
            )}
          >
            {charCount}/{maxChars || '∞'}
          </span>
        </div>
      )}

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

// 专门用于按钮文本的编辑器
export const ButtonTextEditor: React.FC<TextPropertyEditorProps> = props => {
  return (
    <TextPropertyEditor
      {...props}
      config={{
        ...props.config,
        maxLength: 50,
        placeholder: '请输入按钮文字',
      }}
    />
  )
}

// 专门用于输入框占位符的编辑器
export const PlaceholderEditor: React.FC<TextPropertyEditorProps> = props => {
  return (
    <TextPropertyEditor
      {...props}
      config={{
        ...props.config,
        maxLength: 100,
        placeholder: '请输入占位符文字',
      }}
    />
  )
}

// 专门用于标题文本的编辑器
export const HeadingTextEditor: React.FC<TextPropertyEditorProps> = props => {
  return (
    <div className="space-y-3">
      <TextPropertyEditor
        {...props}
        config={{
          ...props.config,
          maxLength: 200,
          placeholder: '请输入标题文字',
        }}
      />

      {/* 标题级别选择 */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">标题级别</Label>
        <Select defaultValue="h2">
          <SelectTrigger>
            <SelectValue placeholder="选择标题级别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h1">一级标题</SelectItem>
            <SelectItem value="h2">二级标题</SelectItem>
            <SelectItem value="h3">三级标题</SelectItem>
            <SelectItem value="h4">四级标题</SelectItem>
            <SelectItem value="h5">五级标题</SelectItem>
            <SelectItem value="h6">六级标题</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default TextPropertyEditor
