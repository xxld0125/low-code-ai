/**
 * 页面设计器懒加载组件加载器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 实现组件懒加载和代码分割，优化初始加载性能
 */

import React, { Suspense, lazy, useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ComponentInstance } from '@/types/page-designer/component'

// 加载状态组件
const LoadingFallback: React.FC<{
  componentType: string
  className?: string
}> = ({ componentType, className }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn(
      'flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4',
      'min-h-[60px] min-w-[120px]',
      className
    )}
  >
    <div className="flex flex-col items-center space-y-2">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      <span className="text-xs text-gray-500">加载 {componentType} 中...</span>
    </div>
  </motion.div>
)

// 错误状态组件
const ErrorFallback: React.FC<{
  componentType: string
  error?: Error
  retry?: () => void
  className?: string
}> = ({ componentType, error, retry, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={cn(
      'flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4',
      'min-h-[60px] min-w-[120px]',
      className
    )}
  >
    <div className="flex flex-col items-center space-y-2">
      <div className="text-red-500">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-xs text-red-600">加载 {componentType} 失败</span>
      {error && (
        <span className="max-w-[200px] text-center text-xs text-red-500">{error.message}</span>
      )}
      {retry && (
        <button onClick={retry} className="text-xs text-red-600 underline hover:text-red-700">
          重试
        </button>
      )}
    </div>
  </motion.div>
)

// 基础组件懒加载映射
const BASIC_COMPONENTS = {
  button: lazy(() =>
    import('@/components/lowcode/page-basic/PageButton').then(m => ({ default: m.PageButton }))
  ),
  input: lazy(() =>
    import('@/components/lowcode/page-basic/PageInput').then(m => ({ default: m.PageInput }))
  ),
  text: lazy(() =>
    import('@/components/lowcode/page-basic/PageText').then(m => ({ default: m.PageText }))
  ),
  image: lazy(() =>
    import('@/components/lowcode/page-basic/PageImage').then(m => ({ default: m.PageImage }))
  ),
  // link: lazy(() => import('@/components/lowcode/page-basic/PageLink')),
  // heading: lazy(() => import('@/components/lowcode/page-basic/PageHeading')),
  // paragraph: lazy(() => import('@/components/lowcode/page-basic/PageParagraph')),
  // divider: lazy(() => import('@/components/lowcode/page-basic/PageDivider')),
  // spacer: lazy(() => import('@/components/lowcode/page-basic/PageSpacer')),
}

// 布局组件懒加载映射
const LAYOUT_COMPONENTS = {
  container: lazy(() =>
    import('@/components/lowcode/page-layout/Container').then(m => ({ default: m.PageContainer }))
  ),
  row: lazy(() =>
    import('@/components/lowcode/page-layout/Row').then(m => ({ default: m.PageRow }))
  ),
  col: lazy(() =>
    import('@/components/lowcode/page-layout/Col').then(m => ({ default: m.PageCol }))
  ),
}

// 表单组件懒加载映射（暂时注释，等组件创建后再启用）
// const FORM_COMPONENTS = {
//   form: lazy(() => import('@/components/lowcode/page-form/Form')),
//   textarea: lazy(() => import('@/components/lowcode/page-form/Textarea')),
//   select: lazy(() => import('@/components/lowcode/page-form/Select')),
//   checkbox: lazy(() => import('@/components/lowcode/page-form/Checkbox')),
//   radio: lazy(() => import('@/components/lowcode/page-form/Radio')),
// }

// 导航组件懒加载映射（暂时注释，等组件创建后再启用）
// const NAVIGATION_COMPONENTS = {
//   navbar: lazy(() => import('@/components/lowcode/page-navigation/Navbar')),
//   sidebar: lazy(() => import('@/components/lowcode/page-navigation/Sidebar')),
//   breadcrumb: lazy(() => import('@/components/lowcode/page-navigation/Breadcrumb')),
//   tabs: lazy(() => import('@/components/lowcode/page-navigation/Tabs')),
// }

// 列表组件懒加载映射（暂时注释，等组件创建后再启用）
// const LIST_COMPONENTS = {
//   list: lazy(() => import('@/components/lowcode/page-list/List')),
//   table: lazy(() => import('@/components/lowcode/page-list/Table')),
//   card: lazy(() => import('@/components/lowcode/page-list/Card')),
//   grid: lazy(() => import('@/components/lowcode/page-list/Grid')),
// }

// 所有组件映射
const COMPONENT_MAPS = {
  basic: BASIC_COMPONENTS,
  layout: LAYOUT_COMPONENTS,
  // form: FORM_COMPONENTS,
  // navigation: NAVIGATION_COMPONENTS,
  // list: LIST_COMPONENTS,
}

// 组件类型到分类的映射
const COMPONENT_CATEGORY_MAP: Record<string, keyof typeof COMPONENT_MAPS> = {
  button: 'basic',
  input: 'basic',
  text: 'basic',
  image: 'basic',
  // link: 'basic',
  // heading: 'basic',
  // paragraph: 'basic',
  // divider: 'basic',
  // spacer: 'basic',
  container: 'layout',
  row: 'layout',
  col: 'layout',
  // form: 'form',
  // textarea: 'form',
  // select: 'form',
  // checkbox: 'form',
  // radio: 'form',
  // navbar: 'navigation',
  // sidebar: 'navigation',
  // breadcrumb: 'navigation',
  // tabs: 'navigation',
  // list: 'list',
  // table: 'list',
  // card: 'list',
  // grid: 'list',
}

// 预加载组件缓存
const preloadCache = new Map<string, Promise<any>>()

/**
 * 预加载组件
 */
export const preloadComponent = async (componentType: string): Promise<void> => {
  if (preloadCache.has(componentType)) {
    return preloadCache.get(componentType)
  }

  const category = COMPONENT_CATEGORY_MAP[componentType]
  if (!category) {
    throw new Error(`Unknown component type: ${componentType}`)
  }

  const componentMap = COMPONENT_MAPS[category]
  const componentLoader = componentMap[componentType as keyof typeof componentMap]

  if (!componentLoader) {
    throw new Error(`Component loader not found: ${componentType}`)
  }

  const preloadPromise = (componentLoader as any)()
  preloadCache.set(componentType, preloadPromise)

  try {
    await preloadPromise
  } catch (error) {
    preloadCache.delete(componentType)
    throw error
  }
}

/**
 * 批量预加载组件
 */
export const preloadComponents = async (componentTypes: string[]): Promise<void> => {
  const promises = componentTypes.map(type => preloadComponent(type))
  await Promise.allSettled(promises)
}

/**
 * 懒加载组件包装器
 */
interface LazyComponentWrapperProps {
  component: ComponentInstance
  className?: string
  isSelected?: boolean
  onSelect?: (id: string) => void
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  enablePreload?: boolean
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  component,
  className,
  isSelected,
  onSelect,
  fallback,
  errorFallback,
  enablePreload = true,
}) => {
  const [retryKey, setRetryKey] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  // 重试加载
  const handleRetry = () => {
    setRetryKey(prev => prev + 1)
    setHasError(false)
    setError(undefined)
  }

  // 错误边界处理
  const handleError = useCallback(
    (error: Error) => {
      setHasError(true)
      setError(error)
      console.error(`Failed to load component ${component.component_type}:`, error)
    },
    [component.component_type]
  )

  // 预加载组件
  useEffect(() => {
    if (enablePreload && !hasError) {
      preloadComponent(component.component_type).catch(handleError)
    }
  }, [component.component_type, enablePreload, hasError, handleError])

  // 获取组件加载器
  const ComponentLoader = useMemo(() => {
    const category = COMPONENT_CATEGORY_MAP[component.component_type]
    if (!category) return null

    const componentMap = COMPONENT_MAPS[category]
    return componentMap[
      component.component_type as keyof typeof componentMap
    ] as React.ComponentType<any> | null
  }, [component.component_type])

  if (hasError) {
    return (
      errorFallback || (
        <ErrorFallback
          componentType={component.component_type}
          error={error}
          retry={handleRetry}
          className={className}
        />
      )
    )
  }

  if (!ComponentLoader) {
    return (
      errorFallback || (
        <ErrorFallback
          componentType={component.component_type}
          error={new Error(`Unknown component type: ${component.component_type}`)}
          className={className}
        />
      )
    )
  }

  return (
    <Suspense
      key={retryKey}
      fallback={
        fallback || (
          <LoadingFallback componentType={component.component_type} className={className} />
        )
      }
    >
      <ComponentLoader
        {...component.props}
        {...component.styles}
        id={component.id}
        isSelected={isSelected}
        onSelect={onSelect}
        className={className}
        onError={handleError}
      />
    </Suspense>
  )
}

/**
 * 虚拟化组件列表
 */
interface VirtualizedComponentListProps {
  components: ComponentInstance[]
  itemHeight: number
  containerHeight: number
  renderItem: (component: ComponentInstance, index: number) => React.ReactNode
  overscan?: number
}

export const VirtualizedComponentList: React.FC<VirtualizedComponentListProps> = ({
  components,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
}) => {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleEnd = Math.min(
    components.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleComponents = components.slice(visibleStart, visibleEnd)

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: components.length * itemHeight, position: 'relative' }}>
        {visibleComponents.map((component, index) => {
          const actualIndex = visibleStart + index
          return (
            <div
              key={component.id}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(component, actualIndex)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LazyComponentWrapper
