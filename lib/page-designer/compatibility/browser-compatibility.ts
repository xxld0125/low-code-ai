/**
 * 页面设计器浏览器兼容性工具
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 确保跨浏览器兼容性，支持Chrome 88+, Firefox 85+, Safari 14+
 */

import React from 'react'

// 浏览器支持矩阵
export interface BrowserSupportMatrix {
  chrome: { minVersion: number; features: string[] }
  firefox: { minVersion: number; features: string[] }
  safari: { minVersion: number; features: string[] }
  edge: { minVersion: number; features: string[] }
  unknown?: { minVersion: number; features: string[] }
}

// 支持的浏览器配置
export const SUPPORTED_BROWSERS: BrowserSupportMatrix = {
  chrome: {
    minVersion: 88,
    features: [
      'CSS Grid',
      'Flexbox',
      'ES2020',
      'Web Components',
      'Intersection Observer',
      'Resize Observer',
      'CSS Custom Properties',
      'CSS Container Queries',
    ],
  },
  firefox: {
    minVersion: 85,
    features: [
      'CSS Grid',
      'Flexbox',
      'ES2020',
      'Web Components',
      'Intersection Observer',
      'Resize Observer',
      'CSS Custom Properties',
    ],
  },
  safari: {
    minVersion: 14,
    features: [
      'CSS Grid',
      'Flexbox',
      'ES2020',
      'Web Components',
      'Intersection Observer',
      'CSS Custom Properties',
    ],
  },
  edge: {
    minVersion: 88,
    features: [
      'CSS Grid',
      'Flexbox',
      'ES2020',
      'Web Components',
      'Intersection Observer',
      'Resize Observer',
      'CSS Custom Properties',
    ],
  },
  unknown: {
    minVersion: 0,
    features: [],
  },
}

// 浏览器检测结果
export interface BrowserDetectionResult {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
  version: number
  isSupported: boolean
  missingFeatures: string[]
  userAgent: string
}

// 兼容性问题
export interface CompatibilityIssue {
  type: 'feature' | 'version' | 'performance' | 'css'
  severity: 'critical' | 'warning' | 'info'
  browser: string
  description: string
  solution: string
  polyfill?: string
}

/**
 * 浏览器兼容性检测器
 */
export class BrowserCompatibilityDetector {
  private cachedResult: BrowserDetectionResult | null = null

  /**
   * 检测当前浏览器
   */
  public detectBrowser(): BrowserDetectionResult {
    if (this.cachedResult) {
      return this.cachedResult
    }

    const userAgent = navigator.userAgent
    let name: BrowserDetectionResult['name'] = 'unknown'
    let version = 0

    // Chrome检测
    if (/Chrome\/(\d+)/.test(userAgent) && !/Edg/.test(userAgent)) {
      name = 'chrome'
      version = parseInt(/Chrome\/(\d+)/.exec(userAgent)![1])
    }
    // Firefox检测
    else if (/Firefox\/(\d+)/.test(userAgent)) {
      name = 'firefox'
      version = parseInt(/Firefox\/(\d+)/.exec(userAgent)![1])
    }
    // Safari检测
    else if (/Safari\/(\d+)/.test(userAgent) && /Apple Computer/.test(userAgent)) {
      name = 'safari'
      const safariVersion = /Version\/(\d+)/.exec(userAgent)
      version = safariVersion ? parseInt(safariVersion[1]) : 0
    }
    // Edge检测
    else if (/Edg\/(\d+)/.test(userAgent)) {
      name = 'edge'
      version = parseInt(/Edg\/(\d+)/.exec(userAgent)![1])
    }

    const browserConfig = SUPPORTED_BROWSERS[name]
    const isSupported = !!(browserConfig && version >= browserConfig.minVersion)
    const missingFeatures =
      browserConfig && version < browserConfig.minVersion
        ? browserConfig.features.filter(feature => !this.isFeatureSupported(feature))
        : []

    this.cachedResult = {
      name,
      version,
      isSupported,
      missingFeatures,
      userAgent,
    }

    return this.cachedResult!
  }

  /**
   * 检测功能支持
   */
  private isFeatureSupported(feature: string): boolean {
    switch (feature) {
      case 'CSS Grid':
        return CSS.supports('display', 'grid')
      case 'Flexbox':
        return CSS.supports('display', 'flex')
      case 'ES2020':
        return this.checkES2020Support()
      case 'Web Components':
        return 'customElements' in window && 'attachShadow' in Element.prototype
      case 'Intersection Observer':
        return 'IntersectionObserver' in window
      case 'Resize Observer':
        return 'ResizeObserver' in window
      case 'CSS Custom Properties':
        return CSS.supports('color', 'var(--test)')
      case 'CSS Container Queries':
        return CSS.supports('container-type', 'size')
      default:
        return true
    }
  }

  /**
   * 检查ES2020支持
   */
  private checkES2020Support(): boolean {
    try {
      // 检查可选链操作符
      const testOptionalChaining = () => {
        const obj = { a: { b: 1 } }
        return obj?.a?.b === 1
      }

      // 检查空值合并操作符
      const testNullishCoalescing = () => {
        const value: string | null = null
        return (value ?? 'default') === 'default'
      }

      // 检查BigInt
      const testBigInt = () => {
        return typeof BigInt === 'function'
      }

      // 检查Promise.allSettled
      const testPromiseAllSettled = () => {
        return typeof Promise.allSettled === 'function'
      }

      return (
        testOptionalChaining() && testNullishCoalescing() && testBigInt() && testPromiseAllSettled()
      )
    } catch {
      return false
    }
  }

  /**
   * 运行兼容性测试
   */
  public runCompatibilityTests(): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = []
    const browser = this.detectBrowser()

    // 版本检查
    if (!browser.isSupported) {
      const requiredVersion = SUPPORTED_BROWSERS[browser.name]?.minVersion
      if (requiredVersion) {
        issues.push({
          type: 'version',
          severity: 'critical',
          browser: browser.name,
          description: `浏览器版本 ${browser.version} 低于最低支持版本 ${requiredVersion}`,
          solution: `请升级 ${browser.name} 到版本 ${requiredVersion} 或更高`,
        })
      }
    }

    // 功能检查
    if (browser.missingFeatures.length > 0) {
      browser.missingFeatures.forEach(feature => {
        issues.push({
          type: 'feature',
          severity: 'warning',
          browser: browser.name,
          description: `缺少功能支持: ${feature}`,
          solution: `考虑使用polyfill或替代方案`,
          polyfill: this.getPolyfillForFeature(feature),
        })
      })
    }

    // CSS特性检查
    const cssIssues = this.checkCSSCompatibility()
    issues.push(...cssIssues)

    // 性能检查
    const performanceIssues = this.checkPerformanceCompatibility()
    issues.push(...performanceIssues)

    return issues
  }

  /**
   * 检查CSS兼容性
   */
  private checkCSSCompatibility(): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = []
    const browser = this.detectBrowser()

    // 检查CSS Grid支持
    if (!CSS.supports('display', 'grid')) {
      issues.push({
        type: 'css',
        severity: 'warning',
        browser: browser.name,
        description: 'CSS Grid不支持',
        solution: '使用Flexbox作为后备方案',
      })
    }

    // 检查CSS自定义属性支持
    if (!CSS.supports('color', 'var(--test)')) {
      issues.push({
        type: 'css',
        severity: 'warning',
        browser: browser.name,
        description: 'CSS自定义属性不支持',
        solution: '使用预处理器或传统CSS变量',
      })
    }

    // 检查CSS容器查询支持
    if (!CSS.supports('container-type', 'size')) {
      issues.push({
        type: 'css',
        severity: 'info',
        browser: browser.name,
        description: 'CSS容器查询不支持',
        solution: '使用JavaScript实现响应式逻辑',
      })
    }

    return issues
  }

  /**
   * 检查性能兼容性
   */
  private checkPerformanceCompatibility(): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = []
    const browser = this.detectBrowser()

    // 检查requestAnimationFrame支持
    if (!('requestAnimationFrame' in window)) {
      issues.push({
        type: 'performance',
        severity: 'critical',
        browser: browser.name,
        description: 'requestAnimationFrame不支持',
        solution: '使用setTimeout作为polyfill',
      })
    }

    // 检查Intersection Observer支持
    if (!('IntersectionObserver' in window)) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        browser: browser.name,
        description: 'Intersection Observer不支持',
        solution: '使用scroll事件监听作为替代',
      })
    }

    // 检查Resize Observer支持
    if (!('ResizeObserver' in window)) {
      issues.push({
        type: 'performance',
        severity: 'warning',
        browser: browser.name,
        description: 'Resize Observer不支持',
        solution: '使用resize事件监听作为替代',
      })
    }

    return issues
  }

  /**
   * 获取功能的polyfill
   */
  private getPolyfillForFeature(feature: string): string {
    const polyfills: Record<string, string> = {
      'Intersection Observer': 'intersection-observer',
      'Resize Observer': 'resize-observer-polyfill',
      'Web Components': '@webcomponents/webcomponentsjs',
      'CSS Custom Properties': 'css-vars-ponyfill',
      'CSS Container Queries': 'container-query-polyfill',
    }

    return polyfills[feature] || ''
  }

  /**
   * 应用兼容性修复
   */
  public applyCompatibilityFixes(): void {
    const issues = this.runCompatibilityTests()

    issues.forEach(issue => {
      switch (issue.type) {
        case 'css':
          this.applyCSSFix(issue)
          break
        case 'feature':
          this.applyFeatureFix(issue)
          break
        case 'performance':
          this.applyPerformanceFix(issue)
          break
      }
    })
  }

  /**
   * 应用CSS修复
   */
  private applyCSSFix(issue: CompatibilityIssue): void {
    // 添加CSS兼容性类
    document.documentElement.setAttribute('data-browser', this.detectBrowser().name)
    document.documentElement.setAttribute('data-compat-mode', 'fallback')
  }

  /**
   * 应用功能修复
   */
  private applyFeatureFix(issue: CompatibilityIssue): void {
    if (issue.polyfill) {
      console.log(`建议安装polyfill: ${issue.polyfill}`)
    }
  }

  /**
   * 应用性能修复
   */
  private applyPerformanceFix(issue: CompatibilityIssue): void {
    // 根据具体问题应用性能修复
    if (issue.description.includes('requestAnimationFrame')) {
      // 添加requestAnimationFrame polyfill
      if (typeof window !== 'undefined' && !('requestAnimationFrame' in window)) {
        ;(window as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
          return setTimeout(callback, 16) as any
        }
      }
    }
  }
}

// 创建全局实例
export const browserCompatibilityDetector = new BrowserCompatibilityDetector()

/**
 * 浏览器兼容性Hook
 */
export const useBrowserCompatibility = () => {
  const [browserInfo, setBrowserInfo] = React.useState<BrowserDetectionResult | null>(null)
  const [issues, setIssues] = React.useState<CompatibilityIssue[]>([])

  React.useEffect(() => {
    const detector = new BrowserCompatibilityDetector()
    const info = detector.detectBrowser()
    const compatibilityIssues = detector.runCompatibilityTests()

    setBrowserInfo(info)
    setIssues(compatibilityIssues)

    if (compatibilityIssues.some(issue => issue.severity === 'critical')) {
      console.warn('检测到严重的兼容性问题', compatibilityIssues)
    }
  }, [])

  return {
    browserInfo,
    issues,
    isCompatible: issues.filter(issue => issue.severity === 'critical').length === 0,
    applyFixes: () => browserCompatibilityDetector.applyCompatibilityFixes(),
  }
}

export default browserCompatibilityDetector
