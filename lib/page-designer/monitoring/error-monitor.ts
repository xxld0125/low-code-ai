/**
 * 页面设计器错误监控和日志系统
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 监控错误、记录日志、提供调试信息
 */

// 错误级别
export type ErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// 错误类型
export type ErrorType =
  | 'component'
  | 'drag_drop'
  | 'layout'
  | 'performance'
  | 'network'
  | 'validation'
  | 'rendering'
  | 'user_interaction'
  | 'system'

// 错误信息
export interface ErrorInfo {
  id: string
  timestamp: number
  level: ErrorLevel
  type: ErrorType
  message: string
  stack?: string
  component?: string
  userId?: string
  sessionId: string
  userAgent: string
  url: string
  additionalData?: Record<string, any>
}

// 日志条目
export interface LogEntry {
  id: string
  timestamp: number
  level: ErrorLevel
  category: string
  message: string
  data?: any
  source: string
}

// 监控配置
export interface MonitoringConfig {
  enableConsoleLogging: boolean
  enableRemoteLogging: boolean
  enablePerformanceMonitoring: boolean
  maxLogEntries: number
  logLevel: ErrorLevel
  remoteEndpoint?: string
  samplingRate: number
  enableUserTracking: boolean
}

// 性能指标
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  interactionTime: number
  memoryUsage: number
  errorCount: number
  warningCount: number
}

/**
 * 错误监控器
 */
export class ErrorMonitor {
  private config: MonitoringConfig
  private errorLog: ErrorInfo[]
  private logEntries: LogEntry[]
  private sessionId: string
  private userId?: string
  private errorCounts: Map<string, number>
  private performanceMetrics: PerformanceMetrics

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      enablePerformanceMonitoring: true,
      maxLogEntries: 1000,
      logLevel: 'info',
      samplingRate: 1.0,
      enableUserTracking: false,
      ...config,
    }

    this.errorLog = []
    this.logEntries = []
    this.sessionId = this.generateSessionId()
    this.errorCounts = new Map()
    this.performanceMetrics = {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
      memoryUsage: 0,
      errorCount: 0,
      warningCount: 0,
    }

    this.initialize()
  }

  /**
   * 初始化监控器
   */
  private initialize(): void {
    // 设置全局错误处理
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this))
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))

      // 监控性能
      if (this.config.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring()
      }
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 处理全局错误
   */
  private handleGlobalError(event: ErrorEvent): void {
    this.logError({
      level: 'error',
      type: 'system',
      message: event.message,
      stack: event.error?.stack,
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    })
  }

  /**
   * 处理未捕获的Promise拒绝
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.logError({
      level: 'error',
      type: 'system',
      message: 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      additionalData: {
        reason: event.reason,
      },
    })
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    // 监控页面加载性能
    if (performance.timing) {
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
        this.performanceMetrics.loadTime = loadTime
        this.log('info', 'performance', `Page load time: ${loadTime}ms`)
      })
    }

    // 监控内存使用情况
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.performanceMetrics.memoryUsage = memory.usedJSHeapSize
        this.log(
          'debug',
          'performance',
          `Memory usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`
        )
      }, 30000) // 每30秒记录一次
    }
  }

  /**
   * 记录错误
   */
  public logError(errorInfo: Partial<ErrorInfo>): void {
    const error: ErrorInfo = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'error',
      type: 'system',
      message: 'Unknown error',
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...errorInfo,
    }

    // 更新错误计数
    const errorKey = `${error.type}:${error.message}`
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1)

    // 添加到错误日志
    this.errorLog.push(error)

    // 限制日志条目数量
    if (this.errorLog.length > this.config.maxLogEntries) {
      this.errorLog = this.errorLog.slice(-this.config.maxLogEntries)
    }

    // 更新性能指标
    this.performanceMetrics.errorCount++

    // 输出到控制台
    if (this.config.enableConsoleLogging) {
      console.error(`[${error.type.toUpperCase()}] ${error.message}`, error)
    }

    // 发送到远程服务器
    if (this.config.enableRemoteLogging && this.shouldSample()) {
      this.sendErrorToRemote(error)
    }
  }

  /**
   * 记录日志
   */
  public log(level: ErrorLevel, category: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return

    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      source: 'page-designer',
    }

    // 添加到日志
    this.logEntries.push(logEntry)

    // 限制日志条目数量
    if (this.logEntries.length > this.config.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.config.maxLogEntries)
    }

    // 更新性能指标
    if (level === 'warn') {
      this.performanceMetrics.warningCount++
    }

    // 输出到控制台
    if (this.config.enableConsoleLogging) {
      const logMethod =
        level === 'debug'
          ? console.debug
          : level === 'info'
            ? console.info
            : level === 'warn'
              ? console.warn
              : console.error
      logMethod(`[${category.toUpperCase()}] ${message}`, data)
    }

    // 发送到远程服务器
    if (this.config.enableRemoteLogging && this.shouldSample()) {
      this.sendLogToRemote(logEntry)
    }
  }

  /**
   * 记录组件错误
   */
  public logComponentError(componentName: string, error: Error, additionalData?: any): void {
    this.logError({
      level: 'error',
      type: 'component',
      message: `Component error: ${componentName}`,
      stack: error.stack,
      component: componentName,
      additionalData,
    })
  }

  /**
   * 记录拖拽错误
   */
  public logDragDropError(operation: string, error: Error, context?: any): void {
    this.logError({
      level: 'error',
      type: 'drag_drop',
      message: `Drag & drop error: ${operation}`,
      stack: error.stack,
      additionalData: { operation, ...context },
    })
  }

  /**
   * 记录性能指标
   */
  public logPerformanceMetric(metric: string, value: number, unit: string = 'ms'): void {
    this.log('info', 'performance', `${metric}: ${value}${unit}`, { metric, value, unit })
  }

  /**
   * 记录用户交互
   */
  public logUserInteraction(action: string, target: string, data?: any): void {
    this.log('info', 'user_interaction', `${action} on ${target}`, data)
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: ErrorLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal']
    const currentLevelIndex = levels.indexOf(this.config.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  /**
   * 检查是否应该采样
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate
  }

  /**
   * 发送错误到远程服务器
   */
  private async sendErrorToRemote(error: ErrorInfo): Promise<void> {
    if (!this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'error',
          data: error,
        }),
      })
    } catch (err) {
      console.warn('Failed to send error to remote server:', err)
    }
  }

  /**
   * 发送日志到远程服务器
   */
  private async sendLogToRemote(logEntry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'log',
          data: logEntry,
        }),
      })
    } catch (err) {
      console.warn('Failed to send log to remote server:', err)
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 设置用户ID
   */
  public setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * 获取错误统计
   */
  public getErrorStats(): {
    totalErrors: number
    totalWarnings: number
    errorsByType: Record<string, number>
    recentErrors: ErrorInfo[]
  } {
    const errorsByType: Record<string, number> = {}
    this.errorCounts.forEach((count, key) => {
      errorsByType[key] = count
    })

    return {
      totalErrors: this.performanceMetrics.errorCount,
      totalWarnings: this.performanceMetrics.warningCount,
      errorsByType,
      recentErrors: this.errorLog.slice(-10),
    }
  }

  /**
   * 获取性能指标
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics }
  }

  /**
   * 获取日志条目
   */
  public getLogEntries(level?: ErrorLevel, category?: string, limit?: number): LogEntry[] {
    let entries = this.logEntries

    if (level) {
      entries = entries.filter(entry => entry.level === level)
    }

    if (category) {
      entries = entries.filter(entry => entry.category === category)
    }

    if (limit) {
      entries = entries.slice(-limit)
    }

    return entries
  }

  /**
   * 清理日志
   */
  public clearLogs(): void {
    this.errorLog = []
    this.logEntries = []
    this.errorCounts.clear()
  }

  /**
   * 导出日志
   */
  public exportLogs(): string {
    const exportData = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      errors: this.errorLog,
      logs: this.logEntries,
      performanceMetrics: this.performanceMetrics,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// 创建全局错误监控器实例
export const errorMonitor = new ErrorMonitor()

/**
 * React错误边界Hook
 */
export const useErrorBoundary = () => {
  const handleError = (error: Error, errorInfo: any) => {
    errorMonitor.logComponentError(errorInfo.componentStack || 'Unknown Component', error, {
      errorInfo,
    })
  }

  return { handleError }
}

export default errorMonitor
