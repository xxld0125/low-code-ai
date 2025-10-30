/**
 * 响应式布局系统
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 * 任务: T104 - 实现响应式布局系统
 *
 * 提供24栅格系统的响应式布局支持，包括：
 * - 栅格计算和对齐
 * - 响应式栅格配置
 * - 布局约束和验证
 * - 栅格间距管理
 */

import { type Breakpoint, getCurrentBreakpoint } from './breakpoints'
import type { SpacingValue } from '@/types/lowcode/style'
import type { ResponsiveValue } from './utils'

// ============================================================================
// 栅格系统配置
// ============================================================================

/**
 * 栅格系统配置
 */
export interface GridSystemConfig {
  /** 栅格总数 */
  columns: number
  /** 栅格间距 */
  gutter: SpacingValue | ResponsiveValue<SpacingValue>
  /** 容器最大宽度 */
  maxWidth?: number | ResponsiveValue<number>
  /** 容器内边距 */
  padding?: SpacingValue | ResponsiveValue<SpacingValue>
  /** 是否启用响应式 */
  responsive?: boolean
}

/**
 * 栅格列定义
 */
export interface GridColumn {
  /** 栅格占用数量 */
  span: number | ResponsiveValue<number>
  /** 栅格偏移数量 */
  offset?: number | ResponsiveValue<number>
  /** 排序优先级 */
  order?: number | ResponsiveValue<number>
  /** 对齐方式 */
  align?: 'start' | 'center' | 'end' | 'stretch' | ResponsiveValue<string>
  /** 弹性布局 */
  flex?: string | number | ResponsiveValue<string | number>
}

/**
 * 栅格行定义
 */
export interface GridRow {
  /** 栅格间距 */
  gutter?: SpacingValue | ResponsiveValue<SpacingValue>
  /** 对齐方式 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | ResponsiveValue<string>
  /** 垂直对齐 */
  align?: 'start' | 'center' | 'end' | 'stretch' | ResponsiveValue<string>
  /** 是否换行 */
  wrap?: boolean | ResponsiveValue<boolean>
  /** 栅格列 */
  columns: GridColumn[]
}

/**
 * 栅格容器定义
 */
export interface GridContainer {
  /** 容器配置 */
  config: GridSystemConfig
  /** 栅格行 */
  rows: GridRow[]
}

// ============================================================================
// 默认配置
// ============================================================================

/**
 * 默认栅格系统配置
 */
export const DEFAULT_GRID_CONFIG: GridSystemConfig = {
  columns: 24,
  gutter: { x: 16, y: 16 },
  maxWidth: {
    mobile: 100,
    tablet: 100,
    desktop: 1200,
  },
  padding: { x: 16, y: 16 },
  responsive: true,
}

/**
 * 响应式断点的默认栅格配置
 */
export const RESPONSIVE_GRID_CONFIGS: Record<Breakpoint, Partial<GridSystemConfig>> = {
  mobile: {
    gutter: { x: 8, y: 8 },
    padding: { x: 12, y: 12 },
  },
  tablet: {
    gutter: { x: 12, y: 12 },
    padding: { x: 16, y: 16 },
  },
  desktop: {
    gutter: { x: 16, y: 16 },
    padding: { x: 24, y: 24 },
  },
}

// ============================================================================
// 栅格计算工具函数
// ============================================================================

/**
 * 获取当前断点的配置值
 */
export function getResponsiveValue<T>(value: T | ResponsiveValue<T>, breakpoint?: Breakpoint): T {
  const currentBreakpoint = breakpoint || getCurrentBreakpoint()

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const responsiveValue = value as ResponsiveValue<T>

    // 优先使用当前断点的值
    if (responsiveValue[currentBreakpoint] !== undefined) {
      return responsiveValue[currentBreakpoint]!
    }

    // 尝试使用移动端的值作为默认值
    if (responsiveValue.mobile !== undefined) {
      return responsiveValue.mobile
    }
  }

  return value as T
}

/**
 * 计算栅格宽度百分比
 */
export function calculateGridWidth(span: number, totalColumns: number = 24): number {
  return (span / totalColumns) * 100
}

/**
 * 计算栅格偏移百分比
 */
export function calculateGridOffset(offset: number, totalColumns: number = 24): number {
  return (offset / totalColumns) * 100
}

/**
 * 验证栅格值
 */
export function validateGridSpan(span: number, totalColumns: number = 24): boolean {
  return Number.isInteger(span) && span > 0 && span <= totalColumns
}

/**
 * 验证栅格偏移
 */
export function validateGridOffset(offset: number, totalColumns: number = 24): boolean {
  return Number.isInteger(offset) && offset >= 0 && offset < totalColumns
}

/**
 * 计算栅格的CSS样式
 */
export function calculateGridColumnStyles(
  column: GridColumn,
  config: GridSystemConfig,
  breakpoint?: Breakpoint
): React.CSSProperties {
  const span = getResponsiveValue(column.span, breakpoint)
  const offset = getResponsiveValue(column.offset || 0, breakpoint)
  const order = getResponsiveValue(column.order || 0, breakpoint)
  const align = getResponsiveValue(column.align || 'start', breakpoint)
  const flex = getResponsiveValue(column.flex, breakpoint)

  // 验证栅格值
  if (!validateGridSpan(span, config.columns)) {
    console.warn(`Invalid grid span: ${span}, must be between 1 and ${config.columns}`)
  }

  if (!validateGridOffset(offset, config.columns)) {
    console.warn(`Invalid grid offset: ${offset}, must be between 0 and ${config.columns - 1}`)
  }

  const styles: React.CSSProperties = {
    flex: flex || 'none',
    order,
    alignSelf: align,
  }

  // 使用flex-basis来控制宽度
  if (flex === undefined || flex === 'none') {
    const widthPercent = calculateGridWidth(span, config.columns)
    const marginLeftPercent = calculateGridOffset(offset, config.columns)

    styles.flexBasis = `${widthPercent}%`
    styles.maxWidth = `${widthPercent}%`
    styles.marginLeft = marginLeftPercent > 0 ? `${marginLeftPercent}%` : undefined
  }

  return styles
}

/**
 * 计算栅格行的CSS样式
 */
export function calculateGridRowStyles(
  row: GridRow,
  config: GridSystemConfig,
  breakpoint?: Breakpoint
): React.CSSProperties {
  const gutter = getResponsiveValue(config.gutter, breakpoint)
  const justify = getResponsiveValue(row.justify || 'start', breakpoint)
  const align = getResponsiveValue(row.align || 'start', breakpoint)
  const wrap = getResponsiveValue(row.wrap !== undefined ? row.wrap : true, breakpoint)

  const gutterX = typeof gutter === 'object' ? gutter.x : gutter
  const gutterY = typeof gutter === 'object' ? gutter.y : gutter

  // Flex对齐方式映射
  const justifyMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  }

  const alignMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  }

  return {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: wrap ? 'wrap' : 'nowrap',
    justifyContent: justifyMap[justify] || justify,
    alignItems: alignMap[align] || align,
    margin: `-${gutterY}px -${gutterX}px`,
  }
}

/**
 * 计算栅格容器的CSS样式
 */
export function calculateGridContainerStyles(
  config: GridSystemConfig,
  breakpoint?: Breakpoint
): React.CSSProperties {
  const maxWidth = getResponsiveValue(config.maxWidth || 100, breakpoint)
  const padding = getResponsiveValue(config.padding || { x: 0, y: 0 }, breakpoint)

  const paddingX = typeof padding === 'object' ? padding.x : padding
  const paddingY = typeof padding === 'object' ? padding.y : padding

  return {
    width: '100%',
    maxWidth: maxWidth === 100 ? '100%' : `${maxWidth}px`,
    margin: '0 auto',
    padding: `${paddingY}px ${paddingX}px`,
    boxSizing: 'border-box',
  }
}

// ============================================================================
// 栅格系统类
// ============================================================================

/**
 * 响应式栅格系统管理器
 */
export class GridSystemManager {
  private config: GridSystemConfig

  constructor(config: Partial<GridSystemConfig> = {}) {
    this.config = { ...DEFAULT_GRID_CONFIG, ...config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<GridSystemConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 获取当前配置
   */
  getConfig(): GridSystemConfig {
    return { ...this.config }
  }

  /**
   * 获取指定断点的配置
   */
  getConfigForBreakpoint(breakpoint: Breakpoint): GridSystemConfig {
    const breakpointConfig = RESPONSIVE_GRID_CONFIGS[breakpoint] || {}
    return { ...this.config, ...breakpointConfig }
  }

  /**
   * 计算栅格列样式
   */
  calculateColumnStyles(column: GridColumn, breakpoint?: Breakpoint): React.CSSProperties {
    const config = this.getConfigForBreakpoint(breakpoint || getCurrentBreakpoint())
    return calculateGridColumnStyles(column, config, breakpoint)
  }

  /**
   * 计算栅格行样式
   */
  calculateRowStyles(row: GridRow, breakpoint?: Breakpoint): React.CSSProperties {
    const config = this.getConfigForBreakpoint(breakpoint || getCurrentBreakpoint())
    return calculateGridRowStyles(row, config, breakpoint)
  }

  /**
   * 计算栅格容器样式
   */
  calculateContainerStyles(breakpoint?: Breakpoint): React.CSSProperties {
    const config = this.getConfigForBreakpoint(breakpoint || getCurrentBreakpoint())
    return calculateGridContainerStyles(config, breakpoint)
  }

  /**
   * 验证栅格布局
   */
  validateLayout(grid: GridContainer): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 验证每行的栅格总数
    grid.rows.forEach((row, rowIndex) => {
      let totalSpan = 0

      row.columns.forEach((column, colIndex) => {
        const span = getResponsiveValue(column.span)
        const offset = getResponsiveValue(column.offset || 0)

        if (!validateGridSpan(span, grid.config.columns)) {
          errors.push(`Row ${rowIndex + 1}, Column ${colIndex + 1}: Invalid span ${span}`)
        }

        if (!validateGridOffset(offset, grid.config.columns)) {
          errors.push(`Row ${rowIndex + 1}, Column ${colIndex + 1}: Invalid offset ${offset}`)
        }

        totalSpan += span + offset
      })

      // 检查是否超出栅格总数（允许换行时可以超出）
      if (totalSpan > grid.config.columns) {
        const wrap = getResponsiveValue(row.wrap !== undefined ? row.wrap : true)
        if (!wrap) {
          errors.push(
            `Row ${rowIndex + 1}: Total span ${totalSpan} exceeds ${grid.config.columns} columns`
          )
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// ============================================================================
// 实例和工具函数
// ============================================================================

/**
 * 默认栅格系统管理器实例
 */
export const defaultGridSystem = new GridSystemManager()

/**
 * 获取栅格系统管理器实例
 */
export function getGridSystem(config?: Partial<GridSystemConfig>): GridSystemManager {
  return config ? new GridSystemManager(config) : defaultGridSystem
}

/**
 * 快速计算栅格样式的工具函数
 */
export const gridUtils = {
  /**
   * 计算列样式
   */
  column: (column: GridColumn, breakpoint?: Breakpoint) =>
    defaultGridSystem.calculateColumnStyles(column, breakpoint),

  /**
   * 计算行样式
   */
  row: (row: GridRow, breakpoint?: Breakpoint) =>
    defaultGridSystem.calculateRowStyles(row, breakpoint),

  /**
   * 计算容器样式
   */
  container: (breakpoint?: Breakpoint) => defaultGridSystem.calculateContainerStyles(breakpoint),

  /**
   * 验证布局
   */
  validate: (grid: GridContainer) => defaultGridSystem.validateLayout(grid),

  /**
   * 获取响应式值
   */
  responsive: <T>(value: T | ResponsiveValue<T>, breakpoint?: Breakpoint) =>
    getResponsiveValue(value, breakpoint),
}

// ============================================================================
// TypeScript类型导出
// ============================================================================
