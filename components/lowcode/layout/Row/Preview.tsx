/**
 * Row预览组件（从现有PageRowPreview迁移）
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import React from 'react'

export const RowPreview: React.FC<{
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
      <div className="flex gap-1">
        <div className="h-8 w-8 rounded bg-blue-300"></div>
        <div className="h-8 w-8 rounded bg-blue-400"></div>
        <div className="h-8 w-8 rounded bg-blue-300"></div>
      </div>
    </div>
  )
}
