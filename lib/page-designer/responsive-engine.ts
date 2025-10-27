/**
 * 页面设计器响应式引擎
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import { ComponentInstance, ComponentStyles, Breakpoint } from '@/types/page-designer/component'
import { LayoutCalculationResult, LayoutContext } from '@/types/page-designer/layout'

// 响应式断点配置
export const RESPONSIVE_BREAKPOINTS: Record<
  Breakpoint,
  { width: number; label: string; description: string }
> = {
  xs: { width: 0, label: '超小屏', description: '小于640px' },
  sm: { width: 640, label: '小屏', description: '640px及以上' },
  md: { width: 768, label: '中屏', description: '768px及以上' },
  lg: { width: 1024, label: '大屏', description: '1024px及以上' },
  xl: { width: 1280, label: '超大屏', description: '1280px及以上' },
  '2xl': { width: 1536, label: '特大屏', description: '1536px及以上' },
}

// 响应式上下文
export interface ResponsiveContext {
  viewport: {
    width: number
    height: number
  }
  breakpoint: Breakpoint
  orientation: 'portrait' | 'landscape'
  devicePixelRatio: number
}

// 响应式规则
export interface ResponsiveRule {
  breakpoint: Breakpoint
  props?: Record<string, any>
  styles?: ComponentStyles
  visible?: boolean
}

// 响应式冲突类型
export type ResponsiveConflictType =
  | 'visibility_conflict'
  | 'style_conflict'
  | 'layout_conflict'
  | 'breakpoint_overflow'

// 响应式冲突
export interface ResponsiveConflict {
  type: ResponsiveConflictType
  componentId: string
  breakpoints: Breakpoint[]
  message: string
  severity: 'error' | 'warning'
  suggestion?: string
}

// 响应式引擎类
export class ResponsiveEngine {
  private breakpoints: Record<Breakpoint, { width: number; label: string; description: string }>
  private mobileFirst: boolean

  constructor(mobileFirst: boolean = true) {
    this.breakpoints = RESPONSIVE_BREAKPOINTS
    this.mobileFirst = mobileFirst
  }

  // 获取当前断点
  public getCurrentBreakpoint(viewportWidth: number): Breakpoint {
    if (this.mobileFirst) {
      // 移动优先：从大到小查找
      const sortedBreakpoints = Object.entries(this.breakpoints).sort(
        ([, a], [, b]) => b.width - a.width
      )

      for (const [breakpoint, config] of sortedBreakpoints) {
        if (viewportWidth >= config.width) {
          return breakpoint as Breakpoint
        }
      }
    } else {
      // 桌面优先：从小到大查找
      const sortedBreakpoints = Object.entries(this.breakpoints).sort(
        ([, a], [, b]) => a.width - b.width
      )

      for (const [breakpoint, config] of sortedBreakpoints) {
        if (viewportWidth <= config.width) {
          return breakpoint as Breakpoint
        }
      }
    }

    return 'xs' // 默认断点
  }

  // 获取响应式上下文
  public getResponsiveContext(viewportWidth: number, viewportHeight: number): ResponsiveContext {
    const breakpoint = this.getCurrentBreakpoint(viewportWidth)
    const orientation = viewportWidth > viewportHeight ? 'landscape' : 'portrait'

    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      breakpoint,
      orientation,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    }
  }

  // 应用响应式规则
  public applyResponsiveRules(
    component: ComponentInstance,
    context: ResponsiveContext
  ): ComponentStyles {
    const baseStyles: ComponentStyles = { ...component.styles }
    const responsiveConfig = component.responsive

    if (!responsiveConfig) {
      return baseStyles
    }

    const currentBreakpoint = context.breakpoint
    const appliedStyles: ComponentStyles = {}

    // 收集所有需要应用的断点规则
    const applicableBreakpoints = this.getApplicableBreakpoints(currentBreakpoint)

    applicableBreakpoints.forEach(breakpoint => {
      const breakpointConfig = responsiveConfig[breakpoint]
      if (!breakpointConfig) return

      // 应用响应式属性（转换为样式）
      if (breakpointConfig.props) {
        const propsStyles = this.propsToStyles(breakpointConfig.props, component.component_type)
        Object.assign(appliedStyles, propsStyles)
      }

      // 应用响应式样式
      if (breakpointConfig.styles) {
        Object.assign(appliedStyles, breakpointConfig.styles)
      }
    })

    return { ...baseStyles, ...appliedStyles }
  }

  // 获取适用的断点（移动优先）
  private getApplicableBreakpoints(currentBreakpoint: Breakpoint): Breakpoint[] {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

    if (this.mobileFirst) {
      // 移动优先：应用当前断点及之前的所有断点
      return breakpointOrder.slice(0, currentIndex + 1)
    } else {
      // 桌面优先：应用当前断点及之后的所有断点
      return breakpointOrder.slice(currentIndex)
    }
  }

  // 将属性转换为样式
  private propsToStyles(props: any, componentType: string): ComponentStyles {
    const styles: ComponentStyles = {}

    // 根据组件类型应用特定的属性转换
    switch (componentType) {
      case 'col':
        if (props.col) {
          Object.assign(styles, this.colPropsToStyles(props.col))
        }
        break
      case 'container':
      case 'row':
        if (props[componentType]) {
          Object.assign(styles, this.containerPropsToStyles(props[componentType]))
        }
        break
    }

    return styles
  }

  // Col属性转样式
  private colPropsToStyles(colProps: any): ComponentStyles {
    const styles: ComponentStyles = {}

    // 处理响应式span
    if (colProps.span !== undefined) {
      // 这里会通过CSS类来实现，而不是直接设置样式
      // 在实际应用中，这些值会转换为Tailwind CSS类
    }

    // 处理响应式offset
    if (colProps.offset !== undefined) {
      // 同样通过CSS类实现
    }

    // 处理响应式order
    if (colProps.order !== undefined) {
      styles.order = colProps.order
    }

    // 处理响应式对齐
    if (colProps.alignSelf) {
      styles.alignSelf = colProps.alignSelf
    }

    return styles
  }

  // Container/Row属性转样式
  private containerPropsToStyles(containerProps: any): ComponentStyles {
    const styles: ComponentStyles = {}

    // 处理响应式方向
    if (containerProps.direction) {
      styles.flexDirection = containerProps.direction
    }

    // 处理响应式对齐
    if (containerProps.justify) {
      styles.justifyContent = this.getJustifyValue(containerProps.justify)
    }

    if (containerProps.align) {
      styles.alignItems = this.getAlignValue(containerProps.align)
    }

    // 处理响应式间距
    if (containerProps.gap !== undefined) {
      styles.gap = `${containerProps.gap}px`
    }

    // 处理响应式显示
    if (containerProps.wrap !== undefined) {
      styles.flexWrap = containerProps.wrap ? 'wrap' : 'nowrap'
    }

    return styles
  }

  // 对齐值转换
  private getJustifyValue(
    value: string
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
        return 'center'
    }
  }

  private getAlignValue(
    value: string
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
        return 'center'
    }
  }

  // 生成响应式CSS类
  public generateResponsiveClasses(
    component: ComponentInstance,
    context: ResponsiveContext
  ): string[] {
    const classes: string[] = []
    const responsiveConfig = component.responsive

    if (!responsiveConfig) {
      return classes
    }

    const applicableBreakpoints = this.getApplicableBreakpoints(context.breakpoint)

    applicableBreakpoints.forEach(breakpoint => {
      const breakpointConfig = responsiveConfig[breakpoint]
      if (!breakpointConfig) return

      // 生成响应式类名前缀
      const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`

      // 根据组件类型生成特定的类名
      if (component.component_type === 'col' && breakpointConfig.props?.col) {
        const colProps = breakpointConfig.props.col

        // span类名
        if (colProps.span !== undefined) {
          classes.push(`${prefix}col-span-${colProps.span}`)
        }

        // offset类名
        if (typeof colProps.offset === 'number' && colProps.offset > 0) {
          classes.push(`${prefix}col-start-${colProps.offset + 1}`)
        }

        // order类名
        if (colProps.order !== undefined && colProps.order !== 0) {
          classes.push(`${prefix}order-${colProps.order}`)
        }
      }

      // 显示/隐藏类名
      if (breakpointConfig.visible !== undefined) {
        if (breakpointConfig.visible) {
          classes.push(`${prefix}block`)
        } else {
          classes.push(`${prefix}hidden`)
        }
      }
    })

    return classes
  }

  // 验证响应式配置
  public validateResponsiveConfig(component: ComponentInstance): ResponsiveConflict[] {
    const conflicts: ResponsiveConflict[] = []
    const responsiveConfig = component.responsive

    if (!responsiveConfig) {
      return conflicts
    }

    // 检查可见性冲突
    const visibilityConflicts = this.checkVisibilityConflicts(component, responsiveConfig)
    conflicts.push(...visibilityConflicts)

    // 检查样式冲突
    const styleConflicts = this.checkStyleConflicts(component, responsiveConfig)
    conflicts.push(...styleConflicts)

    // 检查布局冲突
    const layoutConflicts = this.checkLayoutConflicts(component, responsiveConfig)
    conflicts.push(...layoutConflicts)

    return conflicts
  }

  // 检查可见性冲突
  private checkVisibilityConflicts(
    component: ComponentInstance,
    responsiveConfig: Record<string, any>
  ): ResponsiveConflict[] {
    const conflicts: ResponsiveConflict[] = []
    const visibilitySettings: Record<Breakpoint, boolean> = {
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: false,
      '2xl': false,
    }

    // 收集所有断点的可见性设置
    Object.entries(responsiveConfig).forEach(([breakpoint, config]) => {
      if (config.visible !== undefined) {
        visibilitySettings[breakpoint as Breakpoint] = config.visible
      }
    })

    // 检查是否在连续断点中有冲突的可见性设置
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    let lastVisible: boolean | undefined

    breakpoints.forEach(breakpoint => {
      const currentVisible = visibilitySettings[breakpoint]

      if (
        currentVisible !== undefined &&
        lastVisible !== undefined &&
        currentVisible !== lastVisible
      ) {
        conflicts.push({
          type: 'visibility_conflict',
          componentId: component.id,
          breakpoints: [breakpoint],
          message: `组件在 ${breakpoint} 断点的可见性设置与前一断点冲突`,
          severity: 'warning',
          suggestion: '确保可见性设置在断点之间平滑过渡',
        })
      }

      lastVisible = currentVisible
    })

    return conflicts
  }

  // 检查样式冲突
  private checkStyleConflicts(
    component: ComponentInstance,
    responsiveConfig: Record<string, any>
  ): ResponsiveConflict[] {
    const conflicts: ResponsiveConflict[] = []

    // 检查可能导致布局问题的样式冲突
    const applicableBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    let lastWidth: string | undefined

    applicableBreakpoints.forEach(breakpoint => {
      const config = responsiveConfig[breakpoint]
      if (!config || !config.styles) return

      const currentWidth = config.styles.width

      if (currentWidth && lastWidth && currentWidth !== lastWidth) {
        conflicts.push({
          type: 'style_conflict',
          componentId: component.id,
          breakpoints: [breakpoint],
          message: `组件宽度在 ${breakpoint} 断点发生突变`,
          severity: 'warning',
          suggestion: '考虑使用相对单位或百分比来确保平滑过渡',
        })
      }

      lastWidth = currentWidth
    })

    return conflicts
  }

  // 检查布局冲突
  private checkLayoutConflicts(
    component: ComponentInstance,
    responsiveConfig: Record<string, any>
  ): ResponsiveConflict[] {
    const conflicts: ResponsiveConflict[] = []

    // 检查Col组件的栅格冲突
    if (component.component_type === 'col') {
      let totalSpan = 0

      Object.entries(responsiveConfig).forEach(([breakpoint, config]) => {
        if (config.props?.col?.span) {
          const span = config.props.col.span
          if (typeof span === 'number') {
            totalSpan += span

            if (totalSpan > 12) {
              conflicts.push({
                type: 'layout_conflict',
                componentId: component.id,
                breakpoints: [breakpoint as Breakpoint],
                message: `在 ${breakpoint} 断点，栅格总和超过12列`,
                severity: 'error',
                suggestion: '调整span值确保总和不超过12',
              })
            }
          }
        }
      })
    }

    return conflicts
  }

  // 优化响应式配置
  public optimizeResponsiveConfig(component: ComponentInstance): {
    optimized: boolean
    suggestions: string[]
  } {
    const suggestions: string[] = []
    let optimized = false

    const responsiveConfig = component.responsive
    if (!responsiveConfig) {
      return { optimized: false, suggestions }
    }

    // 检查重复的配置
    const duplicateConfigs = this.findDuplicateConfigs(responsiveConfig)
    if (duplicateConfigs.length > 0) {
      suggestions.push(`发现重复的响应式配置，可以合并断点 ${duplicateConfigs.join(', ')}`)
      optimized = true
    }

    // 检查不必要的配置
    const unnecessaryConfigs = this.findUnnecessaryConfigs(responsiveConfig)
    if (unnecessaryConfigs.length > 0) {
      suggestions.push(`断点 ${unnecessaryConfigs.join(', ')} 的配置与默认值相同，可以移除`)
      optimized = true
    }

    // 检查缺失的重要断点
    const missingBreakpoints = this.findMissingImportantBreakpoints(responsiveConfig)
    if (missingBreakpoints.length > 0) {
      suggestions.push(`建议为重要断点 ${missingBreakpoints.join(', ')} 添加配置`)
    }

    return { optimized, suggestions }
  }

  // 查找重复配置
  private findDuplicateConfigs(responsiveConfig: Record<string, any>): Breakpoint[] {
    const configStrings = new Map<string, Breakpoint[]>()
    const duplicates: Breakpoint[] = []

    Object.entries(responsiveConfig).forEach(([breakpoint, config]) => {
      const configString = JSON.stringify(config)

      if (configStrings.has(configString)) {
        configStrings.get(configString)!.push(breakpoint as Breakpoint)
      } else {
        configStrings.set(configString, [breakpoint as Breakpoint])
      }
    })

    configStrings.forEach((breakpoints, configString) => {
      if (breakpoints.length > 1) {
        duplicates.push(...breakpoints.slice(1)) // 保留第一个，其余为重复
      }
    })

    return duplicates
  }

  // 查找不必要的配置
  private findUnnecessaryConfigs(responsiveConfig: Record<string, any>): Breakpoint[] {
    const unnecessary: Breakpoint[] = []

    Object.entries(responsiveConfig).forEach(([breakpoint, config]) => {
      // 检查配置是否与默认值相同
      const defaultConfig = this.getDefaultConfigForBreakpoint(breakpoint as Breakpoint)
      if (JSON.stringify(config) === JSON.stringify(defaultConfig)) {
        unnecessary.push(breakpoint as Breakpoint)
      }
    })

    return unnecessary
  }

  // 获取断点的默认配置
  private getDefaultConfigForBreakpoint(breakpoint: Breakpoint): any {
    // 这里返回每个断点的默认配置
    // 实际实现中可以根据项目需求定义默认值
    return {}
  }

  // 查找缺失的重要断点
  private findMissingImportantBreakpoints(responsiveConfig: Record<string, any>): Breakpoint[] {
    const importantBreakpoints: Breakpoint[] = ['sm', 'md', 'lg'] // 重要的断点
    const existingBreakpoints = Object.keys(responsiveConfig) as Breakpoint[]

    return importantBreakpoints.filter(bp => !existingBreakpoints.includes(bp))
  }

  // 预览响应式效果
  public previewResponsiveEffect(
    component: ComponentInstance,
    targetBreakpoint: Breakpoint
  ): ComponentStyles {
    const mockContext: ResponsiveContext = {
      viewport: {
        width: this.breakpoints[targetBreakpoint].width,
        height: 800,
      },
      breakpoint: targetBreakpoint,
      orientation: 'landscape',
      devicePixelRatio: 1,
    }

    return this.applyResponsiveRules(component, mockContext)
  }
}

// 导出单例实例
export const responsiveEngine = new ResponsiveEngine()

// 导出工具函数
export const getCurrentBreakpoint = (viewportWidth: number): Breakpoint => {
  return responsiveEngine.getCurrentBreakpoint(viewportWidth)
}

export const applyResponsiveStyles = (
  component: ComponentInstance,
  context: ResponsiveContext
): ComponentStyles => {
  return responsiveEngine.applyResponsiveRules(component, context)
}

export const generateResponsiveClasses = (
  component: ComponentInstance,
  context: ResponsiveContext
): string[] => {
  return responsiveEngine.generateResponsiveClasses(component, context)
}
