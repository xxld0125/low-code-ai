/**
 * 响应式断点配置
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

export interface Breakpoint {
  id: string
  label: string
  width: string
  minWidth?: number
}

export const BREAKPOINTS: Record<string, Breakpoint> = {
  mobile: {
    id: 'mobile',
    label: '移动端',
    width: '375px',
    minWidth: 0,
  },
  tablet: {
    id: 'tablet',
    label: '平板',
    width: '768px',
    minWidth: 768,
  },
  desktop: {
    id: 'desktop',
    label: '桌面端',
    width: '1024px',
    minWidth: 1024,
  },
  large: {
    id: 'large',
    label: '大屏',
    width: '1440px',
    minWidth: 1440,
  },
} as const

export const BREAKPOINT_ARRAY = Object.values(BREAKPOINTS)

export const DEFAULT_BREAKPOINT = BREAKPOINTS.desktop

export type BreakpointId = keyof typeof BREAKPOINTS

export const getBreakpointById = (id: string): Breakpoint | undefined => {
  return BREAKPOINT_ARRAY.find(bp => bp.id === id)
}

export const getBreakpointByWidth = (width: number): Breakpoint => {
  // 从大到小排序，找到第一个符合条件的断点
  const sortedBreakpoints = [...BREAKPOINT_ARRAY].sort((a, b) => b.minWidth! - a.minWidth!)
  return sortedBreakpoints.find(bp => width >= (bp.minWidth || 0)) || DEFAULT_BREAKPOINT
}
