/**
 * 属性验证器和错误提示组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useMemo } from 'react'
import { PropertyDefinition, ValidationRule, ValidationType } from '@/types/lowcode/property'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

// 验证结果类型
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  info: ValidationInfo[]
}

export interface ValidationError {
  property: string
  type: ValidationType
  message: string
  value: unknown
  rule?: ValidationRule
}

export interface ValidationWarning {
  property: string
  type: string
  message: string
  value: unknown
  suggestion?: string
}

export interface ValidationInfo {
  property: string
  type: string
  message: string
  value: unknown
}

// 属性验证器Hook
export function usePropertyValidator() {
  // 验证单个属性
  const validateProperty = (value: unknown, definition: PropertyDefinition): ValidationResult => {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const info: ValidationInfo[] = []

    // 必填验证
    if (definition.required && (value === undefined || value === null || value === '')) {
      errors.push({
        property: definition.key,
        type: 'required',
        message: `${definition.label}是必填项`,
        value,
        rule: definition.validation?.find(rule => rule.type === 'required'),
      })
    }

    // 如果值为空且非必填，跳过其他验证
    if (value === undefined || value === null || value === '') {
      return { isValid: errors.length === 0, errors, warnings, info }
    }

    // 执行验证规则
    if (definition.validation) {
      for (const rule of definition.validation) {
        const ruleResult = validateRule(value, rule, definition)
        if (!ruleResult.isValid) {
          errors.push({
            property: definition.key,
            type: rule.type,
            message: ruleResult.message || `${definition.label}验证失败`,
            value,
            rule,
          })
        }
      }
    }

    // 类型特定验证
    const typeResult = validateType(value, definition.type, definition)
    if (!typeResult.isValid) {
      errors.push({
        property: definition.key,
        type: 'custom',
        message: typeResult.message || `${definition.label}类型不正确`,
        value,
      })
    }

    // 添加建议和信息
    const suggestions = generateSuggestions(value, definition)
    warnings.push(...suggestions.warnings)
    info.push(...suggestions.info)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
    }
  }

  // 验证多个属性
  const validateProperties = (
    properties: Record<string, unknown>,
    definitions: PropertyDefinition[]
  ): ValidationResult => {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []
    const allInfo: ValidationInfo[] = []

    definitions.forEach(definition => {
      const value = properties[definition.key]
      const result = validateProperty(value, definition)

      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
      allInfo.push(...result.info)
    })

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      info: allInfo,
    }
  }

  return { validateProperty, validateProperties }
}

// 验证规则
function validateRule(
  value: unknown,
  rule: ValidationRule,
  definition: PropertyDefinition
): { isValid: boolean; message?: string } {
  const { type, params = {} } = rule
  const stringValue = String(value)

  switch (type) {
    case 'required':
      return {
        isValid: value !== undefined && value !== null && value !== '',
        message: rule.message || `${definition.label}是必填项`,
      }

    case 'min_length':
      return {
        isValid: stringValue.length >= (params.minLength as number),
        message: rule.message || `${definition.label}至少需要${params.minLength}个字符`,
      }

    case 'max_length':
      return {
        isValid: stringValue.length <= (params.maxLength as number),
        message: rule.message || `${definition.label}不能超过${params.maxLength}个字符`,
      }

    case 'min_value':
      const numValue = Number(value)
      return {
        isValid: !isNaN(numValue) && numValue >= (params.min as number),
        message: rule.message || `${definition.label}不能小于${params.min}`,
      }

    case 'max_value':
      const maxNumValue = Number(value)
      return {
        isValid: !isNaN(maxNumValue) && maxNumValue <= (params.max as number),
        message: rule.message || `${definition.label}不能大于${params.max}`,
      }

    case 'pattern':
      const regex = new RegExp(params.pattern as string)
      return {
        isValid: regex.test(stringValue),
        message: rule.message || `${definition.label}格式不正确`,
      }

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return {
        isValid: emailRegex.test(stringValue),
        message: rule.message || '请输入有效的邮箱地址',
      }

    case 'url':
      try {
        new URL(stringValue)
        return { isValid: true }
      } catch {
        return {
          isValid: false,
          message: rule.message || '请输入有效的URL地址',
        }
      }

    case 'custom':
      // 自定义验证函数
      if (params.validator && typeof params.validator === 'function') {
        return params.validator(value, definition)
      }
      return { isValid: true }

    default:
      return { isValid: true }
  }
}

// 类型验证
function validateType(
  value: unknown,
  type: string,
  definition: PropertyDefinition
): { isValid: boolean; message?: string } {
  switch (type) {
    case 'string':
      return {
        isValid: typeof value === 'string',
        message: `${definition.label}必须是字符串`,
      }

    case 'number':
      const numValue = Number(value)
      return {
        isValid: !isNaN(numValue) && typeof numValue === 'number',
        message: `${definition.label}必须是数字`,
      }

    case 'boolean':
      return {
        isValid: typeof value === 'boolean',
        message: `${definition.label}必须是布尔值`,
      }

    case 'array':
      return {
        isValid: Array.isArray(value),
        message: `${definition.label}必须是数组`,
      }

    case 'object':
      return {
        isValid: typeof value === 'object' && value !== null && !Array.isArray(value),
        message: `${definition.label}必须是对象`,
      }

    default:
      return { isValid: true }
  }
}

// 生成建议和信息
function generateSuggestions(
  value: unknown,
  definition: PropertyDefinition
): {
  warnings: ValidationWarning[]
  info: ValidationInfo[]
} {
  const warnings: ValidationWarning[] = []
  const info: ValidationInfo[] = []

  const stringValue = String(value)

  // 长度建议
  if (definition.type === 'string' && stringValue.length > 50) {
    warnings.push({
      property: definition.key,
      type: 'length',
      message: `${definition.label}较长，可能影响显示效果`,
      value,
      suggestion: '考虑缩短文本或使用多行显示',
    })
  }

  // 性能建议
  if (definition.type === 'image' && typeof value === 'string') {
    if (value.includes('data:image')) {
      warnings.push({
        property: definition.key,
        type: 'performance',
        message: '使用Base64图片可能影响性能',
        value,
        suggestion: '建议使用外部图片URL',
      })
    }
  }

  // 最佳实践建议
  if (definition.key === 'alt' && !stringValue) {
    warnings.push({
      property: definition.key,
      type: 'accessibility',
      message: '缺少alt属性可能影响可访问性',
      value,
      suggestion: '建议为图片添加描述性的alt文本',
    })
  }

  // 信息提示
  if (definition.description && !definition.validation?.find(rule => rule.type === 'required')) {
    info.push({
      property: definition.key,
      type: 'hint',
      message: definition.description,
      value,
    })
  }

  return { warnings, info }
}

// 验证结果展示组件
interface ValidationDisplayProps {
  result: ValidationResult
  showWarnings?: boolean
  showInfo?: boolean
  compact?: boolean
  className?: string
}

export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  result,
  showWarnings = true,
  showInfo = false,
  compact = false,
  className,
}) => {
  const { isValid, errors, warnings, info } = result

  if (isValid && !showWarnings && !showInfo) {
    return null
  }

  // 计算验证进度
  const totalIssues =
    errors.length + (showWarnings ? warnings.length : 0) + (showInfo ? info.length : 0)
  const errorCount = errors.length
  const progressPercent = totalIssues > 0 ? ((totalIssues - errorCount) / totalIssues) * 100 : 100

  if (compact) {
    // 紧凑模式
    return (
      <div className={cn('validation-display-compact space-y-1', className)}>
        {errors.map((error, index) => (
          <Alert key={`error-${index}`} variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              {error.property}: {error.message}
            </AlertDescription>
          </Alert>
        ))}
        {showWarnings &&
          warnings.map((warning, index) => (
            <Alert key={`warning-${index}`} variant="default" className="border-yellow-200 py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {warning.property}: {warning.message}
              </AlertDescription>
            </Alert>
          ))}
        {showInfo &&
          info.map((infoItem, index) => (
            <Alert key={`info-${index}`} variant="default" className="border-blue-200 py-2">
              <Info className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {infoItem.property}: {infoItem.message}
              </AlertDescription>
            </Alert>
          ))}
      </div>
    )
  }

  // 完整模式
  return (
    <div className={cn('validation-display space-y-4', className)}>
      {/* 验证进度 */}
      {totalIssues > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">验证状态</span>
            <Badge variant={isValid ? 'default' : 'destructive'} className="text-xs">
              {isValid ? '通过' : '未通过'}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{errorCount} 个错误</span>
            {showWarnings && <span>{warnings.length} 个警告</span>}
            {showInfo && <span>{info.length} 个提示</span>}
          </div>
        </div>
      )}

      {/* 错误列表 */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            错误 ({errors.length})
          </div>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <Alert key={`error-${index}`} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium">{error.property}:</span> {error.message}
                    </div>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {error.type}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* 警告列表 */}
      {showWarnings && warnings.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            警告 ({warnings.length})
          </div>
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <Alert key={`warning-${index}`} variant="default" className="border-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <span className="font-medium">{warning.property}:</span> {warning.message}
                    {warning.suggestion && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        建议: {warning.suggestion}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* 信息列表 */}
      {showInfo && info.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <Info className="h-4 w-4" />
            提示 ({info.length})
          </div>
          <div className="space-y-2">
            {info.map((infoItem, index) => (
              <Alert key={`info-${index}`} variant="default" className="border-blue-200">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">{infoItem.property}:</span> {infoItem.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* 验证通过 */}
      {isValid && errors.length === 0 && (
        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
          <CheckCircle className="h-4 w-4" />
          验证通过
        </div>
      )}
    </div>
  )
}
