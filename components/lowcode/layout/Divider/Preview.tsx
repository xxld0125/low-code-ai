import React from 'react'
import { cn } from '@/lib/utils'

interface DividerPreviewProps {
  onClick?: () => void
}

export const DividerPreview: React.FC<DividerPreviewProps> = ({ onClick }) => {
  return (
    <div
      className={cn(
        'flex h-16 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <div className="flex w-full flex-col items-center gap-2">
        {/* 水平分割线预览 */}
        <div className="flex w-full items-center gap-2">
          <div className="h-px flex-1 bg-gray-300"></div>
          <span className="text-xs text-gray-500">分割线</span>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        {/* 垂直分割线预览 */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-px bg-gray-400"></div>
          <span className="text-xs text-gray-400">|</span>
        </div>
      </div>
    </div>
  )
}

export default DividerPreview