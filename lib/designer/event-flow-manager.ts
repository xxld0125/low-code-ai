/**
 * 事件排序和执行流程管理
 * 提供事件的排序、优先级管理和执行流程控制
 */

import type {
  EventConfig,
  EventAction,
  EventExecutionContext,
  EventExecutionResult
} from '@/types/designer'

import { eventEngine } from './event-engine'

/**
 * 队列中的事件
 */
interface QueuedEvent {
  id: string
  event: EventConfig
  context: EventExecutionContext
  priority: number
  dependencies: string[]
  timestamp: number
  resolve?: (result: EventExecutionResult) => void
  reject?: (error: Error) => void
}

/**
 * 执行记录
 */
interface ExecutionRecord {
  eventId: string
  context: EventExecutionContext
  result: EventExecutionResult
  startTime: number
  endTime: number
  queueTime: number
}

/**
 * 事件执行流程管理器
 */
export class EventFlowManager {
  private executionQueue: Array<QueuedEvent> = []
  private isProcessing = false
  private maxConcurrency = 5
  private currentConcurrency = 0
  private executionHistory: ExecutionRecord[] = []
  private dependencies: Map<string, Set<string>> = new Map()

  /**
   * 设置事件依赖关系
   */
  setEventDependencies(eventId: string, dependsOn: string[]): void {
    this.dependencies.set(eventId, new Set(dependsOn))
  }

  /**
   * 移除事件依赖
   */
  removeEventDependencies(eventId: string): void {
    this.dependencies.delete(eventId)
  }

  /**
   * 获取事件依赖
   */
  getEventDependencies(eventId: string): Set<string> {
    return this.dependencies.get(eventId) || new Set()
  }

  /**
   * 添加事件到执行队列
   */
  async queueEvent(
    event: EventConfig,
    context: EventExecutionContext,
    options: {
      priority?: number
      dependencies?: string[]
      immediate?: boolean
    } = {}
  ): Promise<EventExecutionResult> {
    return new Promise((resolve, reject) => {
      const queuedEvent: QueuedEvent = {
        id: `${event.id}-${Date.now()}-${Math.random()}`,
        event,
        context,
        priority: options.priority || 0,
        dependencies: options.dependencies || [],
        timestamp: Date.now(),
        resolve,
        reject
      }

      if (options.immediate) {
        this.executeImmediately(queuedEvent)
      } else {
        this.addToQueue(queuedEvent)
        this.processQueue()
      }
    })
  }

  /**
   * 添加到队列
   */
  private addToQueue(queuedEvent: QueuedEvent): void {
    // 按优先级插入队列
    let insertIndex = this.executionQueue.length
    for (let i = 0; i < this.executionQueue.length; i++) {
      if (queuedEvent.priority > this.executionQueue[i].priority) {
        insertIndex = i
        break
      }
    }

    this.executionQueue.splice(insertIndex, 0, queuedEvent)
  }

  /**
   * 立即执行事件
   */
  private async executeImmediately(queuedEvent: QueuedEvent): Promise<void> {
    try {
      const result = await this.executeEvent(queuedEvent)
      queuedEvent.resolve?.(result)
    } catch (error) {
      queuedEvent.reject?.(error instanceof Error ? error : new Error('执行失败'))
    }
  }

  /**
   * 处理执行队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.currentConcurrency >= this.maxConcurrency) {
      return
    }

    this.isProcessing = true

    while (this.executionQueue.length > 0 && this.currentConcurrency < this.maxConcurrency) {
      const queuedEvent = this.findNextExecutableEvent()
      if (!queuedEvent) {
        break
      }

      this.currentConcurrency++
      this.executeEvent(queuedEvent)
        .finally(() => {
          this.currentConcurrency--
          this.processQueue() // 继续处理队列
        })
    }

    this.isProcessing = false
  }

  /**
   * 查找下一个可执行的事件
   */
  private findNextExecutableEvent(): QueuedEvent | null {
    for (let i = 0; i < this.executionQueue.length; i++) {
      const queuedEvent = this.executionQueue[i]

      if (this.canExecuteEvent(queuedEvent)) {
        this.executionQueue.splice(i, 1)
        return queuedEvent
      }
    }

    return null
  }

  /**
   * 检查事件是否可以执行
   */
  private canExecuteEvent(queuedEvent: QueuedEvent): boolean {
    // 检查依赖是否都已执行完成
    for (const dependency of queuedEvent.dependencies) {
      if (!this.isEventCompleted(dependency)) {
        return false
      }
    }

    return true
  }

  /**
   * 检查事件是否已完成
   */
  private isEventCompleted(eventId: string): boolean {
    return this.executionHistory.some(record =>
      record.eventId === eventId && record.result.success
    )
  }

  /**
   * 执行单个事件
   */
  private async executeEvent(queuedEvent: QueuedEvent): Promise<EventExecutionResult> {
    const startTime = Date.now()
    const queueTime = startTime - queuedEvent.timestamp

    try {
      console.log(`开始执行事件: ${queuedEvent.event.id}, 队列等待时间: ${queueTime}ms`)

      const result = await eventEngine.executeEvent(
        queuedEvent.event.actions,
        queuedEvent.context
      )

      const endTime = Date.now()

      // 记录执行历史
      const record: ExecutionRecord = {
        eventId: queuedEvent.event.id,
        context: queuedEvent.context,
        result,
        startTime,
        endTime,
        queueTime
      }

      this.executionHistory.push(record)
      this.trimHistory()

      console.log(
        `事件执行完成: ${queuedEvent.event.id}, ` +
        `执行时间: ${endTime - startTime}ms, ` +
        `成功率: ${result.executedActions.length}/${queuedEvent.event.actions.length}`
      )

      return result
    } catch (error) {
      const endTime = Date.now()
      const errorResult: EventExecutionResult = {
        success: false,
        executedActions: [],
        errors: [error instanceof Error ? error.message : '未知错误'],
        executionTime: endTime - startTime
      }

      // 记录执行历史
      const record: ExecutionRecord = {
        eventId: queuedEvent.event.id,
        context: queuedEvent.context,
        result: errorResult,
        startTime,
        endTime,
        queueTime
      }

      this.executionHistory.push(record)
      this.trimHistory()

      console.error(`事件执行失败: ${queuedEvent.event.id}`, error)
      return errorResult
    }
  }

  /**
   * 限制历史记录大小
   */
  private trimHistory(): void {
    const maxHistorySize = 1000
    if (this.executionHistory.length > maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-maxHistorySize)
    }
  }

  /**
   * 获取执行统计
   */
  getExecutionStats(): {
    total: number
    success: number
    failure: number
    averageExecutionTime: number
    averageQueueTime: number
    currentQueueSize: number
    currentConcurrency: number
  } {
    const total = this.executionHistory.length
    const success = this.executionHistory.filter(r => r.result.success).length
    const failure = total - success

    const averageExecutionTime = total > 0
      ? this.executionHistory.reduce((sum, r) => sum + r.result.executionTime, 0) / total
      : 0

    const averageQueueTime = total > 0
      ? this.executionHistory.reduce((sum, r) => sum + r.queueTime, 0) / total
      : 0

    return {
      total,
      success,
      failure,
      averageExecutionTime,
      averageQueueTime,
      currentQueueSize: this.executionQueue.length,
      currentConcurrency: this.currentConcurrency
    }
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(limit?: number): ExecutionRecord[] {
    const history = [...this.executionHistory].reverse()
    return limit ? history.slice(0, limit) : history
  }

  /**
   * 清空执行队列
   */
  clearQueue(): void {
    // 拒绝所有排队中的事件
    this.executionQueue.forEach(queuedEvent => {
      queuedEvent.reject?.(new Error('事件执行被取消'))
    })

    this.executionQueue = []
  }

  /**
   * 设置最大并发数
   */
  setMaxConcurrency(max: number): void {
    this.maxConcurrency = Math.max(1, max)
  }

  /**
   * 暂停处理队列
   */
  pause(): void {
    this.isProcessing = true
  }

  /**
   * 恢复处理队列
   */
  resume(): void {
    this.isProcessing = false
    this.processQueue()
  }

  /**
   * 获取事件排序建议
   */
  getEventSortOrder(events: EventConfig[]): Array<{ eventId: string; order: number; reason: string }> {
    const sortedEvents = events.map(event => ({
      eventId: event.id,
      event,
      score: this.calculateEventScore(event),
      dependencies: this.dependencies.get(event.id) || new Set()
    }))

    // 拓扑排序
    const result: Array<{ eventId: string; order: number; reason: string }> = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (item: any, order: number) => {
      if (visited.has(item.eventId)) return
      if (visiting.has(item.eventId)) {
        console.warn(`检测到循环依赖: ${item.eventId}`)
        return
      }

      visiting.add(item.eventId)

      // 先访问依赖的事件
      for (const depId of item.dependencies) {
        const depItem = sortedEvents.find(e => e.eventId === depId)
        if (depItem) {
          visit(depItem, order)
        }
      }

      visiting.delete(item.eventId)
      visited.add(item.eventId)

      result.push({
        eventId: item.eventId,
        order: result.length + 1,
        reason: this.getSortReason(item)
      })
    }

    // 按分数排序后进行拓扑排序
    sortedEvents.sort((a, b) => b.score - a.score)
    sortedEvents.forEach(item => visit(item, 0))

    return result
  }

  /**
   * 计算事件分数
   */
  private calculateEventScore(event: EventConfig): number {
    let score = 0

    // 基础分数
    score += event.enabled ? 10 : 0
    score += event.actions.length * 5

    // 事件类型权重
    const typeWeights: Record<string, number> = {
      'submit': 20,
      'click': 15,
      'change': 10,
      'input': 8,
      'focus': 5,
      'blur': 5,
      'load': 25,
      'scroll': 3,
      'mouseover': 2,
      'mouseout': 2
    }

    score += typeWeights[event.type] || 0

    // 动作复杂度
    event.actions.forEach(action => {
      const actionWeights: Record<string, number> = {
        'api-call': 8,
        'submit-form': 7,
        'set-state': 6,
        'navigate': 5,
        'open-modal': 4,
        'show-message': 3,
        'scroll-to': 2,
        'refresh-data': 4
      }

      score += actionWeights[action.type] || 1
    })

    return score
  }

  /**
   * 获取排序原因
   */
  private getSortReason(item: any): string {
    const reasons: string[] = []

    if (item.event.enabled) {
      reasons.push('已启用')
    }

    if (item.event.actions.length > 1) {
      reasons.push('多动作')
    }

    const hasComplexAction = item.event.actions.some((action: EventAction) =>
      ['api-call', 'submit-form', 'set-state'].includes(action.type)
    )
    if (hasComplexAction) {
      reasons.push('包含复杂动作')
    }

    if (item.dependencies.size > 0) {
      reasons.push(`依赖 ${item.dependencies.size} 个事件`)
    }

    return reasons.join(', ') || '默认排序'
  }
}

/**
 * 事件优先级管理器
 */
export class EventPriorityManager {
  private priorityGroups: Map<string, EventConfig[]> = new Map()

  /**
   * 按优先级分组事件
   */
  groupEventsByPriority(events: EventConfig[]): Map<string, EventConfig[]> {
    const groups = new Map<string, EventConfig[]>()

    // 初始化优先级组
    groups.set('critical', [])
    groups.set('high', [])
    groups.set('normal', [])
    groups.set('low', [])

    events.forEach(event => {
      const priority = this.getEventPriority(event)
      const group = this.getPriorityGroup(priority)
      groups.get(group)?.push(event)
    })

    this.priorityGroups = groups
    return groups
  }

  /**
   * 获取事件优先级
   */
  getEventPriority(event: EventConfig): number {
    let priority = 0

    // 事件类型优先级
    const typePriorities: Record<string, number> = {
      'submit': 100,
      'click': 80,
      'change': 60,
      'input': 50,
      'focus': 40,
      'blur': 40,
      'load': 90,
      'resize': 30,
      'scroll': 20
    }

    priority += typePriorities[event.type] || 10

    // 启用状态
    priority += event.enabled ? 20 : 0

    // 动作数量和复杂度
    priority += event.actions.length * 5

    // 动作类型复杂度
    event.actions.forEach(action => {
      const actionComplexity: Record<string, number> = {
        'api-call': 15,
        'submit-form': 12,
        'set-state': 10,
        'navigate': 8,
        'open-modal': 6,
        'show-message': 4,
        'scroll-to': 3,
        'refresh-data': 5
      }

      priority += actionComplexity[action.type] || 1
    })

    // 描述完整性
    if (event.description) {
      priority += 2
    }

    return priority
  }

  /**
   * 获取优先级组
   */
  private getPriorityGroup(priority: number): string {
    if (priority >= 80) return 'critical'
    if (priority >= 60) return 'high'
    if (priority >= 40) return 'normal'
    return 'low'
  }

  /**
   * 获取优先级组
   */
  getPriorityGroup(groupName: string): EventConfig[] {
    return this.priorityGroups.get(groupName) || []
  }

  /**
   * 调整事件优先级
   */
  adjustEventPriority(
    events: EventConfig[],
    adjustments: Array<{ eventId: string; adjustment: number }>
  ): EventConfig[] {
    return events.map(event => {
      const adjustment = adjustments.find(adj => adj.eventId === event.id)
      if (adjustment) {
        return {
          ...event,
          order: Math.max(1, event.order + adjustment.adjustment)
        }
      }
      return event
    })
  }

  /**
   * 自动排序事件
   */
  autoSortEvents(events: EventConfig[]): EventConfig[] {
    return events
      .map(event => ({
        ...event,
        priority: this.getEventPriority(event)
      }))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .map((event, index) => ({
        ...event,
        order: index + 1
      }))
  }
}

// 导出单例实例
export const eventFlowManager = new EventFlowManager()
export const eventPriorityManager = new EventPriorityManager()

export { eventFlowManager as default, eventPriorityManager }