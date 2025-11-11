'use client'

import React from 'react'

interface ErrorStateProps {
  error: string
  pageDesignId: string
}

export function ErrorState({ error, pageDesignId }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-red-600">加载失败</h1>
        <p className="mb-4 text-gray-600">{error}</p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            重新加载
          </button>
          <a
            href={`/protected/designer/page/${pageDesignId}`}
            className="inline-block rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            返回编辑
          </a>
        </div>
      </div>
    </div>
  )
}