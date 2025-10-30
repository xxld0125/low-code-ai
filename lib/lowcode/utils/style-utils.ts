/**
 * 样式工具函数
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import { ComponentStyles, SizeConfig, StyleCategory } from '../types/editor'

// 解析尺寸值
export interface ParsedSizeValue {
  value: number
  unit: string
  original: string
}

export const parseSizeValue = (value: string | number | undefined): ParsedSizeValue | null => {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return {
      value,
      unit: 'px',
      original: `${value}px`,
    }
  }

  const strValue = String(value).trim()

  // 处理特殊值
  if (strValue === 'auto' || strValue === 'inherit' || strValue === 'initial') {
    return {
      value: 0,
      unit: strValue,
      original: strValue,
    }
  }

  // 匹配数字和单位的正则表达式
  const match = strValue.match(
    /^(-?\d*\.?\d+)(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)?$/i
  )

  if (!match) {
    return null
  }

  const numericValue = parseFloat(match[1])
  const unit = match[2] || 'px'

  return {
    value: numericValue,
    unit: unit.toLowerCase(),
    original: strValue,
  }
}

// 格式化尺寸值
export const formatSizeValue = (value: number, unit: string): string => {
  if (unit === 'auto' || unit === 'inherit' || unit === 'initial') {
    return unit
  }

  return `${value}${unit}`
}

// 转换尺寸单位
export const convertSizeUnit = (
  value: number,
  fromUnit: string,
  toUnit: string,
  baseFontSize: number = 16
): number => {
  // 先转换为像素值
  let pixelValue: number

  switch (fromUnit) {
    case 'px':
      pixelValue = value
      break
    case 'rem':
      pixelValue = value * baseFontSize
      break
    case 'em':
      pixelValue = value * baseFontSize // 假设基于父元素字体大小为基准
      break
    case '%':
      pixelValue = (value / 100) * baseFontSize
      break
    case 'vw':
    case 'vh':
      // 视口单位需要具体的视口尺寸，这里做简化处理
      pixelValue = (value / 100) * 1024 // 假设1024px为基准视口宽度
      break
    default:
      pixelValue = value
  }

  // 从像素值转换为目标单位
  switch (toUnit) {
    case 'px':
      return pixelValue
    case 'rem':
      return pixelValue / baseFontSize
    case 'em':
      return pixelValue / baseFontSize
    case '%':
      return (pixelValue / baseFontSize) * 100
    case 'vw':
    case 'vh':
      return (pixelValue / 1024) * 100
    default:
      return pixelValue
  }
}

// 验证尺寸值
export const validateSizeValue = (
  value: ParsedSizeValue | null,
  config: SizeConfig
): { isValid: boolean; error?: string } => {
  if (!value) {
    return {
      isValid: config.required === false,
      error: config.required ? '此字段为必填项' : undefined,
    }
  }

  // 检查特殊值
  if (['auto', 'inherit', 'initial'].includes(value.unit)) {
    if (config.allowAuto !== true) {
      return { isValid: false, error: '不允许使用特殊值' }
    }
    return { isValid: true }
  }

  // 检查单位
  if (config.units && !config.units.includes(value.unit)) {
    return { isValid: false, error: `不支持的单位: ${value.unit}` }
  }

  // 检查数值范围
  if (config.min !== undefined && value.value < config.min) {
    return { isValid: false, error: `值不能小于 ${config.min}` }
  }

  if (config.max !== undefined && value.value > config.max) {
    return { isValid: false, error: `值不能大于 ${config.max}` }
  }

  // 检查负值
  if (config.allowNegative !== true && value.value < 0) {
    return { isValid: false, error: '不允许负值' }
  }

  return { isValid: true }
}

// 解析颜色值
export interface ParsedColorValue {
  format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'named'
  value: string
  alpha?: number
  original: string
}

export const parseColorValue = (value: string | undefined): ParsedColorValue | null => {
  if (!value || value.trim() === '') {
    return null
  }

  const strValue = value.trim()

  // 十六进制颜色
  const hexMatch = strValue.match(/^#([A-Fa-f0-9]{3}){1,2}$|^#([A-Fa-f0-9]{8})$/)
  if (hexMatch) {
    return {
      format: 'hex',
      value: strValue,
      alpha: strValue.length === 9 ? parseInt(strValue.slice(7, 9), 16) / 255 : undefined,
      original: strValue,
    }
  }

  // RGB 颜色
  const rgbMatch = strValue.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/
  )
  if (rgbMatch) {
    const alpha = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined
    return {
      format: alpha !== undefined ? 'rgba' : 'rgb',
      value: strValue,
      alpha,
      original: strValue,
    }
  }

  // HSL 颜色
  const hslMatch = strValue.match(
    /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)$/
  )
  if (hslMatch) {
    const alpha = hslMatch[4] ? parseFloat(hslMatch[4]) : undefined
    return {
      format: alpha !== undefined ? 'hsla' : 'hsl',
      value: strValue,
      alpha,
      original: strValue,
    }
  }

  // 命名颜色
  if (/^[a-zA-Z]+$/.test(strValue)) {
    return {
      format: 'named',
      value: strValue,
      original: strValue,
    }
  }

  return null
}

// 转换颜色格式
export const convertColorFormat = (
  color: ParsedColorValue,
  targetFormat: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla'
): string => {
  // 先转换为RGB
  let r: number = 0,
    g: number = 0,
    b: number = 0,
    a: number = 1

  switch (color.format) {
    case 'hex':
      const hex = color.value.replace('#', '')
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16)
        g = parseInt(hex.slice(2, 4), 16)
        b = parseInt(hex.slice(4, 6), 16)
      } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16)
        g = parseInt(hex.slice(2, 4), 16)
        b = parseInt(hex.slice(4, 6), 16)
        a = parseInt(hex.slice(6, 8), 16) / 255
      }
      break

    case 'rgb':
    case 'rgba':
      const rgbMatch = color.value.match(
        /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/
      )
      if (rgbMatch) {
        r = parseInt(rgbMatch[1])
        g = parseInt(rgbMatch[2])
        b = parseInt(rgbMatch[3])
        a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1
      }
      break

    case 'named':
      // 对于命名颜色，使用CSS的computed style来获取RGB值
      // 这里简化处理，使用预定义的映射
      const namedColors: Record<string, { r: number; g: number; b: number }> = {
        black: { r: 0, g: 0, b: 0 },
        white: { r: 255, g: 255, b: 255 },
        red: { r: 255, g: 0, b: 0 },
        green: { r: 0, g: 128, b: 0 },
        blue: { r: 0, g: 0, b: 255 },
        yellow: { r: 255, g: 255, b: 0 },
        cyan: { r: 0, g: 255, b: 255 },
        magenta: { r: 255, g: 0, b: 255 },
      }
      const namedColor = namedColors[color.value.toLowerCase()]
      if (namedColor) {
        r = namedColor.r
        g = namedColor.g
        b = namedColor.b
      } else {
        return color.value // 如果无法转换，返回原值
      }
      break

    default:
      return color.value
  }

  // 确保变量已经被赋值
  if (r === undefined || g === undefined || b === undefined) {
    return color.value
  }

  // 从RGB转换为目标格式
  switch (targetFormat) {
    case 'hex':
      const hexColor = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
      return `#${hexColor}`

    case 'rgb':
      return `rgb(${r}, ${g}, ${b})`

    case 'rgba':
      return `rgba(${r}, ${g}, ${b}, ${a})`

    case 'hsl':
      const max = Math.max(r, g, b) / 255
      const min = Math.min(r, g, b) / 255
      const l = (max + min) / 2

      let h = 0,
        s = 0

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max * 255) {
          case r:
            h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6
            break
          case g:
            h = ((b / 255 - r / 255) / d + 2) / 6
            break
          case b:
            h = ((r / 255 - g / 255) / d + 4) / 6
            break
        }
      }

      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`

    case 'hsla':
      const max2 = Math.max(r, g, b) / 255
      const min2 = Math.min(r, g, b) / 255
      const l2 = (max2 + min2) / 2

      let h2 = 0,
        s2 = 0

      if (max2 !== min2) {
        const d = max2 - min2
        s2 = l2 > 0.5 ? d / (2 - max2 - min2) : d / (max2 + min2)

        switch (max2 * 255) {
          case r:
            h2 = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6
            break
          case g:
            h2 = ((b / 255 - r / 255) / d + 2) / 6
            break
          case b:
            h2 = ((r / 255 - g / 255) / d + 4) / 6
            break
        }
      }

      return `hsla(${Math.round(h2 * 360)}, ${Math.round(s2 * 100)}%, ${Math.round(l2 * 100)}%, ${a})`

    default:
      return color.value
  }
}

// 获取样式属性的分类
export const getStyleCategory = (propertyName: string): StyleCategory => {
  const lowerName = propertyName.toLowerCase()

  // 布局相关
  if (
    lowerName.includes('display') ||
    lowerName.includes('position') ||
    lowerName.includes('width') ||
    lowerName.includes('height') ||
    lowerName.includes('margin') ||
    lowerName.includes('padding') ||
    lowerName.includes('flex') ||
    lowerName.includes('grid')
  ) {
    return 'layout'
  }

  // 排版相关
  if (
    lowerName.includes('font') ||
    lowerName.includes('text') ||
    lowerName.includes('line') ||
    lowerName.includes('letter') ||
    lowerName.includes('word')
  ) {
    return 'typography'
  }

  // 颜色相关
  if (lowerName.includes('color') || lowerName.includes('background')) {
    return 'color'
  }

  // 边框相关
  if (lowerName.includes('border') || lowerName.includes('outline')) {
    return 'border'
  }

  // 间距相关
  if (lowerName.includes('margin') || lowerName.includes('padding') || lowerName.includes('gap')) {
    return 'spacing'
  }

  // 阴影相关
  if (lowerName.includes('shadow') || lowerName.includes('box-shadow')) {
    return 'shadow'
  }

  // 背景相关
  if (lowerName.includes('background') || lowerName.includes('bg')) {
    return 'background'
  }

  // 效果相关
  if (
    lowerName.includes('transform') ||
    lowerName.includes('transition') ||
    lowerName.includes('animation') ||
    lowerName.includes('filter') ||
    lowerName.includes('opacity')
  ) {
    return 'effects'
  }

  return 'layout' // 默认分类
}

// 合并样式对象
export const mergeStyles = (
  baseStyles: ComponentStyles,
  overrideStyles: ComponentStyles
): ComponentStyles => {
  return {
    ...baseStyles,
    ...overrideStyles,
  }
}

// 移除样式中的空值
export const removeEmptyStyles = (styles: ComponentStyles): ComponentStyles => {
  const cleanedStyles: ComponentStyles = {}

  Object.entries(styles).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleanedStyles[key] = value
    }
  })

  return cleanedStyles
}

// 获取样式的计算值（用于预览）
export const getComputedStyles = (
  styles: ComponentStyles,
  baseFontSize: number = 16
): ComponentStyles => {
  const computed: ComponentStyles = {}

  Object.entries(styles).forEach(([property, value]) => {
    if (
      property.includes('font-size') ||
      property.includes('width') ||
      property.includes('height') ||
      property.includes('margin') ||
      property.includes('padding')
    ) {
      const parsed = parseSizeValue(value as string | number)
      if (parsed && parsed.unit === 'rem') {
        computed[property] = formatSizeValue(parsed.value * baseFontSize, 'px')
      } else {
        computed[property] = value
      }
    } else {
      computed[property] = value
    }
  })

  return computed
}
