'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Database } from 'lucide-react'

export function ComponentPanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Table
          </Button>
        </div>
      </div>

      {/* Table List */}
      <div className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Data Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              No tables created yet. Click &quot;New Table&quot; to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
