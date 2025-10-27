/**
 * 页面设计器拖拽覆盖层
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import type { DragItem } from '@/types/page-designer/component'
import { cn } from '@/lib/utils'

// 拖拽预览组件映射
const DragPreviewComponents: Record<string, React.FC> = {
  button: () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="rounded-lg border border-blue-600 bg-blue-500 px-4 py-2 text-white shadow-2xl"
    >
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded-full bg-white opacity-50"></div>
        <span className="text-sm font-medium">按钮</span>
      </div>
    </motion.div>
  ),

  input: () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="rounded-lg border-2 border-gray-300 bg-white px-3 py-2 shadow-2xl"
    >
      <div className="h-4 w-32 rounded bg-gray-200"></div>
    </motion.div>
  ),

  text: () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-2xl"
    >
      <div className="text-sm text-gray-700">文本内容</div>
    </motion.div>
  ),

  image: () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="rounded-lg border-2 border-gray-300 bg-gray-100 shadow-2xl"
    >
      <div className="flex h-20 w-32 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-1 h-8 w-8 rounded bg-gray-400"></div>
          <span className="text-xs text-gray-500">图片</span>
        </div>
      </div>
    </motion.div>
  ),
}

// 拖拽覆盖层组件
export const PageDragOverlay: React.FC<{
  active: any
  activeId: string | number
}> = ({ active, activeId }) => {
  const dragData = active?.data?.current as DragItem

  if (!dragData) return null

  const PreviewComponent = DragPreviewComponents[dragData.type]

  return (
    <DragOverlay>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ rotate: -5 }}
            animate={{ rotate: 0 }}
            exit={{ rotate: 5 }}
            className="cursor-grabbing"
          >
            {PreviewComponent ? (
              <PreviewComponent />
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="rounded-lg bg-gray-500 px-3 py-2 text-white shadow-2xl"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 rounded-full bg-white opacity-50"></div>
                  <span className="text-sm font-medium">{dragData.type}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </DragOverlay>
  )
}

export default PageDragOverlay
