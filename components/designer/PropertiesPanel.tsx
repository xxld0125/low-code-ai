'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export function PropertiesPanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        </div>
      </div>

      {/* Properties Content */}
      <div className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">No Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Select a table or field to view and edit its properties.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
