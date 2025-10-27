/**
 * 页面设计器拖拽视觉反馈
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragItem, DragState } from '@/types/page-designer/component'
import { cn } from '@/lib/utils'

// 拖拽指示器组件
export const DragIndicator: React.FC<{
  isActive: boolean
  position?: { x: number; y: number }
  dropZoneType?: 'valid' | 'invalid' | 'forbidden'
  size?: 'small' | 'medium' | 'large'
}> = ({ isActive, position, dropZoneType = 'valid', size = 'medium' }) => {
  if (!isActive) return null

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  const colorClasses = {
    valid: 'bg-green-100 border-green-500 text-green-600',
    invalid: 'bg-red-100 border-red-500 text-red-600',
    forbidden: 'bg-gray-100 border-gray-500 text-gray-600',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={cn(
          'pointer-events-none fixed z-50',
          'flex items-center justify-center rounded-full border-2',
          'transition-all duration-200',
          sizeClasses[size],
          colorClasses[dropZoneType]
        )}
        style={{
          left: position?.x || 0,
          top: position?.y || 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.div
          className={cn(
            'h-full w-full animate-ping rounded-full',
            dropZoneType === 'valid' && 'bg-green-400',
            dropZoneType === 'invalid' && 'bg-red-400',
            dropZoneType === 'forbidden' && 'bg-gray-400'
          )}
          style={{ position: 'absolute' }}
        />
        <div className="relative z-10">
          {dropZoneType === 'valid' && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {dropZoneType === 'invalid' && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {dropZoneType === 'forbidden' && (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8 7a1 1 0 00-.707 1.707L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293A1 1 0 008 7z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// 拖拽路径指示器
export const DragPathIndicator: React.FC<{
  startPoint: { x: number; y: number }
  endPoint: { x: number; y: number }
  isActive: boolean
}> = ({ startPoint, endPoint, isActive }) => {
  const path = useMemo(() => {
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    return {
      length: distance,
      angle,
      midX: startPoint.x + dx / 2,
      midY: startPoint.y + dy / 2,
    }
  }, [startPoint, endPoint])

  return (
    <AnimatePresence>
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        className="pointer-events-none fixed z-40"
        style={{
          left: startPoint.x,
          top: startPoint.y,
          width: path.length,
          height: 2,
        }}
      >
        <motion.line
          x1="0"
          y1="1"
          x2={path.length}
          y2="1"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* 箭头 */}
        <motion.polygon
          points={`${path.length - 8},0 ${path.length},1 ${path.length - 8},2`}
          fill="#3b82f6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
      </motion.svg>
    </AnimatePresence>
  )
}

// 拖拽区域高亮
export const DropZoneHighlight: React.FC<{
  isActive: boolean
  isValid: boolean
  bounds: { x: number; y: number; width: number; height: number }
  label?: string
}> = ({ isActive, isValid, bounds, label }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            'pointer-events-none fixed z-30 rounded-lg border-2 border-dashed',
            'flex items-center justify-center',
            isValid ? 'border-blue-400 bg-blue-50' : 'border-red-400 bg-red-50'
          )}
          style={{
            left: bounds.x,
            top: bounds.y,
            width: bounds.width,
            height: bounds.height,
          }}
        >
          {label && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded px-3 py-1 text-sm font-medium',
                isValid ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
              )}
            >
              {label}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 拖拽统计信息
export const DragStats: React.FC<{
  dragState: DragState
  componentCount: number
  maxComponents: number
}> = ({ dragState, componentCount, maxComponents }) => {
  const { isDragging, draggedComponentType } = dragState

  if (!isDragging) return null

  const canAddMore = componentCount < maxComponents

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform"
    >
      <div
        className={cn(
          'rounded-lg border px-4 py-2 shadow-lg',
          canAddMore ? 'border-gray-200 bg-white' : 'border-red-200 bg-red-50'
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700">
              正在拖拽: {draggedComponentType}
            </span>
          </div>

          <div className="h-4 w-px bg-gray-300"></div>

          <div className="flex items-center space-x-2">
            <span className={cn('text-sm', canAddMore ? 'text-gray-600' : 'text-red-600')}>
              {componentCount}/{maxComponents} 组件
            </span>
            {!canAddMore && <span className="text-xs text-red-600">(已达上限)</span>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 拖拽预览增强组件
export const EnhancedDragPreview: React.FC<{
  dragItem: DragItem
  className?: string
}> = ({ dragItem, className }) => {
  const previewContent = useMemo(() => {
    switch (dragItem.type) {
      case 'button':
        return (
          <div className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white shadow-2xl">
            <div className="h-4 w-4 rounded-full bg-white opacity-50"></div>
            <span className="text-sm font-medium">按钮</span>
          </div>
        )
      case 'input':
        return (
          <div className="rounded-lg border-2 border-gray-300 bg-white px-3 py-2 shadow-2xl">
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        )
      case 'text':
        return (
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-2xl">
            <div className="text-sm text-gray-700">文本内容</div>
          </div>
        )
      case 'image':
        return (
          <div className="rounded-lg border-2 border-gray-300 bg-gray-100 shadow-2xl">
            <div className="flex h-20 w-32 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-1 h-8 w-8 rounded bg-gray-400"></div>
                <span className="text-xs text-gray-500">图片</span>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-2xl">
            <span className="text-sm text-gray-600">{dragItem.type}</span>
          </div>
        )
    }
  }, [dragItem.type])

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
      animate={{ scale: 1, opacity: 1, rotate: 2 }}
      exit={{ scale: 0.8, opacity: 0, rotate: -2 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        'pointer-events-none z-50',
        'transform-gpu', // 使用GPU加速
        className
      )}
    >
      <motion.div
        animate={{
          rotate: [2, -1, 2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {previewContent}
      </motion.div>

      {/* 拖拽光标指示器 */}
      <motion.div
        className="absolute -bottom-2 -right-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 拖拽轨迹效果
export const DragTrail: React.FC<{
  points: Array<{ x: number; y: number; timestamp: number }>
  isActive: boolean
}> = ({ points, isActive }) => {
  const now = Date.now()
  const maxAge = 500 // 轨迹保持时间（毫秒）

  const visiblePoints = useMemo(() => {
    return points.filter(point => now - point.timestamp < maxAge)
  }, [points, now])

  if (!isActive || visiblePoints.length === 0) return null

  return (
    <>
      {visiblePoints.map((point, index) => {
        const age = now - point.timestamp
        const opacity = 1 - age / maxAge
        const scale = 0.5 + opacity * 0.5

        return (
          <motion.div
            key={`${point.timestamp}-${index}`}
            className="z-25 pointer-events-none fixed"
            style={{
              left: point.x,
              top: point.y,
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale, opacity }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <div className="h-2 w-2 rounded-full bg-blue-400" style={{ opacity }} />
          </motion.div>
        )
      })}
    </>
  )
}
