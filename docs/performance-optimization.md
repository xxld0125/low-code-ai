# 样式更新性能优化文档

## 概述

本文档描述了属性配置面板中样式更新性能优化的实现和使用方法。

## 性能优化功能

### 1. 批量更新处理器 (BatchUpdateProcessor)

用于批量处理样式更新，减少单独更新的性能开销。

```typescript
import { BatchUpdateProcessor } from '@/lib/utils/performance'

const processor = new BatchUpdateProcessor(16, 50) // 16ms延迟，最大50条批量

// 添加更新
processor.addUpdate('component1.width', '100px')
processor.addUpdate('component1.height', '200px')

// 注册回调
const unsubscribe = processor.onUpdate((updates) => {
  console.log('批量处理更新:', updates)
})
```

### 2. 样式更新优化器 (StyleUpdateOptimizer)

专门用于优化样式更新的工具，支持限制更新频率。

```typescript
import { StyleUpdateOptimizer } from '@/lib/utils/performance'

const optimizer = new StyleUpdateOptimizer(60) // 最大60次更新/秒

// 添加样式更新
optimizer.addStyleUpdate('component-123', 'width', '100px')

// 批量添加
optimizer.addStyleUpdates('component-123', {
  width: '100px',
  height: '200px',
  backgroundColor: '#FF0000'
})
```

### 3. 缓存管理器 (CacheManager)

用于缓存计算结果和样式对象，避免重复计算。

```typescript
import { CacheManager } from '@/lib/utils/performance'

const cache = new CacheManager<string, CSSProperties>(100, 3000) // 100条缓存，3秒TTL

// 设置缓存
cache.set('component-123.base', { width: '100px', height: '200px' })

// 获取缓存
const styles = cache.get('component-123.base')

// 清理过期缓存
cache.cleanup()
```

## Hook 使用优化

### 启用性能优化

```typescript
import { usePropertyEditor } from '@/hooks/usePropertyEditor'

const propertyEditor = usePropertyEditor('component-123', {
  enablePerformanceOptimization: true, // 启用性能优化
  batchUpdateDelay: 16,                // 批量更新延迟 (ms)
  maxUpdatesPerSecond: 60,             // 最大更新频率
  enablePreview: true,
  autoValidate: true
})
```

### 样式属性更新

性能优化的Hook会自动检测样式属性（以 'style.' 开头）并使用优化方法：

```typescript
// 自动使用性能优化
propertyEditor.updateProperty('style.width', '100px')
propertyEditor.updateProperty('style.backgroundColor', '#FF0000')

// 批量更新（自动分离样式和常规属性）
propertyEditor.updateProperties({
  'style.width': '100px',
  'style.height': '200px',
  'style.backgroundColor': '#FF0000',
  'text': 'Hello World'  // 常规属性
})
```

## Store 使用优化

### 直接使用优化方法

```typescript
import { usePropertyStore } from '@/stores/property-store'

const store = usePropertyStore()

// 性能优化的样式更新
store.updateStylePropertyOptimized('component-123', 'width', '100px')

// 批量优化更新
store.updateStylePropertiesOptimized('component-123', {
  width: '100px',
  height: '200px',
  backgroundColor: '#FF0000'
})
```

### 样式Store优化

```typescript
import { useStyleStore } from '@/stores/style-store'

const styleStore = useStyleStore()

// 优化的样式更新
styleStore.updateStyleOptimized('component-123', 'width', '100px')

// 批量优化更新
styleStore.updateStylesOptimized('component-123', {
  width: '100px',
  height: '200px'
})
```

## 性能监控

### 使用性能监控器

```typescript
import { globalPerformanceMonitor } from '@/lib/utils/performance'

// 测量函数执行时间
const result = globalPerformanceMonitor.measure('style-calculation', () => {
  // 执行样式计算
  return calculateStyles(component)
})

// 获取性能指标
const metrics = globalPerformanceMonitor.getMetrics()
console.log('性能指标:', metrics)

/*
输出示例:
{
  'style-calculation': {
    count: 150,
    averageTime: 2.34,
    minTime: 0.5,
    maxTime: 8.7,
    totalTime: 351.0
  }
}
*/
```

## 最佳实践

### 1. 启用性能优化

始终在属性编辑器中启用性能优化，特别是在处理复杂组件时：

```typescript
const propertyEditor = usePropertyEditor(componentId, {
  enablePerformanceOptimization: true
})
```

### 2. 批量更新

尽可能使用批量更新而不是单个更新：

```typescript
// ✅ 推荐：批量更新
propertyEditor.updateProperties({
  'style.width': '100px',
  'style.height': '200px',
  'style.backgroundColor': '#FF0000'
})

// ❌ 避免：多个单独更新
propertyEditor.updateProperty('style.width', '100px')
propertyEditor.updateProperty('style.height', '200px')
propertyEditor.updateProperty('style.backgroundColor', '#FF0000')
```

### 3. 缓存计算结果

对于复杂的样式计算，使用缓存管理器：

```typescript
const cache = new CacheManager<string, CSSProperties>(100, 5000)

function getComputedStyles(componentId: string): CSSProperties {
  const cacheKey = `computed-${componentId}`

  // 尝试从缓存获取
  let styles = cache.get(cacheKey)

  if (!styles) {
    // 计算样式
    styles = calculateComplexStyles(componentId)
    // 缓存结果
    cache.set(cacheKey, styles)
  }

  return styles
}
```

### 4. 监控性能

定期检查性能指标，识别瓶颈：

```typescript
// 在开发环境中启用性能监控
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = globalPerformanceMonitor.getMetrics()
    Object.entries(metrics).forEach(([name, metric]) => {
      if (metric.averageTime > 10) { // 平均执行时间超过10ms
        console.warn(`性能警告: ${name} 平均执行时间 ${metric.averageTime.toFixed(2)}ms`)
      }
    })
  }, 10000)
}
```

## 性能指标

### 目标性能

- **更新频率**: 最大60次/秒 (约16ms间隔)
- **批量大小**: 最大50个更新
- **缓存命中率**: >80%
- **平均响应时间**: <5ms

### 监控指标

```typescript
// 获取优化器统计信息
const stats = styleOptimizer.getStats()
console.log('优化器统计:', {
  updateCount: stats.updateCount,           // 总更新次数
  pendingCount: stats.pendingCount,         // 待处理更新数
  updatesPerSecond: stats.updatesPerSecond  // 当前更新频率
})
```

## 故障排除

### 常见问题

1. **样式更新延迟过高**
   - 检查 `batchUpdateDelay` 设置
   - 确认没有阻塞的主线程操作

2. **内存使用增长**
   - 定期清理缓存：`cache.cleanup()`
   - 检查缓存TTL设置

3. **UI响应性差**
   - 确保 `enablePerformanceOptimization` 为 `true`
   - 检查批量更新频率设置

### 调试技巧

```typescript
// 启用调试日志
const propertyEditor = usePropertyEditor(componentId, {
  debug: true,
  enablePerformanceOptimization: true
})

// 监控缓存状态
console.log('缓存状态:', {
  size: cache.size,
  keys: Array.from((cache as any).cache.keys())
})
```