/**
 * Text预览组件（从现有PageTextPreview迁移）
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import React from 'react'

export const TextPreview: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <div
      className="flex h-12 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-gray-50 p-2 hover:border-blue-300 hover:bg-blue-50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium text-gray-700">文本</span>
        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
      </div>
    </div>
  )
}
