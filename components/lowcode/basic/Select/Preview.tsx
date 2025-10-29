/**
 * Select组件预览
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'

export const SelectPreview: React.FC<{
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
        <div className="h-8 w-16 rounded border border-gray-300 bg-gray-50 px-2 py-1">
          <div className="h-3 w-8 rounded bg-gray-200"></div>
        </div>
        <span className="text-sm text-gray-600">选择框</span>
      </div>
    </div>
  )
}
