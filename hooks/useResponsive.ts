/**
 * 响应式React Hook
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T133 - 实现三个断点的适配逻辑
 * 创建日期: 2025-10-31
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { ResponsiveAdapter, type AdaptationConfig } from '@/lib/lowcode/responsive/adapter'
import { type Breakpoint, BREAKPOINT_ORDER } from '@/lib/lowcode/responsive/breakpoints'

// 响应式Hook返回值
export interface UseResponsiveReturn {
  // 当前断点信息
  currentBreakpoint: Breakpoint
  previousBreakpoint: Breakpoint | null

  // 断点判断方法
  isBreakpoint: (breakpoint: Breakpoint) => boolean
  isBreakpointInRange: (min: Breakpoint, max: Breakpoint) => boolean
  isMobile: () => boolean
  isTablet: () => boolean
  isDesktop: () => boolean

  // 响应式值获取
  getValue: <T>(value: T | Partial<Record<Breakpoint, T>>) => T
  getClasses: (classes: Partial<Record<Breakpoint, string>>) => string

  // 媒体查询
  mediaQuery: (breakpoint: Breakpoint, css: string) => string

  // 适配器实例
  adapter: ResponsiveAdapter
}

/**
 * 响应式Hook
 */
export function useResponsive(config?: Partial<AdaptationConfig>): UseResponsiveReturn {
  const adapterRef = useRef<ResponsiveAdapter | null>(null)
  if (!adapterRef.current) {
    adapterRef.current = new ResponsiveAdapter(config)
  }

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() =>
    adapterRef.current!.getCurrentBreakpoint()
  )
  const [previousBreakpoint, setPreviousBreakpoint] = useState<Breakpoint | null>(() =>
    adapterRef.current!.getPreviousBreakpoint()
  )

  // 监听断点变化
  useEffect(() => {
    if (typeof window === 'undefined') return

    const adapter = adapterRef.current!
    const unsubscribe = adapter.addListener((newBreakpoint, prevBreakpoint) => {
      setCurrentBreakpoint(newBreakpoint)
      setPreviousBreakpoint(prevBreakpoint)
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  // 断点判断方法
  const isBreakpoint = useCallback(
    (breakpoint: Breakpoint) => {
      return currentBreakpoint === breakpoint
    },
    [currentBreakpoint]
  )

  const isBreakpointInRange = useCallback(
    (min: Breakpoint, max: Breakpoint) => {
      const currentIndex = BREAKPOINT_ORDER.indexOf(currentBreakpoint)
      const minIndex = BREAKPOINT_ORDER.indexOf(min)
      const maxIndex = BREAKPOINT_ORDER.indexOf(max)

      return currentIndex >= minIndex && currentIndex <= maxIndex
    },
    [currentBreakpoint]
  )

  const isMobile = useCallback(() => isBreakpoint('mobile'), [isBreakpoint])
  const isTablet = useCallback(() => isBreakpoint('tablet'), [isBreakpoint])
  const isDesktop = useCallback(() => isBreakpoint('desktop'), [isBreakpoint])

  // 响应式值获取
  const getValue = useCallback(<T>(value: T | Partial<Record<Breakpoint, T>>) => {
    return adapterRef.current!.getResponsiveValue(value)
  }, [])

  const getClasses = useCallback((classes: Partial<Record<Breakpoint, string>>) => {
    return adapterRef.current!.getBreakpointClasses(classes)
  }, [])

  // 媒体查询
  const mediaQuery = useCallback((breakpoint: Breakpoint, css: string) => {
    return adapterRef.current!.generateMediaQuery(breakpoint, css)
  }, [])

  return {
    currentBreakpoint,
    previousBreakpoint,
    isBreakpoint,
    isBreakpointInRange,
    isMobile,
    isTablet,
    isDesktop,
    getValue,
    getClasses,
    mediaQuery,
    adapter: adapterRef.current,
  }
}

/**
 * 简化版响应式值Hook
 */
export function useResponsiveValue<T>(
  value: T | Partial<Record<Breakpoint, T>>,
  config?: Partial<AdaptationConfig>
): T {
  const { getValue } = useResponsive(config)
  return getValue(value)
}

/**
 * 响应式类名Hook
 */
export function useResponsiveClasses(
  classes: Partial<Record<Breakpoint, string>>,
  config?: Partial<AdaptationConfig>
): string {
  const { getClasses } = useResponsive(config)
  return getClasses(classes)
}

/**
 * 断点监听Hook
 */
export function useBreakpointListener(
  listener: (breakpoint: Breakpoint, previous: Breakpoint | null) => void,
  config?: Partial<AdaptationConfig>
) {
  const adapterRef = useRef<ResponsiveAdapter | null>(null)

  useEffect(() => {
    adapterRef.current = new ResponsiveAdapter(config)
    const unsubscribe = adapterRef.current.addListener(listener)

    return () => {
      unsubscribe()
      adapterRef.current?.destroy()
    }
  }, [listener, config])
}

/**
 * 容器尺寸监听Hook
 */
export function useContainerSize(elementRef: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [elementRef])

  return dimensions
}

/**
 * 响应式尺寸Hook
 */
export function useResponsiveSize(
  sizes: Partial<Record<Breakpoint, number | string>>,
  containerWidth?: number
): string {
  const { adapter } = useResponsive()

  const calculateSize = useCallback(() => {
    return adapter.calculateResponsiveSize(sizes, containerWidth)
  }, [adapter, sizes, containerWidth])

  const [size, setSize] = useState(() => calculateSize())

  useEffect(() => {
    setSize(calculateSize())
  }, [calculateSize])

  return size
}

/**
 * 媒体查询Hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(query)
    setMatches(mediaQueryList.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQueryList.addEventListener('change', handleChange)
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * 预定义媒体查询Hook
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * 响应式布局Hook
 */
export function useResponsiveLayout() {
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useResponsive()

  const layoutConfig = {
    columns: isMobile() ? 1 : isTablet() ? 2 : 3,
    spacing: isMobile() ? 8 : isTablet() ? 16 : 24,
    containerPadding: isMobile() ? 16 : isTablet() ? 24 : 32,
    cardWidth: isMobile() ? '100%' : isTablet() ? 'calc(50% - 8px)' : 'calc(33.333% - 16px)',
  }

  return {
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    layoutConfig,
  }
}

const responsiveHooks = {
  useResponsive,
  useResponsiveValue,
  useResponsiveClasses,
  useBreakpointListener,
  useContainerSize,
  useResponsiveSize,
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useResponsiveLayout,
}

export default responsiveHooks
