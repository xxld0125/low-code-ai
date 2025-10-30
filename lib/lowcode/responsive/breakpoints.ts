/**
 * 响应式断点系统定义
 * 基于research.md中的简化三级断点系统设计
 *
 * 断点定义:
 * - mobile: 0-767px (移动端)
 * - tablet: 768-1023px (平板端)
 * - desktop: 1024px+ (桌面端)
 *
 * 创建日期: 2025-10-29
 * 功能模块: T009-响应式设计断点和可访问性标准
 */

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export interface BreakpointConfig {
  min: number
  max: number
}

/**
 * 三级断点系统定义
 * 采用简化设计降低学习成本，符合低代码平台定位
 */
export const BREAKPOINTS: Record<Breakpoint, BreakpointConfig> = {
  mobile: { min: 0, max: 767 }, // 移动端：0-767px
  tablet: { min: 768, max: 1023 }, // 平板端：768-1023px
  desktop: { min: 1024, max: Infinity }, // 桌面端：1024px+
}

/**
 * 断点像素值映射
 */
export const BREAKPOINT_VALUES: Record<Breakpoint, number> = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
}

/**
 * 断点媒体查询
 * 用于生成CSS媒体查询字符串
 */
export const MEDIA_QUERIES: Record<Breakpoint, string> = {
  mobile: `(max-width: ${BREAKPOINTS.mobile.max}px)`,
  tablet: `(min-width: ${BREAKPOINTS.tablet.min}px) and (max-width: ${BREAKPOINTS.tablet.max}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop.min}px)`,
}

/**
 * 最小宽度媒体查询
 */
export const MIN_WIDTH_QUERIES: Record<Breakpoint, string> = {
  mobile: '(min-width: 0px)',
  tablet: `(min-width: ${BREAKPOINTS.tablet.min}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop.min}px)`,
}

/**
 * 最大宽度媒体查询
 */
export const MAX_WIDTH_QUERIES: Record<Breakpoint, string> = {
  mobile: `(max-width: ${BREAKPOINTS.mobile.max}px)`,
  tablet: `(max-width: ${BREAKPOINTS.tablet.max}px)`,
  desktop: '(max-width: 999999px)', // 桌面端没有最大限制
}

/**
 * 断点顺序（从小到大）
 */
export const BREAKPOINT_ORDER: Breakpoint[] = ['mobile', 'tablet', 'desktop']

/**
 * 获取指定宽度对应的断点
 * @param width 屏幕宽度（像素）
 * @returns 对应的断点
 */
export function getBreakpointForWidth(width: number): Breakpoint {
  if (width <= BREAKPOINTS.mobile.max) {
    return 'mobile'
  }
  if (width <= BREAKPOINTS.tablet.max) {
    return 'tablet'
  }
  return 'desktop'
}

/**
 * 获取指定断点之后的所有断点
 * @param breakpoint 当前断点
 * @returns 更大断点的数组
 */
export function getNextBreakpoints(breakpoint: Breakpoint): Breakpoint[] {
  const index = BREAKPOINT_ORDER.indexOf(breakpoint)
  return BREAKPOINT_ORDER.slice(index + 1)
}

/**
 * 获取指定断点之前的所有断点
 * @param breakpoint 当前断点
 * @returns 更小断点的数组
 */
export function getPreviousBreakpoints(breakpoint: Breakpoint): Breakpoint[] {
  const index = BREAKPOINT_ORDER.indexOf(breakpoint)
  return BREAKPOINT_ORDER.slice(0, index)
}

/**
 * 获取下一个更大的断点
 * @param breakpoint 当前断点
 * @returns 下一个断点，如果没有则返回null
 */
export function getNextBreakpoint(breakpoint: Breakpoint): Breakpoint | null {
  const index = BREAKPOINT_ORDER.indexOf(breakpoint)
  return index < BREAKPOINT_ORDER.length - 1 ? BREAKPOINT_ORDER[index + 1] : null
}

/**
 * 获取上一个更小的断点
 * @param breakpoint 当前断点
 * @returns 上一个断点，如果没有则返回null
 */
export function getPreviousBreakpoint(breakpoint: Breakpoint): Breakpoint | null {
  const index = BREAKPOINT_ORDER.indexOf(breakpoint)
  return index > 0 ? BREAKPOINT_ORDER[index - 1] : null
}

/**
 * 检查断点是否有效
 * @param breakpoint 断点名称
 * @returns 是否为有效断点
 */
export function isValidBreakpoint(breakpoint: string): breakpoint is Breakpoint {
  return Object.keys(BREAKPOINTS).includes(breakpoint)
}

/**
 * 获取当前屏幕断点
 * 在客户端使用时返回实际断点，在服务端使用时返回默认断点
 * @returns 当前断点
 */
export function getCurrentBreakpoint(): Breakpoint {
  // 检查是否在客户端环境
  if (typeof window !== 'undefined') {
    const width = window.innerWidth
    return getBreakpointForWidth(width)
  }

  // 服务端渲染时返回默认断点（mobile-first）
  return 'mobile'
}
