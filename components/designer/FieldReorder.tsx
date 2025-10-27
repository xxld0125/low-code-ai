'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Type, Hash, Calendar, ToggleLeft, ArrowUpDown, Save, X } from 'lucide-react'
import type { DataField } from '@/types/designer'
import { FIELD_TYPE_INFO } from '@/lib/designer/constants'

interface FieldReorderProps {
  fields: DataField[]
  onReorder: (fields: DataField[]) => void
  onSave: (orderedFields: Array<{ fieldId: string; sort_order: number }>) => Promise<void>
  onCancel: () => void
  disabled?: boolean
}

interface SortableFieldItemProps {
  field: DataField
  index: number
}

function SortableFieldItem({ field, index }: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'number':
        return <Hash className="h-4 w-4" />
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'boolean':
        return <ToggleLeft className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  const getFieldTypeColor = (type: string) => {
    const info = FIELD_TYPE_INFO[type as keyof typeof FIELD_TYPE_INFO]
    return info?.color || 'gray'
  }

  return (
    <div ref={setNodeRef} style={style} className="group">
      <Card className={`${isDragging ? 'shadow-lg' : ''} transition-colors hover:bg-muted/30`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Field Icon and Type */}
            <div className={`text-${getFieldTypeColor(field.data_type)}-600`}>
              {getFieldTypeIcon(field.data_type)}
            </div>

            {/* Field Info */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="truncate text-sm font-medium">{field.name}</p>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                {field.is_required && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{field.field_name}</code>
                <Badge variant="secondary" className="text-xs">
                  {field.data_type}
                </Badge>
              </div>
              {field.default_value && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Default:{' '}
                  <code className="rounded bg-muted px-1 py-0.5">{field.default_value}</code>
                </p>
              )}
            </div>

            {/* Sort Order Indicator */}
            <div className="rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
              Order: {field.sort_order}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DragOverlayField({ field, index }: { field: DataField; index: number }) {
  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'number':
        return <Hash className="h-4 w-4" />
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'boolean':
        return <ToggleLeft className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  return (
    <Card className="border-primary shadow-lg">
      <CardContent className="bg-primary/5 p-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle (visual only) */}
          <div className="p-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Field Icon and Type */}
          <div className="text-primary">{getFieldTypeIcon(field.data_type)}</div>

          {/* Field Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className="truncate text-sm font-medium">{field.name}</p>
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-1 py-0.5 text-xs">{field.field_name}</code>
              <Badge variant="secondary" className="text-xs">
                {field.data_type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FieldReorder({
  fields,
  onReorder,
  onSave,
  onCancel,
  disabled = false,
}: FieldReorderProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [orderedFields, setOrderedFields] = useState<DataField[]>(fields)
  const [isSaving, setIsSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (active.id !== over?.id) {
        const oldIndex = orderedFields.findIndex(field => field.id === active.id)
        const newIndex = orderedFields.findIndex(field => field.id === over?.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newFields = arrayMove(orderedFields, oldIndex, newIndex)
          // Update sort_order values
          const updatedFields = newFields.map((field, index) => ({
            ...field,
            sort_order: index,
          }))
          setOrderedFields(updatedFields)
          onReorder(updatedFields)
        }
      }

      setActiveId(null)
    },
    [orderedFields, onReorder]
  )

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const fieldOrders = orderedFields.map((field, index) => ({
        fieldId: field.id,
        sort_order: index,
      }))
      await onSave(fieldOrders)
    } catch (error) {
      console.error('Failed to save field order:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setOrderedFields(fields)
    onCancel()
  }

  const hasChanges = orderedFields.some((field, index) => {
    const originalField = fields.find(f => f.id === field.id)
    return originalField ? originalField.sort_order !== index : false
  })

  const activeField = activeId ? orderedFields.find(field => field.id === activeId) : null
  const activeIndex = activeField ? orderedFields.indexOf(activeField) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-medium">
            <ArrowUpDown className="h-5 w-5" />
            Reorder Fields
          </h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop fields to reorder them. The new order will be saved to the database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={disabled}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={disabled || !hasChanges || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </div>

      {/* Reorder Instructions */}
      {!hasChanges && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GripVertical className="h-4 w-4" />
              <span>Drag the grip handle to reorder fields</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Field List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedFields.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {orderedFields.map((field, index) => (
              <SortableFieldItem key={field.id} field={field} index={index} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeField ? <DragOverlayField field={activeField} index={activeIndex} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Changes Indicator */}
      {hasChanges && (
        <Card className="border-primary">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-primary">
                You have unsaved changes. Click &quot;Save Order&quot; to update the field
                positions.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Simple field sort component for quick reordering
export function QuickFieldSort({
  fields, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSortChange,
  disabled = false,
}: {
  fields: DataField[]
  onSortChange: (sortBy: 'name' | 'type' | 'required' | 'order', direction: 'asc' | 'desc') => void
  disabled?: boolean
}) {
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'required' | 'order'>('order')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

  const handleSortChange = (newSortBy: typeof sortBy) => {
    const newDirection = sortBy === newSortBy && direction === 'asc' ? 'desc' : 'asc'
    setSortBy(newSortBy)
    setDirection(newDirection)
    onSortChange(newSortBy, newDirection)
  }

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
    }
    return direction === 'asc' ? (
      <ArrowUpDown className="h-3 w-3 text-primary" />
    ) : (
      <ArrowUpDown className="h-3 w-3 rotate-180 transform text-primary" />
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
      <span className="text-xs font-medium text-muted-foreground">Sort by:</span>
      <Button
        variant={sortBy === 'name' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleSortChange('name')}
        disabled={disabled}
        className="h-7 px-2"
      >
        Name
        {getSortIcon('name')}
      </Button>
      <Button
        variant={sortBy === 'type' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleSortChange('type')}
        disabled={disabled}
        className="h-7 px-2"
      >
        Type
        {getSortIcon('type')}
      </Button>
      <Button
        variant={sortBy === 'required' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleSortChange('required')}
        disabled={disabled}
        className="h-7 px-2"
      >
        Required
        {getSortIcon('required')}
      </Button>
      <Button
        variant={sortBy === 'order' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => handleSortChange('order')}
        disabled={disabled}
        className="h-7 px-2"
      >
        Order
        {getSortIcon('order')}
      </Button>
    </div>
  )
}
