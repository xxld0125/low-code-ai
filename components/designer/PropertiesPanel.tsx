'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Settings,
  Edit,
  Trash2,
  Database,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  Plus,
} from 'lucide-react'
import { FieldConfigModal } from './modals/FieldConfigModal'
import type { DataField, DataTableWithFields } from '@/types/designer'
import { FIELD_TYPE_INFO } from '@/lib/designer/constants'

interface PropertiesPanelProps {
  selectedTable?: DataTableWithFields | null
  selectedField?: DataField | null
  projectId: string
  onFieldUpdate?: (field: DataField) => void
  onFieldDelete?: (fieldId: string) => void
  onAddField?: () => void
  onReorderFields?: (fieldIds: string[]) => void
}

export function PropertiesPanel({
  selectedTable,
  selectedField,
  projectId,
  onFieldUpdate,
  onFieldDelete,
  onAddField,
  onReorderFields, // eslint-disable-line @typescript-eslint/no-unused-vars
}: PropertiesPanelProps) {
  const [fieldConfigModalOpen, setFieldConfigModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<DataField | undefined>()

  const handleEditField = (field: DataField) => {
    setEditingField(field)
    setFieldConfigModalOpen(true)
  }

  const handleFieldSave = (field: DataField) => {
    onFieldUpdate?.(field)
    setEditingField(undefined)
    setFieldConfigModalOpen(false)
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
        return <Database className="h-4 w-4" />
    }
  }

  const getFieldTypeColor = (type: string) => {
    const info = FIELD_TYPE_INFO[type as keyof typeof FIELD_TYPE_INFO]
    return info?.color || 'gray'
  }

  const renderTableProperties = () => {
    if (!selectedTable) return null

    return (
      <div className="space-y-6">
        {/* Table Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Database className="h-4 w-4" />
              Table Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Name</Label>
              <p className="text-sm font-medium">{selectedTable.name}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Database Name</Label>
              <p className="rounded bg-muted px-2 py-1 font-mono text-sm">
                {selectedTable.table_name}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Badge variant={selectedTable.status === 'active' ? 'default' : 'secondary'}>
                {selectedTable.status}
              </Badge>
            </div>
            {selectedTable.description && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                <p className="text-sm text-muted-foreground">{selectedTable.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fields List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Fields</CardTitle>
              <Button size="sm" variant="outline" onClick={onAddField} className="h-7">
                <Plus className="mr-1 h-3 w-3" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedTable.fields?.map(field => (
                <div
                  key={field.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                    selectedField?.id === field.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => {}}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div className={`mt-0.5 text-${getFieldTypeColor(field.data_type)}-600`}>
                        {getFieldTypeIcon(field.data_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{field.name}</p>
                          {field.is_required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {field.field_name}
                          </code>
                          <Badge variant="secondary" className="text-xs">
                            {field.data_type}
                          </Badge>
                        </div>
                        {field.default_value && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Default:{' '}
                            <code className="rounded bg-muted px-1 py-0.5">
                              {field.default_value}
                            </code>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={e => {
                          e.stopPropagation()
                          handleEditField(field)
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={e => {
                          e.stopPropagation()
                          onFieldDelete?.(field.id)
                        }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderFieldProperties = () => {
    if (!selectedField) return null

    const info = FIELD_TYPE_INFO[selectedField.data_type]

    return (
      <div className="space-y-6">
        {/* Field Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              {getFieldTypeIcon(selectedField.data_type)}
              Field Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Display Name</Label>
              <p className="text-sm font-medium">{selectedField.name}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Field Name</Label>
              <p className="rounded bg-muted px-2 py-1 font-mono text-sm">
                {selectedField.field_name}
              </p>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Data Type</Label>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">{info.label}</Badge>
                <span className="text-xs text-muted-foreground">{info.description}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-muted-foreground">Required</Label>
              <Switch checked={selectedField.is_required} disabled />
              <span className="text-xs text-muted-foreground">
                {selectedField.is_required ? 'Yes' : 'No'}
              </span>
            </div>
            {selectedField.default_value && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Default Value</Label>
                <p className="rounded bg-muted px-2 py-1 font-mono text-sm">
                  {selectedField.default_value}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Field Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(selectedField.field_config).length > 0 ? (
                Object.entries(selectedField.field_config).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{key.replace(/_/g, ' ')}</Label>
                    <code className="rounded bg-muted px-2 py-1 text-xs">{String(value)}</code>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No additional configuration for this field type.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" onClick={() => handleEditField(selectedField)} className="w-full">
              <Edit className="mr-2 h-4 w-4" />
              Edit Field
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onFieldDelete?.(selectedField.id)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Field
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderEmptyState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">No Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Select a table or field to view and edit its properties.
        </p>
      </CardContent>
    </Card>
  )

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Properties</h2>
          </div>
        </div>

        {/* Properties Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedTable
            ? renderTableProperties()
            : selectedField
              ? renderFieldProperties()
              : renderEmptyState()}
        </div>
      </div>

      {/* Field Configuration Modal */}
      <FieldConfigModal
        open={fieldConfigModalOpen}
        onOpenChange={setFieldConfigModalOpen}
        projectId={projectId}
        tableId={selectedTable?.id || ''}
        field={editingField}
        onSave={handleFieldSave}
      />
    </>
  )
}
