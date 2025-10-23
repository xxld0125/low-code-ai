'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Database } from 'lucide-react'
import { useDesignerStore } from '@/stores/designer/useDesignerStore'
import { CreateTableRequest } from '@/types/designer/table'
import { CreateDataFieldRequest } from '@/types/designer/field'
import { SUPPORTED_FIELD_TYPES } from '@/lib/designer/constants'

interface CreateTableModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
}

export function CreateTableModal({ open, onOpenChange, projectId }: CreateTableModalProps) {
  const { createTable } = useDesignerStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    table_name: '',
  })

  const [fields, setFields] = useState<CreateDataFieldRequest[]>([
    {
      name: 'id',
      field_name: 'id',
      data_type: 'text',
      is_required: true,
      default_value: undefined,
      sort_order: 0,
    },
  ])

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }))
    }

  const generateTableName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/^[0-9]/, 'table_$&')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      table_name: generateTableName(name),
    }))
  }

  const addField = () => {
    const newField: CreateDataFieldRequest = {
      name: '',
      field_name: '',
      data_type: 'text',
      is_required: false,
      default_value: undefined,
      sort_order: fields.length,
    }
    setFields([...fields, newField])
  }

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const updatedFields = fields.filter((_, i) => i !== index)
      setFields(updatedFields.map((field, i) => ({ ...field, sort_order: i })))
    }
  }

  const updateField = (index: number, updates: Partial<CreateDataFieldRequest>) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], ...updates }

    // Auto-generate field_name if name changed
    if (updates.name !== undefined) {
      const fieldName = updates.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/^_+|_+$/g, '')
      updatedFields[index].field_name = fieldName
    }

    setFields(updatedFields)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.table_name.trim()) {
      return
    }

    const validFields = fields.filter(field => field.name.trim())
    if (validFields.length === 0) {
      return
    }

    setIsLoading(true)

    try {
      const tableData: CreateTableRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        table_name: formData.table_name.trim(),
        fields: validFields,
      }

      await createTable(projectId, tableData)

      // Reset form
      setFormData({ name: '', description: '', table_name: '' })
      setFields([
        {
          name: 'id',
          field_name: 'id',
          data_type: 'text',
          is_required: true,
          default_value: undefined,
          sort_order: 0,
        },
      ])

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create table:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isValid =
    formData.name.trim() && formData.table_name.trim() && fields.some(field => field.name.trim())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create New Table
          </DialogTitle>
          <DialogDescription>
            Design a new data table with custom fields. The table will be created in your
            project&apos;s database schema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Table Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Table Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Users, Products, Orders"
                  value={formData.name}
                  onChange={handleNameChange}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table_name">Database Table Name *</Label>
                <Input
                  id="table_name"
                  placeholder="e.g., users, products, orders"
                  value={formData.table_name}
                  onChange={handleInputChange('table_name')}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this table stores and how it will be used..."
                value={formData.description}
                onChange={handleInputChange('description')}
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>

          {/* Table Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Table Fields</h3>
                <p className="text-sm text-muted-foreground">
                  Define the columns for your table. Each field represents a database column.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-12">
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor={`field-name-${index}`}>Field Name *</Label>
                        <Input
                          id={`field-name-${index}`}
                          placeholder="e.g., email, price"
                          value={field.name}
                          onChange={e => updateField(index, { name: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor={`field-type-${index}`}>Type *</Label>
                        <Select
                          value={field.data_type}
                          onValueChange={(value: 'text' | 'number' | 'date' | 'boolean') =>
                            updateField(index, { data_type: value })
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger id={`field-type-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_FIELD_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {type.label}
                                  </Badge>
                                  <span className="text-sm">{type.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor={`field-default-${index}`}>Default Value</Label>
                        <Input
                          id={`field-default-${index}`}
                          placeholder="null or specific value"
                          value={field.default_value || ''}
                          onChange={e =>
                            updateField(index, {
                              default_value: e.target.value || undefined,
                            })
                          }
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Required</Label>
                        <div className="mt-2 flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`field-required-${index}`}
                            checked={field.is_required}
                            onChange={e =>
                              updateField(index, {
                                is_required: e.target.checked,
                              })
                            }
                            disabled={isLoading || field.name === 'id'}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`field-required-${index}`} className="text-sm">
                            Must have value
                          </Label>
                        </div>
                      </div>

                      <div className="flex items-end md:col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(index)}
                          disabled={isLoading || fields.length === 1 || field.name === 'id'}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? 'Creating...' : 'Create Table'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
