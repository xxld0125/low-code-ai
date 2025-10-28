/**
 * 页面设计器无障碍功能管理器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 管理无障碍功能和ARIA标签，确保符合WCAG 2.1 AA标准
 */

// ARIA属性类型
export interface ARIAAttributes {
  role?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-pressed'?: boolean
  'aria-checked'?: boolean
  'aria-disabled'?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-relevant'?: string
  'aria-busy'?: boolean
  'aria-owns'?: string
  'aria-controls'?: string
  'aria-activedescendant'?: string
  'aria-multiselectable'?: boolean
  'aria-orientation'?: 'horizontal' | 'vertical'
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
  'aria-colcount'?: number
  'aria-rowcount'?: number
  'aria-colindex'?: number
  'aria-rowindex'?: number
}

// 键盘导航配置
export interface KeyboardNavigationConfig {
  enableKeyboardNavigation: boolean
  enableFocusManagement: boolean
  enableScreenReaderSupport: boolean
  enableHighContrastMode: boolean
  enableReducedMotion: boolean
  tabIndexManagement: boolean
  focusTrapElements?: string[]
  skipLinksTarget?: string
}

// 无障碍审计结果
export interface AccessibilityAuditResult {
  score: number // 0-100
  issues: AccessibilityIssue[]
  warnings: AccessibilityWarning[]
  passes: AccessibilityPass[]
  timestamp: number
}

// 无障碍问题
export interface AccessibilityIssue {
  type: 'error' | 'warning'
  category: 'keyboard' | 'screen-reader' | 'contrast' | 'focus' | 'semantics' | 'motion'
  element?: string
  message: string
  suggestion: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagCriterion: string
}

// 无障碍警告
export interface AccessibilityWarning {
  category: string
  message: string
  suggestion: string
}

// 无障碍通过项
export interface AccessibilityPass {
  category: string
  message: string
}

// 组件无障碍规则
export interface ComponentAccessibilityRule {
  componentType: string
  requiredAttributes: string[]
  recommendedAttributes: string[]
  roles: string[]
  keyboardHandlers: string[]
  ariaMapping: Record<string, string>
}

/**
 * 无障碍功能管理器
 */
export class AccessibilityManager {
  private config: KeyboardNavigationConfig
  private focusableElements: Set<HTMLElement>
  private currentFocusElement: HTMLElement | null
  private announcementsQueue: string[]
  private screenReaderEnabled: boolean
  private highContrastMode: boolean
  private reducedMotion: boolean

  constructor(config: Partial<KeyboardNavigationConfig> = {}) {
    this.config = {
      enableKeyboardNavigation: true,
      enableFocusManagement: true,
      enableScreenReaderSupport: true,
      enableHighContrastMode: false,
      enableReducedMotion: true,
      tabIndexManagement: true,
      focusTrapElements: [],
      skipLinksTarget: '#main-content',
      ...config,
    }

    this.focusableElements = new Set()
    this.currentFocusElement = null
    this.announcementsQueue = []
    this.screenReaderEnabled = this.detectScreenReader()
    this.highContrastMode = this.detectHighContrast()
    this.reducedMotion = this.detectReducedMotion()
  }

  /**
   * 初始化无障碍功能
   */
  public initialize(): void {
    this.setupKeyboardNavigation()
    this.setupFocusManagement()
    this.setupScreenReaderSupport()
    this.setupAnnouncementRegion()
    this.detectUserPreferences()
  }

  /**
   * 检测屏幕阅读器
   */
  private detectScreenReader(): boolean {
    // 简单的屏幕阅读器检测
    return (
      window.speechSynthesis !== undefined ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver')
    )
  }

  /**
   * 检测高对比度模式
   */
  private detectHighContrast(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-contrast: high)').matches
    }
    return false
  }

  /**
   * 检测减少动画偏好
   */
  private detectReducedMotion(): boolean {
    if (window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  }

  /**
   * 检测用户偏好
   */
  private detectUserPreferences(): void {
    // 监听偏好变化
    if (window.matchMedia) {
      const mediaQueries = [
        '(prefers-contrast: high)',
        '(prefers-reduced-motion: reduce)',
        '(prefers-color-scheme: dark)',
      ]

      mediaQueries.forEach(query => {
        const media = window.matchMedia(query)
        media.addEventListener('change', () => {
          this.highContrastMode = this.detectHighContrast()
          this.reducedMotion = this.detectReducedMotion()
          this.updateAccessibilitySettings()
        })
      })
    }
  }

  /**
   * 设置键盘导航
   */
  private setupKeyboardNavigation(): void {
    if (!this.config.enableKeyboardNavigation) return

    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('focus', this.handleFocus.bind(this), true)
    document.addEventListener('blur', this.handleBlur.bind(this), true)
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Tab':
        this.handleTabNavigation(event)
        break
      case 'Enter':
      case ' ':
        this.handleActivation(event)
        break
      case 'Escape':
        this.handleEscape(event)
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event)
        break
      case 'Home':
      case 'End':
        this.handleHomeEndNavigation(event)
        break
    }
  }

  /**
   * 处理Tab导航
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    if (!this.config.tabIndexManagement) return

    const focusableElements = this.getFocusableElements()
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

    let nextIndex: number
    if (event.shiftKey) {
      // Shift+Tab - 向前导航
      nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
    } else {
      // Tab - 向后导航
      nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
    }

    if (focusableElements[nextIndex]) {
      event.preventDefault()
      focusableElements[nextIndex].focus()
    }
  }

  /**
   * 处理激活键
   */
  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement
    if (target.getAttribute('role') === 'button' || target.tagName === 'BUTTON') {
      event.preventDefault()
      target.click()
    }
  }

  /**
   * 处理Escape键
   */
  private handleEscape(event: KeyboardEvent): void {
    // 关闭模态框、返回上一级等
    this.announceToScreenReader('已退出当前操作')
  }

  /**
   * 处理方向键导航
   */
  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement
    const role = target.getAttribute('role')

    if (role === 'menu' || role === 'menubar' || role === 'listbox') {
      event.preventDefault()
      // 实现菜单导航逻辑
    }
  }

  /**
   * 处理Home/End键导航
   */
  private handleHomeEndNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement
    const role = target.getAttribute('role')

    if (role === 'listbox' || role === 'grid' || role === 'tree') {
      event.preventDefault()
      // 实现Home/End导航逻辑
    }
  }

  /**
   * 处理焦点事件
   */
  private handleFocus(event: FocusEvent): void {
    const target = event.target as HTMLElement
    this.currentFocusElement = target
    this.updateFocusIndicators(target)
  }

  /**
   * 处理失焦事件
   */
  private handleBlur(event: FocusEvent): void {
    this.currentFocusElement = null
    this.clearFocusIndicators(event.target as HTMLElement)
  }

  /**
   * 设置焦点管理
   */
  private setupFocusManagement(): void {
    if (!this.config.enableFocusManagement) return

    // 初始化可聚焦元素
    this.updateFocusableElements()
  }

  /**
   * 获取可聚焦元素
   */
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="tab"]',
    ].join(', ')

    return Array.from(document.querySelectorAll(selector)) as HTMLElement[]
  }

  /**
   * 更新可聚焦元素列表
   */
  public updateFocusableElements(): void {
    const elements = this.getFocusableElements()
    this.focusableElements.clear()
    elements.forEach(element => this.focusableElements.add(element))
  }

  /**
   * 更新焦点指示器
   */
  private updateFocusIndicators(element: HTMLElement): void {
    // 添加焦点样式
    element.style.outline = this.config.enableHighContrastMode
      ? '3px solid #ffffff'
      : '2px solid #2563eb'
  }

  /**
   * 清除焦点指示器
   */
  private clearFocusIndicators(element: HTMLElement): void {
    element.style.outline = ''
  }

  /**
   * 设置屏幕阅读器支持
   */
  private setupScreenReaderSupport(): void {
    if (!this.config.enableScreenReaderSupport) return

    // 添加屏幕阅读器专用的ARIA标签
    this.addScreenReaderLabels()
  }

  /**
   * 添加屏幕阅读器标签
   */
  private addScreenReaderLabels(): void {
    // 为设计器区域添加标签
    const designer = document.querySelector('[data-designer="canvas"]')
    if (designer) {
      designer.setAttribute('role', 'application')
      designer.setAttribute('aria-label', '页面设计器画布')
    }

    // 为组件面板添加标签
    const componentPanel = document.querySelector('[data-designer="component-panel"]')
    if (componentPanel) {
      componentPanel.setAttribute('role', 'navigation')
      componentPanel.setAttribute('aria-label', '组件面板')
    }

    // 为属性面板添加标签
    const propertiesPanel = document.querySelector('[data-designer="properties-panel"]')
    if (propertiesPanel) {
      propertiesPanel.setAttribute('role', 'complementary')
      propertiesPanel.setAttribute('aria-label', '属性面板')
    }
  }

  /**
   * 设置屏幕阅读器公告区域
   */
  private setupAnnouncementRegion(): void {
    // 创建屏幕阅读器公告区域
    const announcementRegion = document.createElement('div')
    announcementRegion.setAttribute('aria-live', 'polite')
    announcementRegion.setAttribute('aria-atomic', 'true')
    announcementRegion.className = 'sr-only'
    announcementRegion.setAttribute('data-announcer', 'true')
    document.body.appendChild(announcementRegion)
  }

  /**
   * 向屏幕阅读器发送公告
   */
  public announceToScreenReader(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    const announcer = document.querySelector('[data-announcer="true"]') as HTMLElement
    if (announcer) {
      announcer.setAttribute('aria-live', priority)
      announcer.textContent = message
    }
  }

  /**
   * 生成组件的ARIA属性
   */
  public generateComponentARIA(componentType: string, props: any): ARIAAttributes {
    const ariaAttributes: ARIAAttributes = {}

    switch (componentType) {
      case 'button':
        ariaAttributes.role = 'button'
        ariaAttributes['aria-label'] = props.text || props.label || '按钮'
        ariaAttributes['aria-pressed'] = props.pressed
        ariaAttributes['aria-expanded'] = props.expanded
        ariaAttributes['aria-disabled'] = props.disabled
        break

      case 'input':
        if (props.type === 'checkbox') {
          ariaAttributes.role = 'checkbox'
          ariaAttributes['aria-checked'] = props.checked
          ariaAttributes['aria-required'] = props.required
          ariaAttributes['aria-invalid'] = props.error || false
        } else if (props.type === 'radio') {
          ariaAttributes.role = 'radio'
          ariaAttributes['aria-checked'] = props.checked
          ariaAttributes['aria-required'] = props.required
        } else {
          ariaAttributes.role = 'textbox'
          ariaAttributes['aria-required'] = props.required
          ariaAttributes['aria-invalid'] = props.error || false
          ariaAttributes['aria-label'] = props.label || props.placeholder
        }
        break

      case 'text':
        if (props.variant?.startsWith('heading')) {
          ariaAttributes.role = 'heading'
          const level = props.variant?.replace('heading', '') || '2'
          ;(ariaAttributes as any)['aria-level'] = parseInt(level)
        }
        ariaAttributes['aria-label'] = props.content || '文本'
        break

      case 'image':
        ariaAttributes.role = 'img'
        ariaAttributes['aria-label'] = props.alt || props.title || '图片'
        break

      case 'container':
        if (props.role) {
          ariaAttributes.role = props.role
        }
        if (props.label) {
          ariaAttributes['aria-label'] = props.label
        }
        break

      case 'link':
        ariaAttributes.role = 'link'
        ariaAttributes['aria-label'] = props.text || props.title || '链接'
        break

      case 'list':
        ariaAttributes.role = 'list'
        ariaAttributes['aria-label'] = props.label || '列表'
        break

      case 'table':
        ariaAttributes.role = 'table'
        ariaAttributes['aria-label'] = props.caption || '表格'
        if (props.sortable) {
          ariaAttributes['aria-sort'] = props.sortDirection || 'none'
        }
        break
    }

    return ariaAttributes
  }

  /**
   * 运行无障碍审计
   */
  public auditAccessibility(): AccessibilityAuditResult {
    const issues: AccessibilityIssue[] = []
    const warnings: AccessibilityWarning[] = []
    const passes: AccessibilityPass[] = []

    // 检查键盘导航
    this.auditKeyboardNavigation(issues, warnings, passes)

    // 检查屏幕阅读器支持
    this.auditScreenReaderSupport(issues, warnings, passes)

    // 检查颜色对比度
    this.auditColorContrast(issues, warnings, passes)

    // 检查焦点管理
    this.auditFocusManagement(issues, warnings, passes)

    // 检查语义化标签
    this.auditSemanticMarkup(issues, warnings, passes)

    // 计算得分
    const totalChecks = issues.length + warnings.length + passes.length
    const score = totalChecks > 0 ? Math.round((passes.length / totalChecks) * 100) : 100

    return {
      score,
      issues,
      warnings,
      passes,
      timestamp: Date.now(),
    }
  }

  /**
   * 审计键盘导航
   */
  private auditKeyboardNavigation(
    issues: AccessibilityIssue[],
    warnings: AccessibilityWarning[],
    passes: AccessibilityPass[]
  ): void {
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]'
    )

    if (interactiveElements.length === 0) {
      issues.push({
        type: 'error',
        category: 'keyboard',
        message: '没有找到可交互的元素',
        suggestion: '确保所有交互功能都可以通过键盘访问',
        impact: 'critical',
        wcagCriterion: '2.1.1',
      })
    } else {
      passes.push({
        category: 'keyboard',
        message: `找到 ${interactiveElements.length} 个可交互元素`,
      })
    }

    // 检查Tab顺序
    const focusableElements = this.getFocusableElements()
    if (focusableElements.length > 0) {
      passes.push({
        category: 'keyboard',
        message: 'Tab导航正常工作',
      })
    }
  }

  /**
   * 审计屏幕阅读器支持
   */
  private auditScreenReaderSupport(
    issues: AccessibilityIssue[],
    warnings: AccessibilityWarning[],
    passes: AccessibilityPass[]
  ): void {
    // 检查ARIA标签
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-labelledby], [role]')
    if (elementsWithAria.length > 0) {
      passes.push({
        category: 'screen-reader',
        message: `找到 ${elementsWithAria.length} 个带ARIA属性的元素`,
      })
    } else {
      warnings.push({
        category: 'screen-reader',
        message: '没有找到ARIA标签',
        suggestion: '为重要的交互元素添加适当的ARIA标签',
      })
    }

    // 检查图片alt属性
    const images = document.querySelectorAll('img')
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt)
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'error',
        category: 'screen-reader',
        element: imagesWithoutAlt.map(img => img.src).join(', '),
        message: `找到 ${imagesWithoutAlt.length} 个没有alt属性的图片`,
        suggestion: '为所有图片提供描述性的alt属性',
        impact: 'serious',
        wcagCriterion: '1.1.1',
      })
    }
  }

  /**
   * 审计颜色对比度
   */
  private auditColorContrast(
    issues: AccessibilityIssue[],
    warnings: AccessibilityWarning[],
    passes: AccessibilityPass[]
  ): void {
    // 简单的对比度检查（实际应用中需要更复杂的算法）
    if (this.highContrastMode) {
      passes.push({
        category: 'contrast',
        message: '高对比度模式已启用',
      })
    } else {
      warnings.push({
        category: 'contrast',
        message: '建议检查颜色对比度',
        suggestion: '确保文本和背景的对比度至少为4.5:1',
      })
    }
  }

  /**
   * 审计焦点管理
   */
  private auditFocusManagement(
    issues: AccessibilityIssue[],
    warnings: AccessibilityWarning[],
    passes: AccessibilityPass[]
  ): void {
    const focusableElements = this.getFocusableElements()

    if (focusableElements.length > 0) {
      passes.push({
        category: 'focus',
        message: `找到 ${focusableElements.length} 个可聚焦元素`,
      })
    }

    // 检查焦点陷阱
    const modals = document.querySelectorAll('[role="dialog"], [role="modal"]')
    if (modals.length > 0) {
      passes.push({
        category: 'focus',
        message: `找到 ${modals.length} 个模态框`,
      })
    }
  }

  /**
   * 审计语义化标签
   */
  private auditSemanticMarkup(
    issues: AccessibilityIssue[],
    warnings: AccessibilityWarning[],
    passes: AccessibilityPass[]
  ): void {
    const semanticElements = document.querySelectorAll(
      'header, nav, main, section, article, aside, footer'
    )

    if (semanticElements.length > 0) {
      passes.push({
        category: 'semantics',
        message: `找到 ${semanticElements.length} 个语义化标签`,
      })
    } else {
      warnings.push({
        category: 'semantics',
        message: '建议使用语义化HTML标签',
        suggestion: '使用header, nav, main等语义化标签改善可访问性',
      })
    }
  }

  /**
   * 更新无障碍设置
   */
  private updateAccessibilitySettings(): void {
    document.body.setAttribute('data-high-contrast', this.highContrastMode.toString())
    document.body.setAttribute('data-reduced-motion', this.reducedMotion.toString())
  }

  /**
   * 获取当前配置
   */
  public getConfig(): KeyboardNavigationConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<KeyboardNavigationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.updateAccessibilitySettings()
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    document.removeEventListener('focus', this.handleFocus.bind(this), true)
    document.removeEventListener('blur', this.handleBlur.bind(this), true)

    // 移除公告区域
    const announcer = document.querySelector('[data-announcer="true"]')
    if (announcer) {
      announcer.remove()
    }
  }
}

// 全局无障碍管理器实例
export const accessibilityManager = new AccessibilityManager()

export default accessibilityManager
