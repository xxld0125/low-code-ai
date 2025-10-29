/**
 * 组件渲染器使用示例
 * 功能模块: 基础组件库 (004-basic-component-library) - T011任务
 * 创建日期: 2025-10-29
 * 用途: 展示组件渲染器的各种使用方式和最佳实践
 */

import React, { useState, useCallback } from 'react'
import {
  ComponentRenderer,
  EnhancedComponentRenderer,
  BatchComponentRenderer,
  ComponentRendererUtils,
  ComponentErrorBoundary,
  ComponentDevTools,
  useComponentPerformance,
} from './index'
import { Button } from './basic/Button'
import { Input } from './basic/Input'
import { Text } from './display/Text'
import { Container } from './layout/Container'

// 示例1: 基础组件渲染
export const BasicRendererExample: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleUpdate = useCallback((id: string, data: any) => {
    console.log('Update component:', id, data)
  }, [])

  const handleDelete = useCallback((id: string) => {
    console.log('Delete component:', id)
  }, [])

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">基础组件渲染示例</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 渲染Button组件 */}
        <ComponentRenderer
          id="button-1"
          componentType="Button"
          component={Button}
          props={{ text: '点击我', variant: 'default' } as any}
          defaultProps={{ text: '默认按钮', variant: 'default' } as any}
          styles={{ padding: 8, margin: 4 }}
          isSelected={selectedId === 'button-1'}
          onSelect={handleSelect}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        {/* 渲染Input组件 */}
        <ComponentRenderer
          id="input-1"
          componentType="Input"
          component={Input}
          props={{ placeholder: '请输入内容', type: 'text' } as any}
          styles={{ width: '100%' }}
          isSelected={selectedId === 'input-1'}
          onSelect={handleSelect}
        />

        {/* 渲染Text组件 */}
        <ComponentRenderer
          id="text-1"
          componentType="Text"
          component={Text}
          props={{ content: '这是一段文本内容', size: 'base' } as any}
          styles={{ color: '#333' }}
          isSelected={selectedId === 'text-1'}
          onSelect={handleSelect}
        />
      </div>

      <div className="mt-4 rounded bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          选中的组件ID: <code>{selectedId || '无'}</code>
        </p>
      </div>
    </div>
  )
}

// 示例2: 增强版渲染器（带缓存优化）
export const EnhancedRendererExample: React.FC = () => {
  const [componentData, setComponentData] = useState([
    {
      id: 'enhanced-button-1',
      componentType: 'Button',
      props: { text: '增强按钮', variant: 'primary' },
      styles: { margin: 8 },
    },
    {
      id: 'enhanced-input-1',
      componentType: 'Input',
      props: { placeholder: '增强输入框', value: '' },
      styles: { margin: 8 },
    },
  ])

  const handleUpdate = useCallback((id: string, data: any) => {
    setComponentData(prev => prev.map(comp => (comp.id === id ? { ...comp, ...data } : comp)))
  }, [])

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">增强版渲染器示例</h2>

      <div className="space-y-4">
        {componentData.map(component => (
          <EnhancedComponentRenderer
            key={component.id}
            id={component.id}
            componentType={component.componentType}
            component={component.componentType === 'Button' ? Button : Input}
            props={component.props as any}
            styles={component.styles}
            onUpdate={handleUpdate}
            config={{
              enableCache: true,
              enableLazyLoading: false,
              enableErrorBoundary: true,
              enableDebugMode: true,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// 示例3: 批量组件渲染
export const BatchRendererExample: React.FC = () => {
  const [components] = useState([
    {
      id: 'batch-btn-1',
      componentType: 'Button',
      props: { text: '批量按钮1', variant: 'default' },
      styles: { margin: 4 },
    },
    {
      id: 'batch-btn-2',
      componentType: 'Button',
      props: { text: '批量按钮2', variant: 'outline' },
      styles: { margin: 4 },
    },
    {
      id: 'batch-text-1',
      componentType: 'Text',
      props: { content: '批量渲染的文本' },
      styles: { margin: 4 },
    },
  ])

  const handleSelect = useCallback((id: string) => {
    console.log('Selected batch component:', id)
  }, [])

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">批量组件渲染示例</h2>

      <BatchComponentRenderer
        components={components as any}
        onSelect={handleSelect}
        config={{
          enableCache: true,
          enableDebugMode: true,
        }}
      />
    </div>
  )
}

// 示例4: 带性能监控的组件
export const PerformanceMonitoredComponent: React.FC<{
  id: string
  title: string
}> = ({ id, title }) => {
  const performance = useComponentPerformance(id, 'PerformanceExample')

  React.useEffect(() => {
    performance.startRender()
    return () => {
      performance.endRender()
    }
  })

  return (
    <div className="rounded border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">渲染次数: {performance.renderCount}</p>
      <p className="text-sm text-gray-600">
        平均渲染时间: {performance.averageRenderTime.toFixed(2)}ms
      </p>
    </div>
  )
}

// 示例5: 错误边界演示
export const ErrorBoundaryExample: React.FC = () => {
  const [shouldError, setShouldError] = useState(false)

  // 故意出错的组件
  const BuggyComponent: React.FC = () => {
    if (shouldError) {
      throw new Error('这是一个演示错误')
    }
    return <div>正常工作的组件</div>
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">错误边界示例</h2>

      <button
        onClick={() => setShouldError(!shouldError)}
        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        {shouldError ? '修复错误' : '触发错误'}
      </button>

      <ComponentErrorBoundary componentId="buggy-component" showRetry={true} showDetails={true}>
        <BuggyComponent />
      </ComponentErrorBoundary>
    </div>
  )
}

// 示例6: 工具函数使用
export const UtilsExample: React.FC = () => {
  // 创建自定义渲染器
  const CustomRenderer = ComponentRendererUtils.createRenderer({
    enableCache: true,
    enableDebugMode: true,
    enableErrorBoundary: true,
  })

  // 创建带错误边界的渲染器
  const ErrorBoundedRenderer = ComponentRendererUtils.createErrorBoundaryRenderer()

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">工具函数示例</h2>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 font-medium">自定义渲染器</h3>
          <CustomRenderer
            id="custom-1"
            componentType="Button"
            component={Button}
            props={{ text: '自定义渲染器按钮' } as any}
          />
        </div>

        <div>
          <h3 className="mb-2 font-medium">错误边界渲染器</h3>
          <ErrorBoundedRenderer
            id="error-bounded-1"
            componentType="Text"
            component={Text}
            props={{ content: '错误边界保护的文本' } as any}
          />
        </div>
      </div>

      <div className="mt-4 rounded bg-gray-50 p-4">
        <h3 className="mb-2 font-medium">缓存统计</h3>
        <pre className="text-sm">{JSON.stringify(ComponentRendererUtils.getStats(), null, 2)}</pre>
      </div>
    </div>
  )
}

// 完整示例应用
export const ComponentRendererShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'enhanced' | 'batch' | 'error' | 'utils'>(
    'basic'
  )

  const tabs = [
    { id: 'basic', label: '基础渲染', component: BasicRendererExample },
    { id: 'enhanced', label: '增强渲染', component: EnhancedRendererExample },
    { id: 'batch', label: '批量渲染', component: BatchRendererExample },
    { id: 'error', label: '错误处理', component: ErrorBoundaryExample },
    { id: 'utils', label: '工具函数', component: UtilsExample },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BasicRendererExample

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 开发工具 */}
      <ComponentDevTools
        config={{
          enabled: true,
          position: 'top-right',
          defaultExpanded: false,
        }}
      />

      {/* 标题 */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">组件渲染器演示</h1>
          <p className="mt-1 text-gray-600">T011任务 - 实现组件渲染器和画布集成</p>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`border-b-2 px-1 py-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <ActiveComponent />
      </div>

      {/* 性能监控组件 */}
      <div className="mx-auto max-w-6xl px-6 pb-6">
        <PerformanceMonitoredComponent id="perf-monitor-1" title="性能监控演示组件" />
      </div>
    </div>
  )
}

export default ComponentRendererShowcase
