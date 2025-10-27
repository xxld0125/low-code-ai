/**
 * 页面设计器无障碍标准配置
 * 遵循WCAG 2.1 AA级别标准
 */

export const ACCESSIBILITY_CONFIG = {
  // 颜色对比度标准
  colorContrast: {
    normalText: 4.5, // 正常文本最小对比度
    largeText: 3.0, // 大文本最小对比度
    graphicalObjects: 3.0, // 图形对象最小对比度
  },

  // 键盘导航
  keyboardNavigation: {
    tabOrder: true, // 保持Tab键顺序
    focusVisible: true, // 焦点可见性
    skipLinks: true, // 跳转链接
    trapFocus: true, // 焦点陷阱（模态框等）
  },

  // 屏幕阅读器支持
  screenReader: {
    ariaLabels: true, // ARIA标签
    roles: true, // 语义化角色
    announcements: true, // 状态变化通知
    altText: true, // 图片替代文本
  },

  // 运动和动画
  motion: {
    reducedMotion: true, // 减少动画偏好支持
    pauseAnimations: true, // 动画暂停控制
    seizureSafe: true, // 闪烁内容安全
  },

  // 表单无障碍
  forms: {
    labels: true, // 表单标签
    instructions: true, // 表单说明
    errorMessages: true, // 错误消息关联
    requiredIndicators: true, // 必填字段指示
  },

  // 间距和尺寸
  spacing: {
    minTouchTarget: 44, // 最小触摸目标尺寸（像素）
    textSpacing: 1.5, // 文本行间距倍数
    resizeText: 200, // 文本缩放百分比
  },
} as const

/**
 * ARIA角色和属性映射
 */
export const ARIA_MAPPING = {
  // 组件类型到ARIA角色的映射
  componentRoles: {
    button: 'button',
    input: 'textbox',
    text: 'paragraph',
    image: 'img',
    container: 'region',
    form: 'form',
    navigation: 'navigation',
    main: 'main',
    header: 'banner',
    footer: 'contentinfo',
  },

  // 状态属性
  stateProperties: {
    disabled: 'aria-disabled',
    required: 'aria-required',
    invalid: 'aria-invalid',
    expanded: 'aria-expanded',
    selected: 'aria-selected',
    busy: 'aria-busy',
  },

  // 关系属性
  relationshipProperties: {
    labelledBy: 'aria-labelledby',
    describedBy: 'aria-describedby',
    controls: 'aria-controls',
    owns: 'aria-owns',
  },
} as const

/**
 * 无障碍验证规则
 */
export const ACCESSIBILITY_VALIDATORS = {
  /**
   * 验证颜色对比度
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateColorContrast: (_foreground: string, _background: string): boolean => {
    // 这里应该实现实际的颜色对比度计算
    // 暂时返回true，后续可以集成颜色对比度计算库
    return true
  },

  /**
   * 验证触摸目标尺寸
   */
  validateTouchTarget: (width: number, height: number): boolean => {
    return (
      width >= ACCESSIBILITY_CONFIG.spacing.minTouchTarget &&
      height >= ACCESSIBILITY_CONFIG.spacing.minTouchTarget
    )
  },

  /**
   * 验证表单字段是否有标签
   */
  validateFormField: (
    hasLabel: boolean,
    hasAriaLabel: boolean,
    hasAriaLabelledBy: boolean
  ): boolean => {
    return hasLabel || hasAriaLabel || hasAriaLabelledBy
  },

  /**
   * 验证图片是否有替代文本
   */
  validateImageAlt: (alt: string | undefined, isDecorative = false): boolean => {
    return isDecorative ? alt === '' || alt === undefined : alt !== undefined && alt.length > 0
  },

  /**
   * 验证链接文本描述性
   */
  validateLinkText: (text: string): boolean => {
    const avoidPatterns = ['点击这里', 'click here', '更多', 'more']
    return !avoidPatterns.some(pattern => text.toLowerCase().includes(pattern))
  },

  /**
   * 验证标题层级
   */
  validateHeadingLevels: (currentLevel: number, previousLevel: number): boolean => {
    // 标题层级不能跳跃超过一级
    return currentLevel <= previousLevel + 1
  },
} as const

/**
 * 键盘导航配置
 */
export const KEYBOARD_NAVIGATION = {
  // 快捷键定义
  shortcuts: {
    escape: 'Escape',
    tab: 'Tab',
    shiftTab: 'Shift+Tab',
    enter: 'Enter',
    space: ' ',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    arrowLeft: 'ArrowLeft',
    arrowRight: 'ArrowRight',
    home: 'Home',
    end: 'End',
    pageUp: 'PageUp',
    pageDown: 'PageDown',
  },

  // 焦点管理
  focusManagement: {
    // 焦点可进入的元素类型
    focusableElements: [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ],

    // 跳过焦点的元素
    skipElements: ['[disabled]', '[aria-hidden="true"]', '[aria-disabled="true"]', ':hidden'],
  },

  // 焦点陷阱策略
  focusTrap: {
    // 需要焦点陷阱的组件
    trapElements: [
      '[role="dialog"]',
      '[role="modal"]',
      '[role="menu"]',
      '[role="listbox"]',
      '[role="tree"]',
    ],

    // 陷阱激活条件
    trapConditions: {
      modalOpen: true,
      dropdownOpen: true,
      menuOpen: true,
    },
  },
} as const

/**
 * 工具函数
 */
export const accessibilityUtils = {
  /**
   * 生成唯一ID用于ARIA属性
   */
  generateAriaId: (prefix = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
  },

  /**
   * 检查系统是否偏好减少动画
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * 检查系统是否偏好高对比度
   */
  prefersHighContrast: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-contrast: high)').matches
  },

  /**
   * 生成组件的无障碍属性
   */
  generateAccessibilityProps: (componentType: string, props: Record<string, unknown>) => {
    const role =
      ARIA_MAPPING.componentRoles[componentType as keyof typeof ARIA_MAPPING.componentRoles]
    const ariaProps: Record<string, unknown> = {}

    if (role) {
      ariaProps.role = role
    }

    // 根据组件类型添加特定的ARIA属性
    switch (componentType) {
      case 'button':
        if (props.disabled) ariaProps['aria-disabled'] = true
        if (props.loading) ariaProps['aria-busy'] = true
        break
      case 'input':
        if (props.required) ariaProps['aria-required'] = true
        if (props.error) ariaProps['aria-invalid'] = true
        if (props.label) ariaProps['aria-label'] = props.label
        break
      case 'image':
        if (props.alt || props.alt === '') ariaProps.alt = props.alt
        break
    }

    return ariaProps
  },
} as const
