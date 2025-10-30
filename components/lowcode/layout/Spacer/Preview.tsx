import React from 'react'
import { cn } from '@/lib/utils'

interface SpacerPreviewProps {
  onClick?: () => void
}

export const SpacerPreview: React.FC<SpacerPreviewProps> = ({ onClick }) => {
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
      <div className="flex w-full flex-col items-center justify-center gap-3">
        {/* 垂直间距预览 */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-8 rounded bg-gray-300"></div>
          <div className="h-1 w-1 rounded-full bg-blue-500"></div>
          <div className="h-2 w-12 rounded bg-gray-400"></div>
          <div className="h-1 w-1 rounded-full bg-blue-500"></div>
          <div className="h-2 w-6 rounded bg-gray-300"></div>
        </div>

        {/* 水平间距预览 */}
        <div className="flex items-center gap-1">
          <div className="h-2 w-6 rounded bg-gray-400"></div>
          <div className="flex w-4 justify-center">
            <div className="h-1 w-1 rounded-full bg-blue-500"></div>
          </div>
          <div className="h-2 w-8 rounded bg-gray-300"></div>
          <div className="flex w-4 justify-center">
            <div className="h-1 w-1 rounded-full bg-blue-500"></div>
          </div>
          <div className="h-2 w-4 rounded bg-gray-400"></div>
        </div>

        {/* 标签 */}
        <span className="text-xs text-gray-500">间距</span>
      </div>
    </div>
  )
}

export default SpacerPreview