/**
 * 验证规则引擎
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T007 - 验证规则引擎实现
 * 创建日期: 2025-10-29
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 验证规则类型枚举
 */
export enum ValidationRuleType {
  REQUIRED = 'required',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
  EMAIL = 'email',
  PATTERN = 'pattern',
  CUSTOM = 'custom',
}

/**
 * 属性类型枚举
 */
export enum PropType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  EMAIL = 'email',
  ARRAY = 'array',
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  duration: number
  timestamp: string
}

/**
 * 验证错误信息
 */
export interface ValidationError {
  code: string
  message: string
  field: string
  value: any
  params?: Record<string, any>
  severity: 'error' | 'warning' | 'info'
}

/**
 * 验证警告信息
 */
export interface ValidationWarning {
  code: string
  message: string
  field: string
  value: any
  params?: Record<string, any>
}

/**
 * 验证上下文
 */
export interface ValidationContext {
  componentId?: string
  propertyName?: string
  allValues?: Record<string, any>
  mode: 'create' | 'update' | 'preview'
  locale: string
  customData?: Record<string, any>
}

/**
 * 验证规则基础接口
 */
export interface ValidationRule {
  id: string
  type: ValidationRuleType
  name: string
  description?: string
  enabled: boolean
  priority: number
  stopOnFail: boolean
  params: Record<string, any>
  message?: string
  validator?: ValidatorFunction
  asyncValidator?: AsyncValidatorFunction
}

/**
 * 同步验证函数类型
 */
export type ValidatorFunction = (
  value: any,
  rule: ValidationRule,
  context: ValidationContext
) => ValidationResult | Promise<ValidationResult>

/**
 * 异步验证函数类型
 */
export type AsyncValidatorFunction = (
  value: any,
  rule: ValidationRule,
  context: ValidationContext
) => Promise<ValidationResult>

/**
 * 验证器接口
 */
export interface Validator {
  name: string
  description: string
  supportedTypes: PropType[]
  validate: ValidatorFunction
  defaultConfig?: Record<string, any>
}

/**
 * 验证引擎配置
 */
export interface ValidationEngineConfig {
  defaultLocale: string
  enableAsyncValidation: boolean
  asyncValidationTimeout: number
  enableCache: boolean
  cacheExpiration: number
  globalValidators: Validator[]
  customMessages: Record<string, string>
  performanceMonitoring: boolean
  debugMode: boolean
}

/**
 * 属性验证配置
 */
export interface PropertyValidationConfig {
  propertyName: string
  propertyType: PropType
  rules: ValidationRule[]
  realTimeValidation?: boolean
  triggerOn?: 'change' | 'blur' | 'submit' | 'manual'
  debounceMs?: number
}

/**
 * 批量验证结果
 */
export interface BatchValidationResult {
  isValid: boolean
  fieldResults: Record<string, ValidationResult>
  allErrors: ValidationError[]
  allWarnings: ValidationWarning[]
  summary: {
    totalFields: number
    validFields: number
    invalidFields: number
    warningFields: number
    totalErrors: number
    totalWarnings: number
    duration: number
  }
}

// ============================================================================
// 验证器工厂函数
// ============================================================================

/**
 * 创建验证结果
 */
function createValidationResult(
  isValid: boolean,
  errors: ValidationError[] = [],
  warnings: ValidationWarning[] = [],
  duration: number = 0
): ValidationResult {
  return {
    isValid,
    errors,
    warnings,
    duration,
    timestamp: new Date().toISOString(),
  }
}

/**
 * 创建验证错误
 */
function createValidationError(
  code: string,
  message: string,
  field: string,
  value: any,
  params?: Record<string, any>
): ValidationError {
  return {
    code,
    message,
    field,
    value,
    params,
    severity: 'error',
  }
}

// ============================================================================
// 基础验证器实现
// ============================================================================

/**
 * 必填验证器
 */
export const RequiredValidator: Validator = {
  name: 'required',
  description: '验证字段是否必填',
  supportedTypes: Object.values(PropType),
  validate: (value: any, rule: ValidationRule, context: ValidationContext): ValidationResult => {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    const { allowEmptyString = false, allowEmptyArray = false } = rule.params

    if (value === null || value === undefined) {
      errors.push(
        createValidationError(
          'REQUIRED',
          rule.message || `${context.propertyName || '字段'}是必填字段`,
          context.propertyName || '',
          value
        )
      )
    } else {
      if (!allowEmptyString && typeof value === 'string' && value.trim() === '') {
        errors.push(
          createValidationError(
            'REQUIRED_EMPTY',
            rule.message || `${context.propertyName || '字段'}不能为空`,
            context.propertyName || '',
            value
          )
        )
      }
      if (!allowEmptyArray && Array.isArray(value) && value.length === 0) {
        errors.push(
          createValidationError(
            'REQUIRED_EMPTY_ARRAY',
            rule.message || `${context.propertyName || '字段'}至少需要包含一个元素`,
            context.propertyName || '',
            value
          )
        )
      }
    }

    return createValidationResult(errors.length === 0, errors, [], Date.now() - startTime)
  },
  defaultConfig: {
    allowEmptyString: false,
    allowEmptyArray: false,
  },
}

/**
 * 最小长度验证器
 */
export const MinLengthValidator: Validator = {
  name: 'min_length',
  description: '验证字符串或数组的最小长度',
  supportedTypes: [PropType.STRING, PropType.ARRAY],
  validate: (value: any, rule: ValidationRule, context: ValidationContext): ValidationResult => {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    const { length: minLength } = rule.params

    if (value === null || value === undefined) {
      return createValidationResult(true, [], [], Date.now() - startTime)
    }

    let actualLength = 0
    if (typeof value === 'string') {
      actualLength = value.length
    } else if (Array.isArray(value)) {
      actualLength = value.length
    } else {
      errors.push(
        createValidationError(
          'INVALID_TYPE',
          rule.message || `${context.propertyName || '字段'}必须是字符串或数组`,
          context.propertyName || '',
          value
        )
      )
      return createValidationResult(false, errors, [], Date.now() - startTime)
    }

    if (actualLength < minLength) {
      errors.push(
        createValidationError(
          'MIN_LENGTH',
          rule.message || `${context.propertyName || '字段'}长度不能少于${minLength}个字符`,
          context.propertyName || '',
          value,
          { minLength, actualLength }
        )
      )
    }

    return createValidationResult(errors.length === 0, errors, [], Date.now() - startTime)
  },
  defaultConfig: {
    length: 1,
  },
}

/**
 * 最大长度验证器
 */
export const MaxLengthValidator: Validator = {
  name: 'max_length',
  description: '验证字符串或数组的最大长度',
  supportedTypes: [PropType.STRING, PropType.ARRAY],
  validate: (value: any, rule: ValidationRule, context: ValidationContext): ValidationResult => {
    const startTime = Date.now()
    const errors: ValidationError[] = []
    const { length: maxLength } = rule.params

    if (value === null || value === undefined) {
      return createValidationResult(true, [], [], Date.now() - startTime)
    }

    let actualLength = 0
    if (typeof value === 'string') {
      actualLength = value.length
    } else if (Array.isArray(value)) {
      actualLength = value.length
    } else {
      errors.push(
        createValidationError(
          'INVALID_TYPE',
          rule.message || `${context.propertyName || '字段'}必须是字符串或数组`,
          context.propertyName || '',
          value
        )
      )
      return createValidationResult(false, errors, [], Date.now() - startTime)
    }

    if (actualLength > maxLength) {
      errors.push(
        createValidationError(
          'MAX_LENGTH',
          rule.message || `${context.propertyName || '字段'}长度不能超过${maxLength}个字符`,
          context.propertyName || '',
          value,
          { maxLength, actualLength }
        )
      )
    }

    return createValidationResult(errors.length === 0, errors, [], Date.now() - startTime)
  },
  defaultConfig: {
    length: 255,
  },
}

/**
 * 邮箱验证器
 */
export const EmailValidator: Validator = {
  name: 'email',
  description: '验证邮箱格式',
  supportedTypes: [PropType.STRING, PropType.EMAIL],
  validate: (value: any, rule: ValidationRule, context: ValidationContext): ValidationResult => {
    const startTime = Date.now()
    const errors: ValidationError[] = []

    if (value === null || value === undefined) {
      return createValidationResult(true, [], [], Date.now() - startTime)
    }

    if (typeof value !== 'string') {
      errors.push(
        createValidationError(
          'INVALID_TYPE',
          rule.message || `${context.propertyName || '字段'}必须是字符串`,
          context.propertyName || '',
          value
        )
      )
      return createValidationResult(false, errors, [], Date.now() - startTime)
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(value)) {
      errors.push(
        createValidationError(
          'INVALID_EMAIL',
          rule.message || `${context.propertyName || '字段'}必须是有效的邮箱地址`,
          context.propertyName || '',
          value
        )
      )
    }

    return createValidationResult(errors.length === 0, errors, [], Date.now() - startTime)
  },
}

/**
 * 内置验证器注册表
 */
export const BUILTIN_VALIDATORS: Record<ValidationRuleType, Validator> = {
  [ValidationRuleType.REQUIRED]: RequiredValidator,
  [ValidationRuleType.MIN_LENGTH]: MinLengthValidator,
  [ValidationRuleType.MAX_LENGTH]: MaxLengthValidator,
  [ValidationRuleType.EMAIL]: EmailValidator,
  [ValidationRuleType.PATTERN]: RequiredValidator, // 占位符
  [ValidationRuleType.CUSTOM]: RequiredValidator, // 占位符
}

// ============================================================================
// 验证引擎实现
// ============================================================================

/**
 * 验证引擎类
 */
export class ValidationEngine {
  private config: ValidationEngineConfig
  private customValidators: Map<string, Validator> = new Map()

  constructor(config: Partial<ValidationEngineConfig> = {}) {
    this.config = {
      defaultLocale: 'zh-CN',
      enableAsyncValidation: true,
      asyncValidationTimeout: 10000,
      enableCache: true,
      cacheExpiration: 300000,
      globalValidators: [],
      customMessages: {},
      performanceMonitoring: false,
      debugMode: false,
      ...config,
    }
  }

  /**
   * 注册自定义验证器
   */
  registerValidator(name: string, validator: Validator): void {
    this.customValidators.set(name, validator)
  }

  /**
   * 验证单个值
   */
  async validateValue(
    value: any,
    rules: ValidationRule[],
    context: Partial<ValidationContext> = {}
  ): Promise<ValidationResult> {
    const fullContext: ValidationContext = {
      mode: 'create',
      locale: this.config.defaultLocale,
      allValues: {},
      ...context,
    }

    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []

    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority)

    for (const rule of sortedRules) {
      if (!rule.enabled) continue

      const validator = BUILTIN_VALIDATORS[rule.type] || this.customValidators.get(rule.type)
      if (validator) {
        try {
          const result = await validator.validate(value, rule, fullContext)
          allErrors.push(...result.errors)
          allWarnings.push(...result.warnings)

          if (!result.isValid && rule.stopOnFail) {
            break
          }
        } catch (error) {
          allErrors.push(
            createValidationError(
              'VALIDATION_ERROR',
              `验证执行失败：${(error as Error).message}`,
              context.propertyName || '',
              value
            )
          )
        }
      }
    }

    return createValidationResult(allErrors.length === 0, allErrors, allWarnings, 0)
  }
}

/**
 * 创建默认验证引擎实例
 */
export const defaultValidationEngine = new ValidationEngine()

/**
 * 创建验证规则
 */
export function createValidationRule(
  type: ValidationRuleType,
  params: any,
  options: Partial<ValidationRule> = {}
): ValidationRule {
  return {
    id: options.id || `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    name: options.name || type,
    description: options.description,
    enabled: options.enabled !== false,
    priority: options.priority || 0,
    stopOnFail: options.stopOnFail || false,
    params,
    message: options.message,
  }
}

/**
 * 创建必填规则
 */
export function createRequiredRule(options: Partial<ValidationRule> = {}): ValidationRule {
  return createValidationRule(
    ValidationRuleType.REQUIRED,
    {
      allowEmptyString: false,
      allowEmptyArray: false,
    },
    options
  )
}

/**
 * 创建最小长度规则
 */
export function createMinLengthRule(
  minLength: number,
  options: Partial<ValidationRule> = {}
): ValidationRule {
  return createValidationRule(
    ValidationRuleType.MIN_LENGTH,
    {
      length: minLength,
    },
    options
  )
}

/**
 * 创建最大长度规则
 */
export function createMaxLengthRule(
  maxLength: number,
  options: Partial<ValidationRule> = {}
): ValidationRule {
  return createValidationRule(
    ValidationRuleType.MAX_LENGTH,
    {
      length: maxLength,
    },
    options
  )
}

/**
 * 创建邮箱规则
 */
export function createEmailRule(options: Partial<ValidationRule> = {}): ValidationRule {
  return createValidationRule(ValidationRuleType.EMAIL, {}, options)
}
