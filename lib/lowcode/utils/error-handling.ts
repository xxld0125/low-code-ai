/**
 * 错误处理工具函数
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import { ValidationError } from '../validation/style-validator'

// 应用错误接口
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  stack?: string
  timestamp: number
}

// 错误类型枚举
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  RUNTIME = 'RUNTIME',
  COMPONENT = 'COMPONENT',
  PERMISSION = 'PERMISSION',
  SYSTEM = 'SYSTEM',
}

// 创建应用错误
export const createAppError = (
  code: string,
  message: string,
  details?: Record<string, unknown>,
  error?: Error
): AppError => {
  return {
    code,
    message,
    details,
    stack: error?.stack,
    timestamp: Date.now(),
  }
}

// 创建安全的包装函数
export const createSafeHandler = <T extends (...args: unknown[]) => unknown>(
  handler: T,
  errorHandler?: (error: Error) => void
): ((...args: Parameters<T>) => ReturnType<T> | undefined) => {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      return handler(...args) as ReturnType<T>
    } catch (error) {
      const appError = error instanceof Error ? error : new Error(String(error))

      if (errorHandler) {
        errorHandler(appError)
      } else {
        console.error('Error in safe handler:', appError)
      }

      return undefined
    }
  }
}

// 创建异步安全包装函数
export const createSafeAsyncHandler = <T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T,
  errorHandler?: (error: Error) => void
): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    try {
      return (await handler(...args)) as ReturnType<T>
    } catch (error) {
      const appError = error instanceof Error ? error : new Error(String(error))

      if (errorHandler) {
        errorHandler(appError)
      } else {
        console.error('Error in safe async handler:', appError)
      }

      return undefined
    }
  }
}

// 格式化验证错误
export const formatValidationError = (error: ValidationError): string => {
  const { property, rule, message, suggestion } = error

  let formattedMessage = `[${property}] ${message}`

  if (rule.config && Object.keys(rule.config).length > 0) {
    const configStr = Object.entries(rule.config)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
    formattedMessage += ` (配置: ${configStr})`
  }

  if (suggestion) {
    formattedMessage += ` 建议: ${suggestion}`
  }

  return formattedMessage
}

// 批量格式化验证错误
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) {
    return ''
  }

  if (errors.length === 1) {
    return formatValidationError(errors[0])
  }

  const formattedErrors = errors.map(formatValidationError)
  return `发现 ${errors.length} 个验证错误:\n${formattedErrors.map((err, index) => `${index + 1}. ${err}`).join('\n')}`
}

// 检查错误是否为网络错误
export const isNetworkError = (error: Error): boolean => {
  return (
    error.message.includes('Network') ||
    error.message.includes('fetch') ||
    error.message.includes('timeout') ||
    error.message.includes('AbortError')
  )
}

// 检查错误是否为权限错误
export const isPermissionError = (error: Error): boolean => {
  return (
    error.message.includes('Permission') ||
    error.message.includes('Unauthorized') ||
    error.message.includes('Forbidden') ||
    error.message.includes('401') ||
    error.message.includes('403')
  )
}

// 检查错误是否为验证错误
export const isValidationError = (error: Error): boolean => {
  return (
    error.message.includes('validation') ||
    error.message.includes('required') ||
    error.message.includes('invalid') ||
    // 检查错误代码是否匹配验证错误标识
    (error as Error & { code?: string }).code === 'VALIDATION_ERROR'
  )
}

// 错误边界组件的错误处理器
export const handleErrorBoundary = (error: Error, errorInfo: unknown): AppError => {
  const appError = createAppError(
    'COMPONENT_ERROR',
    `组件渲染错误: ${error.message}`,
    {
      componentStack: (errorInfo as { componentStack?: string }).componentStack,
      errorBoundary: true,
    },
    error
  )

  console.error('Error Boundary caught:', appError)

  return appError
}

// 创建错误报告
export const createErrorReport = (
  errors: Array<AppError | ValidationError>
): {
  summary: {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
  }
  details: Array<{
    id: string
    type: string
    message: string
    timestamp: number
    details?: Record<string, unknown>
  }>
} => {
  const summary = {
    total: errors.length,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
  }

  const details = errors.map((error, index) => {
    const errorId = `error-${Date.now()}-${index}`
    const errorType = 'rule' in error ? 'validation' : 'app'
    const severity = 'rule' in error ? error.rule.severity : 'error'

    summary.byType[errorType] = (summary.byType[errorType] || 0) + 1
    summary.bySeverity[severity] = (summary.bySeverity[severity] || 0) + 1

    return {
      id: errorId,
      type: errorType,
      message: 'rule' in error ? formatValidationError(error) : error.message,
      timestamp: Date.now(),
      details: (error as AppError).details || ('rule' in error ? { rule: error.rule } : undefined),
    }
  })

  return { summary, details }
}

// 防抖错误处理
export const createDebouncedErrorHandler = (
  handler: (error: Error) => void,
  delay: number = 1000
) => {
  let timeoutId: NodeJS.Timeout | null = null
  const pendingErrors: Error[] = []

  return (error: Error) => {
    pendingErrors.push(error)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      if (pendingErrors.length === 1) {
        handler(pendingErrors[0])
      } else {
        // 合并多个错误为一个报告
        const combinedError = new Error(
          `发现 ${pendingErrors.length} 个错误: ${pendingErrors.map(e => e.message).join('; ')}`
        )
        combinedError.name = 'CombinedError'
        ;(combinedError as Error & { errors: unknown[] }).errors = pendingErrors
        handler(combinedError)
      }

      pendingErrors.length = 0
      timeoutId = null
    }, delay)
  }
}

// 创建重试机制
export const createRetryHandler = <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    backoff?: number
    shouldRetry?: (error: Error) => boolean
  } = {}
) => {
  const { maxRetries = 3, delay = 1000, backoff = 2, shouldRetry = () => true } = options

  return async (): Promise<T> => {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt === maxRetries || !shouldRetry(lastError)) {
          throw lastError
        }

        const retryDelay = delay * Math.pow(backoff, attempt)
        await new Promise(resolve => setTimeout(resolve, retryDelay))

        console.warn(
          `操作失败，${retryDelay}ms后重试 (${attempt + 1}/${maxRetries}):`,
          lastError.message
        )
      }
    }

    throw lastError!
  }
}

// 全局错误处理器
class GlobalErrorHandler {
  private listeners: Set<(error: AppError) => void> = new Set()
  private reportBuffer: AppError[] = []
  private maxBufferSize = 100

  // 添加错误监听器
  addListener(listener: (error: AppError) => void): void {
    this.listeners.add(listener)
  }

  // 移除错误监听器
  removeListener(listener: (error: AppError) => void): void {
    this.listeners.delete(listener)
  }

  // 处理错误
  handleError(error: Error | AppError, context?: Record<string, unknown>): void {
    const appError =
      'code' in error
        ? (error as AppError)
        : createAppError('GLOBAL_ERROR', error.message, context, error)

    // 添加到缓冲区
    this.reportBuffer.push(appError)
    if (this.reportBuffer.length > this.maxBufferSize) {
      this.reportBuffer.shift()
    }

    // 通知所有监听器
    this.listeners.forEach(listener => {
      try {
        listener(appError)
      } catch (handlerError) {
        console.error('Error in global error listener:', handlerError)
      }
    })

    // 默认处理
    console.error('Global error handled:', appError)
  }

  // 获取错误报告
  getErrorReport() {
    return createErrorReport(this.reportBuffer)
  }

  // 清空错误缓冲区
  clearErrors(): void {
    this.reportBuffer.length = 0
  }
}

// 创建全局错误处理器实例
export const globalErrorHandler = new GlobalErrorHandler()

// 初始化全局错误处理
if (typeof window !== 'undefined') {
  window.addEventListener('error', event => {
    globalErrorHandler.handleError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener('unhandledrejection', event => {
    globalErrorHandler.handleError(new Error(`Unhandled promise rejection: ${event.reason}`), {
      reason: event.reason,
    })
  })
}
