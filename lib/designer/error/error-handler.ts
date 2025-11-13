/**
 * 综合错误处理和用户反馈系统
 */

// 错误类型定义
export interface PropertyError {
  id: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  category: 'validation' | 'network' | 'system' | 'user'
  timestamp: Date
  context?: any
  stack?: string
  userMessage?: string
  actions?: ErrorAction[]
}

export interface ErrorAction {
  id: string
  label: string
  action: () => void | Promise<void>
  style?: 'primary' | 'secondary' | 'danger'
}

// 错误处理器类
export class PropertyErrorHandler {
  private errors: PropertyError[] = []
  private listeners: Set<(errors: PropertyError[]) => void> = new Set()
  private maxErrors = 100

  // 添加错误
  addError(error: Omit<PropertyError, 'id' | 'timestamp'>): void {
    const propertyError: PropertyError = {
      ...error,
      id: this.generateId(),
      timestamp: new Date()
    }

    this.errors.unshift(propertyError)

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    this.notifyListeners()
  }

  // 移除错误
  removeError(id: string): boolean {
    const index = this.errors.findIndex(e => e.id === id)
    if (index > -1) {
      this.errors.splice(index, 1)
      this.notifyListeners()
      return true
    }
    return false
  }

  // 清除错误
  clearErrors(): void {
    this.errors = []
    this.notifyListeners()
  }

  // 获取错误
  getErrors(): PropertyError[] {
    return [...this.errors]
  }

  // 订阅错误变化
  subscribe(listener: (errors: PropertyError[]) => void): () => void {
    this.listeners.add(listener)
    listener(this.errors)

    return () => {
      this.listeners.delete(listener)
    }
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.errors))
  }
}

// 全局错误处理器实例
export const globalErrorHandler = new PropertyErrorHandler()

// 便捷函数
export const addPropertyError = (error: Omit<PropertyError, 'id' | 'timestamp'>): void => {
  globalErrorHandler.addError(error)
}

export const clearPropertyErrors = (): void => {
  globalErrorHandler.clearErrors()
}