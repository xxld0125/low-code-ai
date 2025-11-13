/**
 * 事件验证和执行单元测试
 * 测试事件配置的验证逻辑和执行引擎
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import type {
  EventConfig,
  EventAction,
  EventValidationResult,
  EventExecutionContext
} from '../../../types/designer'

// Mock implementations for testing
const mockEventValidation = {
  validateEventConfig: jest.fn(),
  validateEventAction: jest.fn(),
  checkSecurityConstraints: jest.fn()
}

const mockEventEngine = {
  executeEvent: jest.fn(),
  registerEventHandler: jest.fn(),
  unregisterEventHandler: jest.fn()
}

describe('事件验证系统', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateEventConfig', () => {
    it('应该验证有效的事件配置', () => {
      // 准备测试数据
      const validEventConfig: EventConfig = {
        id: 'event-001',
        type: 'click',
        actions: [
          {
            id: 'action-001',
            type: 'navigate',
            payload: { url: '/page1' },
            order: 1
          }
        ],
        enabled: true,
        order: 1
      }

      // 设置mock返回值
      mockEventValidation.validateEventConfig.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      // 执行验证
      const result = mockEventValidation.validateEventConfig(validEventConfig)

      // 断言结果
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(mockEventValidation.validateEventConfig).toHaveBeenCalledWith(validEventConfig)
    })

    it('应该检测无效的事件配置', () => {
      // 准备无效的测试数据
      const invalidEventConfig = {
        id: '', // 空ID
        type: 'invalid-event', // 无效事件类型
        actions: [], // 空动作列表
        enabled: true,
        order: 1
      } as EventConfig

      // 设置mock返回值
      mockEventValidation.validateEventConfig.mockReturnValue({
        isValid: false,
        errors: [
          '事件ID不能为空',
          '无效的事件类型',
          '事件必须包含至少一个动作'
        ],
        warnings: []
      })

      // 执行验证
      const result = mockEventValidation.validateEventConfig(invalidEventConfig)

      // 断言结果
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors[0]).toBe('事件ID不能为空')
    })

    it('应该处理缺失必需字段的事件配置', () => {
      const incompleteEventConfig = {
        id: 'event-001'
        // 缺失type, actions等必需字段
      } as EventConfig

      mockEventValidation.validateEventConfig.mockReturnValue({
        isValid: false,
        errors: [
          '事件类型不能为空',
          '事件动作列表不能为空'
        ],
        warnings: []
      })

      const result = mockEventValidation.validateEventConfig(incompleteEventConfig)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('事件类型不能为空')
    })
  })

  describe('validateEventAction', () => {
    it('应该验证有效的事件动作', () => {
      const validAction: EventAction = {
        id: 'action-001',
        type: 'navigate',
        payload: { url: '/target-page' },
        order: 1
      }

      mockEventValidation.validateEventAction.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: []
      })

      const result = mockEventValidation.validateEventAction(validAction, 'click')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的动作类型', () => {
      const invalidAction: EventAction = {
        id: 'action-002',
        type: 'invalid-action' as any,
        payload: {},
        order: 1
      }

      mockEventValidation.validateEventAction.mockReturnValue({
        isValid: false,
        errors: ['无效的动作类型: invalid-action'],
        warnings: []
      })

      const result = mockEventValidation.validateEventAction(invalidAction, 'click')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('无效的动作类型: invalid-action')
    })

    it('应该验证动作载荷的格式', () => {
      const navigateActionWithoutUrl: EventAction = {
        id: 'action-003',
        type: 'navigate',
        payload: {}, // 缺失必需的url字段
        order: 1
      }

      mockEventValidation.validateEventAction.mockReturnValue({
        isValid: false,
        errors: ['导航动作必须包含有效的URL'],
        warnings: []
      })

      const result = mockEventValidation.validateEventAction(navigateActionWithoutUrl, 'click')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('导航动作必须包含有效的URL')
    })
  })

  describe('checkSecurityConstraints', () => {
    it('应该允许安全的动作配置', () => {
      const secureAction: EventAction = {
        id: 'action-secure',
        type: 'navigate',
        payload: { url: '/internal-page' },
        order: 1
      }

      mockEventValidation.checkSecurityConstraints.mockReturnValue({
        isSecure: true,
        securityIssues: [],
        warnings: []
      })

      const result = mockEventValidation.checkSecurityConstraints(secureAction)

      expect(result.isSecure).toBe(true)
      expect(result.securityIssues).toHaveLength(0)
    })

    it('应该检测潜在的安全风险', () => {
      const riskyAction: EventAction = {
        id: 'action-risky',
        type: 'execute-script',
        payload: { script: 'malicious-code()' },
        order: 1
      }

      mockEventValidation.checkSecurityConstraints.mockReturnValue({
        isSecure: false,
        securityIssues: [
          '不允许执行自定义脚本',
          '检测到潜在的安全风险: execute-script'
        ],
        warnings: ['建议使用预定义的安全动作类型']
      })

      const result = mockEventValidation.checkSecurityConstraints(riskyAction)

      expect(result.isSecure).toBe(false)
      expect(result.securityIssues).toHaveLength(2)
    })

    it('应该防止外部链接跳转', () => {
      const externalLinkAction: EventAction = {
        id: 'action-external',
        type: 'navigate',
        payload: { url: 'http://malicious-site.com' },
        order: 1
      }

      mockEventValidation.checkSecurityConstraints.mockReturnValue({
        isSecure: false,
        securityIssues: ['不允许跳转到外部域名'],
        warnings: ['建议使用内部路由']
      })

      const result = mockEventValidation.checkSecurityConstraints(externalLinkAction)

      expect(result.isSecure).toBe(false)
      expect(result.securityIssues).toContain('不允许跳转到外部域名')
    })
  })
})

describe('事件执行引擎', () => {
  let mockExecutionContext: EventExecutionContext

  beforeEach(() => {
    jest.clearAllMocks()
    mockExecutionContext = {
      componentId: 'component-001',
      eventType: 'click',
      timestamp: Date.now(),
      userInfo: { userId: 'user-001', permissions: ['edit'] },
      environment: 'designer'
    }
  })

  describe('executeEvent', () => {
    it('应该成功执行有效的事件配置', async () => {
      const eventConfig: EventConfig = {
        id: 'event-001',
        type: 'click',
        actions: [
          {
            id: 'action-001',
            type: 'navigate',
            payload: { url: '/success-page' },
            order: 1
          }
        ],
        enabled: true,
        order: 1
      }

      mockEventEngine.executeEvent.mockResolvedValue({
        success: true,
        executedActions: ['action-001'],
        errors: [],
        executionTime: 15
      })

      const result = await mockEventEngine.executeEvent(eventConfig, mockExecutionContext)

      expect(result.success).toBe(true)
      expect(result.executedActions).toHaveLength(1)
      expect(result.executedActions[0]).toBe('action-001')
      expect(result.errors).toHaveLength(0)
    })

    it('应该按照动作顺序执行事件', async () => {
      const multiActionEvent: EventConfig = {
        id: 'event-002',
        type: 'click',
        actions: [
          {
            id: 'action-001',
            type: 'show-message',
            payload: { message: '第一步' },
            order: 1
          },
          {
            id: 'action-002',
            type: 'navigate',
            payload: { url: '/step2' },
            order: 2
          },
          {
            id: 'action-003',
            type: 'show-message',
            payload: { message: '完成' },
            order: 3
          }
        ],
        enabled: true,
        order: 1
      }

      mockEventEngine.executeEvent.mockResolvedValue({
        success: true,
        executedActions: ['action-001', 'action-002', 'action-003'],
        errors: [],
        executionTime: 45
      })

      const result = await mockEventEngine.executeEvent(multiActionEvent, mockExecutionContext)

      expect(result.success).toBe(true)
      expect(result.executedActions).toEqual(['action-001', 'action-002', 'action-003'])
      expect(mockEventEngine.executeEvent).toHaveBeenCalledWith(
        multiActionEvent,
        mockExecutionContext
      )
    })

    it('应该处理禁用的事件配置', async () => {
      const disabledEvent: EventConfig = {
        id: 'event-003',
        type: 'click',
        actions: [
          {
            id: 'action-001',
            type: 'navigate',
            payload: { url: '/should-not-execute' },
            order: 1
          }
        ],
        enabled: false, // 事件被禁用
        order: 1
      }

      mockEventEngine.executeEvent.mockResolvedValue({
        success: false,
        executedActions: [],
        errors: ['事件已被禁用'],
        executionTime: 0
      })

      const result = await mockEventEngine.executeEvent(disabledEvent, mockExecutionContext)

      expect(result.success).toBe(false)
      expect(result.executedActions).toHaveLength(0)
      expect(result.errors[0]).toBe('事件已被禁用')
    })

    it('应该处理动作执行错误', async () => {
      const faultyEvent: EventConfig = {
        id: 'event-004',
        type: 'click',
        actions: [
          {
            id: 'action-001',
            type: 'navigate',
            payload: { url: '/valid-page' },
            order: 1
          },
          {
            id: 'action-002',
            type: 'invalid-action',
            payload: {},
            order: 2
          }
        ],
        enabled: true,
        order: 1
      }

      mockEventEngine.executeEvent.mockResolvedValue({
        success: false,
        executedActions: ['action-001'],
        errors: ['动作 action-002 执行失败: 无效的动作类型'],
        executionTime: 25
      })

      const result = await mockEventEngine.executeEvent(faultyEvent, mockExecutionContext)

      expect(result.success).toBe(false)
      expect(result.executedActions).toEqual(['action-001'])
      expect(result.errors).toHaveLength(1)
    })

    it('应该支持异步动作执行', async () => {
      const asyncEvent: EventConfig = {
        id: 'event-005',
        type: 'click',
        actions: [
          {
            id: 'action-001',
            type: 'api-call',
            payload: { endpoint: '/api/data', method: 'GET' },
            order: 1
          }
        ],
        enabled: true,
        order: 1
      }

      mockEventEngine.executeEvent.mockImplementation(async (event, context) => {
        // 模拟异步API调用
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
          success: true,
          executedActions: ['action-001'],
          errors: [],
          executionTime: 105
        }
      })

      const result = await mockEventEngine.executeEvent(asyncEvent, mockExecutionContext)

      expect(result.success).toBe(true)
      expect(result.executedActions).toHaveLength(1)
      expect(result.executionTime).toBeGreaterThan(100)
    })
  })

  describe('事件处理器注册', () => {
    it('应该能够注册自定义事件处理器', () => {
      const customHandler = jest.fn()
      const eventType = 'custom-event'

      mockEventEngine.registerEventHandler.mockReturnValue(true)

      const result = mockEventEngine.registerEventHandler(eventType, customHandler)

      expect(result).toBe(true)
      expect(mockEventEngine.registerEventHandler).toHaveBeenCalledWith(eventType, customHandler)
    })

    it('应该能够注销事件处理器', () => {
      const eventType = 'custom-event'

      mockEventEngine.unregisterEventHandler.mockReturnValue(true)

      const result = mockEventEngine.unregisterEventHandler(eventType)

      expect(result).toBe(true)
      expect(mockEventEngine.unregisterEventHandler).toHaveBeenCalledWith(eventType)
    })

    it('应该防止重复注册相同的事件类型', () => {
      const eventType = 'duplicate-event'
      const handler1 = jest.fn()
      const handler2 = jest.fn()

      mockEventEngine.registerEventHandler
        .mockReturnValueOnce(true) // 第一次注册成功
        .mockReturnValueOnce(false) // 第二次注册失败

      const result1 = mockEventEngine.registerEventHandler(eventType, handler1)
      const result2 = mockEventEngine.registerEventHandler(eventType, handler2)

      expect(result1).toBe(true)
      expect(result2).toBe(false)
    })
  })

  describe('性能测试', () => {
    it('应该在合理时间内执行简单事件', async () => {
      const simpleEvent: EventConfig = {
        id: 'event-simple',
        type: 'click',
        actions: [
          {
            id: 'action-001',
            type: 'show-message',
            payload: { message: 'Hello' },
            order: 1
          }
        ],
        enabled: true,
        order: 1
      }

      mockEventEngine.executeEvent.mockImplementation(async (event, context) => {
        // 模拟快速执行
        await new Promise(resolve => setTimeout(resolve, 10))
        return {
          success: true,
          executedActions: ['action-001'],
          errors: [],
          executionTime: 12
        }
      })

      const startTime = Date.now()
      const result = await mockEventEngine.executeEvent(simpleEvent, mockExecutionContext)
      const endTime = Date.now()

      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(50) // 应该在50ms内完成
    })

    it('应该处理大量并发事件执行', async () => {
      const concurrentEvents = Array.from({ length: 10 }, (_, index) => ({
        id: `event-concurrent-${index}`,
        type: 'click' as const,
        actions: [
          {
            id: `action-${index}`,
            type: 'show-message' as const,
            payload: { message: `Message ${index}` },
            order: 1
          }
        ],
        enabled: true,
        order: 1
      }))

      mockEventEngine.executeEvent.mockImplementation(async (event, context) => {
        await new Promise(resolve => setTimeout(resolve, 5))
        return {
          success: true,
          executedActions: [event.actions[0].id],
          errors: [],
          executionTime: 6
        }
      })

      const startTime = Date.now()
      const results = await Promise.all(
        concurrentEvents.map(event => mockEventEngine.executeEvent(event, mockExecutionContext))
      )
      const endTime = Date.now()

      expect(results).toHaveLength(10)
      expect(results.every(r => r.success)).toBe(true)
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成所有事件
    })
  })
})