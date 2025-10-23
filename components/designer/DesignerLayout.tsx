'use client'

import { useState } from 'react'
import { ComponentPanel } from './ComponentPanel'
import { Canvas } from './Canvas'
import { PropertiesPanel } from './PropertiesPanel'
import { ErrorDisplay } from './ErrorDisplay'
import { useDesignerStore } from '@/stores/designer/useDesignerStore'
import { DataTableWithFields } from '@/types/designer/table'
import { cn } from '@/lib/utils'

interface DesignerLayoutProps {
  projectId: string
}

export function DesignerLayout({ projectId }: DesignerLayoutProps) {
  const [selectedTable, setSelectedTable] = useState<DataTableWithFields | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState({
    left: false,
    right: false,
  })

  const { error, clearError } = useDesignerStore()

  const handleTableSelect = (table: DataTableWithFields) => {
    setSelectedTable(table)
  }

  const toggleSidebar = (side: 'left' | 'right') => {
    setSidebarCollapsed(prev => ({
      ...prev,
      [side]: !prev[side],
    }))
  }

  const leftPanelWidth = sidebarCollapsed.left ? 'w-12' : 'w-80'
  const rightPanelWidth = sidebarCollapsed.right ? 'w-12' : 'w-96'

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Component List */}
      <div
        className={cn(
          'relative border-r border-border bg-card transition-all duration-300 ease-in-out',
          leftPanelWidth
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => toggleSidebar('left')}
          className="absolute right-2 top-4 z-10 rounded-md bg-muted p-1.5 transition-colors hover:bg-muted/80"
          title={sidebarCollapsed.left ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn(
              'h-4 w-4 transition-transform',
              sidebarCollapsed.left ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className={cn('h-full overflow-hidden', !sidebarCollapsed.left && 'px-4')}>
          <ComponentPanel
            projectId={projectId}
            onTableSelect={handleTableSelect}
            selectedTableId={selectedTable?.id}
          />
        </div>
      </div>

      {/* Middle Panel - Canvas */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Data Model Designer</h1>
            {selectedTable && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Selected:</span>
                <span className="font-medium text-foreground">{selectedTable.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Canvas controls will go here */}
            <div className="text-sm text-muted-foreground">
              {projectId ? `Project: ${projectId.slice(0, 8)}...` : 'No project selected'}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Error Display */}
          <div className="p-4 pb-0">
            <ErrorDisplay error={error} onDismiss={clearError} title="Designer Error" />
          </div>

          <div className="flex-1">
            <Canvas onTableSelect={handleTableSelect} />
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div
        className={cn(
          'relative border-l border-border bg-card transition-all duration-300 ease-in-out',
          rightPanelWidth
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => toggleSidebar('right')}
          className="absolute left-2 top-4 z-10 rounded-md bg-muted p-1.5 transition-colors hover:bg-muted/80"
          title={sidebarCollapsed.right ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={cn(
              'h-4 w-4 transition-transform',
              sidebarCollapsed.right ? 'rotate-0' : 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className={cn('h-full overflow-hidden', !sidebarCollapsed.right && 'px-4')}>
          <PropertiesPanel
            projectId={projectId}
            selectedTable={selectedTable}
            onFieldUpdate={() => {}}
            onFieldDelete={() => {}}
            onAddField={() => {}}
          />
        </div>
      </div>
    </div>
  )
}
