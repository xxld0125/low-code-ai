/**
 * 事件验证和安全检查
 * 提供事件配置的验证逻辑和安全检查
 */

import type {
  EventConfig,
  EventAction,
  EventValidationResult,
  EventValidationContext
} from '@/types/designer'

// 允许的外部域名列表
const ALLOWED_EXTERNAL_DOMAINS = [
  'localhost',
  '127.0.0.1',
  window.location.hostname
]

// 危险的脚本模式
const DANGEROUS_SCRIPT_PATTERNS = [
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi
]

// 危险的CSS属性
const DANGEROUS_CSS_PROPERTIES = [
  'expression',
  'behavior',
  'binding',
  'include-source'
]

/**
 * 事件验证器
 */
export class EventValidator {
  private validationRules: Map<string, ValidationRule[]> = new Map()
  private securityRules: SecurityRule[] = []

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * 初始化默认验证规则
   */
  private initializeDefaultRules(): void {
    // 基础事件验证规则
    this.validationRules.set('event', [
      new RequiredFieldRule('id'),
      new RequiredFieldRule('type'),
      new RequiredFieldRule('actions'),
      new ArrayNotEmptyRule('actions'),
      new UniqueIdRule(),
      new OrderRule('actions')
    ])

    // 动作验证规则
    this.validationRules.set('action', [
      new RequiredFieldRule('id'),
      new RequiredFieldRule('type'),
      new RequiredFieldRule('payload'),
      new OrderRule()
    ])

    // 安全规则
    this.securityRules = [
      new UrlSecurityRule(),
      new ScriptSecurityRule(),
      new CssSecurityRule(),
      new PayloadSizeRule(),
      new RecursionRule(),
      new PermissionsRule()
    ]
  }

  /**
   * 验证事件配置
   */
  async validateEventConfig(
    event: EventConfig,
    context?: EventValidationContext
  ): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 基础验证
      const baseValidation = await this.validateWithRules('event', event, context)
      errors.push(...baseValidation.errors)
      warnings.push(...baseValidation.warnings)

      // 动作验证
      if (event.actions && Array.isArray(event.actions)) {
        for (let i = 0; i < event.actions.length; i++) {
          const action = event.actions[i]
          const actionValidation = await this.validateAction(action, context)

          // 为错误添加动作索引
          actionValidation.errors.forEach(error => {
            errors.push(`动作 ${i + 1}: ${error}`)
          })

          actionValidation.warnings.forEach(warning => {
            warnings.push(`动作 ${i + 1}: ${warning}`)
          })
        }
      }

      // 事件级别验证
      await this.validateEventSpecific(event, context, errors, warnings)

      // 安全检查
      await this.performSecurityCheck(event, context, errors, warnings)

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`验证过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings
      }
    }
  }

  /**
   * 验证单个动作
   */
  async validateAction(
    action: EventAction,
    context?: EventValidationContext
  ): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 基础验证
      const baseValidation = await this.validateWithRules('action', action, context)
      errors.push(...baseValidation.errors)
      warnings.push(...baseValidation.warnings)

      // 动作类型特定验证
      await this.validateActionSpecific(action, context, errors, warnings)

      // 载荷验证
      await this.validatePayload(action, context, errors, warnings)

      // 安全检查
      await this.performActionSecurityCheck(action, context, errors, warnings)

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      }
    } catch (error) {
      return {
        isValid: false,
        errors: [`动作验证失败: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings
      }
    }
  }

  /**
   * 使用规则验证对象
   */
  private async validateWithRules(
    type: string,
    obj: any,
    context?: EventValidationContext
  ): Promise<EventValidationResult> {
    const rules = this.validationRules.get(type) || []
    const errors: string[] = []
    const warnings: string[] = []

    for (const rule of rules) {
      try {
        const result = await rule.validate(obj, context)
        errors.push(...result.errors)
        warnings.push(...result.warnings)
      } catch (error) {
        errors.push(`规则 ${rule.constructor.name} 执行失败`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 事件特定验证
   */
  private async validateEventSpecific(
    event: EventConfig,
    context?: EventValidationContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // 检查事件类型是否有效
    const validEventTypes = [
      'click', 'dblclick', 'submit', 'change', 'input',
      'focus', 'blur', 'mouseover', 'mouseout',
      'keydown', 'keyup', 'load', 'resize', 'scroll'
    ]

    if (!validEventTypes.includes(event.type)) {
      warnings.push(`未知的事件类型: ${event.type}`)
    }

    // 检查动作顺序
    const orders = event.actions.map(action => action.order)
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index)
    if (duplicateOrders.length > 0) {
      warnings.push(`发现重复的动作顺序: ${duplicateOrders.join(', ')}`)
    }

    // 检查描述长度
    if (event.description && event.description.length > 200) {
      warnings.push('事件描述过长，建议控制在200字符以内')
    }
  }

  /**
   * 动作特定验证
   */
  private async validateActionSpecific(
    action: EventAction,
    context?: EventValidationContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // 检查动作类型是否有效
    const validActionTypes = [
      'navigate', 'api-call', 'show-message', 'set-state', 'toggle-state',
      'reset-form', 'submit-form', 'scroll-to', 'open-modal', 'close-modal',
      'download-file', 'copy-to-clipboard', 'refresh-data'
    ]

    if (!validActionTypes.includes(action.type)) {
      errors.push(`无效的动作类型: ${action.type}`)
    }

    // 检查延迟时间
    if (action.delay && (action.delay < 0 || action.delay > 30000)) {
      warnings.push('延迟时间建议控制在0-30000毫秒之间')
    }

    // 检查条件表达式
    if (action.condition) {
      try {
        // 尝试解析条件表达式
        new Function('context', `return ${action.condition}`)
      } catch (error) {
        errors.push('无效的条件表达式语法')
      }
    }
  }

  /**
   * 载荷验证
   */
  private async validatePayload(
    action: EventAction,
    context?: EventValidationContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (!action.payload || typeof action.payload !== 'object') {
      errors.push('动作载荷必须是有效的对象')
      return
    }

    // 根据动作类型验证特定字段
    switch (action.type) {
      case 'navigate':
        await this.validateNavigatePayload(action.payload, errors, warnings)
        break
      case 'api-call':
        await this.validateApiCallPayload(action.payload, errors, warnings)
        break
      case 'show-message':
        await this.validateShowMessagePayload(action.payload, errors, warnings)
        break
      case 'set-state':
        await this.validateSetStatePayload(action.payload, errors, warnings)
        break
      case 'submit-form':
        await this.validateSubmitFormPayload(action.payload, errors, warnings)
        break
    }
  }

  private async validateNavigatePayload(
    payload: any,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (!payload.url) {
      errors.push('导航动作必须包含URL参数')
      return
    }

    if (typeof payload.url !== 'string') {
      errors.push('URL参数必须是字符串')
      return
    }

    // 检查URL格式
    if (payload.url.startsWith('http://') || payload.url.startsWith('https://')) {
      try {
        const url = new URL(payload.url)
        if (!ALLOWED_EXTERNAL_DOMAINS.includes(url.hostname)) {
          warnings.push(`导航到外部域名可能存在安全风险: ${url.hostname}`)
        }
      } catch {
        errors.push('无效的URL格式')
      }
    }
  }

  private async validateApiCallPayload(
    payload: any,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (!payload.url) {
      errors.push('API调用必须包含URL参数')
      return
    }

    if (typeof payload.url !== 'string') {
      errors.push('URL参数必须是字符串')
      return
    }

    // 检查HTTP方法
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    if (payload.method && !validMethods.includes(payload.method)) {
      errors.push(`无效的HTTP方法: ${payload.method}`)
    }

    // 检查请求数据
    if (payload.data && typeof payload.data !== 'object') {
      warnings.push('请求数据建议使用对象格式')
    }
  }

  private async validateShowMessagePayload(
    payload: any,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (!payload.message) {
      errors.push('显示消息必须包含消息内容')
      return
    }

    if (typeof payload.message !== 'string') {
      errors.push('消息内容必须是字符串')
      return
    }

    if (payload.message.length > 500) {
      warnings.push('消息内容过长，建议控制在500字符以内')
    }

    // 检查消息类型
    const validTypes = ['info', 'success', 'warning', 'error']
    if (payload.type && !validTypes.includes(payload.type)) {
      errors.push(`无效的消息类型: ${payload.type}`)
    }
  }

  private async validateSetStatePayload(
    payload: any,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (!payload.target) {
      errors.push('设置状态必须包含目标参数')
      return
    }

    if (payload.value === undefined) {
      errors.push('设置状态必须包含值参数')
      return
    }

    // 检查目标格式
    if (typeof payload.target !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(payload.target)) {
      errors.push('目标参数格式无效，应使用字母、数字、点或下划线')
    }
  }

  private async validateSubmitFormPayload(
    payload: any,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    if (!payload.formId) {
      errors.push('提交表单必须包含表单ID')
      return
    }

    if (!payload.url) {
      errors.push('提交表单必须包含提交URL')
      return
    }

    if (payload.method && !['POST', 'PUT', 'PATCH'].includes(payload.method)) {
      errors.push('表单提交只支持POST、PUT、PATCH方法')
    }
  }

  /**
   * 执行安全检查
   */
  private async performSecurityCheck(
    event: EventConfig,
    context?: EventValidationContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    for (const rule of this.securityRules) {
      try {
        const result = await rule.check(event, context)
        errors.push(...result.errors)
        warnings.push(...result.warnings)
      } catch (error) {
        errors.push(`安全检查规则 ${rule.constructor.name} 执行失败`)
      }
    }
  }

  /**
   * 执行动作安全检查
   */
  private async performActionSecurityCheck(
    action: EventAction,
    context?: EventValidationContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // 检查载荷大小
    const payloadSize = JSON.stringify(action.payload || {}).length
    if (payloadSize > 10000) { // 10KB
      warnings.push('载荷过大，可能影响性能')
    }

    // 检查是否包含危险内容
    const payloadString = JSON.stringify(action.payload).toLowerCase()
    for (const pattern of DANGEROUS_SCRIPT_PATTERNS) {
      if (pattern.test(payloadString)) {
        errors.push('检测到危险的脚本内容')
        break
      }
    }
  }

  /**
   * 添加自定义验证规则
   */
  addValidationRule(type: string, rule: ValidationRule): void {
    const rules = this.validationRules.get(type) || []
    rules.push(rule)
    this.validationRules.set(type, rules)
  }

  /**
   * 添加安全规则
   */
  addSecurityRule(rule: SecurityRule): void {
    this.securityRules.push(rule)
  }
}

// 验证规则基类
abstract class ValidationRule {
  abstract validate(obj: any, context?: EventValidationContext): Promise<EventValidationResult>
}

// 安全规则基类
abstract class SecurityRule {
  abstract check(event: EventConfig, context?: EventValidationContext): Promise<EventValidationResult>
}

// 具体验证规则实现

class RequiredFieldRule extends ValidationRule {
  constructor(private fieldName: string) {
    super()
  }

  async validate(obj: any): Promise<EventValidationResult> {
    if (obj?.[this.fieldName] === undefined || obj[this.fieldName] === null) {
      return {
        isValid: false,
        errors: [`缺少必需字段: ${this.fieldName}`],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }
}

class ArrayNotEmptyRule extends ValidationRule {
  constructor(private fieldName: string) {
    super()
  }

  async validate(obj: any): Promise<EventValidationResult> {
    const array = obj?.[this.fieldName]
    if (!Array.isArray(array) || array.length === 0) {
      return {
        isValid: false,
        errors: [`${this.fieldName} 必须是非空数组`],
        warnings: []
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }
}

class UniqueIdRule extends ValidationRule {
  async validate(obj: any): Promise<EventValidationResult> {
    if (!obj.id) {
      return { isValid: true, errors: [], warnings: [] }
    }

    // 这里应该检查ID是否在上下文中唯一
    // 暂时跳过具体实现
    return { isValid: true, errors: [], warnings: [] }
  }
}

class OrderRule extends ValidationRule {
  constructor(private fieldName?: string) {
    super()
  }

  async validate(obj: any): Promise<EventValidationResult> {
    const target = this.fieldName ? obj?.[this.fieldName] : obj

    if (Array.isArray(target)) {
      const orders = target.map((item: any) => item.order).filter(Boolean)
      const sortedOrders = [...orders].sort((a, b) => a - b)

      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== sortedOrders[i]) {
          return {
            isValid: false,
            errors: ['动作顺序不是连续的'],
            warnings: []
          }
        }
      }
    }

    return { isValid: true, errors: [], warnings: [] }
  }
}

// 安全规则实现

class UrlSecurityRule extends SecurityRule {
  async check(event: EventConfig): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    for (const action of event.actions) {
      if (action.type === 'navigate' || action.type === 'api-call') {
        const url = action.payload?.url
        if (url && typeof url === 'string') {
          if (url.includes('javascript:') || url.includes('data:')) {
            errors.push(`动作 ${action.id} 包含危险的URL协议`)
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }
}

class ScriptSecurityRule extends SecurityRule {
  async check(event: EventConfig): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    const eventString = JSON.stringify(event).toLowerCase()

    for (const pattern of DANGEROUS_SCRIPT_PATTERNS) {
      if (pattern.test(eventString)) {
        errors.push('检测到危险的脚本模式')
        break
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }
}

class CssSecurityRule extends SecurityRule {
  async check(event: EventConfig): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    for (const action of event.actions) {
      if (action.type === 'set-state' && action.payload?.styles) {
        const styles = JSON.stringify(action.payload.styles).toLowerCase()

        for (const prop of DANGEROUS_CSS_PROPERTIES) {
          if (styles.includes(prop)) {
            warnings.push(`动作 ${action.id} 包含可能不安全的CSS属性: ${prop}`)
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }
}

class PayloadSizeRule extends SecurityRule {
  async check(event: EventConfig): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    const totalSize = JSON.stringify(event).length
    if (totalSize > 50000) { // 50KB
      warnings.push('事件配置过大，可能影响加载性能')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }
}

class RecursionRule extends SecurityRule {
  async check(event: EventConfig): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查是否存在可能的无限递归
    // 这里可以实现更复杂的递归检测逻辑
    const eventIds = new Set<string>()

    function checkRecursion(currentEvent: EventConfig, depth = 0): boolean {
      if (depth > 10) return true // 防止无限递归
      if (eventIds.has(currentEvent.id)) return true

      eventIds.add(currentEvent.id)

      for (const action of currentEvent.actions) {
        // 检查动作是否可能触发相同事件
        if (action.type === 'trigger-event') {
          const targetEvent = action.payload?.event
          if (targetEvent && targetEvent === currentEvent.type) {
            return true
          }
        }
      }

      return false
    }

    if (checkRecursion(event)) {
      errors.push('检测到可能的无限递归')
    }

    return { isValid: errors.length === 0, errors, warnings }
  }
}

class PermissionsRule extends SecurityRule {
  async check(event: EventConfig, context?: EventValidationContext): Promise<EventValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查用户权限
    if (context?.userInfo?.permissions) {
      const { permissions } = context.userInfo

      // 检查是否需要管理员权限的动作
      const adminOnlyActions = ['api-call', 'set-state', 'reset-form', 'submit-form']
      for (const action of event.actions) {
        if (adminOnlyActions.includes(action.type) && !permissions.includes('admin')) {
          warnings.push(`动作 ${action.id} 可能需要管理员权限`)
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }
}

// 导出单例实例
export const eventValidator = new EventValidator()

export { eventValidator as default }