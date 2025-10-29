/**
 * Textarea组件预览
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'

export const TextareaPreview: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <div
      className="flex h-16 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-white p-2 hover:border-blue-300 hover:bg-blue-50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex items-center space-x-2">
        <div className="h-8 w-16 rounded border border-gray-300 bg-gray-50 p-1">
          <div className="space-y-1">
            <div className="h-1 w-full rounded bg-gray-200"></div>
            <div className="h-1 w-3/4 rounded bg-gray-200"></div>
          </div>
        </div>
        <span className="text-sm text-gray-600">文本域</span>
      </div>
    </div>
  )
}
