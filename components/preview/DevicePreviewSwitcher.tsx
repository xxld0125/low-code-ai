'use client'

import React, { useState } from 'react'

interface DevicePreviewSwitcherProps {
  initialMode?: 'desktop' | 'tablet' | 'mobile'
  onModeChange?: (mode: 'desktop' | 'tablet' | 'mobile') => void
}

export function DevicePreviewSwitcher({
  initialMode = 'desktop',
  onModeChange
}: DevicePreviewSwitcherProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>(initialMode)

  const handleModeChange = (mode: 'desktop' | 'tablet' | 'mobile') => {
    setPreviewMode(mode)
    onModeChange?.(mode)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleModeChange('desktop')}
          className={`rounded p-2 ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="桌面预览"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5z" />
          </svg>
        </button>
        <button
          onClick={() => handleModeChange('tablet')}
          className={`rounded p-2 ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="平板预览"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM3 4a4 4 0 014-4h6a4 4 0 014 4v12a4 4 0 01-4 4H7a4 4 0 01-4-4V4z" />
          </svg>
        </button>
        <button
          onClick={() => handleModeChange('mobile')}
          className={`rounded p-2 ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="手机预览"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 2a2 2 0 00-2 2v12a2 2 0 002 2h4a2 2 0 002-2V4a2 2 0 00-2-2H8zM6 4a4 4 0 014-4h4a4 4 0 014 4v12a4 4 0 01-4 4h-4a4 4 0 01-4-4V4z" />
          </svg>
        </button>
      </div>
    </div>
  )
}