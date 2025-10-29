/**
 * 样式验证模块
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 功能: 样式属性验证、值类型检查、CSS语法验证、安全性检查
 */

import type { ExtendedComponentStyles } from './styles'

/**
 * 验证错误类型
 */
export interface ValidationError {
  /** 错误路径 */
  path: string
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误级别 */
  level: 'error' | 'warning' | 'info'
  /** 无效值 */
  invalidValue?: unknown
  /** 建议值 */
  suggestedValue?: unknown
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 验证错误列表 */
  errors: ValidationError[]
  /** 验证警告列表 */
  warnings: ValidationError[]
  /** 验证信息列表 */
  info: ValidationError[]
  /** 验证统计 */
  stats: {
    totalProperties: number
    validProperties: number
    invalidProperties: number
    warningCount: number
    infoCount: number
  }
}

/**
 * 验证选项
 */
export interface ValidationOptions {
  /** 验证级别 */
  level?: 'strict' | 'normal' | 'loose'
  /** 是否检查安全性 */
  checkSecurity?: boolean
  /** 是否检查性能 */
  checkPerformance?: boolean
  /** 是否提供修复建议 */
  provideSuggestions?: boolean
  /** 自定义验证规则 */
  customRules?: ValidationRule[]
  /** 允许的CSS属性白名单 */
  allowedProperties?: string[]
  /** 禁止的CSS属性黑名单 */
  forbiddenProperties?: string[]
}

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string
  /** 验证函数 */
  validate: (value: unknown, path: string) => ValidationError | null
  /** 规则描述 */
  description?: string
  /** 规则优先级 */
  priority?: number
}

/**
 * CSS属性定义
 */
interface CSSPropertyDefinition {
  /** 属性类型 */
  type:
    | 'length'
    | 'color'
    | 'string'
    | 'number'
    | 'keyword'
    | 'url'
    | 'angle'
    | 'time'
    | 'frequency'
    | 'resolution'
  /** 是否继承 */
  inherited: boolean
  /** 初始值 */
  initial: string
  /** 可选值列表 */
  keywords?: string[]
  /** 是否支持计算值 */
  supportsCalc?: boolean
  /** 单位 */
  units?: string[]
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
}

/**
 * 不安全的CSS属性和值
 */
const UNSAFE_PATTERNS = [
  // JavaScript伪协议
  { pattern: /javascript:/i, message: '不允许使用JavaScript伪协议' },
  // VBScript伪协议
  { pattern: /vbscript:/i, message: '不允许使用VBScript伪协议' },
  // 数据URI（可能被滥用）
  { pattern: /data:(?!image\/)/i, message: '不允许使用非图片的数据URI' },
  // 表达式（旧版IE）
  { pattern: /expression\s*\(/i, message: '不允许使用CSS表达式' },
  // @import（可能导致性能问题）
  { pattern: /@import/i, message: '不允许使用@import' },
  // 绑定行为（旧版IE）
  { pattern: /behavior\s*:/i, message: '不允许使用behavior属性' },
]

/**
 * 性能问题模式
 */
const PERFORMANCE_PATTERNS = [
  // 过渡所有属性
  { pattern: /^all\s+/, message: '避免对所有属性使用过渡，影响性能' },
  // 高消耗属性
  {
    pattern: /(filter|box-shadow|border-radius|transform)\s*:/i,
    message: '该属性可能影响渲染性能，请谨慎使用',
    level: 'warning' as const,
  },
  // 复杂选择器
  {
    pattern: /:[not|has|matches]/i,
    message: '复杂伪选择器可能影响性能',
    level: 'warning' as const,
  },
]

/**
 * CSS属性定义表
 */
const CSS_PROPERTIES: Record<string, CSSPropertyDefinition> = {
  // 尺寸属性
  width: {
    type: 'length',
    inherited: false,
    initial: 'auto',
    units: ['px', '%', 'em', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
  },
  height: {
    type: 'length',
    inherited: false,
    initial: 'auto',
    units: ['px', '%', 'em', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
  },
  minWidth: {
    type: 'length',
    inherited: false,
    initial: '0',
    units: ['px', '%', 'em', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
  },
  minHeight: {
    type: 'length',
    inherited: false,
    initial: '0',
    units: ['px', '%', 'em', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
  },
  maxWidth: {
    type: 'length',
    inherited: false,
    initial: 'none',
    units: ['px', '%', 'em', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
  },
  maxHeight: {
    type: 'length',
    inherited: false,
    initial: 'none',
    units: ['px', '%', 'em', 'rem', 'vw', 'vh', 'vmin', 'vmax'],
  },

  // 间距属性
  margin: { type: 'length', inherited: false, initial: '0', units: ['px', '%', 'em', 'rem'] },
  padding: { type: 'length', inherited: false, initial: '0', units: ['px', '%', 'em', 'rem'] },
  marginTop: { type: 'length', inherited: false, initial: '0', units: ['px', '%', 'em', 'rem'] },
  marginRight: { type: 'length', inherited: false, initial: '0', units: ['px', '%', 'em', 'rem'] },
  marginBottom: { type: 'length', inherited: false, initial: '0', units: ['px', '%', 'em', 'rem'] },
  marginLeft: { type: 'length', inherited: false, initial: '0', units: ['px', '%', 'em', 'rem'] },

  // 颜色属性
  color: { type: 'color', inherited: true, initial: 'canvary' },
  backgroundColor: { type: 'color', inherited: false, initial: 'transparent' },
  borderColor: { type: 'color', inherited: false, initial: 'currentcolor' },
  borderTopColor: { type: 'color', inherited: false, initial: 'currentcolor' },
  borderRightColor: { type: 'color', inherited: false, initial: 'currentcolor' },
  borderBottomColor: { type: 'color', inherited: false, initial: 'currentcolor' },
  borderLeftColor: { type: 'color', inherited: false, initial: 'currentcolor' },

  // 字体属性
  fontSize: { type: 'length', inherited: true, initial: 'medium', units: ['px', 'em', 'rem', '%'] },
  fontWeight: {
    type: 'keyword',
    inherited: true,
    initial: 'normal',
    keywords: [
      'normal',
      'bold',
      'bolder',
      'lighter',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ],
  },
  fontFamily: { type: 'string', inherited: true, initial: 'depends on user agent' },
  lineHeight: { type: 'number', inherited: true, initial: 'normal' },
  textAlign: {
    type: 'keyword',
    inherited: true,
    initial: 'left',
    keywords: ['left', 'right', 'center', 'justify', 'start', 'end'],
  },
  textDecoration: {
    type: 'keyword',
    inherited: false,
    initial: 'none',
    keywords: ['none', 'underline', 'overline', 'line-through', 'blink'],
  },

  // 边框属性
  borderWidth: { type: 'length', inherited: false, initial: 'medium', units: ['px'] },
  borderStyle: {
    type: 'keyword',
    inherited: false,
    initial: 'none',
    keywords: [
      'none',
      'hidden',
      'dotted',
      'dashed',
      'solid',
      'double',
      'groove',
      'ridge',
      'inset',
      'outset',
    ],
  },
  borderRadius: { type: 'length', inherited: false, initial: '0', units: ['px', '%', 'em', 'rem'] },

  // 布局属性
  display: {
    type: 'keyword',
    inherited: false,
    initial: 'inline',
    keywords: [
      'none',
      'inline',
      'block',
      'inline-block',
      'flex',
      'inline-flex',
      'grid',
      'inline-grid',
      'table',
      'inline-table',
    ],
  },
  position: {
    type: 'keyword',
    inherited: false,
    initial: 'static',
    keywords: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  },
  top: {
    type: 'length',
    inherited: false,
    initial: 'auto',
    units: ['px', '%', 'em', 'rem', 'vh', 'vw'],
  },
  right: {
    type: 'length',
    inherited: false,
    initial: 'auto',
    units: ['px', '%', 'em', 'rem', 'vh', 'vw'],
  },
  bottom: {
    type: 'length',
    inherited: false,
    initial: 'auto',
    units: ['px', '%', 'em', 'rem', 'vh', 'vw'],
  },
  left: {
    type: 'length',
    inherited: false,
    initial: 'auto',
    units: ['px', '%', 'em', 'rem', 'vh', 'vw'],
  },
  zIndex: { type: 'number', inherited: false, initial: 'auto', min: -2147483648, max: 2147483647 },

  // 其他属性
  opacity: { type: 'number', inherited: false, initial: '1', min: 0, max: 1 },
  visibility: {
    type: 'keyword',
    inherited: true,
    initial: 'visible',
    keywords: ['visible', 'hidden', 'collapse'],
  },
  overflow: {
    type: 'keyword',
    inherited: false,
    initial: 'visible',
    keywords: ['visible', 'hidden', 'scroll', 'auto'],
  },
  cursor: {
    type: 'keyword',
    inherited: true,
    initial: 'auto',
    keywords: [
      'auto',
      'default',
      'none',
      'context-menu',
      'help',
      'pointer',
      'progress',
      'wait',
      'cell',
      'crosshair',
      'text',
      'vertical-text',
      'alias',
      'copy',
      'move',
      'no-drop',
      'not-allowed',
      'e-resize',
      'n-resize',
      'ne-resize',
      'nw-resize',
      's-resize',
      'se-resize',
      'sw-resize',
      'w-resize',
      'ew-resize',
      'ns-resize',
      'nesw-resize',
      'nwse-resize',
      'col-resize',
      'row-resize',
      'all-scroll',
      'zoom-in',
      'zoom-out',
    ],
  },
}

/**
 * 样式验证器
 */
export class StyleValidator {
  private customRules: ValidationRule[] = []
  private defaultOptions: ValidationOptions

  constructor(options?: ValidationOptions) {
    this.defaultOptions = {
      level: 'normal',
      checkSecurity: true,
      checkPerformance: true,
      provideSuggestions: true,
      customRules: [],
      ...options,
    }
  }

  /**
   * 验证样式对象
   */
  validate(styles: ExtendedComponentStyles, options?: ValidationOptions): ValidationResult {
    const opts = { ...this.defaultOptions, ...options }
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      stats: {
        totalProperties: 0,
        validProperties: 0,
        invalidProperties: 0,
        warningCount: 0,
        infoCount: 0,
      },
    }

    this.validateObject(styles as Record<string, unknown>, '', result, opts)

    // 应用自定义验证规则
    this.applyCustomRules(styles, result, opts)

    // 计算最终结果
    result.isValid = result.errors.length === 0
    result.stats.invalidProperties = result.errors.length
    result.stats.warningCount = result.warnings.length
    result.stats.infoCount = result.info.length

    return result
  }

  /**
   * 添加自定义验证规则
   */
  addRule(rule: ValidationRule): void {
    this.customRules.push(rule)
    // 按优先级排序
    this.customRules.sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  /**
   * 移除验证规则
   */
  removeRule(name: string): boolean {
    const index = this.customRules.findIndex(rule => rule.name === name)
    if (index >= 0) {
      this.customRules.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 获取所有自定义规则
   */
  getRules(): ValidationRule[] {
    return [...this.customRules]
  }

  /**
   * 验证单个属性值
   */
  validateProperty(
    property: string,
    value: unknown,
    path: string,
    result: ValidationResult,
    options: ValidationOptions
  ): void {
    result.stats.totalProperties++

    // 检查属性白名单
    if (options.allowedProperties && !options.allowedProperties.includes(property)) {
      const error: ValidationError = {
        path: `${path}.${property}`,
        code: 'FORBIDDEN_PROPERTY',
        message: `属性 ${property} 不在允许的属性列表中`,
        level: 'error',
        invalidValue: value,
      }
      result.errors.push(error)
      return
    }

    // 检查属性黑名单
    if (options.forbiddenProperties && options.forbiddenProperties.includes(property)) {
      const error: ValidationError = {
        path: `${path}.${property}`,
        code: 'FORBIDDEN_PROPERTY',
        message: `属性 ${property} 被禁止使用`,
        level: 'error',
        invalidValue: value,
      }
      result.errors.push(error)
      return
    }

    // 获取属性定义
    const propDef = CSS_PROPERTIES[this.camelToKebab(property)]
    if (!propDef) {
      // 未知属性，根据严格程度决定
      if (options.level === 'strict') {
        const error: ValidationError = {
          path: `${path}.${property}`,
          code: 'UNKNOWN_PROPERTY',
          message: `未知的CSS属性: ${property}`,
          level: 'warning',
          invalidValue: value,
        }
        result.warnings.push(error)
      }
      result.stats.validProperties++
      return
    }

    // 类型验证
    const typeError = this.validatePropertyType(property, value, propDef, path)
    if (typeError) {
      result.errors.push(typeError)
      return
    }

    // 值范围验证
    const rangeError = this.validatePropertyRange(property, value, propDef, path)
    if (rangeError) {
      result.errors.push(rangeError)
      return
    }

    // 安全性检查
    if (options.checkSecurity) {
      const securityError = this.checkSecurity(property, value, path)
      if (securityError) {
        result.errors.push(securityError)
        return
      }
    }

    // 性能检查
    if (options.checkPerformance) {
      const performanceIssue = this.checkPerformance(property, value, path)
      if (performanceIssue) {
        if (performanceIssue.level === 'error') {
          result.errors.push(performanceIssue)
          return
        } else {
          result.warnings.push(performanceIssue)
        }
      }
    }

    result.stats.validProperties++
  }

  /**
   * 验证对象
   */
  private validateObject(
    obj: Record<string, unknown>,
    path: string,
    result: ValidationResult,
    options: ValidationOptions
  ): void {
    if (typeof obj !== 'object' || obj === null) {
      return
    }

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 递归验证嵌套对象
        this.validateObject(value as Record<string, unknown>, currentPath, result, options)
      } else if (key !== 'responsive' && key !== 'customCSS') {
        // 验证属性值（跳过响应式和自定义CSS）
        this.validateProperty(key, value, path, result, options)
      } else if (key === 'customCSS' && typeof value === 'string') {
        // 验证自定义CSS
        this.validateCustomCSS(value, currentPath, result, options)
      }
    })
  }

  /**
   * 验证属性类型
   */
  private validatePropertyType(
    property: string,
    value: unknown,
    propDef: CSSPropertyDefinition,
    path: string
  ): ValidationError | null {
    const stringValue = String(value)

    switch (propDef.type) {
      case 'length':
        if (!this.isValidLength(stringValue, propDef.units)) {
          return {
            path: `${path}.${property}`,
            code: 'INVALID_LENGTH',
            message: `无效的长度值: ${value}`,
            level: 'error',
            invalidValue: value,
            suggestedValue: '0px',
          }
        }
        break

      case 'color':
        if (!this.isValidColor(stringValue)) {
          return {
            path: `${path}.${property}`,
            code: 'INVALID_COLOR',
            message: `无效的颜色值: ${value}`,
            level: 'error',
            invalidValue: value,
            suggestedValue: '#000000',
          }
        }
        break

      case 'number':
        if (!this.isValidNumber(stringValue, propDef.min, propDef.max)) {
          return {
            path: `${path}.${property}`,
            code: 'INVALID_NUMBER',
            message: `无效的数字值: ${value}`,
            level: 'error',
            invalidValue: value,
            suggestedValue: propDef.initial,
          }
        }
        break

      case 'keyword':
        if (!this.isValidKeyword(stringValue, propDef.keywords)) {
          return {
            path: `${path}.${property}`,
            code: 'INVALID_KEYWORD',
            message: `无效的关键字值: ${value}，允许的值: ${propDef.keywords?.join(', ')}`,
            level: 'error',
            invalidValue: value,
            suggestedValue: propDef.keywords?.[0],
          }
        }
        break

      case 'url':
        if (!this.isValidURL(stringValue)) {
          return {
            path: `${path}.${property}`,
            code: 'INVALID_URL',
            message: `无效的URL值: ${value}`,
            level: 'error',
            invalidValue: value,
          }
        }
        break
    }

    return null
  }

  /**
   * 验证属性范围
   */
  private validatePropertyRange(
    property: string,
    value: unknown,
    propDef: CSSPropertyDefinition,
    path: string
  ): ValidationError | null {
    const numValue = Number(value)

    if (propDef.type === 'number' && !isNaN(numValue)) {
      if (propDef.min !== undefined && numValue < propDef.min) {
        return {
          path: `${path}.${property}`,
          code: 'VALUE_TOO_SMALL',
          message: `值 ${value} 小于最小值 ${propDef.min}`,
          level: 'error',
          invalidValue: value,
          suggestedValue: propDef.min.toString(),
        }
      }

      if (propDef.max !== undefined && numValue > propDef.max) {
        return {
          path: `${path}.${property}`,
          code: 'VALUE_TOO_LARGE',
          message: `值 ${value} 大于最大值 ${propDef.max}`,
          level: 'error',
          invalidValue: value,
          suggestedValue: propDef.max.toString(),
        }
      }
    }

    return null
  }

  /**
   * 安全性检查
   */
  private checkSecurity(property: string, value: unknown, path: string): ValidationError | null {
    const stringValue = String(value)

    for (const unsafe of UNSAFE_PATTERNS) {
      if (unsafe.pattern.test(stringValue)) {
        return {
          path: `${path}.${property}`,
          code: 'SECURITY_RISK',
          message: unsafe.message,
          level: 'error',
          invalidValue: value,
        }
      }
    }

    return null
  }

  /**
   * 性能检查
   */
  private checkPerformance(property: string, value: unknown, path: string): ValidationError | null {
    const stringValue = String(value)

    for (const perf of PERFORMANCE_PATTERNS) {
      if (perf.pattern.test(stringValue)) {
        return {
          path: `${path}.${property}`,
          code: 'PERFORMANCE_ISSUE',
          message: perf.message,
          level: perf.level || 'warning',
          invalidValue: value,
        }
      }
    }

    return null
  }

  /**
   * 验证自定义CSS
   */
  private validateCustomCSS(
    css: string,
    path: string,
    result: ValidationResult,
    options: ValidationOptions
  ): void {
    // 检查安全性
    if (options.checkSecurity) {
      for (const unsafe of UNSAFE_PATTERNS) {
        if (unsafe.pattern.test(css)) {
          result.errors.push({
            path,
            code: 'CUSTOM_CSS_SECURITY',
            message: `自定义CSS中包含不安全内容: ${unsafe.message}`,
            level: 'error',
            invalidValue: css,
          })
        }
      }
    }

    // 简单的CSS语法检查
    try {
      // 这里可以添加更复杂的CSS解析器
      const balanced = this.checkCSSBalance(css)
      if (!balanced) {
        result.warnings.push({
          path,
          code: 'CSS_SYNTAX_WARNING',
          message: 'CSS语法可能有误（括号不匹配）',
          level: 'warning',
          invalidValue: css,
        })
      }
    } catch (error) {
      result.errors.push({
        path,
        code: 'CSS_PARSE_ERROR',
        message: `CSS解析错误: ${error}`,
        level: 'error',
        invalidValue: css,
      })
    }
  }

  /**
   * 应用自定义验证规则
   */
  private applyCustomRules(
    styles: ExtendedComponentStyles,
    result: ValidationResult,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: ValidationOptions
  ): void {
    for (const rule of this.customRules) {
      try {
        const error = rule.validate(styles, '')
        if (error) {
          if (error.level === 'error') {
            result.errors.push(error)
          } else if (error.level === 'warning') {
            result.warnings.push(error)
          } else {
            result.info.push(error)
          }
        }
      } catch (error) {
        console.warn(`验证规则 ${rule.name} 执行失败:`, error)
      }
    }
  }

  /**
   * 检查长度值是否有效
   */
  private isValidLength(value: string, allowedUnits?: string[]): boolean {
    if (value === '0' || value === 'auto') return true

    const lengthRegex = /^(-?\d*\.?\d+)(px|em|rem|%|vw|vh|vmin|vmax|ex|ch|cm|mm|in|pt|pc)$/
    const match = value.match(lengthRegex)

    if (!match) return false

    const unit = match[2]
    return !allowedUnits || allowedUnits.includes(unit)
  }

  /**
   * 检查颜色值是否有效
   */
  private isValidColor(value: string): boolean {
    // 十六进制颜色
    if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value)) return true

    // RGB/RGBA颜色
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[01]?\.?\d+\s*)?\)$/.test(value)) return true

    // HSL/HSLA颜色
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[01]?\.?\d+\s*)?\)$/.test(value)) return true

    // 命名颜色
    const namedColors = [
      'transparent',
      'currentColor',
      'inherit',
      'initial',
      'unset',
      'black',
      'white',
      'gray',
      'red',
      'green',
      'blue',
      'yellow',
      'orange',
      'purple',
      'pink',
    ]
    if (namedColors.includes(value.toLowerCase())) return true

    return false
  }

  /**
   * 检查数字值是否有效
   */
  private isValidNumber(value: string, min?: number, max?: number): boolean {
    const num = Number(value)
    if (isNaN(num)) return false

    if (min !== undefined && num < min) return false
    if (max !== undefined && num > max) return false

    return true
  }

  /**
   * 检查关键字是否有效
   */
  private isValidKeyword(value: string, allowedKeywords?: string[]): boolean {
    if (!allowedKeywords) return true
    return allowedKeywords.includes(value.toLowerCase())
  }

  /**
   * 检查URL是否有效
   */
  private isValidURL(value: string): boolean {
    try {
      // 支持相对URL和data URI
      if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
        return true
      }
      new URL(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查CSS括号平衡
   */
  private checkCSSBalance(css: string): boolean {
    let braceCount = 0
    let parenCount = 0
    let bracketCount = 0

    for (let i = 0; i < css.length; i++) {
      const char = css[i]
      switch (char) {
        case '{':
          braceCount++
          break
        case '}':
          braceCount--
          break
        case '(':
          parenCount++
          break
        case ')':
          parenCount--
          break
        case '[':
          bracketCount++
          break
        case ']':
          bracketCount--
          break
      }

      if (braceCount < 0 || parenCount < 0 || bracketCount < 0) {
        return false
      }
    }

    return braceCount === 0 && parenCount === 0 && bracketCount === 0
  }

  /**
   * 驼峰转短横线
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }
}

/**
 * 默认样式验证器实例
 */
export const defaultStyleValidator = new StyleValidator()

/**
 * 便捷函数：验证样式
 */
export function validateComponentStyles(
  styles: ExtendedComponentStyles,
  options?: ValidationOptions
): ValidationResult {
  return defaultStyleValidator.validate(styles, options)
}

/**
 * 便捷函数：添加验证规则
 */
export function addValidationRule(rule: ValidationRule): void {
  defaultStyleValidator.addRule(rule)
}

/**
 * 便捷函数：移除验证规则
 */
export function removeValidationRule(name: string): boolean {
  return defaultStyleValidator.removeRule(name)
}
