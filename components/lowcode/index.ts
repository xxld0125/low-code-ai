/**
 * 基础组件库主导出文件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 * 更新日期: 2025-10-29 (T011任务 - 组件渲染器实现)
 */

// 导出所有基础组件
export * from './basic'
export * from './display'
export * from './layout'

// 导出核心渲染器 (T011任务)
export {
  ComponentRenderer,
  EnhancedComponentRenderer,
  BatchComponentRenderer,
  ComponentRendererUtils,
} from './ComponentRenderer'

// 导出错误边界
export { ComponentErrorBoundary, withErrorBoundary, DefaultErrorFallback } from './ErrorBoundary'

// 导出组件缓存系统
export {
  ComponentCacheManager,
  LRUCache,
  LazyComponentWrapper,
  useComponentCache,
  useCachedStyles,
  useCachedProps,
  generateCacheKeys,
} from './ComponentCache'

// 导出开发工具
export { ComponentDevTools, useComponentPerformance, ComponentDebugInfo } from './ComponentDevTools'

// 导出注册系统
// export * from './registry'

// 导出编辑器组件
// export * from './editors'

// 导出共享类型和工具
// export * from './shared'

// TODO: 取消注释上述导出，当相关组件实现后
