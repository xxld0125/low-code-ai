'use client'

import { useState, useEffect } from 'react'
import { ComponentPanel } from './ComponentPanel'
import { Canvas } from './Canvas'
import { PropertiesPanel } from './PropertiesPanel'
import { ErrorDisplay } from './ErrorDisplay'
import { ErrorBoundary } from './ErrorBoundary'
import { LoadingOverlay, useLoadingStates } from './LoadingStates'
import { useDesignerStore } from '@/stores/designer/useDesignerStore'
import { DataTableWithFields } from '@/types/designer/table'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface DesignerLayoutProps {
  projectId: string
}

export function DesignerLayout({ projectId }: DesignerLayoutProps) {
  const [selectedTable, setSelectedTable] = useState<DataTableWithFields | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState({
    left: false,
    right: false,
  })

  const { error, clearError, isLoading: storeLoading, loadProjectData } = useDesignerStore()
  const { setLoading, isLoading } = useLoadingStates()

  // Load project data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading('initial-load', {
        type: 'data_loading',
        message: 'Loading project data...',
        showProgress: false,
      })

      try {
        await loadProjectData(projectId)
      } catch (error) {
        console.error('Failed to load project data:', error)
      } finally {
        setLoading('initial-load', false)
      }
    }

    loadInitialData()
  }, [projectId, loadProjectData, setLoading])

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
    <ErrorBoundary
      component="DesignerLayout"
      severity="high"
      showRetry={true}
      enableReporting={true}
    >
      <LoadingOverlay
        isLoading={isLoading('initial-load') || storeLoading}
        type="data_loading"
        message="Loading designer..."
        className="h-full"
      >
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
          <ErrorBoundary
            component="ComponentPanel"
            severity="medium"
            showRetry={true}
            enableReporting={true}
            fallback={
              <div className="p-4 text-center text-sm text-muted-foreground">
                Component panel unavailable
              </div>
            }
          >
            <ComponentPanel
              projectId={projectId}
              onTableSelect={handleTableSelect}
              selectedTableId={selectedTable?.id}
            />
          </ErrorBoundary>
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
            <ErrorBoundary
              component="Canvas"
              severity="high"
              showRetry={true}
              enableReporting={true}
              fallback={
                <div className="flex h-full items-center justify-center text-center">
                  <div className="space-y-2">
                    <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Canvas unavailable</p>
                  </div>
                </div>
              }
            >
              <Canvas onTableSelect={handleTableSelect} />
            </ErrorBoundary>
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
          <ErrorBoundary
            component="PropertiesPanel"
            severity="medium"
            showRetry={true}
            enableReporting={true}
            fallback={
              <div className="p-4 text-center text-sm text-muted-foreground">
                Properties panel unavailable
              </div>
            }
          >
            <PropertiesPanel
              projectId={projectId}
              selectedTable={selectedTable}
              onFieldUpdate={() => {}}
              onFieldDelete={() => {}}
              onAddField={() => {}}
            />
          </ErrorBoundary>
        </div>
      </div>
      </div>
    </LoadingOverlay>
    </ErrorBoundary>
  )
}
