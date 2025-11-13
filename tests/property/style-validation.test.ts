/**
 * 样式属性验证单元测试
 * 测试样式属性验证的各种场景和规则
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

// 待实现的样式验证器类型定义
interface StyleValidationRule {
  name: string
  validate: (value: unknown) => ValidationResult
}

interface ValidationResult {
  valid: boolean
  message?: string
  normalized?: unknown
}

interface StylePropertySchema {
  type: 'color' | 'size' | 'spacing' | 'alignment' | 'position'
  required?: boolean
  default?: unknown
  validation?: StyleValidationRule[]
  responsive?: boolean
}

interface StyleProperty {
  name: string
  value: unknown
  schema: StylePropertySchema
}

// 模拟样式验证器实现（待在T036中实现）
class StylePropertyValidator {
  private rules: Map<string, StyleValidationRule[]> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules(): void {
    // 颜色验证规则
    this.addRule('color', [
      {
        name: 'hex-color',
        validate: (value: unknown) => {
          if (typeof value !== 'string') {
            return { valid: false, message: '颜色值必须是字符串' }
          }
          const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
          return {
            valid: hexRegex.test(value),
            message: hexRegex.test(value) ? undefined : '请输入有效的十六进制颜色值（如 #FF0000）'
          }
        }
      },
      {
        name: 'named-color',
        validate: (value: unknown) => {
          if (typeof value !== 'string') {
            return { valid: false, message: '颜色值必须是字符串' }
          }
          const namedColors = [
            'red', 'blue', 'green', 'yellow', 'purple', 'orange',
            'black', 'white', 'gray', 'transparent'
          ]
          return {
            valid: namedColors.includes(value.toLowerCase()),
            message: namedColors.includes(value.toLowerCase())
              ? undefined
              : '请输入有效的颜色名称或十六进制值'
          }
        }
      }
    ])

    // 尺寸验证规则
    this.addRule('size', [
      {
        name: 'size-unit',
        validate: (value: unknown) => {
          if (typeof value !== 'string') {
            return { valid: false, message: '尺寸值必须是字符串' }
          }
          const sizeRegex = /^(\d+(\.\d+)?)(px|rem|em|%|vh|vw|auto)$/
          const isValid = sizeRegex.test(value) || value === 'auto'
          return {
            valid: isValid,
            message: isValid ? undefined : '请输入有效的尺寸值（如 10px, 1rem, 100%, auto）'
          }
        }
      }
    ])

    // 间距验证规则
    this.addRule('spacing', [
      {
        name: 'spacing-value',
        validate: (value: unknown) => {
          if (typeof value !== 'string' && typeof value !== 'number') {
            return { valid: false, message: '间距值必须是字符串或数字' }
          }
          const stringValue = String(value)
          const spacingRegex = /^(\d+(\.\d+)?)(px|rem|em)$/
          return {
            valid: spacingRegex.test(stringValue),
            message: spacingRegex.test(stringValue)
              ? undefined
              : '请输入有效的间距值（如 8px, 1rem）'
          }
        }
      }
    ])
  }

  addRule(type: string, rules: StyleValidationRule[]): void {
    this.rules.set(type, rules)
  }

  validateProperty(property: StyleProperty): ValidationResult {
    const { name, value, schema } = property

    // 检查必填属性
    if (schema.required && (value === undefined || value === null || value === '')) {
      return {
        valid: false,
        message: `${name} 是必填属性`
      }
    }

    // 如果值为空且非必填，则跳过验证
    if (!schema.required && (value === undefined || value === null || value === '')) {
      return { valid: true }
    }

    // 执行类型特定验证
    const typeRules = this.rules.get(schema.type) || []
    const validationRules = [...typeRules, ...(schema.validation || [])]

    for (const rule of validationRules) {
      const result = rule.validate(value)
      if (!result.valid) {
        return result
      }
    }

    return { valid: true }
  }

  validateProperties(properties: StyleProperty[]): ValidationResult[] {
    return properties.map(property => this.validateProperty(property))
  }
}

describe('样式属性验证器', () => {
  let validator: StylePropertyValidator

  beforeEach(() => {
    validator = new StylePropertyValidator()
  })

  describe('颜色属性验证', () => {
    it('应该接受有效的十六进制颜色值', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: '#FF0000',
        schema: { type: 'color', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该接受有效的短十六进制颜色值', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: '#F00',
        schema: { type: 'color', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该接受有效的颜色名称', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: 'red',
        schema: { type: 'color', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该拒绝无效的颜色值', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: 'invalid-color',
        schema: { type: 'color', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('请输入有效的颜色名称或十六进制值')
    })

    it('应该拒绝非字符串类型的颜色值', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: 123,
        schema: { type: 'color', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('颜色值必须是字符串')
    })
  })

  describe('尺寸属性验证', () => {
    it('应该接受有效的像素尺寸', () => {
      const property: StyleProperty = {
        name: 'width',
        value: '100px',
        schema: { type: 'size', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该接受有效的rem尺寸', () => {
      const property: StyleProperty = {
        name: 'width',
        value: '1.5rem',
        schema: { type: 'size', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该接受有效的百分比尺寸', () => {
      const property: StyleProperty = {
        name: 'width',
        value: '50%',
        schema: { type: 'size', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该接受auto值', () => {
      const property: StyleProperty = {
        name: 'width',
        value: 'auto',
        schema: { type: 'size', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该拒绝无效的尺寸值', () => {
      const property: StyleProperty = {
        name: 'width',
        value: '100',
        schema: { type: 'size', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('请输入有效的尺寸值')
    })
  })

  describe('间距属性验证', () => {
    it('应该接受有效的像素间距', () => {
      const property: StyleProperty = {
        name: 'padding',
        value: '16px',
        schema: { type: 'spacing', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该接受有效的rem间距', () => {
      const property: StyleProperty = {
        name: 'margin',
        value: '1rem',
        schema: { type: 'spacing', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该拒绝无效的间距值', () => {
      const property: StyleProperty = {
        name: 'padding',
        value: '16',
        schema: { type: 'spacing', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('请输入有效的间距值')
    })
  })

  describe('必填属性验证', () => {
    it('应该拒绝空的必填属性', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: '',
        schema: { type: 'color', required: true }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(false)
      expect(result.message).toContain('是必填属性')
    })

    it('应该允许空的非必填属性', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: '',
        schema: { type: 'color', required: false }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })

    it('应该允许undefined的非必填属性', () => {
      const property: StyleProperty = {
        name: 'backgroundColor',
        value: undefined,
        schema: { type: 'color', required: false }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
    })
  })

  describe('批量属性验证', () => {
    it('应该验证多个属性', () => {
      const properties: StyleProperty[] = [
        {
          name: 'backgroundColor',
          value: '#FF0000',
          schema: { type: 'color', required: true }
        },
        {
          name: 'width',
          value: '100px',
          schema: { type: 'size', required: true }
        },
        {
          name: 'padding',
          value: '16px',
          schema: { type: 'spacing', required: false }
        }
      ]

      const results = validator.validateProperties(properties)
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.valid).toBe(true)
      })
    })

    it('应该返回所有验证错误', () => {
      const properties: StyleProperty[] = [
        {
          name: 'backgroundColor',
          value: 'invalid-color',
          schema: { type: 'color', required: true }
        },
        {
          name: 'width',
          value: 'invalid-size',
          schema: { type: 'size', required: true }
        }
      ]

      const results = validator.validateProperties(properties)
      expect(results).toHaveLength(2)
      results.forEach(result => {
        expect(result.valid).toBe(false)
        expect(result.message).toBeDefined()
      })
    })
  })

  describe('自定义验证规则', () => {
    it('应该支持添加自定义验证规则', () => {
      const customRule: StyleValidationRule = {
        name: 'custom-color',
        validate: (value: unknown) => {
          if (value === 'custom-blue') {
            return { valid: true, normalized: '#0000FF' }
          }
          return { valid: false, message: '只允许 custom-blue' }
        }
      }

      validator.addRule('color', [customRule])

      const property: StyleProperty = {
        name: 'backgroundColor',
        value: 'custom-blue',
        schema: { type: 'color', required: true, validation: [customRule] }
      }

      const result = validator.validateProperty(property)
      expect(result.valid).toBe(true)
      expect(result.normalized).toBe('#0000FF')
    })
  })
})

describe('样式验证边界情况', () => {
  let validator: StylePropertyValidator

  beforeEach(() => {
    validator = new StylePropertyValidator()
  })

  it('应该处理null值', () => {
    const property: StyleProperty = {
      name: 'backgroundColor',
      value: null,
      schema: { type: 'color', required: false }
    }

    const result = validator.validateProperty(property)
    expect(result.valid).toBe(true)
  })

  it('应该处理undefined值', () => {
    const property: StyleProperty = {
      name: 'backgroundColor',
      value: undefined,
      schema: { type: 'color', required: false }
    }

    const result = validator.validateProperty(property)
    expect(result.valid).toBe(true)
  })

  it('应该处理空字符串', () => {
    const property: StyleProperty = {
      name: 'backgroundColor',
      value: '',
      schema: { type: 'color', required: false }
    }

    const result = validator.validateProperty(property)
    expect(result.valid).toBe(true)
  })

  it('应该处理空数组', () => {
    const results = validator.validateProperties([])
    expect(results).toHaveLength(0)
  })

  it('应该处理未知的属性类型', () => {
    const property: StyleProperty = {
      name: 'unknownProperty',
      value: 'some-value',
      schema: { type: 'unknown' as any, required: true }
    }

    const result = validator.validateProperty(property)
    expect(result.valid).toBe(true)
  })
})