/**
 * 栅格编辑器演示组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T135 - 实现栅格系统的可视化编辑器
 * 创建日期: 2025-10-31
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GridEditor, type GridRowConfig } from './GridEditor'

/**
 * 栅格编辑器演示组件
 */
export function GridEditorDemo() {
  const [config, setConfig] = useState<GridRowConfig>({
    id: 'demo-row',
    gutter: {
      mobile: { x: 16, y: 16 },
      tablet: { x: 24, y: 24 },
      desktop: { x: 24, y: 24 },
    },
    justify: {
      mobile: 'start',
      tablet: 'center',
      desktop: 'end',
    },
    align: {
      mobile: 'start',
      tablet: 'center',
      desktop: 'stretch',
    },
    wrap: {
      mobile: false,
      tablet: true,
      desktop: true,
    },
    direction: {
      mobile: 'row',
      tablet: 'row',
      desktop: 'row',
    },
    columns: [
      {
        id: 'demo-col-1',
        span: {
          mobile: 24,
          tablet: 12,
          desktop: 8,
        },
        offset: {
          mobile: 0,
          tablet: 0,
          desktop: 2,
        },
        content: '主内容区',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        alignSelf: {
          mobile: 'auto',
          tablet: 'auto',
          desktop: 'start',
        },
      },
      {
        id: 'demo-col-2',
        span: {
          mobile: 24,
          tablet: 12,
          desktop: 6,
        },
        content: '侧边栏',
        backgroundColor: 'hsl(var(--secondary) / 0.1)',
        alignSelf: {
          mobile: 'auto',
          tablet: 'auto',
          desktop: 'stretch',
        },
      },
      {
        id: 'demo-col-3',
        span: {
          mobile: 24,
          tablet: 24,
          desktop: 8,
        },
        order: {
          mobile: 1,
          tablet: 0,
          desktop: 0,
        },
        content: '底部内容',
        backgroundColor: 'hsl(var(--accent) / 0.1)',
        hidden: {
          mobile: false,
          tablet: false,
          desktop: true,
        },
      },
    ],
  })

  const handleConfigChange = (newConfig: GridRowConfig) => {
    setConfig(newConfig)
    console.log('栅格配置已更新:', newConfig)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">栅格系统可视化编辑器</h1>
        <p className="text-muted-foreground">拖拽式栅格布局配置，支持响应式设计和实时预览</p>
      </div>

      <GridEditor
        config={config}
        onChange={handleConfigChange}
        showPreview={true}
        showControls={true}
        className="mx-auto max-w-7xl"
      />

      {/* 使用说明 */}
      <Card className="mx-auto max-w-7xl">
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">基本功能</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 支持移动端、平板、桌面三个断点</li>
                <li>• 24列栅格系统，灵活配置布局</li>
                <li>• 实时预览，所见即所得</li>
                <li>• 可视化和代码两种预览模式</li>
                <li>• 支持列的添加、删除、复制操作</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-medium">高级功能</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 列偏移控制，实现精确间距</li>
                <li>• 排序功能，调整显示顺序</li>
                <li>• 条件隐藏，响应式显示控制</li>
                <li>• 多种对齐方式，灵活布局</li>
                <li>• 自动生成可用的组件代码</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-2 font-medium">操作提示</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• 点击列卡片可以选中并编辑详细属性</li>
              <li>• 使用滑块快速调整栅格宽度和间距</li>
              <li>• 切换断点查看不同屏幕尺寸下的布局效果</li>
              <li>• 代码模式下可以复制生成的组件代码</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GridEditorDemo
