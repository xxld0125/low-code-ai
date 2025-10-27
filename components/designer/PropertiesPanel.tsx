'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
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
  Lock,
  Unlock,
  Clock,
  User,
  GitBranch,
  Eye,
  Save,
  X,
} from 'lucide-react'
import { FieldConfigModal } from './modals/FieldConfigModal'
import { useTableLock } from '@/hooks/designer/useTableLock'
import { useConflictDetection, NotificationType } from '@/lib/designer/conflict-detection'
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
  onTableUpdate?: (table: DataTableWithFields) => void
  onTableDelete?: (tableId: string) => void
  onDeployTable?: (tableId: string) => void
}

export function PropertiesPanel({
  selectedTable,
  selectedField,
  projectId,
  onFieldUpdate,
  onFieldDelete,
  onAddField,
  onReorderFields, // eslint-disable-line @typescript-eslint/no-unused-vars
  onTableUpdate,
  onTableDelete,
  onDeployTable,
}: PropertiesPanelProps) {
  // State
  const [fieldConfigModalOpen, setFieldConfigModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<DataField | undefined>()
  const [isEditingTable, setIsEditingTable] = useState(false)
  const [editedTable, setEditedTable] = useState<DataTableWithFields | null>(null)

  // Hooks
  const tableLock = useTableLock(selectedTable?.id || '', {
    autoRenewMinutes: 5,
    confirmActions: true,
    defaultDuration: 30,
    autoCleanup: true,
  })

  const { detectTableConflicts, createNotification } = useConflictDetection(projectId)

  // Update edited table when selection changes
  useEffect(() => {
    if (selectedTable) {
      setEditedTable({ ...selectedTable })
      setIsEditingTable(false)
    } else {
      setEditedTable(null)
      setIsEditingTable(false)
    }
  }, [selectedTable])

  // Check for conflicts when switching between items
  useEffect(() => {
    if (selectedTable) {
      detectTableConflicts(selectedTable.id, 'update').then(result => {
        if (result.conflicts.length > 0) {
          result.conflicts.forEach(conflict => {
            createNotification(NotificationType.WARNING, conflict.title, conflict.description, {
              persistent: conflict.severity === 'critical',
              actions: [
                {
                  label: 'View Details',
                  action: async () => console.log('View conflict details:', conflict),
                  variant: 'primary',
                },
              ],
            })
          })
        }
      })
    }
  }, [selectedTable, detectTableConflicts, createNotification])

  const handleEditField = (field: DataField) => {
    setEditingField(field)
    setFieldConfigModalOpen(true)
  }

  const handleFieldSave = (field: DataField) => {
    onFieldUpdate?.(field)
    setEditingField(undefined)
    setFieldConfigModalOpen(false)
  }

  // Table editing handlers
  const handleStartEditTable = () => {
    if (!tableLock.canEdit && selectedTable) {
      createNotification(
        NotificationType.ERROR,
        'Table Locked',
        'Cannot edit table - it is locked by another user'
      )
      return
    }

    if (!isEditingTable && selectedTable) {
      // Acquire lock before editing
      tableLock
        .acquireLock({
          lock_type: 'optimistic',
          reason: 'Editing table properties',
        })
        .then(success => {
          if (success) {
            setIsEditingTable(true)
          }
        })
    }
  }

  const handleSaveTableEdit = () => {
    if (editedTable && onTableUpdate) {
      onTableUpdate(editedTable)
      setIsEditingTable(false)

      // Release lock after saving
      if (tableLock.currentLock) {
        tableLock.releaseLock()
      }
    }
  }

  const handleCancelTableEdit = () => {
    if (selectedTable) {
      setEditedTable({ ...selectedTable })
      setIsEditingTable(false)

      // Release lock if we have one
      if (tableLock.currentLock) {
        tableLock.releaseLock()
      }
    }
  }

  const handleDeployTable = () => {
    if (selectedTable && onDeployTable) {
      onDeployTable(selectedTable.id)
    }
  }

  const handleDeleteTable = () => {
    if (selectedTable && onTableDelete) {
      if (
        window.confirm(
          `Are you sure you want to delete the table "${selectedTable.name}"? This action cannot be undone.`
        )
      ) {
        onTableDelete(selectedTable.id)
      }
    }
  }

  // Lock status component
  const renderLockStatus = () => {
    if (!selectedTable) return null

    const isLocked = tableLock.currentLock !== null
    const isLockedByCurrentUser = tableLock.isLockedByCurrentUser
    const timeRemaining = tableLock.timeRemaining

    if (!isLocked) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Unlock className="h-4 w-4" />
          <span>Table is unlocked</span>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <div
          className={`flex items-center gap-2 text-sm ${
            isLockedByCurrentUser ? 'text-blue-600' : 'text-orange-600'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Locked by {isLockedByCurrentUser ? 'you' : tableLock.getLockOwner()}</span>
        </div>

        {timeRemaining !== null && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeRemaining} minutes remaining</span>
          </div>
        )}

        {isLockedByCurrentUser && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => tableLock.extendLock(30)}
              disabled={tableLock.isLoading}
              className="h-7 px-2 text-xs"
            >
              Extend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => tableLock.releaseLock()}
              disabled={tableLock.isLoading}
              className="h-7 px-2 text-xs"
            >
              Release
            </Button>
          </div>
        )}
      </div>
    )
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
    if (!selectedTable || !editedTable) return null

    return (
      <div className="space-y-6">
        {/* Table Lock Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4" />
              Collaboration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderLockStatus()}

            {/* Show active users */}
            {tableLock.activeLocks.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Active Collaborators
                </Label>
                <div className="space-y-1">
                  {tableLock.activeLocks.map(lock => (
                    <div key={lock.id} className="flex items-center gap-2 text-xs">
                      <User className="h-3 w-3" />
                      <span>
                        {String(
                          lock.user?.user_metadata?.name || lock.user?.email || 'Unknown user'
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {lock.lock_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4" />
                Table Properties
              </CardTitle>
              {!isEditingTable ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartEditTable}
                  disabled={!tableLock.canEdit}
                  className="h-7"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelTableEdit}
                    className="h-7"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" onClick={handleSaveTableEdit} className="h-7">
                    <Save className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Name</Label>
              {isEditingTable ? (
                <Input
                  value={editedTable.name}
                  onChange={e => setEditedTable({ ...editedTable, name: e.target.value })}
                  className="mt-1 h-8"
                  placeholder="Table name"
                />
              ) : (
                <p className="text-sm font-medium">{selectedTable.name}</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Database Name</Label>
              {isEditingTable ? (
                <Input
                  value={editedTable.table_name}
                  onChange={e => setEditedTable({ ...editedTable, table_name: e.target.value })}
                  className="mt-1 h-8 font-mono text-sm"
                  placeholder="table_name"
                />
              ) : (
                <p className="rounded bg-muted px-2 py-1 font-mono text-sm">
                  {selectedTable.table_name}
                </p>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Status</Label>
              <Badge variant={selectedTable.status === 'active' ? 'default' : 'secondary'}>
                {selectedTable.status}
              </Badge>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Description</Label>
              {isEditingTable ? (
                <Textarea
                  value={editedTable.description || ''}
                  onChange={e => setEditedTable({ ...editedTable, description: e.target.value })}
                  className="mt-1 min-h-16 resize-none"
                  placeholder="Table description (optional)"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {selectedTable.description || 'No description provided'}
                </p>
              )}
            </div>
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

        {/* Table Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Table Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              size="sm"
              onClick={handleDeployTable}
              disabled={selectedTable.status === 'active'}
              className="w-full"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              {selectedTable.status === 'active' ? 'Deployed' : 'Deploy to Database'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                createNotification(
                  NotificationType.INFO,
                  'Export Schema',
                  'Schema export functionality coming soon'
                )
              }}
              className="w-full"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Schema
            </Button>

            {onTableDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteTable}
                disabled={!tableLock.canEdit}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Table
              </Button>
            )}
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
