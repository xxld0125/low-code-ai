/**
 * 样式验证器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import { ComponentStyles } from '../types/editor'

// 验证错误接口
export interface ValidationError {
  property: string
  value: unknown
  rule: ValidationRule
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestion?: string
}

// 验证规则接口
export interface ValidationRule {
  id: string
  name: string
  type: ValidationRuleType
  property?: string // 特定属性验证，为空则验证所有属性
  severity: 'error' | 'warning' | 'info'
  enabled: boolean
  config: Record<string, unknown>
  message?: string
  suggestion?: string
}

export type ValidationRuleType =
  | 'css-syntax'
  | 'color-format'
  | 'size-unit'
  | 'responsiveness'
  | 'accessibility'
  | 'performance'
  | 'compatibility'
  | 'custom'

// 验证结果接口
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  info: ValidationError[]
  summary: {
    total: number
    errors: number
    warnings: number
    info: number
  }
}

// CSS语法验证配置
const CSS_SYNTAX_RULES: ValidationRule[] = [
  {
    id: 'css-syntax-basic',
    name: 'CSS语法基础验证',
    type: 'css-syntax',
    severity: 'error',
    enabled: true,
    config: {
      validateProperties: true,
      validateValues: true,
      allowImportant: true,
    },
    message: 'CSS语法错误',
  },
  {
    id: 'css-syntax-values',
    name: 'CSS值验证',
    type: 'css-syntax',
    severity: 'error',
    enabled: true,
    config: {
      validateColors: true,
      validateSizes: true,
      validateUrls: true,
    },
    message: '无效的CSS值',
  },
]

// 颜色格式验证规则
const COLOR_FORMAT_RULES: ValidationRule[] = [
  {
    id: 'color-format-hex',
    name: '十六进制颜色验证',
    type: 'color-format',
    severity: 'error',
    enabled: true,
    config: {
      allow3Char: true,
      allow6Char: true,
      allowAlpha: true,
    },
    message: '无效的十六进制颜色格式',
  },
  {
    id: 'color-format-rgb',
    name: 'RGB颜色验证',
    type: 'color-format',
    severity: 'error',
    enabled: true,
    config: {
      allowRgb: true,
      allowRgba: true,
    },
    message: '无效的RGB颜色格式',
  },
  {
    id: 'color-format-contrast',
    name: '颜色对比度验证',
    type: 'accessibility',
    severity: 'warning',
    enabled: true,
    config: {
      minContrastRatio: 4.5, // WCAG AA标准
      checkLightBackground: true,
      checkDarkBackground: true,
    },
    message: '颜色对比度不足',
    suggestion: '建议调整颜色以提高可访问性',
  },
]

// 尺寸单位验证规则
const SIZE_UNIT_RULES: ValidationRule[] = [
  {
    id: 'size-unit-valid',
    name: '尺寸单位验证',
    type: 'size-unit',
    severity: 'warning',
    enabled: true,
    config: {
      preferredUnits: ['px', 'rem', 'em', '%'],
      discouragedUnits: ['pt', 'cm', 'mm', 'in'],
      allowUnitless: false,
    },
    message: '建议使用推荐的尺寸单位',
    suggestion: '推荐使用 px、rem、em 或 % 单位',
  },
  {
    id: 'size-unit-responsive',
    name: '响应式尺寸验证',
    type: 'responsiveness',
    severity: 'info',
    enabled: true,
    config: {
      requireRelativeUnits: false,
      suggestFluid: true,
    },
    message: '固定尺寸可能影响响应式设计',
    suggestion: '考虑使用相对单位或流式布局',
  },
]

// 性能验证规则
const PERFORMANCE_RULES: ValidationRule[] = [
  {
    id: 'performance-expensive-properties',
    name: '性能属性验证',
    type: 'performance',
    severity: 'warning',
    enabled: true,
    config: {
      expensiveProperties: ['box-shadow', 'filter', 'transform', 'animation'],
      maxComplexity: 3,
    },
    message: '使用大量性能敏感属性可能影响渲染性能',
    suggestion: '考虑简化或使用CSS动画优化',
  },
  {
    id: 'performance-unused-properties',
    name: '未使用属性检测',
    type: 'performance',
    severity: 'info',
    enabled: true,
    config: {
      checkOverridden: true,
      checkUnused: true,
    },
    message: '检测到可能未使用的CSS属性',
  },
]

// 可访问性验证规则
const ACCESSIBILITY_RULES: ValidationRule[] = [
  {
    id: 'accessibility-focus',
    name: '焦点样式验证',
    type: 'accessibility',
    severity: 'error',
    enabled: true,
    config: {
      requireFocusVisible: true,
      requireFocusOutline: true,
    },
    message: '缺少焦点样式',
    suggestion: '为交互元素添加明确的焦点样式',
  },
  {
    id: 'accessibility-text-size',
    name: '文字大小验证',
    type: 'accessibility',
    severity: 'warning',
    enabled: true,
    config: {
      minFontSize: 16, // px
      minRelativeFontSize: 1, // rem
    },
    message: '文字大小过小可能影响可读性',
    suggestion: '建议使用至少16px或1rem的文字大小',
  },
]

/**
 * 样式验证器类
 */
export class StyleValidator {
  private rules: ValidationRule[]
  private customRules: ValidationRule[] = []

  constructor() {
    this.rules = [
      ...CSS_SYNTAX_RULES,
      ...COLOR_FORMAT_RULES,
      ...SIZE_UNIT_RULES,
      ...PERFORMANCE_RULES,
      ...ACCESSIBILITY_RULES,
    ]
  }

  // 添加自定义验证规则
  public addCustomRule(rule: ValidationRule): void {
    this.customRules.push(rule)
  }

  // 移除自定义验证规则
  public removeCustomRule(ruleId: string): void {
    this.customRules = this.customRules.filter(rule => rule.id !== ruleId)
  }

  // 获取所有规则
  public getAllRules(): ValidationRule[] {
    return [...this.rules, ...this.customRules]
  }

  // 启用/禁用规则
  public enableRule(ruleId: string): void {
    const rule = this.findRule(ruleId)
    if (rule) {
      rule.enabled = true
    }
  }

  public disableRule(ruleId: string): void {
    const rule = this.findRule(ruleId)
    if (rule) {
      rule.enabled = false
    }
  }

  private findRule(ruleId: string): ValidationRule | undefined {
    return this.getAllRules().find(rule => rule.id === ruleId)
  }

  // 验证样式
  public validateStyles(
    styles: ComponentStyles,
    options?: {
      rules?: ValidationRule[]
      severity?: 'error' | 'warning' | 'info'
      properties?: string[]
    }
  ): ValidationResult {
    const rulesToUse = options?.rules || this.getAllRules().filter(rule => rule.enabled)
    const minSeverity = options?.severity || 'error'

    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    const info: ValidationError[] = []

    for (const rule of rulesToUse) {
      // 检查严重级别过滤
      if (this.shouldSkipSeverity(rule.severity, minSeverity)) {
        continue
      }

      // 检查属性过滤
      if (rule.property && options?.properties && !options.properties.includes(rule.property)) {
        continue
      }

      // 执行验证
      const result = this.validateRule(rule, styles)

      switch (result.severity) {
        case 'error':
          errors.push(result)
          break
        case 'warning':
          warnings.push(result)
          break
        case 'info':
          info.push(result)
          break
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
      summary: {
        total: errors.length + warnings.length + info.length,
        errors: errors.length,
        warnings: warnings.length,
        info: info.length,
      },
    }
  }

  private shouldSkipSeverity(ruleSeverity: string, minSeverity: string): boolean {
    const severityOrder = ['error', 'warning', 'info']
    const ruleIndex = severityOrder.indexOf(ruleSeverity)
    const minIndex = severityOrder.indexOf(minSeverity)

    return ruleIndex > minIndex
  }

  private validateRule(rule: ValidationRule, styles: ComponentStyles): ValidationError {
    let property: string | undefined
    let value: unknown

    if (rule.property) {
      // 验证特定属性
      property = rule.property
      value = styles[property as keyof ComponentStyles]
    } else {
      // 验证所有属性或找到第一个匹配的属性
      const result = this.findPropertyForRule(rule, styles)
      if (result) {
        property = result.property
        value = result.value
      } else {
        // 没有找到匹配的属性，返回空的验证错误
        return {
          property: '',
          value: null,
          rule,
          message: rule.message || '验证失败',
          severity: rule.severity,
        }
      }
    }

    // 根据规则类型执行具体验证
    const validationResult = this.executeValidation(rule.type, property, value, rule.config)

    return {
      property: property || '',
      value,
      rule,
      message: validationResult.message || rule.message || '验证失败',
      severity: rule.severity,
      suggestion: validationResult.suggestion || rule.suggestion,
    }
  }

  private findPropertyForRule(
    rule: ValidationRule,
    styles: ComponentStyles
  ): {
    property: string
    value: unknown
  } | null {
    for (const [prop, value] of Object.entries(styles)) {
      if (this.propertyMatchesRule(prop, rule)) {
        return { property: prop, value }
      }
    }
    return null
  }

  private propertyMatchesRule(property: string, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'color-format':
        return (
          property.includes('color') || property === 'backgroundColor' || property === 'borderColor'
        )
      case 'size-unit':
        return (
          property.includes('width') ||
          property.includes('height') ||
          property.includes('margin') ||
          property.includes('padding') ||
          property.includes('fontSize') ||
          property.includes('borderRadius')
        )
      default:
        return true
    }
  }

  private executeValidation(
    type: ValidationRuleType,
    property: string,
    value: unknown,
    config: Record<string, unknown>
  ): {
    message?: string
    suggestion?: string
  } {
    switch (type) {
      case 'css-syntax':
        return this.validateCSSSyntax(property, value, config)
      case 'color-format':
        return this.validateColorFormat(property, value, config)
      case 'size-unit':
        return this.validateSizeUnit(property, value, config)
      case 'accessibility':
        return this.validateAccessibility(property, value, config)
      case 'performance':
        return this.validatePerformance(property, value, config)
      case 'responsiveness':
        return this.validateResponsiveness(property, value, config)
      default:
        return {}
    }
  }

  private validateCSSSyntax(
    property: string,
    value: unknown,
    config: Record<string, unknown>
  ): {
    message?: string
    suggestion?: string
  } {
    if (typeof value !== 'string') {
      return { message: 'CSS属性值必须是字符串类型' }
    }

    // 基础CSS语法验证
    if (config.validateValues) {
      try {
        // 创建临时元素来测试CSS属性值
        const element = document.createElement('div')
        ;(element.style as CSSStyleDeclaration & Record<string, string>)[property] = value

        // 检查值是否被正确应用
        const appliedValue = (element.style as CSSStyleDeclaration & Record<string, string>)[
          property
        ]
        if (!appliedValue && value !== '') {
          return {
            message: `无效的CSS属性值: ${value}`,
            suggestion: '请检查CSS属性值的格式是否正确',
          }
        }
      } catch (error) {
        return {
          message: `CSS语法错误: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: '请检查CSS语法是否正确',
        }
      }
    }

    return {}
  }

  private validateColorFormat(
    property: string,
    value: unknown,
    config: Record<string, unknown>
  ): {
    message?: string
    suggestion?: string
  } {
    if (typeof value !== 'string' || !value) {
      return {}
    }

    // 验证十六进制颜色
    if (config.validateHexColors) {
      const hexRegex = config.allowAlpha
        ? /^#([A-Fa-f0-9]{3}){1,2}$|^#([A-Fa-f0-9]{8})$/
        : /^#([A-Fa-f0-9]{3}){1,2}$/

      if (config.allow3Char || config.allow6Char) {
        if (!hexRegex.test(value)) {
          return {
            message: '无效的十六进制颜色格式',
            suggestion: '请使用 #RGB、#RRGGBB、#RRGGBBAA 或 #RGBA 格式',
          }
        }
      }
    }

    // 验证RGB颜色
    if (config.validateRgbColors && (config.allowRgb || config.allowRgba)) {
      const rgbRegex = config.allowRgba
        ? /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/
        : /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/

      if (value.startsWith('rgb') && !rgbRegex.test(value)) {
        return {
          message: '无效的RGB颜色格式',
          suggestion: '请使用 rgb(R, G, B) 或 rgba(R, G, B, A) 格式',
        }
      }
    }

    return {}
  }

  private validateSizeUnit(
    property: string,
    value: unknown,
    config: Record<string, unknown>
  ): {
    message?: string
    suggestion?: string
  } {
    if (typeof value !== 'string' || !value) {
      return {}
    }

    const preferredUnits = (config.preferredUnits as string[]) || ['px', 'rem', 'em', '%']
    const discouragedUnits = (config.discouragedUnits as string[]) || ['pt', 'cm', 'mm', 'in']

    // 检查是否使用了不推荐的单位
    for (const unit of discouragedUnits) {
      if (value.includes(unit)) {
        return {
          message: `使用了不推荐的单位: ${unit}`,
          suggestion: `建议使用以下单位之一: ${preferredUnits.join(', ')}`,
        }
      }
    }

    // 检查是否缺少单位（纯数字）
    if (config.allowUnitless === false && /^\d+$/.test(value)) {
      return {
        message: '尺寸值缺少单位',
        suggestion: `请添加单位，推荐使用: ${preferredUnits[0]}`,
      }
    }

    return {}
  }

  private validateAccessibility(
    property: string,
    value: unknown,
    config: Record<string, unknown>
  ): {
    message?: string
    suggestion?: string
  } {
    // 文字大小验证
    if (property === 'fontSize' && config.minFontSize) {
      const fontSize = parseFloat(value as string)
      if (fontSize < (config.minFontSize as number)) {
        return {
          message: `文字大小过小: ${fontSize}px`,
          suggestion: `建议使用至少 ${config.minFontSize}px 的文字大小以提高可读性`,
        }
      }
    }

    // 焦点样式验证
    if (property === 'outline' && config.requireFocusOutline) {
      if (value === 'none' || value === '0') {
        return {
          message: '移除了焦点轮廓',
          suggestion: '为确保可访问性，建议保留或提供其他焦点样式',
        }
      }
    }

    return {}
  }

  private validatePerformance(
    property: string,
    value: unknown,
    config: Record<string, unknown>
  ): {
    message?: string
    suggestion?: string
  } {
    const expensiveProperties = (config.expensiveProperties as string[]) || []

    // 检查是否使用了性能敏感属性
    if (expensiveProperties.includes(property)) {
      return {
        message: `使用了性能敏感属性: ${property}`,
        suggestion: '考虑简化样式以优化渲染性能',
      }
    }

    return {}
  }

  private validateResponsiveness(
    property: string,
    value: unknown,
    config: Record<string, unknown>
  ): {
    message?: string
    suggestion?: string
  } {
    if (typeof value !== 'string') {
      return {}
    }

    // 检查固定尺寸
    if (config.suggestFluid && /\d+px$/.test(value)) {
      return {
        message: '使用了固定像素尺寸',
        suggestion: '考虑使用相对单位或流式布局以提高响应式能力',
      }
    }

    return {}
  }
}

// 创建全局样式验证器实例
export const globalStyleValidator = new StyleValidator()

// 工具函数
export const validateStyles = (
  styles: ComponentStyles,
  options?: {
    rules?: ValidationRule[]
    severity?: 'error' | 'warning' | 'info'
    properties?: string[]
  }
): ValidationResult => {
  const validator = new StyleValidator()
  return validator.validateStyles(styles, options)
}

export const addCustomValidationRule = (rule: ValidationRule): void => {
  globalStyleValidator.addCustomRule(rule)
}

export const createStyleValidator = (customRules?: ValidationRule[]): StyleValidator => {
  const validator = new StyleValidator()
  customRules?.forEach(rule => validator.addCustomRule(rule))
  return validator
}
