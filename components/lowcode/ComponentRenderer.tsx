/**
 * 组件渲染器
 * 功能模块: 基础组件库 (004-basic-component-library) - T011任务
 * 创建日期: 2025-10-29
 * 用途: 动态渲染低代码组件，支持属性合并、样式应用、错误处理和性能优化
 */

import React, { memo, useMemo, useCallback, forwardRef, useState, useEffect } from 'react'
import { ComponentDefinition, LowcodeComponentProps, StyleValue } from '@/types/lowcode'
import { ComponentErrorBoundary, withErrorBoundary } from './ErrorBoundary'
import {
  ComponentCacheManager,
  useComponentCache,
  LazyComponentWrapper,
  useCachedStyles,
  useCachedProps,
  generateCacheKeys,
} from './ComponentCache'

// 渲染器配置接口
interface RendererConfig {
  enableCache: boolean
  enableLazyLoading: boolean
  enableErrorBoundary: boolean
  enableDebugMode: boolean
  performanceMonitoring: boolean
}

// 默认配置
const DEFAULT_RENDERER_CONFIG: RendererConfig = {
  enableCache: true,
  enableLazyLoading: true,
  enableErrorBoundary: true,
  enableDebugMode: process.env.NODE_ENV === 'development',
  performanceMonitoring: process.env.NODE_ENV === 'development',
}

// 渲染器Props接口
export interface ComponentRendererProps {
  // 基础属性
  id: string
  componentType: string
  componentDefinition?: ComponentDefinition
  component?: React.ComponentType<any>

  // 组件属性
  props?: LowcodeComponentProps
  defaultProps?: LowcodeComponentProps

  // 样式属性
  styles?: StyleValue
  defaultStyles?: StyleValue
  className?: string

  // 交互属性
  isSelected?: boolean
  isDragging?: boolean
  isEditable?: boolean

  // 事件回调
  onSelect?: (id: string) => void
  onUpdate?: (id: string, data: Partial<ComponentRendererProps>) => void
  onDelete?: (id: string) => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void

  // 子组件
  children?: React.ReactNode

  // 响应式
  breakpoint?: string

  // 高级选项
  lazy?: boolean
  fallback?: React.ReactNode
  config?: Partial<RendererConfig>
}

// 性能监控数据
interface PerformanceMetrics {
  renderTime: number
  cacheHitRate: number
  memoryUsage: number
  componentCount: number
}

/**
 * 组件渲染器核心组件
 */
export const ComponentRenderer = memo(
  forwardRef<any, ComponentRendererProps>(
    (
      {
        id,
        componentType,
        componentDefinition,
        component: ComponentProp,
        props = {},
        defaultProps = {},
        styles = {},
        defaultStyles = {},
        className,
        isSelected = false,
        isDragging = false,
        isEditable = true,
        onSelect,
        onUpdate,
        onDelete,
        onError,
        children,
        breakpoint,
        lazy,
        fallback,
        config: customConfig,
      },
      ref
    ) => {
      // 合并配置
      const config = useMemo(
        () => ({
          ...DEFAULT_RENDERER_CONFIG,
          ...customConfig,
        }),
        [customConfig]
      )

      // 获取缓存管理器
      const cacheManager = useComponentCache()

      // 状态管理
      const [isLoading, setIsLoading] = useState(false)
      const [renderError, setRenderError] = useState<Error | null>(null)
      const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
        renderTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        componentCount: 1,
      })

      // 缓存键生成
      const cacheKeys = useMemo(
        () => ({
          component: generateCacheKeys.component(componentType),
          styles: generateCacheKeys.style(componentType, styles, breakpoint),
          props: generateCacheKeys.props(componentType, defaultProps, props),
        }),
        [componentType, styles, breakpoint, defaultProps, props]
      )

      // 缓存合并后的属性
      const mergedProps = useCachedProps(componentType, defaultProps, props)

      // 缓存计算后的样式
      const computedStyles = useCachedStyles(
        componentType,
        {
          ...defaultStyles,
          ...styles,
        },
        breakpoint
      )

      // 组件加载逻辑
      const loadComponent = useCallback(async () => {
        if (!ComponentProp && componentDefinition) {
          setIsLoading(true)
          try {
            // 如果有组件定义，尝试从定义中加载组件
            if (componentDefinition.component) {
              return componentDefinition.component
            }

            // 如果是懒加载组件
            if (config.enableLazyLoading && lazy) {
              const loadedComponent = await cacheManager.loadComponentLazy(
                componentType,
                async () => ({ default: ComponentProp || (() => null) })
              )
              return loadedComponent
            }

            throw new Error(`Component not found for type: ${componentType}`)
          } catch (error) {
            console.error(`Failed to load component ${componentType}:`, error)
            setRenderError(error as Error)
            return null
          } finally {
            setIsLoading(false)
          }
        }

        return ComponentProp
      }, [
        ComponentProp,
        componentDefinition,
        componentType,
        config.enableLazyLoading,
        lazy,
        cacheManager,
      ])

      // 性能监控
      useEffect(() => {
        if (config.performanceMonitoring) {
          const startTime = performance.now()

          // 模拟渲染完成
          const timer = setTimeout(() => {
            const endTime = performance.now()
            const renderTime = endTime - startTime

            // 获取缓存统计
            const stats = cacheManager.getStats()
            const cacheHitRate =
              stats.components.totalAccesses > 0
                ? (stats.components.totalAccesses - stats.components.size) /
                  stats.components.totalAccesses
                : 0

            // 估算内存使用（简化版本）
            const memoryUsage = stats.components.size * 1024 // 假设每个组件1KB

            setPerformanceMetrics({
              renderTime: Math.round(renderTime * 100) / 100,
              cacheHitRate: Math.round(cacheHitRate * 100),
              memoryUsage,
              componentCount: 1,
            })
          }, 0)

          return () => clearTimeout(timer)
        }
      }, [config.performanceMonitoring, componentType, cacheManager])

      // 事件处理器
      const handleClick = useCallback(
        (event: React.MouseEvent) => {
          event.stopPropagation()

          if (isEditable && onSelect) {
            onSelect(id)
          }
        },
        [id, isEditable, onSelect]
      )

      const handleDelete = useCallback(
        (event: React.MouseEvent) => {
          event.stopPropagation()

          if (onDelete) {
            onDelete(id)
          }
        },
        [id, onDelete]
      )

      const handleError = useCallback(
        (error: Error, errorInfo: React.ErrorInfo) => {
          setRenderError(error)
          onError?.(error, errorInfo)
        },
        [onError]
      )

      // 合并CSS类名
      const combinedClassName = useMemo(() => {
        const classes = ['lowcode-component']

        if (isSelected) classes.push('lowcode-component--selected')
        if (isDragging) classes.push('lowcode-component--dragging')
        if (isEditable) classes.push('lowcode-component--editable')
        if (className) classes.push(className)

        return classes.join(' ')
      }, [isSelected, isDragging, isEditable, className])

      // 渲染内容
      const renderContent = useMemo(() => {
        const Component = ComponentProp

        if (!Component) {
          return (
            <div className="component-missing rounded border border-yellow-200 bg-yellow-50 p-4">
              <div className="text-sm text-yellow-800">组件未找到: {componentType}</div>
            </div>
          )
        }

        if (isLoading) {
          return (
            fallback || (
              <div className="component-loading rounded border border-gray-200 bg-gray-50 p-4">
                <div className="text-sm text-gray-600">加载中...</div>
              </div>
            )
          )
        }

        return (
          <Component
            ref={ref}
            {...mergedProps}
            className={combinedClassName}
            style={computedStyles}
          >
            {children}
          </Component>
        )
      }, [
        ComponentProp,
        isLoading,
        fallback,
        componentType,
        mergedProps,
        combinedClassName,
        computedStyles,
        children,
        ref,
      ])

      // 调试信息
      const renderDebugInfo = () => {
        if (!config.enableDebugMode) return null

        return (
          <div className="component-debug-info absolute right-0 top-0 rounded bg-black bg-opacity-75 p-2 text-xs text-white">
            <div>ID: {id}</div>
            <div>Type: {componentType}</div>
            <div>Render Time: {performanceMetrics.renderTime}ms</div>
            <div>Cache Hit Rate: {performanceMetrics.cacheHitRate}%</div>
            <div>Memory: {performanceMetrics.memoryUsage}B</div>
          </div>
        )
      }

      // 主渲染
      const content = (
        <div
          className={`lowcode-component-wrapper ${combinedClassName}`}
          onClick={handleClick}
          data-component-id={id}
          data-component-type={componentType}
          style={{
            position: 'relative',
            outline: isSelected ? '2px solid #3b82f6' : 'none',
            outlineOffset: isSelected ? '2px' : 'none',
            opacity: isDragging ? 0.5 : 1,
            cursor: isEditable ? 'pointer' : 'default',
            ...computedStyles,
          }}
        >
          {renderContent}

          {/* 选中状态的控制器 */}
          {isSelected && isEditable && (
            <div className="component-controls absolute -right-2 -top-2 flex gap-1">
              <button
                className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white hover:bg-blue-600"
                onClick={handleClick}
                title="选择组件"
              >
                ✓
              </button>
              {onDelete && (
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                  onClick={handleDelete}
                  title="删除组件"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* 调试信息 */}
          {renderDebugInfo()}
        </div>
      )

      // 错误边界包装
      if (config.enableErrorBoundary) {
        return (
          <ComponentErrorBoundary
            onError={handleError}
            componentId={id}
            showRetry={true}
            showDetails={config.enableDebugMode}
          >
            {content}
          </ComponentErrorBoundary>
        )
      }

      return content
    }
  )
)

ComponentRenderer.displayName = 'ComponentRenderer'

/**
 * 增强版组件渲染器，支持更多高级功能
 */
export const EnhancedComponentRenderer = memo(
  forwardRef<any, ComponentRendererProps>((props, ref) => {
    const cacheManager = useComponentCache()

    // 预加载相关组件
    useEffect(() => {
      if (props.componentDefinition && cacheManager) {
        const componentKey = generateCacheKeys.component(props.componentType)

        if (!cacheManager.getCachedComponent(componentKey) && props.componentDefinition.component) {
          cacheManager.cacheComponent(componentKey, props.componentDefinition.component)
        }
      }
    }, [props.componentDefinition, props.componentType, cacheManager])

    return <ComponentRenderer {...props} ref={ref} />
  })
)

EnhancedComponentRenderer.displayName = 'EnhancedComponentRenderer'

/**
 * 批量组件渲染器
 */
export const BatchComponentRenderer: React.FC<{
  components: Array<{
    id: string
    componentType: string
    props?: LowcodeComponentProps
    styles?: StyleValue
    children?: React.ReactNode
  }>
  onSelect?: (id: string) => void
  onUpdate?: (id: string, data: any) => void
  onDelete?: (id: string) => void
  config?: Partial<RendererConfig>
}> = ({ components, onSelect, onUpdate, onDelete, config }) => {
  const cacheManager = useComponentCache()

  // 预热缓存
  useEffect(() => {
    if (cacheManager && config?.enableCache) {
      // 这里可以添加批量预加载逻辑
      console.log(`Preheating cache for ${components.length} components`)
    }
  }, [components, cacheManager, config])

  return (
    <div className="batch-component-renderer">
      {components.map(component => (
        <ComponentRenderer
          key={component.id}
          id={component.id}
          componentType={component.componentType}
          props={component.props}
          styles={component.styles}
          onSelect={onSelect}
          onUpdate={onUpdate}
          onDelete={onDelete}
          config={config}
        >
          {component.children}
        </ComponentRenderer>
      ))}
    </div>
  )
}

/**
 * 渲染器工具函数
 */
export const ComponentRendererUtils = {
  // 创建默认渲染器
  createRenderer: (config?: Partial<RendererConfig>) => {
    return (props: Omit<ComponentRendererProps, 'config'>) => (
      <ComponentRenderer {...props} config={config} />
    )
  },

  // 创建错误边界包装的渲染器
  createErrorBoundaryRenderer: (ErrorFallback?: React.ComponentType<any>) => {
    return withErrorBoundary(ComponentRenderer, {
      fallback: ErrorFallback ? <ErrorFallback /> : <div>组件加载失败</div>,
    })
  },

  // 清理缓存
  clearCache: () => {
    ComponentCacheManager.getInstance().clearCache()
  },

  // 获取渲染器统计
  getStats: () => {
    return ComponentCacheManager.getInstance().getStats()
  },

  // 预加载组件
  preloadComponents: async (
    components: Array<{
      type: string
      loader: () => Promise<{ default: React.ComponentType<any> }>
    }>
  ) => {
    return ComponentCacheManager.getInstance().preloadComponents(components)
  },
}

export default ComponentRenderer
