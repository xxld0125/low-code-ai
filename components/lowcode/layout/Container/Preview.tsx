/**
 * Container预览组件（从现有PageContainerPreview迁移）
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import React from 'react'

export const ContainerPreview: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <div
      className="flex h-20 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-white p-2 hover:border-blue-300 hover:bg-blue-50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="h-2 w-16 rounded bg-gray-300"></div>
        <div className="h-2 w-12 rounded bg-gray-400"></div>
        <div className="h-2 w-14 rounded bg-gray-300"></div>
      </div>
    </div>
  )
}
