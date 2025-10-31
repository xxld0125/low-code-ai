/**
 * ValidationEditor 组件核心逻辑测试
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 * 专门用于测试验证编辑器的核心逻辑，避免复杂的UI组件mock问题
 */

import { renderHook, act } from '@testing-library/react'
import { ValidationEditorCore } from '../../../components/lowcode/editors/ValidationEditorCore'

// Mock field definition
const mockField = {
  key: 'username',
  type: 'string' as const,
  label: '用户名',
  required: false,
  default: '',
  group: 'basic',
  order: 1,
}

// Mock validation rules
const mockRules = [
  {
    id: 'required_1',
    type: 'required' as const,
    enabled: true,
    errorMessage: '用户名不能为空',
    description: '必填验证',
  },
  {
    id: 'minLength_1',
    type: 'minLength' as const,
    value: 3,
    enabled: true,
    errorMessage: '用户名至少需要3个字符',
    description: '最小长度验证',
  },
]

describe('ValidationEditorCore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('验证规则类型过滤', () => {
    it('应该为字符串字段返回适用的规则类型', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useApplicableRuleTypes('string')
      )

      const applicableTypes = result.current

      expect(applicableTypes).toContain('required')
      expect(applicableTypes).toContain('minLength')
      expect(applicableTypes).toContain('maxLength')
      expect(applicableTypes).toContain('pattern')
      expect(applicableTypes).toContain('email')
      expect(applicableTypes).not.toContain('min')
      expect(applicableTypes).not.toContain('max')
    })

    it('应该为数字字段返回适用的规则类型', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useApplicableRuleTypes('number')
      )

      const applicableTypes = result.current

      expect(applicableTypes).toContain('required')
      expect(applicableTypes).toContain('min')
      expect(applicableTypes).toContain('max')
      expect(applicableTypes).not.toContain('minLength')
      expect(applicableTypes).not.toContain('maxLength')
      expect(applicableTypes).not.toContain('pattern')
    })

    it('应该为选择字段返回适用的规则类型', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useApplicableRuleTypes('select')
      )

      const applicableTypes = result.current

      expect(applicableTypes).toContain('required')
      expect(applicableTypes).not.toContain('minLength')
      expect(applicableTypes).not.toContain('maxLength')
      expect(applicableTypes).not.toContain('min')
      expect(applicableTypes).not.toContain('max')
    })

    it('应该为复选框字段返回适用的规则类型', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useApplicableRuleTypes('checkbox')
      )

      const applicableTypes = result.current

      expect(applicableTypes).toContain('custom')
      expect(applicableTypes).not.toContain('required')
      expect(applicableTypes).not.toContain('minLength')
    })
  })

  describe('验证规则管理', () => {
    it('应该支持添加新规则', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleManager(mockRules)
      )

      const newRule = {
        id: 'maxLength_1',
        type: 'maxLength' as const,
        value: 20,
        enabled: true,
        errorMessage: '最多20个字符',
        description: '最大长度验证',
      }

      act(() => {
        result.current.addRule(newRule)
      })

      expect(result.current.rules).toHaveLength(3)
      expect(result.current.rules[2]).toEqual(newRule)
    })

    it('应该支持更新规则', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleManager(mockRules)
      )

      const updates = {
        value: 5,
        errorMessage: '至少需要5个字符',
      }

      act(() => {
        result.current.updateRule('minLength_1', updates)
      })

      const updatedRule = result.current.rules.find(r => r.id === 'minLength_1')
      expect(updatedRule?.value).toBe(5)
      expect(updatedRule?.errorMessage).toBe('至少需要5个字符')
    })

    it('应该支持删除规则', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleManager(mockRules)
      )

      act(() => {
        result.current.removeRule('required_1')
      })

      expect(result.current.rules).toHaveLength(1)
      expect(result.current.rules[0].id).toBe('minLength_1')
    })

    it('应该支持切换规则启用状态', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleManager(mockRules)
      )

      act(() => {
        result.current.toggleRule('required_1', false)
      })

      const rule = result.current.rules.find(r => r.id === 'required_1')
      expect(rule?.enabled).toBe(false)
    })

    it('应该返回启用的规则数量', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleManager(mockRules)
      )

      expect(result.current.enabledCount).toBe(2)

      act(() => {
        result.current.toggleRule('required_1', false)
      })

      expect(result.current.enabledCount).toBe(1)
    })
  })

  describe('验证规则执行', () => {
    it('应该执行必填验证', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleExecutor(mockRules)
      )

      // 测试空值
      const result1 = result.current.validate('')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('用户名不能为空')

      // 测试有效值
      const result2 = result.current.validate('testuser')
      expect(result2.isValid).toBe(true)
    })

    it('应该执行最小长度验证', () => {
      const rules = [
        {
          id: 'minLength_1',
          type: 'minLength' as const,
          value: 3,
          enabled: true,
          errorMessage: '至少需要3个字符',
        },
      ]

      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleExecutor(rules)
      )

      // 测试过短的值
      const result1 = result.current.validate('ab')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('至少需要3个字符')

      // 测试有效值
      const result2 = result.current.validate('abc')
      expect(result2.isValid).toBe(true)
    })

    it('应该执行最大长度验证', () => {
      const rules = [
        {
          id: 'maxLength_1',
          type: 'maxLength' as const,
          value: 5,
          enabled: true,
          errorMessage: '最多5个字符',
        },
      ]

      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleExecutor(rules)
      )

      // 测试过长的值
      const result1 = result.current.validate('abcdef')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('最多5个字符')

      // 测试有效值
      const result2 = result.current.validate('abc')
      expect(result2.isValid).toBe(true)
    })

    it('应该执行数字范围验证', () => {
      const rules = [
        {
          id: 'min_1',
          type: 'min' as const,
          value: 0,
          enabled: true,
          errorMessage: '值不能小于 0',
        },
        {
          id: 'max_1',
          type: 'max' as const,
          value: 100,
          enabled: true,
          errorMessage: '值不能大于 100',
        },
      ]

      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleExecutor(rules)
      )

      // 测试小于最小值
      const result1 = result.current.validate(-1)
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('值不能小于 0')

      // 测试大于最大值
      const result2 = result.current.validate(150)
      expect(result2.isValid).toBe(false)
      expect(result2.errors).toContain('值不能大于 100')

      // 测试有效值
      const result3 = result.current.validate(50)
      expect(result3.isValid).toBe(true)
    })

    it('应该执行正则表达式验证', () => {
      const rules = [
        {
          id: 'pattern_1',
          type: 'pattern' as const,
          value: '^[a-zA-Z0-9_]+$',
          enabled: true,
          errorMessage: '只能包含字母、数字和下划线',
        },
      ]

      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleExecutor(rules)
      )

      // 测试无效字符
      const result1 = result.current.validate('test@user')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('只能包含字母、数字和下划线')

      // 测试有效值
      const result2 = result.current.validate('test_user123')
      expect(result2.isValid).toBe(true)
    })

    it('应该忽略禁用的规则', () => {
      const rules = [
        {
          id: 'required_1',
          type: 'required' as const,
          enabled: false, // 禁用
          errorMessage: '用户名不能为空',
        },
        {
          id: 'minLength_1',
          type: 'minLength' as const,
          value: 3,
          enabled: true,
          errorMessage: '至少需要3个字符',
        },
      ]

      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleExecutor(rules)
      )

      // 空值应该通过必填验证（因为被禁用），但不通过最小长度验证
      const validation = result.current.validate('')
      expect(validation.isValid).toBe(false)
      expect(validation.errors).not.toContain('用户名不能为空')
      expect(validation.errors).toContain('至少需要3个字符')
    })

    it('应该支持自定义验证函数', () => {
      const customValidator = jest.fn((value: string) => {
        return value.startsWith('admin_')
      })

      const rules = [
        {
          id: 'custom_1',
          type: 'custom' as const,
          value: customValidator,
          enabled: true,
          errorMessage: '必须以admin_开头',
        },
      ]

      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleExecutor(rules)
      )

      // 测试不匹配的值
      const result1 = result.current.validate('user')
      expect(result1.isValid).toBe(false)
      expect(result1.errors).toContain('必须以admin_开头')

      // 测试匹配的值
      const result2 = result.current.validate('admin_user')
      expect(result2.isValid).toBe(true)

      expect(customValidator).toHaveBeenCalledWith('user')
      expect(customValidator).toHaveBeenCalledWith('admin_user')
    })
  })

  describe('验证预设管理', () => {
    it('应该提供用户名预设', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useValidationPresets('string')
      )

      const usernamePreset = result.current.getPreset('username')
      expect(usernamePreset).toBeDefined()
      expect(usernamePreset?.label).toBe('用户名')
      expect(usernamePreset?.description).toBe('用户名验证规则')
      expect(usernamePreset?.rules).toHaveLength(4) // required, minLength, maxLength, pattern

      const requiredRule = usernamePreset?.rules.find(r => r.type === 'required')
      expect(requiredRule?.enabled).toBe(true)
      expect(requiredRule?.errorMessage).toBe('此字段为必填项')

      const minLengthRule = usernamePreset?.rules.find(r => r.type === 'minLength')
      expect(minLengthRule?.value).toBe(3)
    })

    it('应该提供密码预设', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useValidationPresets('string')
      )

      const passwordPreset = result.current.getPreset('password')
      expect(passwordPreset).toBeDefined()
      expect(passwordPreset?.label).toBe('密码')
      expect(passwordPreset?.rules).toHaveLength(3) // required, minLength, pattern

      const patternRule = passwordPreset?.rules.find(r => r.type === 'pattern')
      expect(patternRule?.value).toContain('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')
    })

    it('应该提供邮箱预设', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useValidationPresets('string')
      )

      const emailPreset = result.current.getPreset('email')
      expect(emailPreset).toBeDefined()
      expect(emailPreset?.label).toBe('邮箱')
      expect(emailPreset?.rules).toHaveLength(2) // required, email

      const emailRule = emailPreset?.rules.find(r => r.type === 'email')
      expect(emailRule?.errorMessage).toBe('请输入有效的邮箱地址')
    })

    it('应该为数字字段提供年龄预设', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useValidationPresets('number')
      )

      const agePreset = result.current.getPreset('age')
      expect(agePreset).toBeDefined()
      expect(agePreset?.label).toBe('年龄')
      expect(agePreset?.rules).toHaveLength(3) // required, min, max

      const minRule = agePreset?.rules.find(r => r.type === 'min')
      expect(minRule?.value).toBe(0)

      const maxRule = agePreset?.rules.find(r => r.type === 'max')
      expect(maxRule?.value).toBe(150)
    })

    it('应该返回所有可用的预设', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useValidationPresets('string')
      )

      const presets = result.current.getAllPresets()
      expect(presets).toHaveLength(3) // username, password, email
      expect(presets.map(p => p.key)).toContain('username')
      expect(presets.map(p => p.key)).toContain('password')
      expect(presets.map(p => p.key)).toContain('email')
    })
  })

  describe('错误消息管理', () => {
    it('应该提供默认错误消息', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useErrorMessages()
      )

      expect(result.current.getMessage('required')).toBe('此字段为必填项')
      expect(result.current.getMessage('minLength')).toBe('最少需要 {{min}} 个字符')
      expect(result.current.getMessage('maxLength')).toBe('最多允许 {{max}} 个字符')
      expect(result.current.getMessage('email')).toBe('请输入有效的邮箱地址')
    })

    it('应该支持错误消息模板替换', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useErrorMessages()
      )

      const message = result.current.getMessage('minLength', { min: 5 })
      expect(message).toBe('最少需要 5 个字符')

      const message2 = result.current.getMessage('maxLength', { max: 10 })
      expect(message2).toBe('最多允许 10 个字符')
    })

    it('应该支持自定义错误消息', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useErrorMessages({
          required: '此字段是必需的',
          minLength: '长度不能少于{{min}}位',
        })
      )

      expect(result.current.getMessage('required')).toBe('此字段是必需的')
      expect(result.current.getMessage('minLength', { min: 5 })).toBe('长度不能少于5位')
      expect(result.current.getMessage('maxLength')).toBe('最多允许 {{max}} 个字符') // 回退到默认值
    })
  })

  describe('验证规则导入导出', () => {
    it('应该导出验证规则为JSON', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleImportExport()
      )

      const exported = result.current.exportToJSON(mockRules, mockField)

      const parsed = JSON.parse(exported)
      expect(parsed.field).toBe('username')
      expect(parsed.rules).toHaveLength(2)
      expect(parsed.fieldType).toBe('string')
      expect(parsed.metadata.version).toBe('1.0.0')
      expect(parsed.metadata.exportTime).toBeDefined()
    })

    it('应该从JSON导入验证规则', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleImportExport()
      )

      const importData = {
        field: 'email',
        rules: [
          {
            type: 'required',
            enabled: true,
            errorMessage: '邮箱不能为空',
          },
          {
            type: 'email',
            enabled: true,
            errorMessage: '请输入有效的邮箱地址',
          },
        ],
        metadata: {
          exportTime: '2025-10-31T12:00:00.000Z',
          fieldType: 'string',
          version: '1.0.0',
        },
      }

      const importedRules = result.current.importFromJSON(JSON.stringify(importData))

      expect(importedRules).toHaveLength(2)
      expect(importedRules[0].type).toBe('required')
      expect(importedRules[1].type).toBe('email')
    })

    it('应该处理无效的导入数据', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleImportExport()
      )

      expect(() => {
        result.current.importFromJSON('invalid json')
      }).toThrow('无效的JSON格式')

      expect(() => {
        result.current.importFromJSON('{}')
      }).toThrow('导入数据格式不正确')

      expect(() => {
        result.current.importFromJSON('{ "field": "test" }')
      }).toThrow('导入数据格式不正确')
    })

    it('应该生成验证规则代码', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleImportExport()
      )

      const code = result.current.generateRuleCode(mockRules, 'username')

      expect(code).toContain('function validateUsername(value)')
      expect(code).toContain('required')
      expect(code).toContain('minLength')
      expect(code).toContain('isValid: errors.length === 0')
    })
  })

  describe('验证规则序列化', () => {
    it('应该序列化规则为配置格式', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleSerializer()
      )

      const serialized = result.current.serialize(mockRules)

      expect(serialized).toHaveProperty('version')
      expect(serialized).toHaveProperty('rules')
      expect(serialized).toHaveProperty('metadata')
      expect(serialized.rules).toHaveLength(2)
    })

    it('应该从配置格式反序列化规则', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleSerializer()
      )

      const config = {
        version: '1.0.0',
        rules: [
          {
            type: 'required',
            enabled: true,
            errorMessage: '必填',
          },
        ],
        metadata: {
          created: '2025-10-31T12:00:00.000Z',
        },
      }

      const rules = result.current.deserialize(config)

      expect(rules).toHaveLength(1)
      expect(rules[0].type).toBe('required')
      expect(rules[0].enabled).toBe(true)
    })

    it('应该验证配置格式', () => {
      const { result } = renderHook(() =>
        ValidationEditorCore.useRuleSerializer()
      )

      const validConfig = {
        version: '1.0.0',
        rules: [],
        metadata: {},
      }

      const validConfig = {
        version: '1.0.0',
        rules: [],
        metadata: {},
      }
      const invalidConfig1 = {}
      const invalidConfig2 = { version: '1.0.0' }
      const invalidConfig3 = { version: '1.0.0', metadata: {} }

      expect(result.current.validateConfig(validConfig)).toBe(true)
      expect(result.current.validateConfig(invalidConfig1 as any)).toBe(false)
      expect(result.current.validateConfig(invalidConfig2 as any)).toBe(false)
      expect(result.current.validateConfig(invalidConfig3 as any)).toBe(false)
    })
  })
})