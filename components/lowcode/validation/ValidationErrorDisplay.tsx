/**
 * 验证错误显示组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T125 - 完善验证错误的UI显示机制
 * 创建日期: 2025-10-30
 */

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AlertTriangle, Info, XCircle } from 'lucide-react'

// 验证错误类型
export type ValidationErrorType = 'error' | 'warning' | 'info' | 'success'

// 验证错误项接口
export interface ValidationErrorItem {
  type: ValidationErrorType
  message: string
  code?: string
  field?: string
  rule?: string
}

// 验证错误显示组件属性
export interface ValidationErrorDisplayProps {
  // 错误列表
  errors?: ValidationErrorItem[]

  // 显示配置
  showIcon?: boolean
  showBadge?: boolean
  showField?: boolean
  dismissible?: boolean

  // 样式配置
  variant?: 'default' | 'compact' | 'detailed'
  maxItems?: number
  className?: string

  // 事件处理
  onDismiss?: (error: ValidationErrorItem) => void
  onRetry?: (error: ValidationErrorItem) => void
  onViewDetails?: (error: ValidationErrorItem) => void
}

// 获取错误类型对应的图标
const getErrorIcon = (type: ValidationErrorType) => {
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />
    case 'info':
      return <Info className="h-4 w-4" />
    case 'success':
      return null // 成功通常不显示图标
  }
}

// 获取错误类型对应的样式
const getErrorStyles = (type: ValidationErrorType) => {
  switch (type) {
    case 'error':
      return {
        alert: 'destructive',
        text: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        badge: 'destructive'
      }
    case 'warning':
      return {
        alert: 'default',
        text: 'text-yellow-600',
        bg: 'bg-yellow-50 border-yellow-200',
        badge: 'secondary'
      }
    case 'info':
      return {
        alert: 'default',
        text: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200',
        badge: 'secondary'
      }
    case 'success':
      return {
        alert: 'default',
        text: 'text-green-600',
        bg: 'bg-green-50 border-green-200',
        badge: 'default'
      }
  }
}

// 获取错误类型对应的标签
const getErrorLabel = (type: ValidationErrorType) => {
  switch (type) {
    case 'error':
      return '错误'
    case 'warning':
      return '警告'
    case 'info':
      return '提示'
    case 'success':
      return '成功'
  }
}

export const ValidationErrorDisplay: React.FC<ValidationErrorDisplayProps> = ({
  errors = [],
  showIcon = true,
  showBadge = true,
  showField = false,
  dismissible = false,
  variant = 'default',
  maxItems = 5,
  className,
  onDismiss,
  onRetry,
  onViewDetails,
}) => {
  if (!errors || errors.length === 0) {
    return null
  }

  // 按类型分组错误
  const groupedErrors = errors.reduce((groups, error) => {
    if (!groups[error.type]) {
      groups[error.type] = []
    }
    groups[error.type].push(error)
    return groups
  }, {} as Record<ValidationErrorType, ValidationErrorItem[]>)

  // 限制显示数量
  const displayedErrors = errors.slice(0, maxItems)
  const hasMore = errors.length > maxItems

  // 渲染单个错误项
  const renderErrorItem = (error: ValidationErrorItem, index: number) => {
    const styles = getErrorStyles(error.type)
    const label = getErrorLabel(error.type)

    return (
      <div
        key={`${error.type}-${index}`}
        className={cn(
          'flex items-start gap-2 p-2 rounded-md border',
          styles.bg,
          variant === 'compact' && 'py-1 px-2'
        )}
      >
        {showIcon && (
          <div className={cn('mt-0.5 flex-shrink-0', styles.text)}>
            {getErrorIcon(error.type)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {showBadge && (
              <Badge variant={styles.badge as any} className="text-xs">
                {label}
              </Badge>
            )}

            {error.field && showField && (
              <Badge variant="outline" className="text-xs">
                {error.field}
              </Badge>
            )}
          </div>

          <p className={cn('text-sm mt-1', styles.text)}>
            {error.message}
          </p>

          {variant === 'detailed' && error.rule && (
            <p className="text-xs text-muted-foreground mt-1">
              规则: {error.rule}
            </p>
          )}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={() => onDismiss(error)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors"
            aria-label=" dismiss error"
          >
            <XCircle className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  // 渲染默认变体
  if (variant === 'default') {
    // 按类型显示错误
    return (
      <div className={cn('space-y-2', className)}>
        {Object.entries(groupedErrors).map(([type, typeErrors]) => {
          const styles = getErrorStyles(type as ValidationErrorType)
          const label = getErrorLabel(type as ValidationErrorType)

          return (
            <Alert key={type} variant={styles.alert as any}>
              {showIcon && getErrorIcon(type as ValidationErrorType)}
              <AlertDescription>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {showBadge && (
                      <Badge variant={styles.badge as any} className="text-xs">
                        {label} ({typeErrors.length})
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {typeErrors.slice(0, maxItems).map((error, index) => (
                      <div key={index} className="text-sm">
                        {error.field && showField && (
                          <span className="font-medium">{error.field}: </span>
                        )}
                        {error.message}
                      </div>
                    ))}

                    {typeErrors.length > maxItems && (
                      <div className="text-xs text-muted-foreground">
                        还有 {typeErrors.length - maxItems} 个{label}...
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )
        })}
      </div>
    )
  }

  // 渲染紧凑变体
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-1', className)}>
        {displayedErrors.map((error, index) => renderErrorItem(error, index))}
        {hasMore && (
          <div className="text-xs text-muted-foreground text-center py-1">
            还有 {errors.length - maxItems} 个验证问题...
          </div>
        )}
      </div>
    )
  }

  // 渲染详细变体
  return (
    <div className={cn('space-y-2', className)}>
      {displayedErrors.map((error, index) => (
        <div key={index} className="border rounded-lg p-3">
          {renderErrorItem(error, index)}

          {(onRetry || onViewDetails) && (
            <div className="flex gap-2 mt-2">
              {onRetry && (
                <button
                  onClick={() => onRetry(error)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  重试
                </button>
              )}
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(error)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  查看详情
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {hasMore && (
        <div className="text-center text-sm text-muted-foreground py-2 border">
          还有 {errors.length - maxItems} 个验证问题未显示
        </div>
      )}
    </div>
  )
}

// 便捷组件：表单验证错误显示
export interface FormValidationErrorDisplayProps extends Omit<ValidationErrorDisplayProps, 'errors'> {
  formErrors?: Record<string, string>
  fieldLabels?: Record<string, string>
}

export const FormValidationErrorDisplay: React.FC<FormValidationErrorDisplayProps> = ({
  formErrors = {},
  fieldLabels = {},
  ...props
}) => {
  const errors: ValidationErrorItem[] = Object.entries(formErrors).map(([field, message]) => ({
    type: 'error' as const,
    message,
    field: fieldLabels[field] || field,
    code: 'FORM_VALIDATION_ERROR'
  }))

  return <ValidationErrorDisplay errors={errors} {...props} />
}

// 便捷组件：字段验证错误显示
export interface FieldValidationErrorDisplayProps {
  error?: string
  field?: string
  type?: ValidationErrorType
  showIcon?: boolean
  className?: string
}

export const FieldValidationErrorDisplay: React.FC<FieldValidationErrorDisplayProps> = ({
  error,
  field,
  type = 'error',
  showIcon = true,
  className
}) => {
  if (!error) return null

  const styles = getErrorStyles(type)

  return (
    <div className={cn('flex items-center gap-1 mt-1', className)}>
      {showIcon && (
        <div className={cn('flex-shrink-0', styles.text)}>
          {getErrorIcon(type)}
        </div>
      )}
      <p className={cn('text-sm', styles.text)} role="alert">
        {error}
      </p>
    </div>
  )
}

export default ValidationErrorDisplay