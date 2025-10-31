/**
 * 响应式栅格系统
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T132-T135 - 完善响应式布局系统
 * 创建日期: 2025-10-31
 */

import { Breakpoint, getCurrentBreakpoint } from '../responsive/breakpoints'
import type { SpacingValue } from '@/types/lowcode/style'

// 重新导出类型
export type { Breakpoint }

// 响应式值类型
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

// 栅格系统配置
export interface GridSystemConfig {
  // 栅格列数（24列栅格系统）
  columns: number
  // 栅格间距
  gutter: SpacingValue
  // 边距
  margin: SpacingValue
  // 容器最大宽度
  maxWidth?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

// 默认栅格配置
export const DEFAULT_GRID_CONFIG: GridSystemConfig = {
  columns: 24,
  gutter: { x: 16, y: 16 },
  margin: { x: 16, y: 16 },
  maxWidth: {
    mobile: 576,
    tablet: 768,
    desktop: 1200,
  },
}

// 响应式栅格属性类型
export interface ResponsiveGridProps {
  // 栅格占位（1-24列）
  span?: number | Partial<Record<Breakpoint, number>>
  // 栅格偏移（0-23列）
  offset?: number | Partial<Record<Breakpoint, number>>
  // 栅格排序
  order?: number | Partial<Record<Breakpoint, number>>
  // 栅格显示/隐藏
  hidden?: boolean | Partial<Record<Breakpoint, boolean>>
  // Flex相关属性
  flex?: string | number | Partial<Record<Breakpoint, string | number>>
  flexGrow?: number | Partial<Record<Breakpoint, number>>
  flexShrink?: number | Partial<Record<Breakpoint, number>>
  flexBasis?: string | number | Partial<Record<Breakpoint, string | number>>
  // 对齐方式
  alignSelf?:
    | 'auto'
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'baseline'
    | Partial<Record<Breakpoint, string>>
}

// 响应式行属性类型
export interface ResponsiveRowProps {
  // 栅格间距
  gutter?: SpacingValue | Partial<Record<Breakpoint, SpacingValue>>
  // 栅格对齐
  justify?:
    | 'start'
    | 'end'
    | 'center'
    | 'between'
    | 'around'
    | 'evenly'
    | Partial<Record<Breakpoint, string>>
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline' | Partial<Record<Breakpoint, string>>
  // 是否换行
  wrap?: boolean | Partial<Record<Breakpoint, boolean>>
  // 行方向
  direction?:
    | 'row'
    | 'row-reverse'
    | 'column'
    | 'column-reverse'
    | Partial<Record<Breakpoint, string>>
}

// 栅格系统工具类
export class GridSystemUtils {
  /**
   * 获取响应式值
   */
  static getResponsiveValue<T>(
    value: T | Partial<Record<Breakpoint, T>>,
    breakpoint: Breakpoint = getCurrentBreakpoint()
  ): T {
    if (typeof value === 'object' && value !== null) {
      const responsiveValue = value as Partial<Record<Breakpoint, T>>

      // 如果有精确匹配的值
      if (responsiveValue[breakpoint] !== undefined) {
        return responsiveValue[breakpoint]!
      }

      // 如果没有，尝试从小断点查找
      const breakpoints: Breakpoint[] = ['mobile', 'tablet', 'desktop']
      const currentIndex = breakpoints.indexOf(breakpoint)

      for (let i = currentIndex; i >= 0; i--) {
        const bp = breakpoints[i]
        if (responsiveValue[bp] !== undefined) {
          return responsiveValue[bp]!
        }
      }
    }

    return value as T
  }

  /**
   * 生成栅格列类名
   */
  static generateSpanClasses(span: number | Partial<Record<Breakpoint, number>>): string {
    const classes: string[] = []

    if (typeof span === 'number') {
      // 基础类名
      classes.push(`col-span-${span}`)
    } else {
      // 响应式类名
      Object.entries(span).forEach(([breakpoint, value]) => {
        if (breakpoint === 'mobile') {
          classes.push(`col-span-${value}`)
        } else {
          classes.push(`${breakpoint}:col-span-${value}`)
        }
      })
    }

    return classes.join(' ')
  }

  /**
   * 生成栅格偏移类名
   */
  static generateOffsetClasses(offset: number | Partial<Record<Breakpoint, number>>): string {
    const classes: string[] = []

    if (typeof offset === 'number') {
      classes.push(`col-start-${offset + 1}`)
    } else {
      Object.entries(offset).forEach(([breakpoint, value]) => {
        if (breakpoint === 'mobile') {
          classes.push(`col-start-${value + 1}`)
        } else {
          classes.push(`${breakpoint}:col-start-${value + 1}`)
        }
      })
    }

    return classes.join(' ')
  }

  /**
   * 生成排序类名
   */
  static generateOrderClasses(order: number | Partial<Record<Breakpoint, number>>): string {
    const classes: string[] = []

    if (typeof order === 'number') {
      classes.push(`order-${order}`)
    } else {
      Object.entries(order).forEach(([breakpoint, value]) => {
        if (breakpoint === 'mobile') {
          classes.push(`order-${value}`)
        } else {
          classes.push(`${breakpoint}:order-${value}`)
        }
      })
    }

    return classes.join(' ')
  }

  /**
   * 生成隐藏类名
   */
  static generateHiddenClasses(hidden: boolean | Partial<Record<Breakpoint, boolean>>): string {
    const classes: string[] = []

    if (typeof hidden === 'boolean') {
      if (hidden) {
        classes.push('hidden')
      }
    } else {
      Object.entries(hidden).forEach(([breakpoint, value]) => {
        if (value) {
          if (breakpoint === 'mobile') {
            classes.push('hidden')
          } else {
            classes.push(`${breakpoint}:hidden`)
          }
        }
      })
    }

    return classes.join(' ')
  }

  /**
   * 生成Flex相关类名
   */
  static generateFlexClasses(props: {
    flex?: string | number | Partial<Record<Breakpoint, string | number>>
    flexGrow?: number | Partial<Record<Breakpoint, number>>
    flexShrink?: number | Partial<Record<Breakpoint, number>>
    flexBasis?: string | number | Partial<Record<Breakpoint, string | number>>
  }): string {
    const classes: string[] = []

    // flex属性
    if (props.flex !== undefined) {
      if (typeof props.flex === 'string' || typeof props.flex === 'number') {
        classes.push(`flex-[${props.flex}]`)
      } else {
        Object.entries(props.flex).forEach(([breakpoint, value]) => {
          if (breakpoint === 'mobile') {
            classes.push(`flex-[${value}]`)
          } else {
            classes.push(`${breakpoint}:flex-[${value}]`)
          }
        })
      }
    }

    // flex-grow
    if (props.flexGrow !== undefined) {
      if (typeof props.flexGrow === 'number') {
        classes.push(`grow-${props.flexGrow}`)
      } else {
        Object.entries(props.flexGrow).forEach(([breakpoint, value]) => {
          if (breakpoint === 'mobile') {
            classes.push(`grow-${value}`)
          } else {
            classes.push(`${breakpoint}:grow-${value}`)
          }
        })
      }
    }

    // flex-shrink
    if (props.flexShrink !== undefined) {
      if (typeof props.flexShrink === 'number') {
        classes.push(`shrink-${props.flexShrink}`)
      } else {
        Object.entries(props.flexShrink).forEach(([breakpoint, value]) => {
          if (breakpoint === 'mobile') {
            classes.push(`shrink-${value}`)
          } else {
            classes.push(`${breakpoint}:shrink-${value}`)
          }
        })
      }
    }

    // flex-basis
    if (props.flexBasis !== undefined) {
      if (typeof props.flexBasis === 'string' || typeof props.flexBasis === 'number') {
        classes.push(`basis-[${props.flexBasis}]`)
      } else {
        Object.entries(props.flexBasis).forEach(([breakpoint, value]) => {
          if (breakpoint === 'mobile') {
            classes.push(`basis-[${value}]`)
          } else {
            classes.push(`${breakpoint}:basis-[${value}]`)
          }
        })
      }
    }

    return classes.join(' ')
  }

  /**
   * 生成对齐方式类名
   */
  static generateAlignSelfClasses(alignSelf: ResponsiveGridProps['alignSelf']): string {
    const classes: string[] = []

    if (typeof alignSelf === 'string') {
      const alignMap: Record<string, string> = {
        auto: 'self-auto',
        start: 'self-start',
        end: 'self-end',
        center: 'self-center',
        stretch: 'self-stretch',
        baseline: 'self-baseline',
      }
      classes.push(alignMap[alignSelf] || 'self-auto')
    } else if (alignSelf && typeof alignSelf === 'object') {
      Object.entries(alignSelf).forEach(([breakpoint, value]) => {
        const alignMap: Record<string, string> = {
          auto: 'self-auto',
          start: 'self-start',
          end: 'self-end',
          center: 'self-center',
          stretch: 'self-stretch',
          baseline: 'self-baseline',
        }
        const className = alignMap[value as string] || 'self-auto'

        if (breakpoint === 'mobile') {
          classes.push(className)
        } else {
          classes.push(`${breakpoint}:${className}`)
        }
      })
    }

    return classes.join(' ')
  }

  /**
   * 生成行容器类名
   */
  static generateRowClasses(props: ResponsiveRowProps): string {
    const classes: string[] = ['grid'] // 基础grid类

    // 间距处理
    if (props.gutter !== undefined) {
      if (typeof props.gutter === 'object' && !Array.isArray(props.gutter)) {
        const gutterObj = props.gutter as Record<string, string | number | undefined>

        // 水平间距
        if (gutterObj.x !== undefined) {
          if (typeof gutterObj.x === 'number') {
            classes.push(`-mx-${gutterObj.x / 4}`)
          } else {
            classes.push(`-mx-[${gutterObj.x}]`)
          }
        }

        // 垂直间距
        if (gutterObj.y !== undefined) {
          if (typeof gutterObj.y === 'number') {
            classes.push(`-my-${gutterObj.y / 4}`)
          } else {
            classes.push(`-my-[${gutterObj.y}]`)
          }
        }
      }
    }

    // 对齐方式
    if (props.justify !== undefined) {
      if (typeof props.justify === 'string') {
        const justifyMap: Record<string, string> = {
          start: 'justify-start',
          end: 'justify-end',
          center: 'justify-center',
          between: 'justify-between',
          around: 'justify-around',
          evenly: 'justify-evenly',
        }
        classes.push(justifyMap[props.justify] || 'justify-start')
      }
    }

    if (props.align !== undefined) {
      if (typeof props.align === 'string') {
        const alignMap: Record<string, string> = {
          start: 'items-start',
          end: 'items-end',
          center: 'items-center',
          stretch: 'items-stretch',
          baseline: 'items-baseline',
        }
        classes.push(alignMap[props.align] || 'items-start')
      }
    }

    // 方向
    if (props.direction !== undefined) {
      if (typeof props.direction === 'string') {
        classes.push(`flex-${props.direction}`)
      }
    }

    // 换行
    if (props.wrap !== undefined) {
      if (typeof props.wrap === 'boolean') {
        classes.push(props.wrap ? 'flex-wrap' : 'flex-nowrap')
      }
    }

    return classes.join(' ')
  }

  /**
   * 计算列的实际宽度百分比
   */
  static calculateColumnWidth(
    span: number,
    totalColumns: number = DEFAULT_GRID_CONFIG.columns
  ): string {
    return `${(span / totalColumns) * 100}%`
  }

  /**
   * 生成响应式CSS样式
   */
  static generateResponsiveCSS(
    props: ResponsiveGridProps,
    breakpoint?: Breakpoint
  ): React.CSSProperties {
    const currentBreakpoint = breakpoint || getCurrentBreakpoint()
    const styles: React.CSSProperties = {}

    // 获取当前断点的值
    const span = this.getResponsiveValue(props.span || 12, currentBreakpoint)
    const offset = this.getResponsiveValue(props.offset || 0, currentBreakpoint)

    // 如果有offset，设置grid-column-start
    if (offset > 0) {
      styles.gridColumnStart = offset + 1
    }

    // 设置grid-column-end
    styles.gridColumnEnd = `span ${span}`

    return styles
  }

  /**
   * 验证栅格属性
   */
  static validateGridProps(props: ResponsiveGridProps): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 验证span
    if (props.span !== undefined) {
      if (typeof props.span === 'number') {
        if (props.span < 1 || props.span > DEFAULT_GRID_CONFIG.columns) {
          errors.push(`span值必须在1-${DEFAULT_GRID_CONFIG.columns}之间`)
        }
      } else {
        Object.entries(props.span).forEach(([breakpoint, value]) => {
          if (value < 1 || value > DEFAULT_GRID_CONFIG.columns) {
            errors.push(`${breakpoint}断点的span值必须在1-${DEFAULT_GRID_CONFIG.columns}之间`)
          }
        })
      }
    }

    // 验证offset
    if (props.offset !== undefined) {
      if (typeof props.offset === 'number') {
        if (props.offset < 0 || props.offset >= DEFAULT_GRID_CONFIG.columns) {
          errors.push(`offset值必须在0-${DEFAULT_GRID_CONFIG.columns - 1}之间`)
        }
      } else {
        Object.entries(props.offset).forEach(([breakpoint, value]) => {
          if (value < 0 || value >= DEFAULT_GRID_CONFIG.columns) {
            errors.push(`${breakpoint}断点的offset值必须在0-${DEFAULT_GRID_CONFIG.columns - 1}之间`)
          }
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// 预设的栅格配置
export const GRID_PRESETS = {
  // 均等分栏
  equal2: { span: 12 }, // 2列均分
  equal3: { span: 8 }, // 3列均分
  equal4: { span: 6 }, // 4列均分
  equal6: { span: 4 }, // 6列均分

  // 常见比例
  mainSidebar: { span: { mobile: 24, tablet: 18, desktop: 18 } }, // 主内容+侧边栏
  sidebarMain: { span: { mobile: 24, tablet: 6, desktop: 6 } }, // 侧边栏+主内容

  // 响应式布局
  mobile1Tablet2Desktop3: {
    span: { mobile: 24, tablet: 12, desktop: 8 },
  },

  // 自适应布局
  auto: { flex: 1 },
} as const

// Flex align-self classes
export const FLEX_ALIGN_SELF_CLASSES = {
  auto: 'items-auto',
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

export default GridSystemUtils
