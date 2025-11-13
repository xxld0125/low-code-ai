/**
 * 样式验证和转换工具
 * 提供样式值的验证、转换、标准化等功能
 */

import type { CSSProperties } from '@/types/designer'

// 样式值类型
export type StyleValueType =
  | 'color'
  | 'size'
  | 'spacing'
  | 'number'
  | 'string'
  | 'enum'
  | 'url'
  | 'undefined'

// 验证规则
export interface ValidationRule {
  type: StyleValueType
  required?: boolean
  min?: number
  max?: number
  step?: number
  pattern?: RegExp
  options?: string[]
  units?: string[]
}

// 验证结果
export interface ValidationResult {
  valid: boolean
  value?: string | number
  error?: string
  warnings?: string[]
}

// 样式转换配置
export interface StyleTransformConfig {
  defaultUnit?: string
  precision?: number
  normalizeColor?: boolean
  convertUnits?: boolean
  mergeSpacing?: boolean
}

// CSS属性到类型的映射
const CSS_PROPERTY_TYPES: Record<string, ValidationRule> = {
  // 颜色属性
  color: { type: 'color', required: false },
  backgroundColor: { type: 'color', required: false },
  borderColor: { type: 'color', required: false },
  borderTopColor: { type: 'color', required: false },
  borderRightColor: { type: 'color', required: false },
  borderBottomColor: { type: 'color', required: false },
  borderLeftColor: { type: 'color', required: false },
  outlineColor: { type: 'color', required: false },
  caretColor: { type: 'color', required: false },

  // 尺寸属性
  width: { type: 'size', required: false, min: 0 },
  height: { type: 'size', required: false, min: 0 },
  minWidth: { type: 'size', required: false, min: 0 },
  minHeight: { type: 'size', required: false, min: 0 },
  maxWidth: { type: 'size', required: false, min: 0 },
  maxHeight: { type: 'size', required: false, min: 0 },

  // 间距属性
  margin: { type: 'spacing', required: false },
  marginTop: { type: 'spacing', required: false },
  marginRight: { type: 'spacing', required: false },
  marginBottom: { type: 'spacing', required: false },
  marginLeft: { type: 'spacing', required: false },
  padding: { type: 'spacing', required: false },
  paddingTop: { type: 'spacing', required: false },
  paddingRight: { type: 'spacing', required: false },
  paddingBottom: { type: 'spacing', required: false },
  paddingLeft: { type: 'spacing', required: false },

  // 边框属性
  borderWidth: { type: 'size', required: false, min: 0, step: 1 },
  borderTopWidth: { type: 'size', required: false, min: 0, step: 1 },
  borderRightWidth: { type: 'size', required: false, min: 0, step: 1 },
  borderBottomWidth: { type: 'size', required: false, min: 0, step: 1 },
  borderLeftWidth: { type: 'size', required: false, min: 0, step: 1 },
  borderRadius: { type: 'size', required: false, min: 0 },
  borderTopLeftRadius: { type: 'size', required: false, min: 0 },
  borderTopRightRadius: { type: 'size', required: false, min: 0 },
  borderBottomLeftRadius: { type: 'size', required: false, min: 0 },
  borderBottomRightRadius: { type: 'size', required: false, min: 0 },

  // 数字属性
  zIndex: { type: 'number', required: false, min: 0, step: 1 },
  opacity: { type: 'number', required: false, min: 0, max: 1, step: 0.1 },

  // 枚举属性
  display: {
    type: 'enum',
    required: false,
    options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none', 'contents']
  },
  position: {
    type: 'enum',
    required: false,
    options: ['static', 'relative', 'absolute', 'fixed', 'sticky']
  },
  borderStyle: {
    type: 'enum',
    required: false,
    options: ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge']
  },
  textAlign: {
    type: 'enum',
    required: false,
    options: ['left', 'right', 'center', 'justify']
  },
  verticalAlign: {
    type: 'enum',
    required: false,
    options: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom']
  },

  // URL属性
  backgroundImage: { type: 'url', required: false },
  background: { type: 'string', required: false },
  listStyleImage: { type: 'url', required: false },

  // 字体属性
  fontSize: { type: 'size', required: false, min: 0 },
  fontWeight: { type: 'number', required: false, min: 100, max: 900, step: 100 },
  lineHeight: { type: 'number', required: false, min: 0 },
  letterSpacing: { type: 'size', required: false },
  wordSpacing: { type: 'size', required: false },
  fontFamily: { type: 'string', required: false },
}

// 颜色名称映射
const COLOR_NAMES: Record<string, string> = {
  'transparent': 'transparent',
  'black': '#000000',
  'white': '#FFFFFF',
  'red': '#FF0000',
  'green': '#008000',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'gray': '#808080',
  'grey': '#808080',
  'silver': '#C0C0C0',
  'maroon': '#800000',
  'olive': '#808000',
  'lime': '#00FF00',
  'aqua': '#00FFFF',
  'teal': '#008080',
  'navy': '#000080',
  'fuchsia': '#FF00FF',
  'purple': '#800080',
}

// 预定义的颜色值
const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808000',
  '#800080', '#008080', '#C0C0C0', '#808080', '#FFA500', '#A52A2A',
  '#DEB887', '#5F9EA0', '#7FFF00', '#D2691E', '#FF7F50', '#6495ED',
  '#DC143C', '#00FFFF', '#00008B', '#008B8B', '#B8860B', '#A9A9A9',
]

// 支持的CSS单位
const CSS_UNITS = ['px', 'rem', 'em', '%', 'vw', 'vh', 'vmin', 'vmax', 'ch', 'ex', 'pt', 'pc', 'in', 'cm', 'mm']

// 样式验证器类
export class StyleValidator {
  private rules: Map<string, ValidationRule> = new Map()

  constructor(customRules?: Record<string, ValidationRule>) {
    // 加载默认规则
    Object.entries(CSS_PROPERTY_TYPES).forEach(([property, rule]) => {
      this.rules.set(property, rule)
    })

    // 加载自定义规则
    if (customRules) {
      Object.entries(customRules).forEach(([property, rule]) => {
        this.rules.set(property, rule)
      })
    }
  }

  // 验证单个样式属性
  validateProperty(property: string, value: any): ValidationResult {
    const rule = this.rules.get(property)
    if (!rule) {
      return { valid: true, value: String(value) }
    }

    // 检查必需性
    if (rule.required && (value === undefined || value === null || value === '')) {
      return { valid: false, error: `${property} 是必需属性` }
    }

    // 如果值为空且非必需，则跳过验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return { valid: true, value: '' }
    }

    const stringValue = String(value)

    switch (rule.type) {
      case 'color':
        return this.validateColor(stringValue)
      case 'size':
        return this.validateSize(stringValue, rule)
      case 'spacing':
        return this.validateSpacing(stringValue, rule)
      case 'number':
        return this.validateNumber(stringValue, rule)
      case 'enum':
        return this.validateEnum(stringValue, rule)
      case 'url':
        return this.validateUrl(stringValue)
      case 'string':
      default:
        return { valid: true, value: stringValue }
    }
  }

  // 验证颜色值
  private validateColor(value: string): ValidationResult {
    const normalizedValue = value.toLowerCase().trim()

    // 检查透明值
    if (normalizedValue === 'transparent') {
      return { valid: true, value: 'transparent' }
    }

    // 检查颜色名称
    if (COLOR_NAMES[normalizedValue]) {
      return { valid: true, value: COLOR_NAMES[normalizedValue] }
    }

    // 检查十六进制颜色
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (hexRegex.test(normalizedValue)) {
      return { valid: true, value: normalizedValue.toUpperCase() }
    }

    // 检查RGB颜色
    const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/
    if (rgbRegex.test(normalizedValue)) {
      return { valid: true, value: normalizedValue }
    }

    // 检查RGBA颜色
    const rgbaRegex = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([01]?\.?\d*)\s*\)$/
    if (rgbaRegex.test(normalizedValue)) {
      return { valid: true, value: normalizedValue }
    }

    // 检查HSL颜色
    const hslRegex = /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/
    if (hslRegex.test(normalizedValue)) {
      return { valid: true, value: normalizedValue }
    }

    // 检查HSLA颜色
    const hslaRegex = /^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([01]?\.?\d*)\s*\)$/
    if (hslaRegex.test(normalizedValue)) {
      return { valid: true, value: normalizedValue }
    }

    return { valid: false, error: '无效的颜色值，请使用十六进制、RGB或颜色名称' }
  }

  // 验证尺寸值
  private validateSize(value: string, rule: ValidationRule): ValidationResult {
    const normalizedValue = value.toLowerCase().trim()

    // 检查auto值
    if (normalizedValue === 'auto') {
      return { valid: true, value: 'auto' }
    }

    // 检查inherit值
    if (normalizedValue === 'inherit') {
      return { valid: true, value: 'inherit' }
    }

    // 检查数值和单位
    const sizeRegex = /^(-?\d+(?:\.\d+)?)\s*([a-z%]+)?$/
    const match = normalizedValue.match(sizeRegex)

    if (!match) {
      return { valid: false, error: '无效的尺寸值' }
    }

    const numberValue = parseFloat(match[1])
    const unit = match[2] || 'px'

    // 检查单位是否支持
    if (!CSS_UNITS.includes(unit)) {
      return { valid: false, error: `不支持的单位: ${unit}` }
    }

    // 检查数值范围
    if (rule.min !== undefined && numberValue < rule.min) {
      return { valid: false, error: `值不能小于 ${rule.min}` }
    }

    if (rule.max !== undefined && numberValue > rule.max) {
      return { valid: false, error: `值不能大于 ${rule.max}` }
    }

    // 检查步长
    if (rule.step !== undefined) {
      const steps = numberValue / rule.step
      if (Math.abs(steps - Math.round(steps)) > 0.001) {
        return { valid: false, error: `值必须是 ${rule.step} 的倍数` }
      }
    }

    return { valid: true, value: `${numberValue}${unit}` }
  }

  // 验证间距值
  private validateSpacing(value: string, rule: ValidationRule): ValidationResult {
    const normalizedValue = value.toLowerCase().trim()

    // 检查特殊值
    if (['auto', 'inherit', 'initial', 'unset'].includes(normalizedValue)) {
      return { valid: true, value: normalizedValue }
    }

    // 检查复合间距值 (如: "8px 16px")
    const values = normalizedValue.split(/\s+/)
    if (values.length > 4) {
      return { valid: false, error: '间距值最多支持4个值' }
    }

    // 验证每个值
    for (const val of values) {
      const result = this.validateSize(val, rule)
      if (!result.valid) {
        return result
      }
    }

    return { valid: true, value: normalizedValue }
  }

  // 验证数字值
  private validateNumber(value: string, rule: ValidationRule): ValidationResult {
    const normalizedValue = value.toLowerCase().trim()

    // 检查特殊值
    if (['auto', 'inherit', 'initial', 'unset', 'normal'].includes(normalizedValue)) {
      return { valid: true, value: normalizedValue }
    }

    const numberValue = parseFloat(normalizedValue)

    if (isNaN(numberValue)) {
      return { valid: false, error: '无效的数字值' }
    }

    // 检查数值范围
    if (rule.min !== undefined && numberValue < rule.min) {
      return { valid: false, error: `值不能小于 ${rule.min}` }
    }

    if (rule.max !== undefined && numberValue > rule.max) {
      return { valid: false, error: `值不能大于 ${rule.max}` }
    }

    // 检查步长
    if (rule.step !== undefined) {
      const steps = numberValue / rule.step
      if (Math.abs(steps - Math.round(steps)) > 0.001) {
        return { valid: false, error: `值必须是 ${rule.step} 的倍数` }
      }
    }

    return { valid: true, value: numberValue }
  }

  // 验证枚举值
  private validateEnum(value: string, rule: ValidationRule): ValidationResult {
    const normalizedValue = value.toLowerCase().trim()

    if (!rule.options || rule.options.length === 0) {
      return { valid: false, error: '未定义枚举选项' }
    }

    const normalizedOptions = rule.options.map(opt => opt.toLowerCase())
    if (normalizedOptions.includes(normalizedValue)) {
      return { valid: true, value: rule.options[normalizedOptions.indexOf(normalizedValue)] }
    }

    return {
      valid: false,
      error: `无效的值，可选: ${rule.options.join(', ')}`
    }
  }

  // 验证URL值
  private validateUrl(value: string): ValidationResult {
    const normalizedValue = value.trim()

    if (!normalizedValue) {
      return { valid: true, value: '' }
    }

    // 检查CSS URL语法
    if (normalizedValue.startsWith('url(') && normalizedValue.endsWith(')')) {
      return { valid: true, value: normalizedValue }
    }

    // 检查是否为有效的URL
    try {
      new URL(normalizedValue)
      return { valid: true, value: `url(${normalizedValue})` }
    } catch {
      return { valid: false, error: '无效的URL值' }
    }
  }

  // 验证所有样式属性
  validateAll(styles: CSSProperties): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}

    Object.entries(styles).forEach(([property, value]) => {
      results[property] = this.validateProperty(property, value)
    })

    return results
  }
}

// 样式转换器类
export class StyleTransformer {
  private config: StyleTransformConfig

  constructor(config: StyleTransformConfig = {}) {
    this.config = {
      defaultUnit: 'px',
      precision: 2,
      normalizeColor: true,
      convertUnits: false,
      mergeSpacing: false,
      ...config
    }
  }

  // 标准化CSS属性名
  normalizeProperty(property: string): string {
    // 将驼峰命名转换为短横线命名
    return property.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  // 标准化样式值
  normalizeValue(property: string, value: any): string | number {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value).trim()

    // 空值处理
    if (!stringValue) {
      return ''
    }

    // 颜色标准化
    if (this.config.normalizeColor && this.isColorProperty(property)) {
      return this.normalizeColorValue(stringValue)
    }

    // 尺寸标准化
    if (this.isSizeProperty(property)) {
      return this.normalizeSizeValue(stringValue)
    }

    // 间距标准化
    if (this.config.mergeSpacing && this.isSpacingProperty(property)) {
      return this.normalizeSpacingValue(stringValue)
    }

    return stringValue
  }

  // 标准化颜色值
  private normalizeColorValue(value: string): string {
    const normalizedValue = value.toLowerCase().trim()

    // 转换颜色名称为十六进制
    if (COLOR_NAMES[normalizedValue]) {
      return COLOR_NAMES[normalizedValue]
    }

    // 标准化十六进制颜色
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (hexRegex.test(normalizedValue)) {
      return normalizedValue.toUpperCase()
    }

    return value
  }

  // 标准化尺寸值
  private normalizeSizeValue(value: string): string {
    const normalizedValue = value.toLowerCase().trim()

    // 处理auto值
    if (normalizedValue === 'auto') {
      return 'auto'
    }

    // 解析数值和单位
    const sizeRegex = /^(-?\d+(?:\.\d+)?)\s*([a-z%]*)$/
    const match = normalizedValue.match(sizeRegex)

    if (!match) {
      return value
    }

    let numberValue = parseFloat(match[1])
    const unit = match[2] || this.config.defaultUnit

    // 精度处理
    if (this.config.precision !== undefined && unit !== 'auto') {
      numberValue = parseFloat(numberValue.toFixed(this.config.precision))
    }

    return `${numberValue}${unit}`
  }

  // 标准化间距值
  private normalizeSpacingValue(value: string): string {
    const normalizedValue = value.toLowerCase().trim()
    const values = normalizedValue.split(/\s+/)

    // 标准化每个值
    const normalizedValues = values.map(val => this.normalizeSizeValue(val))

    return normalizedValues.join(' ')
  }

  // 检查是否为颜色属性
  private isColorProperty(property: string): boolean {
    const colorProperties = [
      'color', 'backgroundcolor', 'bordercolor', 'borderleftcolor',
      'borderrightcolor', 'bordertopcolor', 'borderbottomcolor',
      'outlinecolor', 'caretcolor'
    ]
    return colorProperties.includes(property.toLowerCase())
  }

  // 检查是否为尺寸属性
  private isSizeProperty(property: string): boolean {
    const sizeProperties = [
      'width', 'height', 'minwidth', 'maxwidth', 'minheight', 'maxheight',
      'borderwidth', 'bordertopwidth', 'borderrightwidth', 'borderbottomwidth',
      'borderleftwidth', 'borderradius', 'bordertopleftradius', 'bordertoprightradius',
      'borderbottomleftradius', 'borderbottomrightradius', 'fontsize', 'letterspacing',
      'wordspacing', 'lineheight', 'textindent', 'zindex'
    ]
    return sizeProperties.includes(property.toLowerCase())
  }

  // 检查是否为间距属性
  private isSpacingProperty(property: string): boolean {
    const spacingProperties = [
      'margin', 'margintop', 'marginright', 'marginbottom', 'marginleft',
      'padding', 'paddingtop', 'paddingright', 'paddingbottom', 'paddingleft'
    ]
    return spacingProperties.includes(property.toLowerCase())
  }

  // 转换CSS对象为字符串
  cssObjectToString(styles: CSSProperties): string {
    const cssRules: string[] = []

    Object.entries(styles).forEach(([property, value]) => {
      const normalizedProperty = this.normalizeProperty(property)
      const normalizedValue = this.normalizeValue(property, value)

      if (normalizedValue) {
        cssRules.push(`${normalizedProperty}: ${normalizedValue};`)
      }
    })

    return cssRules.join('\n')
  }

  // 转换字符串为CSS对象
  cssStringToObject(cssString: string): CSSProperties {
    const styles: CSSProperties = {}

    if (!cssString) return styles

    const rules = cssString.split(';').filter(rule => rule.trim())

    rules.forEach(rule => {
      const colonIndex = rule.indexOf(':')
      if (colonIndex === -1) return

      const property = rule.substring(0, colonIndex).trim()
      const value = rule.substring(colonIndex + 1).trim()

      // 转换短横线命名为驼峰命名
      const camelCaseProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

      styles[camelCaseProperty] = value
    })

    return styles
  }

  // 合并样式对象
  mergeStyles(baseStyles: CSSProperties, overrideStyles: CSSProperties): CSSProperties {
    return { ...baseStyles, ...overrideStyles }
  }

  // 计算样式差异
  getStyleDifference(styles1: CSSProperties, styles2: CSSProperties): CSSProperties {
    const difference: CSSProperties = {}

    // 检查styles1中存在的属性
    Object.keys(styles1).forEach(property => {
      if (styles1[property] !== styles2[property]) {
        difference[property] = styles2[property]
      }
    })

    // 检查styles2中新增的属性
    Object.keys(styles2).forEach(property => {
      if (!(property in styles1)) {
        difference[property] = styles2[property]
      }
    })

    return difference
  }

  // 克隆样式对象
  cloneStyles(styles: CSSProperties): CSSProperties {
    return JSON.parse(JSON.stringify(styles))
  }
}

// 便捷函数
export const validateStyleProperty = (property: string, value: any): ValidationResult => {
  const validator = new StyleValidator()
  return validator.validateProperty(property, value)
}

export const validateAllStyles = (styles: CSSProperties): Record<string, ValidationResult> => {
  const validator = new StyleValidator()
  return validator.validateAll(styles)
}

export const normalizeStyleValue = (property: string, value: any, config?: StyleTransformConfig): string | number => {
  const transformer = new StyleTransformer(config)
  return transformer.normalizeValue(property, value)
}

export const cssObjectToString = (styles: CSSProperties, config?: StyleTransformConfig): string => {
  const transformer = new StyleTransformer(config)
  return transformer.cssObjectToString(styles)
}

export const cssStringToObject = (cssString: string, config?: StyleTransformConfig): CSSProperties => {
  const transformer = new StyleTransformer(config)
  return transformer.cssStringToObject(cssString)
}

// 导出常用工具
export { CSS_PROPERTY_TYPES, COLOR_NAMES, PRESET_COLORS, CSS_UNITS }