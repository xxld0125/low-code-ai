import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X, Maximize2, Minimize2 } from 'lucide-react'
import {
  useBreakpoint,
  useMaxBreakpoint,
  useResponsiveSidebar,
  useViewportHeight,
  useSafeAreaInsets,
  type ResponsiveSidebarConfig,
} from '@/lib/designer/responsive'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  rightPanel?: React.ReactNode
  header?: React.ReactNode
  className?: string
  sidebarConfig?: ResponsiveSidebarConfig
}

const DEFAULT_SIDEBAR_CONFIG: ResponsiveSidebarConfig = {
  collapsedWidth: { xs: '0px', sm: '48px', md: '48px', lg: '48px' },
  expandedWidth: { xs: '100%', sm: '280px', md: '320px', lg: '360px' },
  breakpoint: 'md',
  behavior: 'push',
}

export function ResponsiveLayout({
  children,
  sidebar,
  rightPanel,
  header,
  className,
  sidebarConfig = DEFAULT_SIDEBAR_CONFIG,
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const isMobile = useMaxBreakpoint('sm')
  const sidebarBehavior = useResponsiveSidebar(sidebarConfig)
  const viewportHeight = useViewportHeight()
  const safeAreaInsets = useSafeAreaInsets()

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    if (sidebarBehavior.shouldCollapse) {
      setSidebarCollapsed(true)
    } else {
      setSidebarCollapsed(false)
      setSidebarOpen(false) // Close overlay on desktop
    }
  }, [sidebarBehavior.shouldCollapse])

  // Close overlay when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-sidebar]')) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [isMobile, sidebarOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        setRightPanelOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const getSidebarStyles = () => {
    if (isMobile) {
      return {
        width: sidebarOpen ? sidebarBehavior.expandedWidth : '0px',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        position: 'fixed' as const,
        zIndex: 50,
        height: `${viewportHeight}px`,
        paddingTop: `${safeAreaInsets.top}px`,
      }
    }

    return {
      width: sidebarCollapsed ? sidebarBehavior.collapsedWidth : sidebarBehavior.expandedWidth,
      transition: 'width 0.3s ease-in-out',
    }
  }

  const getMainContentStyles = () => {
    if (isMobile) {
      return {}
    }

    const sidebarWidth = sidebarCollapsed ? sidebarBehavior.collapsedWidth : sidebarBehavior.expandedWidth
    return {
      marginLeft: sidebar ? sidebarWidth : undefined,
      transition: 'margin-left 0.3s ease-in-out',
    }
  }

  const getRightPanelStyles = () => {
    if (isMobile) {
      return {
        width: '100%',
        position: 'fixed' as const,
        right: rightPanelOpen ? '0' : '-100%',
        top: `${safeAreaInsets.top}px`,
        height: `${viewportHeight - safeAreaInsets.top}px`,
        zIndex: 50,
        transition: 'right 0.3s ease-in-out',
      }
    }

    return {
      width: rightPanelOpen ? '384px' : '0px',
      transition: 'width 0.3s ease-in-out',
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const toggleRightPanel = () => {
    if (isMobile) {
      setRightPanelOpen(!rightPanelOpen)
    }
  }

  return (
    <div
      className={cn(
        'flex h-screen bg-background overflow-hidden',
        isMobile && 'relative',
        className
      )}
      style={{
        paddingTop: `${safeAreaInsets.top}px`,
        paddingBottom: `${safeAreaInsets.bottom}px`,
      }}
    >
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {isMobile && rightPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setRightPanelOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebar && (
        <aside
          data-sidebar
          className={cn(
            'bg-card border-r border-border flex flex-col',
            isMobile ? 'fixed left-0 top-0' : 'relative',
            'transition-all duration-300 ease-in-out'
          )}
          style={getSidebarStyles()}
        >
          {/* Mobile close button */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold">Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Desktop collapse button */}
          {!isMobile && (
            <div className="flex items-center justify-end p-2 border-b border-border">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                {sidebarCollapsed ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          <div className={cn(
            'flex-1 overflow-hidden',
            isMobile ? 'overflow-y-auto' : '',
            !isMobile && !sidebarCollapsed && 'px-2'
          )}>
            {sidebar}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main
        className="flex flex-col min-w-0 flex-1"
        style={getMainContentStyles()}
      >
        {/* Header */}
        {header && (
          <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
            {/* Mobile menu button */}
            {isMobile && sidebar && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-muted mr-2"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}

            <div className="flex-1">
              {header}
            </div>

            {/* Mobile right panel toggle */}
            {isMobile && rightPanel && (
              <button
                onClick={toggleRightPanel}
                className="p-2 rounded-md hover:bg-muted ml-2"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
          </header>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Children content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>

          {/* Right Panel */}
          {rightPanel && (
            <aside
              className={cn(
                'bg-card border-l border-border flex flex-col',
                isMobile ? 'fixed' : 'relative',
                'transition-all duration-300 ease-in-out'
              )}
              style={getRightPanelStyles()}
            >
              {/* Mobile close button */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <span className="font-semibold">Properties</span>
                  <button
                    onClick={() => setRightPanelOpen(false)}
                    className="p-2 rounded-md hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Desktop close button on mobile layout */}
              {!isMobile && (
                <div className="flex items-center justify-end p-2 border-b border-border">
                  <button
                    onClick={toggleRightPanel}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className={cn(
                'flex-1 overflow-hidden',
                isMobile ? 'overflow-y-auto' : '',
                !isMobile && 'px-2'
              )}>
                {rightPanel}
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}

/**
 * Responsive grid component
 */
interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: string
  minItemWidth?: string
  className?: string
}

export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = '1rem',
  minItemWidth = '200px',
  className,
}: ResponsiveGridProps) {
  const breakpoint = useBreakpoint()

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns[breakpoint] || columns.lg || 3}, minmax(${minItemWidth}, 1fr))`,
    gap,
  }

  return (
    <div className={cn('w-full', className)} style={gridStyle}>
      {children}
    </div>
  )
}

/**
 * Responsive container component
 */
interface ResponsiveContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function ResponsiveContainer({
  children,
  size = 'lg',
  className,
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  )
}