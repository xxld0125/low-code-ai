/**
 * 页面设计器Bundle优化工具
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 优化Bundle大小，确保小于250KB gzipped
 */

import React, { lazy, ComponentType } from 'react'

// Bundle大小限制
export const BUNDLE_LIMITS = {
  DESIGNER_CORE: 250 * 1024, // 250KB gzipped
  COMPONENT_LIBRARY: 150 * 1024, // 150KB gzipped
  DND_SYSTEM: 50 * 1024, // 50KB gzipped
  TOTAL_PAGE: 500 * 1024, // 500KB gzipped total
}

// 组件分组策略
export interface ComponentChunk {
  name: string
  components: string[]
  priority: 'high' | 'medium' | 'low'
  preload: boolean
  size: number // 预估大小 (bytes)
}

// 预定义的组件分块
export const COMPONENT_CHUNKS: ComponentChunk[] = [
  // 核心组件 - 立即加载
  {
    name: 'designer-core',
    components: ['DesignerLayout', 'ComponentPanel', 'PageCanvas', 'PagePropertiesPanel'],
    priority: 'high',
    preload: true,
    size: 80 * 1024,
  },

  // 基础组件 - 按需加载
  {
    name: 'basic-components',
    components: ['Button', 'Input', 'Text', 'Image'],
    priority: 'high',
    preload: true,
    size: 60 * 1024,
  },

  // 布局组件 - 按需加载
  {
    name: 'layout-components',
    components: ['Container', 'Row', 'Col'],
    priority: 'medium',
    preload: false,
    size: 40 * 1024,
  },

  // 表单组件 - 延迟加载
  {
    name: 'form-components',
    components: ['Form', 'Textarea', 'Select', 'Checkbox', 'Radio'],
    priority: 'medium',
    preload: false,
    size: 50 * 1024,
  },

  // 导航组件 - 延迟加载
  {
    name: 'navigation-components',
    components: ['Navbar', 'Sidebar', 'Breadcrumb', 'Tabs'],
    priority: 'low',
    preload: false,
    size: 45 * 1024,
  },

  // 列表组件 - 延迟加载
  {
    name: 'list-components',
    components: ['List', 'Table', 'Card', 'Grid'],
    priority: 'low',
    preload: false,
    size: 55 * 1024,
  },
]

// Bundle分析结果
export interface BundleAnalysisResult {
  totalSize: number
  gzippedSize: number
  chunks: Array<{
    name: string
    size: number
    gzippedSize: number
    components: string[]
  }>
  recommendations: string[]
  score: number // 0-100
  timestamp: number
}

/**
 * Bundle优化器类
 */
export class BundleOptimizer {
  private loadedChunks: Set<string>
  private loadingChunks: Map<string, Promise<ComponentType<any>>>
  private chunkCache: Map<string, ComponentType>
  private preloadedChunks: Set<string>

  constructor() {
    this.loadedChunks = new Set()
    this.loadingChunks = new Map()
    this.chunkCache = new Map()
    this.preloadedChunks = new Set()
  }

  /**
   * 动态导入组件分块
   */
  public async loadChunk(chunkName: string): Promise<ComponentType> {
    // 检查是否已加载
    if (this.loadedChunks.has(chunkName)) {
      return this.chunkCache.get(chunkName)!
    }

    // 检查是否正在加载
    if (this.loadingChunks.has(chunkName)) {
      await this.loadingChunks.get(chunkName)
      return this.chunkCache.get(chunkName)!
    }

    // 开始加载
    const loadPromise = this.loadChunkDynamic(chunkName)
    this.loadingChunks.set(chunkName, loadPromise)

    try {
      const component = await loadPromise
      this.loadedChunks.add(chunkName)
      this.chunkCache.set(chunkName, component)
      return component
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error)
      throw error
    } finally {
      this.loadingChunks.delete(chunkName)
    }
  }

  /**
   * 动态加载分块的具体实现
   */
  private async loadChunkDynamic(chunkName: string): Promise<ComponentType> {
    switch (chunkName) {
      case 'designer-core':
        // 暂时返回一个简单的div组件，等DesignerLayout创建后再修改
        const DesignerCoreComponent = () =>
          React.createElement('div', {}, 'Designer Core Component')
        DesignerCoreComponent.displayName = 'DesignerCoreComponent'
        return DesignerCoreComponent

      case 'basic-components':
        // 暂时返回一个简单的div组件，等BasicComponents创建后再修改
        const BasicComponentsComponent = () => React.createElement('div', {}, 'Basic Components')
        BasicComponentsComponent.displayName = 'BasicComponentsComponent'
        return BasicComponentsComponent

      case 'layout-components':
        // 暂时返回一个简单的div组件，等LayoutComponents创建后再修改
        const LayoutComponentsComponent = () => React.createElement('div', {}, 'Layout Components')
        LayoutComponentsComponent.displayName = 'LayoutComponentsComponent'
        return LayoutComponentsComponent

      case 'form-components':
        // 暂时返回一个简单的div组件，等FormComponents创建后再修改
        const FormComponentsComponent = () => React.createElement('div', {}, 'Form Components')
        FormComponentsComponent.displayName = 'FormComponentsComponent'
        return FormComponentsComponent

      case 'navigation-components':
        // 暂时返回一个简单的div组件，等NavigationComponents创建后再修改
        const NavigationComponentsComponent = () =>
          React.createElement('div', {}, 'Navigation Components')
        NavigationComponentsComponent.displayName = 'NavigationComponentsComponent'
        return NavigationComponentsComponent

      case 'list-components':
        // 暂时返回一个简单的div组件，等ListComponents创建后再修改
        const ListComponentsComponent = () => React.createElement('div', {}, 'List Components')
        ListComponentsComponent.displayName = 'ListComponentsComponent'
        return ListComponentsComponent

      default:
        throw new Error(`Unknown chunk: ${chunkName}`)
    }
  }

  /**
   * 预加载组件分块
   */
  public async preloadChunk(chunkName: string): Promise<void> {
    if (this.preloadedChunks.has(chunkName)) return

    const chunk = COMPONENT_CHUNKS.find(c => c.name === chunkName)
    if (!chunk || !chunk.preload) return

    try {
      await this.loadChunk(chunkName)
      this.preloadedChunks.add(chunkName)
      console.log(`Chunk ${chunkName} preloaded successfully`)
    } catch (error) {
      console.error(`Failed to preload chunk ${chunkName}:`, error)
    }
  }

  /**
   * 预加载高优先级分块
   */
  public async preloadHighPriorityChunks(): Promise<void> {
    const highPriorityChunks = COMPONENT_CHUNKS.filter(c => c.priority === 'high')

    const preloadPromises = highPriorityChunks.map(chunk =>
      this.preloadChunk(chunk.name).catch(error => {
        console.error(`Failed to preload ${chunk.name}:`, error)
      })
    )

    await Promise.allSettled(preloadPromises)
  }

  /**
   * 智能预加载基于用户行为
   */
  public async smartPreload(userBehavior: {
    recentComponents: string[]
    frequentComponents: string[]
    sessionDuration: number
  }): Promise<void> {
    const { recentComponents, frequentComponents, sessionDuration } = userBehavior

    // 根据最近使用的组件预加载
    if (recentComponents.length > 0) {
      const recentChunk = this.findChunkForComponents(recentComponents)
      if (recentChunk) {
        await this.preloadChunk(recentChunk)
      }
    }

    // 根据频繁使用的组件预加载
    if (frequentComponents.length > 0) {
      const frequentChunk = this.findChunkForComponents(frequentComponents)
      if (frequentChunk && frequentChunk !== this.findChunkForComponents(recentComponents)) {
        await this.preloadChunk(frequentChunk)
      }
    }

    // 长时间会话预加载更多内容
    if (sessionDuration > 5 * 60 * 1000) {
      // 5分钟
      const mediumPriorityChunks = COMPONENT_CHUNKS.filter(c => c.priority === 'medium')
      const promises = mediumPriorityChunks.slice(0, 2).map(chunk => this.preloadChunk(chunk.name))
      await Promise.allSettled(promises)
    }
  }

  /**
   * 查找组件所属的分块
   */
  private findChunkForComponents(components: string[]): string | null {
    const componentCount = (chunk: ComponentChunk) =>
      components.filter(comp => chunk.components.includes(comp)).length

    const bestChunk = COMPONENT_CHUNKS.map(chunk => ({ chunk, count: componentCount(chunk) }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)[0]

    return bestChunk ? bestChunk.chunk.name : null
  }

  /**
   * 分析Bundle大小
   */
  public analyzeBundle(): BundleAnalysisResult {
    // 模拟Bundle分析（实际应用中需要使用webpack-bundle-analyzer等工具）
    const estimatedChunks = COMPONENT_CHUNKS.map(chunk => ({
      name: chunk.name,
      size: chunk.size,
      gzippedSize: Math.floor(chunk.size * 0.3), // 假设30%压缩率
      components: chunk.components,
    }))

    const totalSize = estimatedChunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const gzippedSize = estimatedChunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0)

    // 生成优化建议
    const recommendations = this.generateRecommendations(estimatedChunks, gzippedSize)

    // 计算得分
    const score = this.calculateBundleScore(gzippedSize, recommendations.length)

    return {
      totalSize,
      gzippedSize,
      chunks: estimatedChunks,
      recommendations,
      score,
      timestamp: Date.now(),
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    chunks: Array<{ name: string; size: number; gzippedSize: number }>,
    totalGzippedSize: number
  ): string[] {
    const recommendations: string[] = []

    // 检查总大小
    if (totalGzippedSize > BUNDLE_LIMITS.TOTAL_PAGE) {
      recommendations.push(
        `Bundle大小 ${Math.round(totalGzippedSize / 1024)}KB 超过限制，建议进一步拆分`
      )
    }

    // 检查大块
    const largeChunks = chunks.filter(chunk => chunk.gzippedSize > 100 * 1024)
    if (largeChunks.length > 0) {
      recommendations.push(`发现 ${largeChunks.length} 个大分块，建议进一步拆分`)
    }

    // 检查预加载策略
    const preloadedSize = chunks
      .filter(chunk => this.preloadedChunks.has(chunk.name))
      .reduce((sum, chunk) => sum + chunk.gzippedSize, 0)

    if (preloadedSize > 150 * 1024) {
      recommendations.push('预加载内容过多，建议优化预加载策略')
    }

    // 性能建议
    if (chunks.length > 8) {
      recommendations.push('分块数量较多，考虑合并小分块')
    }

    return recommendations
  }

  /**
   * 计算Bundle得分
   */
  private calculateBundleScore(gzippedSize: number, issuesCount: number): number {
    let score = 100

    // 大小扣分
    if (gzippedSize > BUNDLE_LIMITS.TOTAL_PAGE) {
      score -= 30
    } else if (gzippedSize > BUNDLE_LIMITS.DESIGNER_CORE) {
      score -= 15
    }

    // 问题扣分
    score -= Math.min(issuesCount * 5, 30)

    return Math.max(0, score)
  }

  /**
   * 获取已加载的分块信息
   */
  public getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks)
  }

  /**
   * 获取预加载的分块信息
   */
  public getPreloadedChunks(): string[] {
    return Array.from(this.preloadedChunks)
  }

  /**
   * 清理未使用的分块
   */
  public cleanupUnusedChunks(): void {
    // 这里可以实现基于LRU的缓存清理策略
    console.log('Cleaning up unused chunks...')
  }

  /**
   * 重置优化器状态
   */
  public reset(): void {
    this.loadedChunks.clear()
    this.loadingChunks.clear()
    this.chunkCache.clear()
    this.preloadedChunks.clear()
  }
}

/**
 * 懒加载高阶组件
 */
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ComponentType
): ComponentType<P> => {
  const LazyComponent = lazy(importFunc)

  const WrappedComponent = (props: P) => {
    const FallbackComponent =
      fallback ||
      (() => (
        <div className="flex items-center justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      ))

    return <LazyComponent {...props} fallback={<FallbackComponent />} />
  }

  WrappedComponent.displayName = `WithLazyLoading(${importFunc.name || 'Component'})`
  return WrappedComponent
}

/**
 * 创建动态导入的组件
 */
export const createDynamicComponent = <P extends object>(
  chunkName: string,
  importFunc: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> => {
  return withLazyLoading(importFunc)
}

// 全局Bundle优化器实例
export const bundleOptimizer = new BundleOptimizer()

export default bundleOptimizer
