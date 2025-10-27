import { useEffect, useState } from 'react'

/**
 * Breakpoint definitions
 */
export const BREAKPOINTS = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Responsive utility hooks
 */

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth

      if (width >= 1536) setBreakpoint('2xl')
      else if (width >= 1280) setBreakpoint('xl')
      else if (width >= 1024) setBreakpoint('lg')
      else if (width >= 768) setBreakpoint('md')
      else if (width >= 640) setBreakpoint('sm')
      else setBreakpoint('xs')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

/**
 * Hook to check if screen is at least a certain breakpoint
 */
export function useMinBreakpoint(minBreakpoint: Breakpoint): boolean {
  const current = useBreakpoint()
  const breakpointOrder = Object.keys(BREAKPOINTS) as Breakpoint[]
  const currentIndex = breakpointOrder.indexOf(current)
  const minIndex = breakpointOrder.indexOf(minBreakpoint)

  return currentIndex >= minIndex
}

/**
 * Hook to check if screen is at most a certain breakpoint
 */
export function useMaxBreakpoint(maxBreakpoint: Breakpoint): boolean {
  const current = useBreakpoint()
  const breakpointOrder = Object.keys(BREAKPOINTS) as Breakpoint[]
  const currentIndex = breakpointOrder.indexOf(current)
  const maxIndex = breakpointOrder.indexOf(maxBreakpoint)

  return currentIndex <= maxIndex
}

/**
 * Hook to check if screen is between two breakpoints
 */
export function useBreakpointRange(minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean {
  const current = useBreakpoint()
  const breakpointOrder = Object.keys(BREAKPOINTS) as Breakpoint[]
  const currentIndex = breakpointOrder.indexOf(current)
  const minIndex = breakpointOrder.indexOf(minBreakpoint)
  const maxIndex = breakpointOrder.indexOf(maxBreakpoint)

  return currentIndex >= minIndex && currentIndex <= maxIndex
}

/**
 * Hook to get screen size information
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: 1024,
    height: 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      })
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)

    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}

/**
 * Responsive value type
 */
export type ResponsiveValue<T> =
  | {
      xs?: T
      sm?: T
      md?: T
      lg?: T
      xl?: T
      '2xl'?: T
    }
  | T

/**
 * Get responsive value based on current breakpoint
 */
export function getResponsiveValue<T>(value: ResponsiveValue<T>, currentBreakpoint: Breakpoint): T {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const responsive = value as Record<Breakpoint, T | undefined>
    const breakpointOrder = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[]

    // Find the first matching breakpoint starting from the current one
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i]
      if (responsive[bp] !== undefined) {
        return responsive[bp]!
      }
    }

    // Fallback to lg if nothing found
    return (
      responsive.lg ?? responsive.md ?? responsive.sm ?? responsive.xs ?? (responsive['2xl'] as T)
    )
  }

  return value
}

/**
 * Hook to get responsive value
 */
export function useResponsiveValue<T>(value: ResponsiveValue<T>): T {
  const breakpoint = useBreakpoint()
  return getResponsiveValue(value, breakpoint)
}

/**
 * Responsive grid configuration
 */
export interface ResponsiveGridConfig {
  columns: ResponsiveValue<number>
  gap: ResponsiveValue<string>
  minItemWidth?: ResponsiveValue<string>
}

/**
 * Get responsive grid styles
 */
export function getResponsiveGridStyles(config: ResponsiveGridConfig, breakpoint: Breakpoint) {
  const columns = getResponsiveValue(config.columns, breakpoint)
  const gap = getResponsiveValue(config.gap, breakpoint)
  const minItemWidth = getResponsiveValue(config.minItemWidth || '200px', breakpoint)

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(${minItemWidth}, 1fr))`,
    gap,
  }
}

/**
 * Hook to get responsive grid styles
 */
export function useResponsiveGrid(config: ResponsiveGridConfig) {
  const breakpoint = useBreakpoint()
  return getResponsiveGridStyles(config, breakpoint)
}

/**
 * Touch device detection
 */
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setIsTouchDevice(hasTouch)
    }

    checkTouchDevice()

    // Listen for changes in touch capability
    window.addEventListener('touchstart', checkTouchDevice, { passive: true })

    return () => {
      window.removeEventListener('touchstart', checkTouchDevice)
    }
  }, [])

  return isTouchDevice
}

/**
 * Orientation detection
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape')

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)

    return () => window.removeEventListener('resize', updateOrientation)
  }, [])

  return orientation
}

/**
 * Viewport height utility (for mobile browsers)
 */
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight)

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight)
    }

    updateViewportHeight()
    window.addEventListener('resize', updateViewportHeight)
    window.addEventListener('orientationchange', updateViewportHeight)

    return () => {
      window.removeEventListener('resize', updateViewportHeight)
      window.removeEventListener('orientationchange', updateViewportHeight)
    }
  }, [])

  return viewportHeight
}

/**
 * Responsive sidebar configuration
 */
export interface ResponsiveSidebarConfig {
  collapsedWidth: ResponsiveValue<string>
  expandedWidth: ResponsiveValue<string>
  breakpoint: Breakpoint
  behavior: 'overlay' | 'push' | 'replace'
}

/**
 * Get responsive sidebar behavior
 */
export function getResponsiveSidebarBehavior(
  config: ResponsiveSidebarConfig,
  currentBreakpoint: Breakpoint,
  screenSize: { width: number; height: number }
) {
  const breakpointOrder = Object.keys(BREAKPOINTS) as Breakpoint[]
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
  const configIndex = breakpointOrder.indexOf(config.breakpoint)

  const shouldCollapse = currentIndex < configIndex
  const isMobile = screenSize.width < 768

  return {
    shouldCollapse,
    collapsedWidth: getResponsiveValue(config.collapsedWidth, currentBreakpoint),
    expandedWidth: getResponsiveValue(config.expandedWidth, currentBreakpoint),
    behavior: isMobile ? 'overlay' : config.behavior,
    isMobile,
  }
}

/**
 * Hook to get responsive sidebar behavior
 */
export function useResponsiveSidebar(config: ResponsiveSidebarConfig) {
  const breakpoint = useBreakpoint()
  const screenSize = useScreenSize()

  return getResponsiveSidebarBehavior(config, breakpoint, screenSize)
}

/**
 * Safe area insets for mobile devices
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      setInsets({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
      })
    }

    updateInsets()

    // Update on resize and orientation change
    window.addEventListener('resize', updateInsets)
    window.addEventListener('orientationchange', updateInsets)

    return () => {
      window.removeEventListener('resize', updateInsets)
      window.removeEventListener('orientationchange', updateInsets)
    }
  }, [])

  return insets
}

/**
 * Responsive typography scale
 */
export interface TypographyScale {
  fontSize: ResponsiveValue<string>
  lineHeight: ResponsiveValue<number>
  letterSpacing?: ResponsiveValue<string>
}

export const TYPOGRAPHY_SCALES: Record<string, TypographyScale> = {
  h1: {
    fontSize: { xs: '1.875rem', sm: '2.25rem', md: '2.5rem', lg: '3rem' },
    lineHeight: { xs: 1.2, sm: 1.2, md: 1.2, lg: 1.1 },
  },
  h2: {
    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
    lineHeight: { xs: 1.3, sm: 1.3, md: 1.25, lg: 1.2 },
  },
  h3: {
    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '1.875rem' },
    lineHeight: { xs: 1.4, sm: 1.4, md: 1.3, lg: 1.3 },
  },
  body: {
    fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem', lg: '1rem' },
    lineHeight: { xs: 1.6, sm: 1.6, md: 1.5, lg: 1.5 },
  },
  small: {
    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem', lg: '0.875rem' },
    lineHeight: { xs: 1.5, sm: 1.5, md: 1.4, lg: 1.4 },
  },
}

/**
 * Get responsive typography styles
 */
export function getResponsiveTypography(scale: TypographyScale, breakpoint: Breakpoint) {
  return {
    fontSize: getResponsiveValue(scale.fontSize, breakpoint),
    lineHeight: getResponsiveValue(scale.lineHeight, breakpoint),
    letterSpacing: scale.letterSpacing
      ? getResponsiveValue(scale.letterSpacing, breakpoint)
      : undefined,
  }
}

/**
 * Hook to get responsive typography styles
 */
export function useResponsiveTypography(scale: TypographyScale) {
  const breakpoint = useBreakpoint()
  return getResponsiveTypography(scale, breakpoint)
}
