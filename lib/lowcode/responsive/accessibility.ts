/**
 * WCAG 2.1 AA 可访问性标准实现
 * 提供可访问性工具函数、检查和标准定义
 *
 * 创建日期: 2025-10-29
 * 功能模块: T009-响应式设计断点和可访问性标准
 */

import type { AriaAttributes, HTMLAttributes } from 'react'

/**
 * WCAG 2.1 AA 标准常量
 */
export const WCAG_STANDARDS = {
  // 颜色对比度要求
  CONTRAST_RATIOS: {
    AA_NORMAL: 4.5, // 正常文本 AA 标准
    AA_LARGE: 3.0, // 大文本 AA 标准
    AAA_NORMAL: 7.0, // 正常文本 AAA 标准
    AAA_LARGE: 4.5, // 大文本 AAA 标准
  },

  // 字体大小阈值（像素）
  FONT_SIZE_THRESHOLDS: {
    LARGE: 18, // 大文本阈值
    LARGE_BOLD: 14, // 大粗体文本阈值
  },

  // 目标点击区域最小尺寸
  TARGET_SIZES: {
    MIN_TOUCH: 44, // 最小触摸目标尺寸（像素）
    RECOMMENDED: 48, // 推荐触摸目标尺寸（像素）
  },

  // 焦点指示器
  FOCUS_INDICATORS: {
    MIN_CONTRAST: 3.0, // 最小对比度
    MIN_THICKNESS: 2, // 最小厚度（像素）
  },
} as const

/**
 * 可访问性检查结果接口
 */
export interface AccessibilityCheck {
  passed: boolean
  level: 'A' | 'AA' | 'AAA'
  message: string
  details?: Record<string, unknown>
}

/**
 * 颜色对比度检查结果
 */
export interface ContrastCheck extends AccessibilityCheck {
  ratio: number
  foreground: string
  background: string
  fontSize?: number
  fontWeight?: string
}

/**
 * 可访问性检查器配置
 */
export interface AccessibilityConfig {
  contrastRatio?: number
  fontSize?: number
  fontWeight?: string
  targetSize?: number
  enableKeyboard?: boolean
  enableScreenReader?: boolean
}

/**
 * 将十六进制颜色转换为 RGB
 * @param hex 十六进制颜色值
 * @returns RGB 对象
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * 计算相对亮度
 * @param rgb RGB 颜色值
 * @returns 相对亮度值 (0-1)
 */
export function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb

  // 标准化 RGB 值到 0-1 范围
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  // 计算相对亮度
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * 计算颜色对比度
 * @param foreground 前景色
 * @param background 背景色
 * @returns 对比度比值
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const fgRgb = hexToRgb(foreground) || hexToRgb('#000000')!
  const bgRgb = hexToRgb(background) || hexToRgb('#ffffff')!

  const fgLuminance = calculateLuminance(fgRgb)
  const bgLuminance = calculateLuminance(bgRgb)

  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 检查文本是否为大文本
 * @param fontSize 字体大小（像素）
 * @param fontWeight 字体粗细
 * @returns 是否为大文本
 */
export function isLargeText(fontSize: number = 16, fontWeight: string = 'normal'): boolean {
  const isBold = ['bold', '600', '700', '800', '900'].includes(fontWeight.toLowerCase())
  return (
    fontSize >= WCAG_STANDARDS.FONT_SIZE_THRESHOLDS.LARGE ||
    (isBold && fontSize >= WCAG_STANDARDS.FONT_SIZE_THRESHOLDS.LARGE_BOLD)
  )
}

/**
 * 检查颜色对比度是否符合 WCAG 标准
 * @param foreground 前景色
 * @param background 背景色
 * @param fontSize 字体大小
 * @param fontWeight 字体粗细
 * @returns 对比度检查结果
 */
export function checkContrast(
  foreground: string,
  background: string,
  fontSize?: number,
  fontWeight?: string
): ContrastCheck {
  const ratio = calculateContrastRatio(foreground, background)
  const largeText = isLargeText(fontSize, fontWeight)

  const { CONTRAST_RATIOS } = WCAG_STANDARDS
  const requiredRatio = largeText ? CONTRAST_RATIOS.AA_LARGE : CONTRAST_RATIOS.AA_NORMAL

  let level: 'A' | 'AA' | 'AAA' = 'A'
  let passed = false

  if (ratio >= CONTRAST_RATIOS.AAA_NORMAL) {
    level = 'AAA'
    passed = true
  } else if (ratio >= requiredRatio) {
    level = 'AA'
    passed = true
  }

  return {
    passed,
    level,
    ratio,
    foreground,
    background,
    fontSize,
    fontWeight,
    message: `对比度 ${ratio.toFixed(2)}:1${passed ? ' 符合' : ' 不符合'} WCAG ${level} 标准`,
  }
}

/**
 * 检查触摸目标尺寸是否符合标准
 * @param width 宽度
 * @param height 高度
 * @returns 触摸目标检查结果
 */
export function checkTouchTarget(width: number, height: number): AccessibilityCheck {
  const minSize = WCAG_STANDARDS.TARGET_SIZES.MIN_TOUCH
  const passed = width >= minSize && height >= minSize

  return {
    passed,
    level: passed ? 'AA' : 'A',
    message: `触摸目标 ${width}x${height}px${passed ? ' 符合' : ' 不符合'} WCAG AA 标准 (最小 ${minSize}px)`,
    details: { width, height, minSize },
  }
}

/**
 * 检查焦点指示器是否符合标准
 * @param element DOM 元素
 * @returns 焦点指示器检查结果
 */
export function checkFocusIndicator(element: HTMLElement): AccessibilityCheck {
  // 检查是否有焦点样式
  const styles = window.getComputedStyle(element, ':focus')
  const outline = styles.outline
  const outlineWidth = parseInt(styles.outlineWidth) || 0
  const outlineColor = styles.outlineColor

  let passed = false
  let message = ''

  if (outline && outline !== 'none' && outlineWidth > 0) {
    // 检查对比度（简化版本）
    const bgColor = styles.backgroundColor || '#ffffff'
    const contrast = calculateContrastRatio(outlineColor, bgColor)

    passed =
      outlineWidth >= WCAG_STANDARDS.FOCUS_INDICATORS.MIN_THICKNESS &&
      contrast >= WCAG_STANDARDS.FOCUS_INDICATORS.MIN_CONTRAST

    message = `焦点指示器${passed ? ' 符合' : ' 不符合'} WCAG 标准`
  } else {
    message = '未检测到焦点指示器'
  }

  return {
    passed,
    level: passed ? 'AA' : 'A',
    message,
    details: { outline, outlineWidth, outlineColor },
  }
}

/**
 * 生成 ARIA 属性建议
 * @param elementType 元素类型
 * @param content 内容
 * @returns ARIA 属性建议
 */
export function generateAriaSuggestions(
  elementType: string,
  content?: string
): Partial<AriaAttributes> & { alt?: string; role?: string } {
  const suggestions: Partial<AriaAttributes> & { alt?: string; role?: string } = {}

  switch (elementType) {
    case 'button':
      if (!content) {
        suggestions['aria-label'] = '按钮'
      }
      break

    case 'input':
      suggestions['aria-label'] = '输入框'
      suggestions['aria-required'] = false
      break

    case 'img':
      suggestions['alt'] = content || '图片'
      break

    case 'link':
      if (!content) {
        suggestions['aria-label'] = '链接'
      }
      break

    case 'heading':
      suggestions['role'] = 'heading'
      suggestions['aria-level'] = 2
      break
  }

  return suggestions
}

/**
 * 生成键盘导航支持
 * @param elementType 元素类型
 * @returns 键盘事件处理属性
 */
export function generateKeyboardSupport(
  elementType: string
): Pick<HTMLAttributes<HTMLElement>, 'tabIndex' | 'onKeyDown' | 'onKeyPress'> {
  const support: Pick<HTMLAttributes<HTMLElement>, 'tabIndex' | 'onKeyDown' | 'onKeyPress'> = {
    tabIndex: 0,
  }

  switch (elementType) {
    case 'button':
      support.onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          const element = event.currentTarget as HTMLElement
          if (element.click) {
            element.click()
          }
        }
      }
      break

    case 'link':
      support.onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          const element = event.currentTarget as HTMLElement
          if (element.click) {
            element.click()
          }
        }
      }
      break
  }

  return support
}

/**
 * 检查页面标题
 * @param title 页面标题
 * @returns 页面标题检查结果
 */
export function checkPageTitle(title: string): AccessibilityCheck {
  const passed = title.trim().length > 0
  const length = title.trim().length

  return {
    passed,
    level: passed ? 'AA' : 'A',
    message: `页面标题 "${title}"${passed ? ' 符合' : ' 不符合'} WCAG AA 标准`,
    details: { title, length },
  }
}

/**
 * 检查语言属性
 * @param lang 语言代码
 * @returns 语言属性检查结果
 */
export function checkLanguageAttribute(lang: string): AccessibilityCheck {
  const passed = Boolean(lang && lang.length >= 2)

  return {
    passed,
    level: passed ? 'AA' : 'A',
    message: `语言属性 "${lang}"${passed ? ' 符合' : ' 不符合'} WCAG AA 标准`,
    details: { lang },
  }
}

/**
 * 生成可访问性测试报告
 * @param config 检查配置
 * @returns 可访问性测试报告
 */
export function generateAccessibilityReport(config: AccessibilityConfig = {}): {
  score: number
  checks: AccessibilityCheck[]
  summary: string
} {
  const checks: AccessibilityCheck[] = []
  let passedCount = 0

  // 颜色对比度检查
  if (config.contrastRatio) {
    const contrastCheck = checkContrast('#000000', '#ffffff')
    checks.push(contrastCheck)
    if (contrastCheck.passed) passedCount++
  }

  // 触摸目标检查
  if (config.targetSize) {
    const targetCheck = checkTouchTarget(config.targetSize, config.targetSize)
    checks.push(targetCheck)
    if (targetCheck.passed) passedCount++
  }

  const score = checks.length > 0 ? Math.round((passedCount / checks.length) * 100) : 0
  const summary = `可访问性评分: ${score}% (${passedCount}/${checks.length} 项通过)`

  return {
    score,
    checks,
    summary,
  }
}

/**
 * 可访问性标准常量导出
 */
export const ACCESSIBILITY_CONSTANTS = {
  // 角色
  ROLES: {
    BUTTON: 'button',
    LINK: 'link',
    NAVIGATION: 'navigation',
    MAIN: 'main',
    COMPLEMENTARY: 'complementary',
    CONTENTINFO: 'contentinfo',
    SEARCH: 'search',
    BANNER: 'banner',
    FORM: 'form',
    DIALOG: 'dialog',
    ALERT: 'alert',
    STATUS: 'status',
  },

  // 属性
  PROPERTIES: {
    LABEL: 'aria-label',
    LABELLEDBY: 'aria-labelledby',
    DESCRIBEDBY: 'aria-describedby',
    REQUIRED: 'aria-required',
    INVALID: 'aria-invalid',
    EXPANDED: 'aria-expanded',
    HIDDEN: 'aria-hidden',
    DISABLED: 'aria-disabled',
    BUSY: 'aria-busy',
  },

  // 状态
  STATES: {
    CHECKED: 'aria-checked',
    PRESSED: 'aria-pressed',
    SELECTED: 'aria-selected',
  },
} as const
