'use client'

import { ComponentPanel } from './ComponentPanel'
import { Canvas } from './Canvas'
import { PropertiesPanel } from './PropertiesPanel'

interface DesignerLayoutProps {
  projectId?: string
}

export function DesignerLayout({ projectId }: DesignerLayoutProps) {
  // Use projectId for potential future data loading or routing
  console.debug('DesignerLayout mounted for project:', projectId)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Component List */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <ComponentPanel />
      </div>

      {/* Middle Panel - Canvas */}
      <div className="flex-1">
        <Canvas />
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 border-l border-gray-200 bg-white">
        <PropertiesPanel />
      </div>
    </div>
  )
}
