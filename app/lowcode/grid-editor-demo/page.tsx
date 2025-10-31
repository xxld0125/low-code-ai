/**
 * 栅格编辑器演示页面
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T135 - 实现栅格系统的可视化编辑器
 * 创建日期: 2025-10-31
 */

import { Metadata } from 'next'
import { GridEditorDemo } from '@/components/lowcode/editors/GridEditor/GridEditorDemo'

export const metadata: Metadata = {
  title: '栅格编辑器演示 - 低代码平台',
  description: '可视化栅格布局编辑器，支持响应式设计和实时预览',
}

export default function GridEditorDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <GridEditorDemo />
    </div>
  )
}
