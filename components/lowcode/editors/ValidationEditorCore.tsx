/**
 * ValidationEditor 核心逻辑模块
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 * 提供验证编辑器的核心逻辑，便于测试和复用
 */

import { useState, useCallback, useMemo } from 'react'

// 类型定义
interface ValidationRuleConfig {
  id: string
  type: string
  value?: any
  enabled: boolean
  errorMessage?: string
  description?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

interface ValidationPreset {
  key: string
  label: string
  description: string
  rules: ValidationRuleConfig[]
}

interface FieldDefinition {
  key: string
  type: string
  label: string
  required?: boolean
  default?: any
  group?: string
  order?: number
}

// 验证规则类型
const VALIDATION_RULE_TYPES = [
  { value: 'required', label: '必填验证' },
  { value: 'minLength', label: '最小长度' },
  { value: 'maxLength', label: '最大长度' },
  { value: 'min', label: '最小值' },
  { value: 'max', label: '最大值' },
  { value: 'pattern', label: '正则表达式' },
  { value: 'email', label: '邮箱格式' },
  { value: 'phone', label: '手机号码' },
  { value: 'url', label: 'URL格式' },
  { value: 'idCard', label: '身份证号' },
  { value: 'custom', label: '自定义函数' },
]

// 错误消息模板
const ERROR_MESSAGE_TEMPLATES: Record<string, string> = {
  required: '此字段为必填项',
  minLength: '最少需要 {{min}} 个字符',
  maxLength: '最多允许 {{max}} 个字符',
  min: '值不能小于 {{min}}',
  max: '值不能大于 {{max}}',
  pattern: '格式不正确',
  email: '请输入有效的邮箱地址',
  phone: '请输入有效的手机号码',
  url: '请输入有效的URL地址',
  idCard: '请输入有效的身份证号码',
  custom: '验证失败',
}

// 验证预设
const createStringPresets = (): Record<string, ValidationPreset> => ({
  username: {
    key: 'username',
    label: '用户名',
    description: '用户名验证规则',
    rules: [
      {
        id: 'required',
        type: 'required',
        enabled: true,
        errorMessage: ERROR_MESSAGE_TEMPLATES.required,
        description: '必填验证',
      },
      {
        id: 'minLength',
        type: 'minLength',
        value: 3,
        enabled: true,
        errorMessage: ERROR_MESSAGE_TEMPLATES.minLength.replace('{{min}}', '3'),
        description: '最小长度验证',
      },
      {
        id: 'maxLength',
        type: 'maxLength',
        value: 20,
        enabled: true,
        errorMessage: ERROR_MESSAGE_TEMPLATES.maxLength.replace('{{max}}', '20'),
        description: '最大长度验证',
      },
      {
        id: 'pattern',
        type: 'pattern',
        value: '^[a-zA-Z0-9_]+$',
        enabled: true,
        errorMessage: '只能包含字母、数字和下划线',
        description: '格式验证',
      },
    ],
  },
  password: {
    key: 'password',
    label: '密码',
    description: '密码验证规则',
    rules: [
      {
        id: 'required',
        type: 'required',
        enabled: true,
        errorMessage: ERROR_MESSAGE_TEMPLATES.required,
        description: '必填验证',
      },
      {
        id: 'minLength',
        type: 'minLength',
        value: 8,
        enabled: true,
        errorMessage: '密码至少需要8个字符',
        description: '最小长度验证',
      },
      {
        id: 'pattern',
        type: 'pattern',
        value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
        enabled: true,
        errorMessage: '密码必须包含大小写字母和数字',
        description: '复杂度验证',
      },
    ],
  },
  email: {
    key: 'email',
    label: '邮箱',
    description: '邮箱格式验证',
    rules: [
      {
        id: 'required',
        type: 'required',
        enabled: true,
        errorMessage: ERROR_MESSAGE_TEMPLATES.required,
        description: '必填验证',
      },
      {
        id: 'email',
        type: 'email',
        enabled: true,
        errorMessage: ERROR_MESSAGE_TEMPLATES.email,
        description: '邮箱格式验证',
      },
    ],
  },
})

const createNumberPresets = (): Record<string, ValidationPreset> => ({
  age: {
    key: 'age',
    label: '年龄',
    description: '年龄验证规则',
    rules: [
      {
        id: 'required',
        type: 'required',
        enabled: true,
        errorMessage: ERROR_MESSAGE_TEMPLATES.required,
        description: '必填验证',
      },
      {
        id: 'min',
        type: 'min',
        value: 0,
        enabled: true,
        errorMessage: '年龄不能小于0',
        description: '最小值验证',
      },
      {
        id: 'max',
        type: 'max',
        value: 150,
        enabled: true,
        errorMessage: '年龄不能大于150',
        description: '最大值验证',
      },
    ],
  },
})

// 适用规则类型 Hook
export const useApplicableRuleTypes = (fieldType: string) => {
  const applicableTypes = useMemo(() => {
    return VALIDATION_RULE_TYPES.filter(ruleType => {
      switch (fieldType) {
        case 'string':
        case 'textarea':
          return ['required', 'minLength', 'maxLength', 'pattern', 'email', 'phone', 'url', 'idCard', 'custom'].includes(ruleType.value)
        case 'number':
          return ['required', 'min', 'max', 'custom'].includes(ruleType.value)
        case 'select':
        case 'radio':
          return ['required', 'custom'].includes(ruleType.value)
        case 'checkbox':
          return ['custom'].includes(ruleType.value)
        default:
          return ['required', 'custom'].includes(ruleType.value)
      }
    }).map(rt => rt.value)
  }, [fieldType])

  return applicableTypes
}

// 规则管理 Hook
export const useRuleManager = (initialRules: ValidationRuleConfig[] = []) => {
  const [rules, setRules] = useState<ValidationRuleConfig[]>(initialRules)

  const addRule = useCallback((rule: ValidationRuleConfig) => {
    setRules(prev => [...prev, rule])
  }, [])

  const updateRule = useCallback((ruleId: string, updates: Partial<ValidationRuleConfig>) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ))
  }, [])

  const removeRule = useCallback((ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId))
  }, [])

  const toggleRule = useCallback((ruleId: string, enabled?: boolean) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, enabled: enabled !== undefined ? enabled : !rule.enabled } : rule
    ))
  }, [])

  const clearRules = useCallback(() => {
    setRules([])
  }, [])

  const enabledCount = useMemo(() => {
    return rules.filter(rule => rule.enabled).length
  }, [rules])

  const getRuleById = useCallback((ruleId: string) => {
    return rules.find(rule => rule.id === ruleId)
  }, [rules])

  return {
    rules,
    addRule,
    updateRule,
    removeRule,
    toggleRule,
    clearRules,
    enabledCount,
    getRuleById,
  }
}

// 规则执行器 Hook
export const useRuleExecutor = (rules: ValidationRuleConfig[]) => {
  const validate = useCallback((value: any): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // 只执行启用的规则
    const enabledRules = rules.filter(rule => rule.enabled)

    for (const rule of enabledRules) {
      try {
        let isValid = true

        switch (rule.type) {
          case 'required':
            isValid = value !== undefined && value !== null && value !== '' && String(value).trim() !== ''
            break

          case 'minLength':
            if (typeof value === 'string') {
              isValid = value.length >= (rule.value || 0)
            }
            break

          case 'maxLength':
            if (typeof value === 'string') {
              isValid = value.length <= (rule.value || Infinity)
            }
            break

          case 'min':
            if (typeof value === 'number') {
              isValid = value >= (rule.value || -Infinity)
            }
            break

          case 'max':
            if (typeof value === 'number') {
              isValid = value <= (rule.value || Infinity)
            }
            break

          case 'pattern':
            if (typeof value === 'string' && rule.value) {
              const regex = new RegExp(rule.value)
              isValid = regex.test(value)
            }
            break

          case 'email':
            if (typeof value === 'string') {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              isValid = emailRegex.test(value)
            }
            break

          case 'phone':
            if (typeof value === 'string') {
              const phoneRegex = /^1[3-9]\d{9}$/
              isValid = phoneRegex.test(value.replace(/\s+/g, ''))
            }
            break

          case 'url':
            if (typeof value === 'string') {
              try {
                new URL(value)
                isValid = true
              } catch {
                isValid = false
              }
            }
            break

          case 'idCard':
            if (typeof value === 'string') {
              const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/
              isValid = idCardRegex.test(value)
            }
            break

          case 'custom':
            if (typeof rule.value === 'function') {
              isValid = rule.value(value)
            }
            break

          default:
            // 未知规则类型，跳过
            continue
        }

        if (!isValid && rule.errorMessage) {
          errors.push(rule.errorMessage)
        }
      } catch (error) {
        warnings.push(`规则 ${rule.type} 执行出错: ${error}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }, [rules])

  return { validate }
}

// 验证预设管理 Hook
export const useValidationPresets = (fieldType: string) => {
  const presets = useMemo(() => {
    let fieldPresets: Record<string, ValidationPreset> = {}

    if (fieldType === 'string' || fieldType === 'textarea') {
      fieldPresets = createStringPresets()
    } else if (fieldType === 'number') {
      fieldPresets = createNumberPresets()
    }

    return fieldPresets
  }, [fieldType])

  const getPreset = useCallback((presetKey: string) => {
    return presets[presetKey]
  }, [presets])

  const getAllPresets = useCallback(() => {
    return Object.entries(presets).map(([key, preset]) => ({ ...preset, key }))
  }, [presets])

  const applyPreset = useCallback((presetKey: string, customizations?: Partial<ValidationRuleConfig>[]) => {
    const preset = presets[presetKey]
    if (!preset) return []

    let rules = [...preset.rules]

    // 应用自定义配置
    if (customizations) {
      rules = rules.map(rule => {
        const customization = customizations.find(c => c.id === rule.id)
        return customization ? { ...rule, ...customization } : rule
      })
    }

    return rules
  }, [presets])

  return {
    getPreset,
    getAllPresets,
    applyPreset,
  }
}

// 错误消息管理 Hook
export const useErrorMessages = (customMessages?: Record<string, string>) => {
  const messages = useMemo(() => ({
    ...ERROR_MESSAGE_TEMPLATES,
    ...customMessages,
  }), [customMessages])

  const getMessage = useCallback((type: string, variables?: Record<string, any>) => {
    let message = messages[type] || ERROR_MESSAGE_TEMPLATES[type] || '验证失败'

    // 替换模板变量
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      })
    }

    return message
  }, [messages])

  const setMessage = useCallback((type: string, message: string) => {
    // 在实际应用中，这里应该更新状态
    console.log(`设置错误消息 ${type}: ${message}`)
  }, [])

  return {
    getMessage,
    setMessage,
  }
}

// 规则导入导出 Hook
export const useRuleImportExport = () => {
  const exportToJSON = useCallback((
    rules: ValidationRuleConfig[],
    field: FieldDefinition
  ): string => {
    const exportData = {
      field: field.key,
      fieldType: field.type,
      rules: rules.map(({ id, ...rule }) => rule),
      metadata: {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
      },
    }

    return JSON.stringify(exportData, null, 2)
  }, [])

  const importFromJSON = useCallback((jsonString: string): ValidationRuleConfig[] => {
    try {
      const importData = JSON.parse(jsonString)

      if (!importData.rules || !Array.isArray(importData.rules)) {
        throw new Error('导入数据格式不正确')
      }

      return importData.rules.map((rule: any, index: number) => ({
        id: rule.id || `imported_${index}_${Date.now()}`,
        type: rule.type,
        value: rule.value,
        enabled: rule.enabled !== false,
        errorMessage: rule.errorMessage,
        description: rule.description,
      }))
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('无效的JSON格式')
      }
      throw error
    }
  }, [])

  const generateRuleCode = useCallback((
    rules: ValidationRuleConfig[],
    fieldName: string
  ): string => {
    const ruleFunctions = rules.map(rule => {
      switch (rule.type) {
        case 'required':
          return `  // 必填验证\n  if (!value || value.trim() === '') {\n    errors.push('${rule.errorMessage}');\n  }`

        case 'minLength':
          return `  // 最小长度验证\n  if (value.length < ${rule.value}) {\n    errors.push('${rule.errorMessage}');\n  }`

        case 'maxLength':
          return `  // 最大长度验证\n  if (value.length > ${rule.value}) {\n    errors.push('${rule.errorMessage}');\n  }`

        case 'min':
          return `  // 最小值验证\n  if (value < ${rule.value}) {\n    errors.push('${rule.errorMessage}');\n  }`

        case 'max':
          return `  // 最大值验证\n  if (value > ${rule.value}) {\n    errors.push('${rule.errorMessage}');\n  }`

        case 'pattern':
          return `  // 格式验证\n  const pattern = ${rule.value};\n  if (!pattern.test(value)) {\n    errors.push('${rule.errorMessage}');\n  }`

        case 'email':
          return `  // 邮箱验证\n  const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  if (!emailPattern.test(value)) {\n    errors.push('${rule.errorMessage}');\n  }`

        default:
          return `  // 自定义验证\n  // TODO: 实现 ${rule.type} 验证逻辑`
      }
    }).join('\n\n')

    return `function validate${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}(value) {
  const errors = [];

  // 只执行启用的规则
  const enabledRules = ${JSON.stringify(rules.filter(r => r.enabled), null, 2)};

${ruleFunctions}

  return {
    isValid: errors.length === 0,
    errors
  };
}`
  }, [])

  return {
    exportToJSON,
    importFromJSON,
    generateRuleCode,
  }
}

// 规则序列化 Hook
export const useRuleSerializer = () => {
  const serialize = useCallback((rules: ValidationRuleConfig[]) => {
    return {
      version: '1.0.0',
      rules,
      metadata: {
        serializedAt: new Date().toISOString(),
        ruleCount: rules.length,
      },
    }
  }, [])

  const deserialize = useCallback((config: any): ValidationRuleConfig[] => {
    if (!config.rules || !Array.isArray(config.rules)) {
      throw new Error('无效的配置格式')
    }

    return config.rules.map((rule: any) => ({
      id: rule.id || `rule_${Date.now()}_${Math.random()}`,
      type: rule.type,
      value: rule.value,
      enabled: rule.enabled !== false,
      errorMessage: rule.errorMessage,
      description: rule.description,
    }))
  }, [])

  const validateConfig = useCallback((config: any): boolean => {
    return (
      config &&
      typeof config === 'object' &&
      config.version &&
      Array.isArray(config.rules) &&
      config.metadata
    )
  }, [])

  return {
    serialize,
    deserialize,
    validateConfig,
  }
}

// 合并所有核心逻辑为 ValidationEditorCore
export const ValidationEditorCore = {
  useApplicableRuleTypes,
  useRuleManager,
  useRuleExecutor,
  useValidationPresets,
  useErrorMessages,
  useRuleImportExport,
  useRuleSerializer,
  VALIDATION_RULE_TYPES,
  ERROR_MESSAGE_TEMPLATES,
}