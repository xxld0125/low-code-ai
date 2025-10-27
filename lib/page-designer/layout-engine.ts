/**
 * 页面设计器布局引擎
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import {
  ComponentInstance,
  ComponentType,
  ComponentStyles,
  Breakpoint,
} from '@/types/page-designer/component'
import {
  LayoutComponentType,
  LayoutCalculationResult,
  LayoutEngineConfig,
  FlexboxLayoutProps,
  GridLayoutProps,
  ContainerProps,
  RowProps,
  ColProps,
} from '@/types/page-designer/layout'

// 布局引擎默认配置
export const DEFAULT_LAYOUT_ENGINE_CONFIG: LayoutEngineConfig = {
  enableCaching: true,
  cacheSize: 100,
  debounceDelay: 16, // 60fps
  gridSize: 8,
  snapToGrid: true,
  showGrid: false,
  enableAlignmentGuides: true,
  alignmentThreshold: 5,
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  mobileFirst: true,
  enableValidation: true,
  strictMode: false,
  showWarnings: true,
}

// 布局计算上下文
export interface LayoutContext {
  viewport: {
    width: number
    height: number
    breakpoint: Breakpoint
  }
  container: {
    width: number
    height: number
    x: number
    y: number
  }
  config: LayoutEngineConfig
}

// 布局缓存项
interface LayoutCacheItem {
  componentId: string
  context: LayoutContext
  result: LayoutCalculationResult
  timestamp: number
}

// 布局引擎类
export class LayoutEngine {
  private config: LayoutEngineConfig
  private cache: Map<string, LayoutCacheItem>
  private debounceTimers: Map<string, NodeJS.Timeout>

  constructor(config: Partial<LayoutEngineConfig> = {}) {
    this.config = { ...DEFAULT_LAYOUT_ENGINE_CONFIG, ...config }
    this.cache = new Map()
    this.debounceTimers = new Map()
  }

  // 更新配置
  public updateConfig(config: Partial<LayoutEngineConfig>): void {
    this.config = { ...this.config, ...config }
    if (!this.config.enableCaching) {
      this.clearCache()
    }
  }

  // 获取当前配置
  public getConfig(): LayoutEngineConfig {
    return { ...this.config }
  }

  // 计算组件布局
  public calculateLayout(
    component: ComponentInstance,
    components: Record<string, ComponentInstance>,
    context: LayoutContext
  ): LayoutCalculationResult {
    // 检查缓存
    if (this.config.enableCaching) {
      const cachedResult = this.getFromCache(component.id, context)
      if (cachedResult) {
        return cachedResult
      }
    }

    // 计算布局
    const result = this.calculateLayoutInternal(component, components, context)

    // 缓存结果
    if (this.config.enableCaching) {
      this.setCache(component.id, context, result)
    }

    return result
  }

  // 批量计算布局
  public calculateBatchLayout(
    componentIds: string[],
    components: Record<string, ComponentInstance>,
    context: LayoutContext
  ): Record<string, LayoutCalculationResult> {
    const results: Record<string, LayoutCalculationResult> = {}

    componentIds.forEach(componentId => {
      const component = components[componentId]
      if (component) {
        results[componentId] = this.calculateLayout(component, components, context)
      }
    })

    return results
  }

  // 防抖计算布局
  public debouncedCalculateLayout(
    component: ComponentInstance,
    components: Record<string, ComponentInstance>,
    context: LayoutContext,
    callback: (result: LayoutCalculationResult) => void
  ): void {
    const key = `${component.id}-${context.viewport.width}-${context.viewport.height}`

    // 清除之前的定时器
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!)
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      const result = this.calculateLayout(component, components, context)
      callback(result)
      this.debounceTimers.delete(key)
    }, this.config.debounceDelay)

    this.debounceTimers.set(key, timer)
  }

  // 内部布局计算方法
  private calculateLayoutInternal(
    component: ComponentInstance,
    components: Record<string, ComponentInstance>,
    context: LayoutContext
  ): LayoutCalculationResult {
    const startTime = performance.now()

    // 获取子组件
    const children = this.getChildComponents(component, components)
    const childrenResults: Record<string, any> = {}

    // 计算当前组件的样式
    const computedStyles = this.computeComponentStyles(component, context)

    // 计算布局信息
    const layoutInfo = this.computeLayoutInfo(component, context, computedStyles)

    // 递归计算子组件布局
    children.forEach(child => {
      const childContext = {
        ...context,
        container: {
          x: layoutInfo.position.x,
          y: layoutInfo.position.y,
          width: layoutInfo.width,
          height: layoutInfo.height,
        },
      }

      const childResult = this.calculateLayoutInternal(child, components, childContext)
      childrenResults[child.id] = {
        position: childResult.layoutInfo.position,
        size: { width: childResult.layoutInfo.width, height: childResult.layoutInfo.height },
        zIndex: childResult.layoutInfo.zIndex,
      }
    })

    // 应用特定布局算法
    const finalLayout = this.applySpecificLayoutAlgorithm(
      component,
      children,
      computedStyles,
      context
    )

    const calculationTime = performance.now() - startTime

    return {
      computedStyles: { ...computedStyles, ...finalLayout.styles },
      layoutInfo: { ...layoutInfo, ...finalLayout.layoutInfo },
      childrenLayouts: childrenResults,
      responsive: {
        breakpoint: context.viewport.breakpoint,
        viewportWidth: context.viewport.width,
        adjustments: finalLayout.adjustments || [],
      },
      performance: {
        calculationTime,
        affectedComponents: children.length + 1,
        optimized: calculationTime < this.config.debounceDelay,
      },
    }
  }

  // 获取子组件
  private getChildComponents(
    component: ComponentInstance,
    components: Record<string, ComponentInstance>
  ): ComponentInstance[] {
    return Object.values(components)
      .filter(child => child.parent_id === component.id)
      .sort((a, b) => a.position.order - b.position.order)
  }

  // 计算组件样式
  private computeComponentStyles(
    component: ComponentInstance,
    context: LayoutContext
  ): ComponentStyles {
    const baseStyles: ComponentStyles = { ...component.styles }

    // 应用响应式样式
    const responsiveStyles = this.applyResponsiveStyles(component, context)

    // 应用网格对齐
    if (this.config.snapToGrid) {
      this.applyGridAlignment(baseStyles, context)
    }

    return { ...baseStyles, ...responsiveStyles }
  }

  // 应用响应式样式
  private applyResponsiveStyles(
    component: ComponentInstance,
    context: LayoutContext
  ): ComponentStyles {
    const responsive = component.responsive
    if (!responsive) return {}

    const breakpointStyles = responsive[context.viewport.breakpoint]
    if (!breakpointStyles) return {}

    const responsiveStyles: ComponentStyles = {}

    // 应用响应式属性
    if (breakpointStyles.props) {
      Object.assign(
        responsiveStyles,
        this.propsToStyles(breakpointStyles.props, component.component_type)
      )
    }

    // 应用响应式样式
    if (breakpointStyles.styles) {
      Object.assign(responsiveStyles, breakpointStyles.styles)
    }

    return responsiveStyles
  }

  // 将属性转换为样式
  private propsToStyles(props: any, componentType: ComponentType): ComponentStyles {
    const styles: ComponentStyles = {}

    switch (componentType) {
      case 'container':
        if (props.container) {
          Object.assign(styles, this.containerPropsToStyles(props.container))
        }
        break
      case 'row':
        if (props.row) {
          Object.assign(styles, this.rowPropsToStyles(props.row))
        }
        break
      case 'col':
        if (props.col) {
          Object.assign(styles, this.colPropsToStyles(props.col))
        }
        break
    }

    return styles
  }

  // Container属性转样式
  private containerPropsToStyles(props: ContainerProps): ComponentStyles {
    const styles: ComponentStyles = {
      display: 'flex',
      flexDirection: props.direction || 'column',
      flexWrap: props.wrap ? 'wrap' : 'nowrap',
      justifyContent: props.justify || 'flex-start',
      alignItems: props.align || 'flex-start',
      gap: props.gap ? `${props.gap}px` : undefined,
    }

    // 处理间距
    if (props.padding) {
      styles.padding = this.spacingToValue(props.padding)
    }
    if (props.margin) {
      styles.margin = this.spacingToValue(props.margin)
    }

    // 处理背景
    if (props.background) {
      styles.backgroundColor = props.background
    }

    // 处理边框
    if (props.border) {
      styles.border = '1px solid #e5e7eb'
    }

    // 处理阴影
    if (props.shadow) {
      styles.boxShadow = this.getShadowValue(props.shadow)
    }

    // 处理圆角
    if (props.rounded) {
      styles.borderRadius = this.getBorderRadiusValue(props.rounded)
    }

    return styles
  }

  // Row属性转样式
  private rowPropsToStyles(props: RowProps): ComponentStyles {
    const styles: ComponentStyles = {
      display: 'flex',
      flexDirection: props.reverse ? 'row-reverse' : 'row',
      flexWrap: props.wrap ? 'wrap' : 'nowrap',
      justifyContent: this.getJustifyValue(props.justify),
      alignItems: this.getAlignValue(props.align),
      gap: this.spacingToValue(props.gap),
    }

    // 处理间距
    if (props.padding) {
      styles.padding = this.spacingToValue(props.padding)
    }
    if (props.margin) {
      styles.margin = this.spacingToValue(props.margin)
    }

    return styles
  }

  // Col属性转样式
  private colPropsToStyles(props: ColProps): ComponentStyles {
    const styles: ComponentStyles = {}

    // Flex属性
    if (props.flex) {
      // 如果props.flex是简单的数值，将其设置给flexGrow
      if (typeof props.flex === 'number') {
        styles.flexGrow = props.flex
      } else if (typeof props.flex === 'string') {
        // 如果是字符串，尝试解析或设置合适的flex属性
        styles.flex = {
          grow: parseFloat(props.flex) || 1,
          shrink: 1,
          basis: 'auto',
        }
      }
    }
    if (props.flexGrow !== undefined) {
      styles.flexGrow = props.flexGrow
    }
    if (props.flexShrink !== undefined) {
      styles.flexShrink = props.flexShrink
    }
    if (props.flexBasis) {
      styles.flexBasis = props.flexBasis
    }

    // 对齐
    if (props.alignSelf) {
      styles.alignSelf = props.alignSelf
    }

    // 栅格系统（通过Tailwind类实现）
    if (props.span) {
      const spanValue = typeof props.span === 'number' ? props.span : 12
      // 这里会通过className来应用，不直接设置样式
    }

    // 处理间距
    if (props.padding) {
      styles.padding = this.spacingToValue(props.padding)
    }
    if (props.margin) {
      styles.margin = this.spacingToValue(props.margin)
    }

    return styles
  }

  // 计算布局信息
  private computeLayoutInfo(
    component: ComponentInstance,
    context: LayoutContext,
    styles: ComponentStyles
  ): any {
    const containerWidth = context.container.width
    const containerHeight = context.container.height

    let width = styles.width || 'auto'
    let height = styles.height || 'auto'

    // 处理响应式宽度
    if (typeof width === 'string' && width.includes('%')) {
      const percentage = parseFloat(width) / 100
      width = containerWidth * percentage
    }

    // 处理响应式高度
    if (typeof height === 'string' && height.includes('%')) {
      const percentage = parseFloat(height) / 100
      height = containerHeight * percentage
    }

    return {
      width: typeof width === 'number' ? width : containerWidth,
      height: typeof height === 'number' ? height : 'auto',
      position: {
        x: styles.left || 0,
        y: styles.top || 0,
      },
      zIndex: styles.zIndex || component.position.z_index,
    }
  }

  // 应用特定布局算法
  private applySpecificLayoutAlgorithm(
    component: ComponentInstance,
    children: ComponentInstance[],
    styles: ComponentStyles,
    context: LayoutContext
  ): { styles: ComponentStyles; layoutInfo: any; adjustments: string[] } {
    const adjustments: string[] = []

    switch (component.component_type) {
      case 'row':
        return this.applyRowLayout(component, children, styles, context, adjustments)
      case 'col':
        return this.applyColLayout(component, children, styles, context, adjustments)
      case 'container':
        return this.applyContainerLayout(component, children, styles, context, adjustments)
      default:
        return { styles, layoutInfo: {}, adjustments }
    }
  }

  // 应用Row布局算法
  private applyRowLayout(
    component: ComponentInstance,
    children: ComponentInstance[],
    styles: ComponentStyles,
    context: LayoutContext,
    adjustments: string[]
  ): { styles: ComponentStyles; layoutInfo: any; adjustments: string[] } {
    const rowProps = component.props.row || {}
    const containerWidth = context.container.width

    // 计算总宽度
    let totalWidth = 0
    const colSpans: number[] = []

    children.forEach(child => {
      const colProps = child.props.col || {}
      const span = typeof colProps.span === 'number' ? colProps.span : 12
      totalWidth += span
      colSpans.push(span)
    })

    // 检查是否超出12列
    if (totalWidth > 12) {
      adjustments.push(`Row中列总数 (${totalWidth}) 超出12，将换行显示`)
    }

    return { styles, layoutInfo: { totalWidth, colSpans }, adjustments }
  }

  // 应用Col布局算法
  private applyColLayout(
    component: ComponentInstance,
    children: ComponentInstance[],
    styles: ComponentStyles,
    context: LayoutContext,
    adjustments: string[]
  ): { styles: ComponentStyles; layoutInfo: any; adjustments: string[] } {
    const colProps = component.props.col || {}
    const containerWidth = context.container.width

    // 计算Col宽度
    const span = typeof colProps.span === 'number' ? colProps.span : 12
    const width = (containerWidth / 12) * span

    // 处理偏移
    const offset = typeof colProps.offset === 'number' ? colProps.offset : 0
    const marginLeft = (containerWidth / 12) * offset

    const computedStyles: ComponentStyles = {
      ...styles,
      width: `${width}px`,
      marginLeft: offset > 0 ? `${marginLeft}px` : styles.marginLeft,
    }

    return {
      styles: computedStyles,
      layoutInfo: { computedWidth: width, computedMarginLeft: marginLeft },
      adjustments,
    }
  }

  // 应用Container布局算法
  private applyContainerLayout(
    component: ComponentInstance,
    children: ComponentInstance[],
    styles: ComponentStyles,
    context: LayoutContext,
    adjustments: string[]
  ): { styles: ComponentStyles; layoutInfo: any; adjustments: string[] } {
    const containerProps = component.props.container || {}
    const direction = containerProps.direction || 'column'

    // Container的布局逻辑主要是Flexbox
    // 这里可以添加特殊的容器布局逻辑

    return { styles, layoutInfo: { direction }, adjustments }
  }

  // 工具方法：间距转值
  private spacingToValue(spacing: any): string | undefined {
    if (!spacing) return undefined
    if (typeof spacing === 'number') return `${spacing}px`
    if (typeof spacing === 'string') return spacing
    if (typeof spacing === 'object') {
      const { x = 0, y = 0, top, right, bottom, left } = spacing
      if (top !== undefined || right !== undefined || bottom !== undefined || left !== undefined) {
        return `${top ?? y}px ${right ?? x}px ${bottom ?? y}px ${left ?? x}px`
      }
      return `${y}px ${x}px`
    }
    return undefined
  }

  // 工具方法：对齐值转换
  private getJustifyValue(
    value?: string
  ): 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' {
    switch (value) {
      case 'start':
        return 'flex-start'
      case 'end':
        return 'flex-end'
      case 'center':
        return 'center'
      case 'between':
        return 'space-between'
      case 'around':
        return 'space-around'
      case 'evenly':
        return 'space-evenly'
      default:
        return 'flex-start'
    }
  }

  private getAlignValue(
    value?: string
  ): 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' {
    switch (value) {
      case 'start':
        return 'flex-start'
      case 'end':
        return 'flex-end'
      case 'center':
        return 'center'
      case 'stretch':
        return 'stretch'
      case 'baseline':
        return 'baseline'
      default:
        return 'flex-start'
    }
  }

  // 工具方法：阴影值
  private getShadowValue(shadow: any): string {
    if (!shadow) return 'none'
    if (typeof shadow === 'boolean') {
      return shadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
    }
    return shadow
  }

  // 工具方法：圆角值
  private getBorderRadiusValue(radius: any): string {
    if (!radius) return '0'
    if (typeof radius === 'boolean') {
      return radius ? '0.375rem' : '0'
    }
    return `${radius}`
  }

  // 应用网格对齐
  private applyGridAlignment(styles: ComponentStyles, context: LayoutContext): void {
    const gridSize = this.config.gridSize

    if (styles.left !== undefined) {
      styles.left = Math.round((styles.left as number) / gridSize) * gridSize
    }
    if (styles.top !== undefined) {
      styles.top = Math.round((styles.top as number) / gridSize) * gridSize
    }
    if (styles.width !== undefined && typeof styles.width === 'number') {
      styles.width = Math.round(styles.width / gridSize) * gridSize
    }
    if (styles.height !== undefined && typeof styles.height === 'number') {
      styles.height = Math.round(styles.height / gridSize) * gridSize
    }
  }

  // 缓存管理
  private getFromCache(
    componentId: string,
    context: LayoutContext
  ): LayoutCalculationResult | null {
    const key = this.getCacheKey(componentId, context)
    const item = this.cache.get(key)

    if (item && Date.now() - item.timestamp < 5000) {
      // 5秒缓存
      return item.result
    }

    return null
  }

  private setCache(
    componentId: string,
    context: LayoutContext,
    result: LayoutCalculationResult
  ): void {
    const key = this.getCacheKey(componentId, context)

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.config.cacheSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      componentId,
      context: { ...context },
      result,
      timestamp: Date.now(),
    })
  }

  private getCacheKey(componentId: string, context: LayoutContext): string {
    return `${componentId}-${context.viewport.width}-${context.viewport.height}-${context.viewport.breakpoint}`
  }

  public clearCache(): void {
    this.cache.clear()
  }

  // 清理防抖定时器
  public clearDebounceTimers(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }
}

// 导出单例实例
export const layoutEngine = new LayoutEngine()

// 导出工具函数
export const calculateLayout = (
  component: ComponentInstance,
  components: Record<string, ComponentInstance>,
  context: LayoutContext
): LayoutCalculationResult => {
  return layoutEngine.calculateLayout(component, components, context)
}

export const updateLayoutEngineConfig = (config: Partial<LayoutEngineConfig>) => {
  layoutEngine.updateConfig(config)
}
