'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Database, Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateTableModal } from './modals/CreateTableModal'
import { useDesignerStore } from '@/stores/designer/useDesignerStore'
import { DataTable } from '@/types/designer/table'
import { TABLE_STATUS_INFO } from '@/lib/designer/constants'

interface ComponentPanelProps {
  projectId: string
  onTableSelect?: (table: DataTable) => void
  selectedTableId?: string
}

export function ComponentPanel({ projectId, onTableSelect, selectedTableId }: ComponentPanelProps) {
  const { tables, deleteTable, deployTable, isLoading } = useDesignerStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTables = tables.filter(
    table =>
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.table_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTableClick = (table: DataTable) => {
    onTableSelect?.(table)
  }

  const handleDeployTable = async (table: DataTable) => {
    try {
      await deployTable(projectId, table.id)
    } catch (error) {
      console.error('Failed to deploy table:', error)
    }
  }

  const handleDeleteTable = async (table: DataTable) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${table.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteTable(projectId, table.id)
      } catch (error) {
        console.error('Failed to delete table:', error)
      }
    }
  }

  const getStatusBadge = (status: DataTable['status']) => {
    const statusInfo = TABLE_STATUS_INFO[status]
    return (
      <Badge
        variant={status === 'active' ? 'default' : status === 'draft' ? 'secondary' : 'outline'}
        className="text-xs"
      >
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tables</h2>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            New Table
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table List */}
      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-2">
          {filteredTables.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  {tables.length === 0 ? 'No Tables Yet' : 'No Matching Tables'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tables.length === 0
                    ? 'Create your first data table to get started with building your application.'
                    : "Try adjusting your search terms to find the table you're looking for."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTables.map(table => (
              <Card
                key={table.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedTableId === table.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleTableClick(table)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <Database className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <CardTitle className="truncate text-sm">{table.name}</CardTitle>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {table.table_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {getStatusBadge(table.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation()
                              handleTableClick(table)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation()
                              handleTableClick(table)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Table
                          </DropdownMenuItem>
                          {table.status === 'draft' && (
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation()
                                handleDeployTable(table)
                              }}
                            >
                              <Database className="mr-2 h-4 w-4" />
                              Deploy to Database
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation()
                              handleDeleteTable(table)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Table
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                {table.description && (
                  <CardContent className="pt-0">
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {table.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create Table Modal */}
      <CreateTableModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        projectId={projectId}
      />
    </div>
  )
}
