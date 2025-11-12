/**
 * 错误处理和日志管理
 * 提供统一的错误处理和日志记录功能
 */

export interface ErrorContext {
  componentId?: string
  propertyPath?: string
  operation?: string
  userId?: string
  sessionId?: string
  timestamp?: number
}

export interface ErrorReport {
  id: string
  type: 'error' | 'warning' | 'info'
  code: string
  message: string
  details?: Record<string, unknown>
  context: ErrorContext
  stack?: string
  recoverable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private errorReports: ErrorReport[] = []
  private errorCallbacks: Set<(error: ErrorReport) => void> = new Set()
  private maxErrorHistory = 1000

  constructor() {
    this.setupGlobalErrorHandlers()
  }

  /**
   * 记录错误
   */
  reportError(
    code: string,
    message: string,
    context: ErrorContext = {},
    details?: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: this.generateId(),
      type: 'error',
      code,
      message,
      details,
      context: {
        ...context,
        timestamp: context.timestamp || Date.now(),
      },
      stack: new Error().stack,
      recoverable: this.isRecoverableError(code),
      severity,
      timestamp: Date.now(),
    }

    this.addErrorReport(errorReport)
    return errorReport
  }

  /**
   * 记录警告
   */
  reportWarning(
    code: string,
    message: string,
    context: ErrorContext = {},
    details?: Record<string, unknown>
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: this.generateId(),
      type: 'warning',
      code,
      message,
      details,
      context: {
        ...context,
        timestamp: context.timestamp || Date.now(),
      },
      recoverable: true,
      severity: 'low',
      timestamp: Date.now(),
    }

    this.addErrorReport(errorReport)
    return errorReport
  }

  /**
   * 记录信息
   */
  reportInfo(
    code: string,
    message: string,
    context: ErrorContext = {},
    details?: Record<string, unknown>
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: this.generateId(),
      type: 'info',
      code,
      message,
      details,
      context: {
        ...context,
        timestamp: context.timestamp || Date.now(),
      },
      recoverable: true,
      severity: 'low',
      timestamp: Date.now(),
    }

    this.addErrorReport(errorReport)
    return errorReport
  }

  /**
   * 处理异步错误
   */
  async handleAsyncError<T>(
    promise: Promise<T>,
    context: ErrorContext = {},
    errorMessage = '异步操作失败'
  ): Promise<{ success: true; data: T } | { success: false; error: ErrorReport }> {
    try {
      const data = await promise
      return { success: true, data }
    } catch (error) {
      const errorReport = this.reportError(
        'ASYNC_ERROR',
        errorMessage,
        context,
        { originalError: error instanceof Error ? error.message : String(error) },
        'medium'
      )
      return { success: false, error: errorReport }
    }
  }

  /**
   * 包装函数以捕获错误
   */
  wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    context: ErrorContext = {},
    errorMessage?: string
  ): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args)

        // 如果返回Promise，处理异步错误
        if (result && typeof result.catch === 'function') {
          return result.catch((error: unknown) => {
            this.reportError(
              'FUNCTION_ERROR',
              errorMessage || '函数执行失败',
              context,
              { args, originalError: error instanceof Error ? error.message : String(error) }
            )
            throw error
          })
        }

        return result
      } catch (error) {
        this.reportError(
          'FUNCTION_ERROR',
          errorMessage || '函数执行失败',
          context,
          { args, originalError: error instanceof Error ? error.message : String(error) }
        )
        throw error
      }
    }) as T
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(options: {
    type?: 'error' | 'warning' | 'info'
    severity?: 'low' | 'medium' | 'high' | 'critical'
    limit?: number
    componentId?: string
  } = {}): ErrorReport[] {
    let filtered = this.errorReports

    if (options.type) {
      filtered = filtered.filter(report => report.type === options.type)
    }

    if (options.severity) {
      filtered = filtered.filter(report => report.severity === options.severity)
    }

    if (options.componentId) {
      filtered = filtered.filter(report => report.context.componentId === options.componentId)
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit)
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number
    errors: number
    warnings: number
    info: number
    bySeverity: Record<string, number>
    byCode: Record<string, number>
  } {
    const stats = {
      total: this.errorReports.length,
      errors: 0,
      warnings: 0,
      info: 0,
      bySeverity: {} as Record<string, number>,
      byCode: {} as Record<string, number>,
    }

    this.errorReports.forEach(report => {
      // 按类型统计
      if (report.type === 'error') stats.errors++
      else if (report.type === 'warning') stats.warnings++
      else if (report.type === 'info') stats.info++

      // 按严重程度统计
      stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1

      // 按错误代码统计
      stats.byCode[report.code] = (stats.byCode[report.code] || 0) + 1
    })

    return stats
  }

  /**
   * 清除错误历史
   */
  clearHistory(before?: number): void {
    if (before) {
      this.errorReports = this.errorReports.filter(report => report.timestamp > before)
    } else {
      this.errorReports = []
    }
  }

  /**
   * 注册错误回调
   */
  onError(callback: (error: ErrorReport) => void): () => void {
    this.errorCallbacks.add(callback)
    return () => this.errorCallbacks.delete(callback)
  }

  /**
   * 导出错误报告
   */
  exportReports(): string {
    return JSON.stringify(this.errorReports, null, 2)
  }

  // 私有方法

  private addErrorReport(errorReport: ErrorReport): void {
    this.errorReports.push(errorReport)

    // 限制历史记录数量
    if (this.errorReports.length > this.maxErrorHistory) {
      this.errorReports = this.errorReports.slice(-this.maxErrorHistory)
    }

    // 通知回调
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorReport)
      } catch (error) {
        console.error('错误回调执行失败:', error)
      }
    })

    // 控制台输出
    if (errorReport.type === 'error') {
      console.error('[PropertyConfig]', errorReport.message, errorReport)
    } else if (errorReport.type === 'warning') {
      console.warn('[PropertyConfig]', errorReport.message, errorReport)
    } else {
      console.info('[PropertyConfig]', errorReport.message, errorReport)
    }
  }

  private setupGlobalErrorHandlers(): void {
    // 处理未捕获的Promise拒绝
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.reportError(
          'UNHANDLED_PROMISE_REJECTION',
          '未处理的Promise拒绝',
          {},
          { reason: event.reason }
        )
      })
    }
  }

  private isRecoverableError(code: string): boolean {
    const recoverableCodes = [
      'VALIDATION_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'PERMISSION_DENIED',
    ]
    return recoverableCodes.includes(code)
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler()