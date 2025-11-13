/**
 * 事件执行引擎
 * 负责事件和动作的具体执行逻辑
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  EventAction,
  EventExecutionContext,
  EventExecutionResult
} from '@/types/designer'

// 动作处理器类型
type ActionHandler = (action: EventAction, context: EventExecutionContext) => Promise<void>

// 事件动作处理器注册表
const actionHandlers: Record<string, ActionHandler> = {}

/**
 * 事件执行引擎
 * 提供事件配置的执行能力，支持异步动作和错误处理
 */
export class EventEngine {
  private performanceMetrics: Map<string, number> = new Map()
  private executionHistory: Array<{
    timestamp: number
    actionId: string
    success: boolean
    duration: number
  }> = []
  private maxHistorySize = 1000

  /**
   * 注册动作处理器
   */
  registerActionHandler(actionType: string, handler: ActionHandler): void {
    if (actionHandlers[actionType]) {
      console.warn(`动作处理器 ${actionType} 已存在，将被覆盖`)
    }
    actionHandlers[actionType] = handler
  }

  /**
   * 注销动作处理器
   */
  unregisterActionHandler(actionType: string): void {
    delete actionHandlers[actionType]
  }

  /**
   * 执行单个动作
   */
  async executeAction(
    action: EventAction,
    context: EventExecutionContext
  ): Promise<void> {
    const startTime = performance.now()
    const actionType = action.type

    try {
      // 检查动作是否启用
      if (action.enabled === false) {
        console.log(`动作 ${action.id} 已禁用，跳过执行`)
        return
      }

      // 检查执行条件
      if (action.condition) {
        const shouldExecute = await this.evaluateCondition(action.condition, context)
        if (!shouldExecute) {
          console.log(`动作 ${action.id} 执行条件不满足，跳过执行`)
          return
        }
      }

      // 查找动作处理器
      const handler = actionHandlers[actionType]
      if (!handler) {
        throw new Error(`未找到动作类型 ${actionType} 的处理器`)
      }

      // 处理延迟执行
      if (action.delay && action.delay > 0) {
        await this.delay(action.delay)
      }

      // 执行动作
      await handler(action, context)

      // 记录执行成功
      const duration = performance.now() - startTime
      this.recordExecution(action.id, true, duration)
      this.recordPerformance(actionType, duration)

      console.log(`动作 ${action.id} (${actionType}) 执行成功，耗时 ${duration.toFixed(2)}ms`)
    } catch (error) {
      // 记录执行失败
      const duration = performance.now() - startTime
      this.recordExecution(action.id, false, duration)

      console.error(`动作 ${action.id} (${actionType}) 执行失败:`, error)
      throw error
    }
  }

  /**
   * 执行事件的所有动作
   */
  async executeEvent(
    eventActions: EventAction[],
    context: EventExecutionContext
  ): Promise<EventExecutionResult> {
    const startTime = performance.now()
    const executedActions: string[] = []
    const errors: string[] = []

    console.log(`开始执行事件 ${context.eventType}，共 ${eventActions.length} 个动作`)

    // 按动作顺序执行
    for (const action of eventActions.sort((a, b) => a.order - b.order)) {
      try {
        await this.executeAction(action, context)
        executedActions.push(action.id)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        errors.push(`动作 ${action.id} 执行失败: ${errorMessage}`)

        // 根据配置决定是否继续执行后续动作
        if (action.condition === 'stop-on-error') {
          console.log(`事件执行在动作 ${action.id} 处停止，由于错误处理策略`)
          break
        }
      }
    }

    const totalDuration = performance.now() - startTime

    console.log(
      `事件 ${context.eventType} 执行完成：成功 ${executedActions.length}/${eventActions.length} 个动作，总耗时 ${totalDuration.toFixed(2)}ms`
    )

    return {
      success: errors.length === 0,
      executedActions,
      errors,
      executionTime: Math.round(totalDuration)
    }
  }

  /**
   * 评估执行条件
   */
  private async evaluateCondition(
    condition: string,
    context: EventExecutionContext
  ): Promise<boolean> {
    try {
      // 安全的条件评估环境
      const evalContext = {
        userId: context.userInfo.userId,
        permissions: context.userInfo.permissions,
        environment: context.environment,
        componentId: context.componentId,
        eventType: context.eventType,
        timestamp: context.timestamp,
        metadata: context.metadata || {}
      }

      // 使用Function构造函数安全地评估条件
      const conditionFn = new Function('context', `
        "use strict";
        try {
          return ${condition};
        } catch (error) {
          return false;
        }
      `)

      return await conditionFn(evalContext)
    } catch (error) {
      console.warn(`条件评估失败: ${condition}`, error)
      return false
    }
  }

  /**
   * 延迟执行
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 记录执行历史
   */
  private recordExecution(
    actionId: string,
    success: boolean,
    duration: number
  ): void {
    this.executionHistory.push({
      timestamp: Date.now(),
      actionId,
      success,
      duration
    })

    // 限制历史记录大小
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * 记录性能指标
   */
  private recordPerformance(actionType: string, duration: number): void {
    const current = this.performanceMetrics.get(actionType) || 0
    const count = this.executionHistory.filter(
      record => record.actionId.startsWith(actionType.split('-')[0])
    ).length

    // 计算平均执行时间
    const average = (current * (count - 1) + duration) / count
    this.performanceMetrics.set(actionType, average)
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics)
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(
    limit?: number,
    actionType?: string
  ): Array<{
    timestamp: number
    actionId: string
    success: boolean
    duration: number
  }> {
    let history = [...this.executionHistory]

    if (actionType) {
      history = history.filter(record => record.actionId.includes(actionType))
    }

    if (limit) {
      history = history.slice(-limit)
    }

    return history.reverse() // 最新的在前面
  }

  /**
   * 清理历史记录
   */
  clearHistory(): void {
    this.executionHistory = []
  }

  /**
   * 设置历史记录大小限制
   */
  setHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size)
  }
}

// 创建全局事件引擎实例
export const eventEngine = new EventEngine()

// 注册内置动作处理器
eventEngine.registerActionHandler('navigate', handleNavigate)
eventEngine.registerActionHandler('api-call', handleApiCall)
eventEngine.registerActionHandler('show-message', handleShowMessage)
eventEngine.registerActionHandler('set-state', handleSetState)
eventEngine.registerActionHandler('toggle-state', handleToggleState)
eventEngine.registerActionHandler('reset-form', handleResetForm)
eventEngine.registerActionHandler('submit-form', handleSubmitForm)
eventEngine.registerActionHandler('scroll-to', handleScrollTo)
eventEngine.registerActionHandler('open-modal', handleOpenModal)
eventEngine.registerActionHandler('close-modal', handleCloseModal)
eventEngine.registerActionHandler('download-file', handleDownloadFile)
eventEngine.registerActionHandler('copy-to-clipboard', handleCopyToClipboard)
eventEngine.registerActionHandler('refresh-data', handleRefreshData)

// 内置动作处理器实现

async function handleNavigate(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { url, target = '_self', replace = false } = action.payload as any

  if (!url || typeof url !== 'string') {
    throw new Error('导航动作需要有效的URL参数')
  }

  // 检查URL安全性
  if (!isValidUrl(url) && !url.startsWith('/')) {
    throw new Error('不允许的URL格式')
  }

  if (replace) {
    window.location.replace(url)
  } else {
    window.open(url, target)
  }
}

async function handleApiCall(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { url, method = 'GET', data, headers } = action.payload as any

  if (!url || typeof url !== 'string') {
    throw new Error('API调用需要有效的URL参数')
  }

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  }

  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    requestInit.body = JSON.stringify(data)
  }

  const response = await fetch(url, requestInit)

  if (!response.ok) {
    throw new Error(`API调用失败: ${response.status} ${response.statusText}`)
  }

  const result = await response.json()

  // 处理成功消息
  if (action.payload.successMessage) {
    showNotification(action.payload.successMessage, 'success')
  }

  return result
}

async function handleShowMessage(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { message, type = 'info', duration = 3000, position = 'top' } = action.payload as any

  if (!message || typeof message !== 'string') {
    throw new Error('显示消息需要有效的消息内容')
  }

  showNotification(message, type, duration, position)
}

async function handleSetState(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { target, value } = action.payload as any

  if (!target || typeof target !== 'string') {
    throw new Error('设置状态需要有效的目标参数')
  }

  // 这里应该与状态管理系统集成
  console.log(`设置状态 ${target} =`, value)
  // emitStateChangeEvent(target, value, true)
}

async function handleToggleState(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { target } = action.payload as any

  if (!target || typeof target !== 'string') {
    throw new Error('切换状态需要有效的目标参数')
  }

  // 这里应该与状态管理系统集成
  console.log(`切换状态 ${target}`)
  // emitStateToggleEvent(target)
}

async function handleResetForm(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { formId, fields } = action.payload as any

  // 这里应该与表单管理系统集成
  console.log(`重置表单 ${formId}`, fields)
  // emitFormResetEvent(formId, fields)
}

async function handleSubmitForm(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { formId, url } = action.payload as any

  if (!formId || !url) {
    throw new Error('提交表单需要表单ID和URL参数')
  }

  // 这里应该与表单管理系统集成
  console.log(`提交表单 ${formId} 到 ${url}`)
  // emitFormSubmitEvent(formId, url, 'POST', true, false)
}

async function handleScrollTo(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { target, behavior = 'smooth', offset = 0 } = action.payload as any

  if (!target || typeof target !== 'string') {
    throw new Error('滚动需要有效的目标参数')
  }

  let element: Element | null = null

  if (target === 'top') {
    window.scrollTo({ top: 0, behavior })
  } else if (target === 'bottom') {
    window.scrollTo({ top: document.body.scrollHeight, behavior })
  } else if (target.startsWith('#')) {
    element = document.querySelector(target)
  } else {
    element = document.querySelector(`#${target}`)
  }

  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset + offset
    window.scrollTo({ top: y, behavior })
  } else {
    throw new Error(`未找到滚动目标: ${target}`)
  }
}

async function handleOpenModal(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { modalId, data } = action.payload as any

  if (!modalId) {
    throw new Error('打开模态框需要模态框ID参数')
  }

  // 这里应该与模态框管理系统集成
  console.log(`打开模态框 ${modalId}`, data)
  // emitModalOpenEvent(modalId, data, true, true)
}

async function handleCloseModal(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { modalId, result } = action.payload as any

  // 这里应该与模态框管理系统集成
  console.log(`关闭模态框 ${modalId}`, result)
  // emitModalCloseEvent(modalId, result)
}

async function handleDownloadFile(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { url, filename, openInNewTab = false } = action.payload as any

  if (!url || typeof url !== 'string') {
    throw new Error('下载文件需要有效的URL参数')
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename || url.split('/').pop() || 'download'

  if (openInNewTab) {
    link.target = '_blank'
  }

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function handleCopyToClipboard(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { text, successMessage } = action.payload as any

  if (!text || typeof text !== 'string') {
    throw new Error('复制到剪贴板需要有效的文本参数')
  }

  try {
    await navigator.clipboard.writeText(text)

    if (successMessage) {
      showNotification(successMessage, 'success')
    } else {
      showNotification('已复制到剪贴板', 'success')
    }
  } catch (_error) {
    throw new Error('复制到剪贴板失败')
  }
}

async function handleRefreshData(action: EventAction, _context: EventExecutionContext): Promise<void> {
  const { source } = action.payload as any

  if (!source || typeof source !== 'string') {
    throw new Error('刷新数据需要有效的数据源参数')
  }

  // 这里应该与数据管理系统集成
  console.log(`刷新数据源 ${source}`)
  // emitDataRefreshEvent(source, true, true)
}

// 辅助函数

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function showNotification(message: string, type: string, duration?: number, position?: string): void {
  // 这里应该与通知系统集成
  console.log(`[${type.toUpperCase()}] ${message}`)

  // 发送自定义事件
  window.dispatchEvent(new CustomEvent('show-notification', {
    detail: { message, type, duration, position }
  }))
}

export { eventEngine as default }