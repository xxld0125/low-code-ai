'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, GripVertical, Plus, Settings, Eye, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { DataTableWithFields } from '@/types/designer/table'
import { DataField } from '@/types/designer/field'

interface DraggableTableProps {
  table: DataTableWithFields
  position: { x: number; y: number }
  isSelected: boolean
  isDragging?: boolean
  onPositionChange: (tableId: string, position: { x: number; y: number }) => void
  onSelect: (table: DataTableWithFields) => void
  onFieldSelect?: (field: DataField) => void
  onEditTable?: (table: DataTableWithFields) => void
  onDeleteTable?: (table: DataTableWithFields) => void
  onAddField?: (table: DataTableWithFields) => void
  onDeployTable?: (table: DataTableWithFields) => void
  onRelationshipCreate?: (sourceTable: DataTableWithFields, field: DataField) => void
  selectedFieldId?: string
  disabled?: boolean
}

interface FieldWithActionsProps {
  field: DataField
  table: DataTableWithFields
  isSelected: boolean
  onSelect: (field: DataField) => void
  onRelationshipCreate?: (table: DataTableWithFields, field: DataField) => void
}

function FieldWithActions({
  field,
  table,
  isSelected,
  onSelect,
  onRelationshipCreate,
}: FieldWithActionsProps) {
  return (
    <div
      className={cn(
        'group flex items-center justify-between rounded-md p-2 text-sm transition-colors',
        'cursor-pointer hover:bg-accent/50',
        isSelected && 'border border-accent-foreground/20 bg-accent/70'
      )}
      onClick={() => onSelect(field)}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            'h-2 w-2 flex-shrink-0 rounded-full',
            field.is_required ? 'bg-orange-400' : 'bg-blue-400'
          )}
        />
        <span className="truncate font-medium">{field.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground">
          {field.data_type}
        </span>

        {/* Relationship drag handle */}
        {onRelationshipCreate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={e => {
              e.stopPropagation()
              onRelationshipCreate(table, field)
            }}
            title="拖拽到其他表创建关系"
          >
            <Database className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function DraggableTable({
  table,
  position,
  isSelected,
  isDragging = false,
  onPositionChange, // Used by @dnd-kit drag end event in parent component
  onSelect,
  onFieldSelect,
  onEditTable,
  onDeleteTable,
  onAddField,
  onDeployTable,
  onRelationshipCreate,
  selectedFieldId,
  disabled = false,
}: DraggableTableProps) {
  // Don't allow table operations while dragging
  const isTableDisabled = disabled || isDragging

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggableDragging,
  } = useDraggable({
    id: `table-${table.id}`,
    data: {
      tableId: table.id,
      table,
      type: 'table',
    },
    disabled: isTableDisabled,
  })

  const tableRef = useRef<HTMLDivElement>(null)

  // Calculate final position with transform
  const finalPosition = {
    x: position.x + (transform?.x || 0),
    y: position.y + (transform?.y || 0),
  }

  const handleTableClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest('.table-header') ||
      (e.target as HTMLElement).closest('.table-footer')
    ) {
      e.stopPropagation()
      onSelect(table)
    }
  }

  const handleFieldSelect = (field: DataField) => {
    onFieldSelect?.(field)
  }

  const handleRelationshipCreate = (sourceTable: DataTableWithFields, field: DataField) => {
    onRelationshipCreate?.(sourceTable, field)
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute',
        'transition-shadow duration-200',
        isDraggableDragging && 'z-50',
        isTableDisabled && 'pointer-events-none opacity-50'
      )}
      style={{
        left: `${finalPosition.x}px`,
        top: `${finalPosition.y}px`,
        width: '280px',
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
      {...attributes}
    >
      <Card
        ref={tableRef}
        className={cn(
          'cursor-move shadow-md transition-all duration-200 hover:shadow-lg',
          'border-2',
          isSelected
            ? 'border-primary ring-2 ring-primary/20'
            : 'border-border hover:border-accent-foreground/50',
          isDraggableDragging && 'opacity-90 shadow-xl'
        )}
        onClick={handleTableClick}
      >
        {/* Table Header with Drag Handle */}
        <CardHeader
          className="table-header cursor-move pb-3"
          onMouseDown={listeners?.onMouseDown as React.MouseEventHandler<HTMLDivElement>}
          onTouchStart={listeners?.onTouchStart as React.TouchEventHandler<HTMLDivElement>}
        >
          <div className="flex items-start justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold leading-tight">{table.name}</h3>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {table.table_name}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-1">
              <Badge
                variant={table.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {table.status}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={e => e.stopPropagation()}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation()
                      onSelect(table)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    查看详情
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation()
                      onEditTable?.(table)
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    编辑表
                  </DropdownMenuItem>
                  {table.status === 'draft' && (
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation()
                        onDeployTable?.(table)
                      }}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      部署到数据库
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={e => {
                      e.stopPropagation()
                      onDeleteTable?.(table)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除表
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Table Fields */}
        <CardContent className="px-3 pb-3 pt-0">
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {table.fields?.length > 0 ? (
              table.fields.map(field => (
                <FieldWithActions
                  key={field.id}
                  field={field}
                  table={table}
                  isSelected={selectedFieldId === field.id}
                  onSelect={handleFieldSelect}
                  onRelationshipCreate={handleRelationshipCreate}
                />
              ))
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                <Database className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">暂无字段</p>
                <p className="mt-1 text-xs">点击下方按钮添加字段</p>
              </div>
            )}
          </div>

          {/* Add Field Button */}
          {onAddField && (
            <div className="mt-3 border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={e => {
                  e.stopPropagation()
                  onAddField(table)
                }}
              >
                <Plus className="h-3 w-3" />
                添加字段
              </Button>
            </div>
          )}
        </CardContent>

        {/* Table Footer */}
        <div className="table-footer border-t border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{table.fields?.length || 0} 个字段</span>
            <span>
              {(table.relationships?.outgoing?.length || 0) +
                (table.relationships?.incoming?.length || 0)}{' '}
              个关系
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
