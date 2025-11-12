import { describe, it, expect, beforeEach } from '@jest/globals'

// 属性验证系统
import {
  PropertyValidator,
  ValidationRule,
  ValidationResult,
  PropertyType,
  PropertySchema
} from '@/lib/designer/validation/property-validator'

describe('Property Validation', () => {
  let validator: PropertyValidator

  beforeEach(() => {
    validator = new PropertyValidator()
  })

  describe('字符串类型验证', () => {
    it('应该验证有效的字符串', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        minLength: 1,
        maxLength: 50
      }

      const result = validator.validate('Hello World', schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝过短的字符串', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        minLength: 5
      }

      const result = validator.validate('Hi', schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('至少需要5个字符')
    })

    it('应该拒绝过长的字符串', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        maxLength: 10
      }

      const result = validator.validate('This is a very long string', schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('不能超过10个字符')
    })

    it('应该支持正则表达式验证', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        pattern: '^[a-zA-Z0-9]+$'
      }

      const validResult = validator.validate('Valid123', schema)
      expect(validResult.valid).toBe(true)

      const invalidResult = validator.validate('Invalid@123', schema)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors[0].message).toContain('格式不正确')
    })
  })

  describe('数字类型验证', () => {
    it('应该验证有效的数字', () => {
      const schema: PropertySchema = {
        type: PropertyType.NUMBER,
        minimum: 0,
        maximum: 100
      }

      const result = validator.validate(50, schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝过小的数字', () => {
      const schema: PropertySchema = {
        type: PropertyType.NUMBER,
        minimum: 10
      }

      const result = validator.validate(5, schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('不能小于10')
    })

    it('应该拒绝过大的数字', () => {
      const schema: PropertySchema = {
        type: PropertyType.NUMBER,
        maximum: 100
      }

      const result = validator.validate(150, schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('不能大于100')
    })

    it('应该接受字符串形式的数字', () => {
      const schema: PropertySchema = {
        type: PropertyType.NUMBER,
        minimum: 0
      }

      const result = validator.validate('50', schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝非数字字符串', () => {
      const schema: PropertySchema = {
        type: PropertyType.NUMBER
      }

      const result = validator.validate('not-a-number', schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('必须是数字')
    })
  })

  describe('布尔类型验证', () => {
    it('应该验证布尔值 true', () => {
      const schema: PropertySchema = {
        type: PropertyType.BOOLEAN
      }

      const result = validator.validate(true, schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该验证布尔值 false', () => {
      const schema: PropertySchema = {
        type: PropertyType.BOOLEAN
      }

      const result = validator.validate(false, schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该接受字符串形式的布尔值', () => {
      const schema: PropertySchema = {
        type: PropertyType.BOOLEAN
      }

      const trueResult = validator.validate('true', schema)
      expect(trueResult.valid).toBe(true)

      const falseResult = validator.validate('false', schema)
      expect(falseResult.valid).toBe(true)

      const result1 = validator.validate('1', schema)
      expect(result1.valid).toBe(true)

      const result0 = validator.validate('0', schema)
      expect(result0.valid).toBe(true)
    })

    it('应该拒绝无效的布尔值', () => {
      const schema: PropertySchema = {
        type: PropertyType.BOOLEAN
      }

      const result = validator.validate('maybe', schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('必须是布尔值')
    })
  })

  describe('必需字段验证', () => {
    it('应该拒绝空的必需字段', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        required: true
      }

      const result = validator.validate('', schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('必填项')
    })

    it('应该拒绝null的必需字段', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        required: true
      }

      const result = validator.validate(null, schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('必填项')
    })

    it('应该拒绝undefined的必需字段', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        required: true
      }

      const result = validator.validate(undefined, schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('必填项')
    })

    it('应该接受非空的必需字段', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        required: true
      }

      const result = validator.validate('valid value', schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该接受空的非必需字段', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        required: false
      }

      const result = validator.validate('', schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('枚举值验证', () => {
    it('应该验证有效的枚举值', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        enum: ['small', 'medium', 'large']
      }

      const result = validator.validate('medium', schema)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该拒绝无效的枚举值', () => {
      const schema: PropertySchema = {
        type: PropertyType.STRING,
        enum: ['small', 'medium', 'large']
      }

      const result = validator.validate('extra-large', schema)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('必须是以下值之一')
    })
  })

  describe('自定义验证规则', () => {
    it('应该支持自定义验证函数', () => {
      const customRule: ValidationRule = {
        type: 'custom',
        validator: (value: any, schema?: PropertySchema) => {
          if (typeof value === 'string' && value.includes('@')) {
            return { valid: true, errors: [], warnings: [] }
          }
          return { valid: false, errors: [{ code: 'CUSTOM', message: '必须包含@符号', value }], warnings: [] }
        }
      }

      const schema: PropertySchema = {
        type: PropertyType.STRING,
        customRules: [customRule]
      }

      const validResult = validator.validate('user@example.com', schema)
      expect(validResult.valid).toBe(true)

      const invalidResult = validator.validate('invalid-email', schema)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors[0].message).toBe('必须包含@符号')
    })

    it('应该支持多个自定义验证规则', () => {
      const customRules: ValidationRule[] = [
        {
          type: 'custom',
          validator: (value: any) => ({
            valid: typeof value === 'string' && value.length >= 8,
            errors: typeof value === 'string' && value.length >= 8 ? [] : [{ code: 'CUSTOM', message: '至少需要8个字符', value }],
            warnings: []
          })
        },
        {
          type: 'custom',
          validator: (value: any) => ({
            valid: typeof value === 'string' && /[A-Z]/.test(value),
            errors: typeof value === 'string' && /[A-Z]/.test(value) ? [] : [{ code: 'CUSTOM', message: '至少需要1个大写字母', value }],
            warnings: []
          })
        }
      ]

      const schema: PropertySchema = {
        type: PropertyType.STRING,
        customRules
      }

      const validResult = validator.validate('StrongPass', schema)
      expect(validResult.valid).toBe(true)

      const weakResult = validator.validate('weak', schema)
      expect(weakResult.valid).toBe(false)
      expect(weakResult.errors).toHaveLength(2)
    })
  })

  describe('批量验证', () => {
    it('应该验证多个属性', () => {
      const schemas = {
        username: {
          type: PropertyType.STRING,
          required: true,
          minLength: 3,
          maxLength: 20
        } as PropertySchema,
        age: {
          type: PropertyType.NUMBER,
          minimum: 18,
          maximum: 100
        } as PropertySchema,
        email: {
          type: PropertyType.STRING,
          required: true,
          pattern: '^[^@]+@[^@]+\.[^@]+$'
        } as PropertySchema
      }

      const values = {
        username: 'john',
        age: 25,
        email: 'john@example.com'
      }

      const results = validator.validateMultiple(values, schemas)

      expect(results.username.valid).toBe(true)
      expect(results.age.valid).toBe(true)
      expect(results.email.valid).toBe(true)
    })

    it('应该返回所有验证错误', () => {
      const schemas = {
        username: {
          type: PropertyType.STRING,
          required: true,
          minLength: 3
        } as PropertySchema,
        age: {
          type: PropertyType.NUMBER,
          minimum: 18
        } as PropertySchema
      }

      const values = {
        username: 'jo', // 太短
        age: 15 // 太小
      }

      const results = validator.validateMultiple(values, schemas)

      expect(results.username.valid).toBe(false)
      expect(results.age.valid).toBe(false)
      expect(results.username.errors.length).toBeGreaterThan(0)
      expect(results.age.errors.length).toBeGreaterThan(0)
    })
  })

  describe('异步验证', () => {
    it('应该支持异步验证规则', async () => {
      const asyncRule: ValidationRule = {
        type: 'custom',
        validator: async (value: any) => {
          // 模拟API调用检查用户名是否已存在
          await new Promise(resolve => setTimeout(resolve, 100))
          return {
            valid: value !== 'taken-username',
            errors: value !== 'taken-username' ? [] : [{ code: 'ASYNC_CUSTOM', message: '用户名已被占用', value }],
            warnings: []
          }
        }
      }

      const schema: PropertySchema = {
        type: PropertyType.STRING,
        customRules: [asyncRule]
      }

      const validResult = await validator.validateAsync('available-username', schema)
      expect(validResult.valid).toBe(true)

      const invalidResult = await validator.validateAsync('taken-username', schema)
      expect(invalidResult.valid).toBe(false)
      if (invalidResult.errors.length > 0) {
        expect(invalidResult.errors[0].message).toBe('用户名已被占用')
      }
    })
  })
})