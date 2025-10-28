/**
 * 页面设计器组件预加载管理器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 智能预加载组件，优化用户体验
 */

import {
  preloadComponent,
  preloadComponents,
} from '@/components/page-designer/lazy/LazyComponentLoader'

// 预加载策略
export type PreloadStrategy =
  | 'eager' // 立即预加载所有组件
  | 'idle' // 在浏览器空闲时预加载
  | 'visible' // 当组件即将可见时预加载
  | 'hover' // 鼠标悬停时预加载
  | 'intersection' // 使用 IntersectionObserver 预加载

// 组件使用优先级
export type ComponentPriority = 'critical' | 'high' | 'medium' | 'low'

// 组件预加载配置
export interface ComponentPreloadConfig {
  type: string
  priority: ComponentPriority
  strategy: PreloadStrategy
  threshold?: number // IntersectionObserver 阈值
  delay?: number // 延迟加载时间 (ms)
}

// 默认预加载配置
const DEFAULT_PRELOAD_CONFIG: ComponentPreloadConfig[] = [
  // 关键组件 - 立即预加载
  { type: 'button', priority: 'critical', strategy: 'eager' },
  { type: 'text', priority: 'critical', strategy: 'eager' },
  { type: 'container', priority: 'critical', strategy: 'eager' },

  // 高优先级组件 - 空闲时预加载
  { type: 'input', priority: 'high', strategy: 'idle' },
  { type: 'image', priority: 'high', strategy: 'idle' },
  { type: 'row', priority: 'high', strategy: 'idle' },
  { type: 'col', priority: 'high', strategy: 'idle' },

  // 中等优先级组件 - 可见时预加载
  { type: 'heading', priority: 'medium', strategy: 'visible', threshold: 0.1 },
  { type: 'paragraph', priority: 'medium', strategy: 'visible', threshold: 0.1 },
  { type: 'link', priority: 'medium', strategy: 'visible', threshold: 0.1 },

  // 低优先级组件 - 悬停时预加载
  { type: 'form', priority: 'low', strategy: 'hover', delay: 100 },
  { type: 'textarea', priority: 'low', strategy: 'hover', delay: 100 },
  { type: 'select', priority: 'low', strategy: 'hover', delay: 100 },
  { type: 'divider', priority: 'low', strategy: 'hover', delay: 200 },
  { type: 'spacer', priority: 'low', strategy: 'hover', delay: 200 },
]

/**
 * 组件预加载管理器
 */
export class ComponentPreloader {
  private config: ComponentPreloadConfig[]
  private preloadedComponents: Set<string>
  private loadingComponents: Set<string>
  private failedComponents: Set<string>
  private intersectionObservers: Map<string, IntersectionObserver>
  private hoverElements: Map<string, HTMLElement>
  private preloadPromises: Map<string, Promise<void>>

  constructor(config: ComponentPreloadConfig[] = DEFAULT_PRELOAD_CONFIG) {
    this.config = config
    this.preloadedComponents = new Set()
    this.loadingComponents = new Set()
    this.failedComponents = new Set()
    this.intersectionObservers = new Map()
    this.hoverElements = new Map()
    this.preloadPromises = new Map()
  }

  /**
   * 初始化预加载器
   */
  public initialize(): void {
    this.setupEagerPreloading()
    this.setupIdlePreloading()
  }

  /**
   * 设置立即预加载
   */
  private setupEagerPreloading(): void {
    const eagerConfigs = this.config.filter(c => c.strategy === 'eager')

    eagerConfigs.forEach(config => {
      this.preloadComponent(config)
    })
  }

  /**
   * 设置空闲时预加载
   */
  private setupIdlePreloading(): void {
    const idleConfigs = this.config.filter(c => c.strategy === 'idle')

    if (idleConfigs.length === 0) return

    const preloadIdleComponents = () => {
      idleConfigs.forEach(config => {
        this.preloadComponent(config)
      })
    }

    // 使用 requestIdleCallback 在浏览器空闲时预加载
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadIdleComponents, { timeout: 5000 })
    } else {
      // 回退到 setTimeout
      setTimeout(preloadIdleComponents, 1000)
    }
  }

  /**
   * 预加载单个组件
   */
  public async preloadComponent(config: ComponentPreloadConfig): Promise<void> {
    const { type, priority, strategy, delay = 0 } = config

    // 检查是否已经预加载
    if (this.preloadedComponents.has(type)) {
      return
    }

    // 检查是否正在加载
    if (this.loadingComponents.has(type)) {
      return this.preloadPromises.get(type)
    }

    // 检查是否加载失败
    if (this.failedComponents.has(type)) {
      console.warn(`Component ${type} failed to load previously, skipping preload`)
      return
    }

    const loadComponent = async (): Promise<void> => {
      this.loadingComponents.add(type)

      try {
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        await preloadComponent(type)
        this.preloadedComponents.add(type)
        console.log(`Component ${type} preloaded successfully`)
      } catch (error) {
        this.failedComponents.add(type)
        console.error(`Failed to preload component ${type}:`, error)
      } finally {
        this.loadingComponents.delete(type)
        this.preloadPromises.delete(type)
      }
    }

    const loadPromise = loadComponent()
    this.preloadPromises.set(type, loadPromise)

    return loadPromise
  }

  /**
   * 为元素设置可见性预加载
   */
  public setupIntersectionPreloading(
    element: HTMLElement,
    componentType: string,
    threshold = 0.1
  ): void {
    const config = this.config.find(c => c.type === componentType && c.strategy === 'visible')
    if (!config) return

    if (this.intersectionObservers.has(componentType)) {
      this.intersectionObservers.get(componentType)?.disconnect()
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.preloadComponent(config)
            observer.disconnect()
            this.intersectionObservers.delete(componentType)
          }
        })
      },
      { threshold: config.threshold || threshold }
    )

    observer.observe(element)
    this.intersectionObservers.set(componentType, observer)
  }

  /**
   * 为元素设置悬停预加载
   */
  public setupHoverPreloading(element: HTMLElement, componentType: string, delay = 100): void {
    const config = this.config.find(c => c.type === componentType && c.strategy === 'hover')
    if (!config) return

    let timeoutId: NodeJS.Timeout

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.preloadComponent({ ...config, delay })
      }, config.delay || delay)
    }

    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    this.hoverElements.set(componentType, element)
  }

  /**
   * 预加载组件列表
   */
  public async preloadComponents(componentTypes: string[]): Promise<void> {
    const configs = componentTypes
      .map(type => this.config.find(c => c.type === type))
      .filter((config): config is ComponentPreloadConfig => !!config)

    await preloadComponents(componentTypes)
  }

  /**
   * 根据优先级预加载组件
   */
  public async preloadByPriority(priority: ComponentPriority): Promise<void> {
    const configs = this.config.filter(c => c.priority === priority)
    const componentTypes = configs.map(c => c.type)

    await this.preloadComponents(componentTypes)
  }

  /**
   * 预测用户可能需要的组件
   */
  public async predictAndPreload(currentComponents: string[]): Promise<void> {
    // 简单的预测逻辑：如果用户使用了基础组件，预加载相关的布局组件
    const predictionMap: Record<string, string[]> = {
      button: ['container', 'row', 'col'],
      input: ['form', 'textarea', 'select'],
      text: ['heading', 'paragraph'],
      image: ['container', 'card'],
      container: ['row', 'col'],
      row: ['col'],
      col: ['button', 'input', 'text'],
    }

    const predictedComponents: string[] = []

    currentComponents.forEach(type => {
      const related = predictionMap[type] || []
      related.forEach(component => {
        if (!predictedComponents.includes(component)) {
          predictedComponents.push(component)
        }
      })
    })

    await this.preloadComponents(predictedComponents)
  }

  /**
   * 获取预加载统计信息
   */
  public getStats(): {
    total: number
    preloaded: number
    loading: number
    failed: number
    pending: number
  } {
    const total = this.config.length
    const preloaded = this.preloadedComponents.size
    const loading = this.loadingComponents.size
    const failed = this.failedComponents.size
    const pending = total - preloaded - loading - failed

    return {
      total,
      preloaded,
      loading,
      failed,
      pending,
    }
  }

  /**
   * 检查组件是否已预加载
   */
  public isPreloaded(componentType: string): boolean {
    return this.preloadedComponents.has(componentType)
  }

  /**
   * 检查组件是否正在加载
   */
  public isLoading(componentType: string): boolean {
    return this.loadingComponents.has(componentType)
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    // 断开所有 IntersectionObserver
    this.intersectionObservers.forEach(observer => observer.disconnect())
    this.intersectionObservers.clear()

    // 清理悬停事件监听器
    this.hoverElements.forEach((element, componentType) => {
      element.removeEventListener('mouseenter', () => {})
      element.removeEventListener('mouseleave', () => {})
    })
    this.hoverElements.clear()

    // 清理状态
    this.preloadedComponents.clear()
    this.loadingComponents.clear()
    this.failedComponents.clear()
    this.preloadPromises.clear()
  }
}

// 全局组件预加载器实例
export const componentPreloader = new ComponentPreloader()

export default componentPreloader
