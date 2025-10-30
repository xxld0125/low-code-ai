/**
 * 组件性能优化工具
 */

import { useMemo, useCallback, useRef } from 'react'

/**
 * 防抖Hook
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])
}

/**
 * 记忆化搜索Hook
 */
export function useComponentSearch(components: any[], searchQuery: string) {
  const search = useCallback((query: string, componentList: any[]) => {
    if (!query) return componentList

    const normalizedQuery = query.toLowerCase()

    return componentList.filter(component => {
      return (
        component.name?.toLowerCase().includes(normalizedQuery) ||
        component.description?.toLowerCase().includes(normalizedQuery) ||
        component.keywords?.some((keyword: string) =>
          keyword.toLowerCase().includes(normalizedQuery)
        ) ||
        component.type?.toLowerCase().includes(normalizedQuery)
      )
    })
  }, [])

  return useMemo(() => {
    return search(searchQuery, components)
  }, [search, searchQuery, components])
}

/**
 * 懒加载组件注册Hook
 */
export function useLazyComponentRegistration() {
  const registeredComponents = useRef<Set<string>>(new Set())
  const registrationPromises = useRef<Map<string, Promise<void>>>(new Map())

  const registerComponent = useCallback(async (definition: any) => {
    const componentType = definition.type

    // 如果已经注册过，直接返回
    if (registeredComponents.current.has(componentType)) {
      return
    }

    // 如果正在注册中，等待注册完成
    if (registrationPromises.current.has(componentType)) {
      await registrationPromises.current.get(componentType)
      return
    }

    // 开始注册过程
    const registrationPromise = (async () => {
      try {
        const { getComponentRegistry } = await import('@/components/lowcode/registry/component-registry')
        const registry = getComponentRegistry()

        const result = await registry.register(definition)

        if (result.success) {
          registeredComponents.current.add(componentType)
          console.log(`✓ 成功注册组件: ${componentType}`)
        } else {
          console.error(`注册组件失败: ${componentType}`, result.errors)
          throw new Error(result.errors?.join(', ') || '注册失败')
        }
      } catch (error) {
        console.error(`组件注册过程中发生错误: ${componentType}`, error)
        throw error
      } finally {
        registrationPromises.current.delete(componentType)
      }
    })()

    registrationPromises.current.set(componentType, registrationPromise)
    await registrationPromise
  }, [])

  const batchRegisterComponents = useCallback(async (definitions: any[]) => {
    // 并行注册组件以提高性能
    const registrationTasks = definitions.map(definition =>
      registerComponent(definition).catch(error => {
        console.error(`批量注册失败: ${definition.type}`, error)
        return null
      })
    )

    await Promise.allSettled(registrationTasks)
  }, [registerComponent])

  return {
    registerComponent,
    batchRegisterComponents,
    isRegistered: (componentType: string) => registeredComponents.current.has(componentType),
    getRegisteredCount: () => registeredComponents.current.size,
  }
}

/**
 * 组件渲染性能监控Hook
 */
export function useComponentPerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef<number>(Date.now())

  const logRender = useCallback(() => {
    renderCount.current += 1
    const now = Date.now()
    const timeSinceLastRender = now - lastRenderTime.current

    // 如果渲染间隔过短，可能存在性能问题
    if (timeSinceLastRender < 16 && renderCount.current > 1) { // 60fps ≈ 16ms
      console.warn(`组件 ${componentName} 渲染频率过高，可能存在性能问题`, {
        renderCount: renderCount.current,
        timeSinceLastRender,
      })
    }

    lastRenderTime.current = now
  }, [componentName])

  return {
    logRender,
    getRenderCount: () => renderCount.current,
  }
}

/**
 * 虚拟滚动Hook（用于大量组件列表）
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) {
  return useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const totalHeight = items.length * itemHeight

    const getVisibleItems = (scrollTop: number) => {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
      const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

      return {
        items: items.slice(startIndex, endIndex + 1),
        startIndex,
        endIndex,
        offsetY: startIndex * itemHeight,
      }
    }

    return {
      totalHeight,
      visibleCount,
      getVisibleItems,
    }
  }, [items, containerHeight, itemHeight, overscan])
}