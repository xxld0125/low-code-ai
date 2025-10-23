'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Plus } from 'lucide-react'

export function Canvas() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Data Model Designer</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">Save</Button>
            <Button>Deploy</Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-8">
        <div className="flex h-full items-center justify-center">
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <Database className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <CardTitle>Welcome to Data Model Designer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-gray-600">
                Create database tables visually by defining fields, relationships, and constraints.
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Table
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
