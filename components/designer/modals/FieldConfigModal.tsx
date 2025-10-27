'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Settings, Save, X } from 'lucide-react'
import type {
  DataField,
  UpdateDataFieldRequest,
  FieldConfig,
  DataFieldType,
} from '@/types/designer/field'
import { SUPPORTED_FIELD_TYPES, FIELD_TYPE_INFO } from '@/lib/designer/constants'
import { api } from '@/lib/designer/api'
import { validateDataField } from '@/lib/designer/validation'

interface FieldConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  tableId: string
  field?: DataField
  onSave?: (field: DataField) => void
}

export function FieldConfigModal({
  open,
  onOpenChange,
  projectId,
  tableId,
  field,
  onSave,
}: FieldConfigModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    field_name: '',
    data_type: 'text' as DataFieldType,
    is_required: false,
    default_value: '',
    field_config: {} as FieldConfig,
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Initialize form data when field changes
  useEffect(() => {
    if (field) {
      setFormData({
        name: field.name,
        field_name: field.field_name,
        data_type: field.data_type,
        is_required: field.is_required,
        default_value: field.default_value || '',
        field_config: { ...field.field_config },
      })
    } else {
      // Reset form for new field
      setFormData({
        name: '',
        field_name: '',
        data_type: 'text',
        is_required: false,
        default_value: '',
        field_config: { ...FIELD_TYPE_INFO.text.defaultConfig },
      })
    }
    setValidationErrors([])
  }, [field, open])

  const generateFieldName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/^[0-9]/, 'field_$&')
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      // Auto-generate field_name if name changed
      if (field === 'name' && typeof value === 'string') {
        newData.field_name = generateFieldName(value)
      }

      // Update field_config when data_type changes
      if (field === 'data_type' && typeof value === 'string') {
        newData.field_config = {
          ...FIELD_TYPE_INFO[value as keyof typeof FIELD_TYPE_INFO].defaultConfig,
        }
      }

      return newData
    })
    setValidationErrors([])
  }

  const handleFieldConfigChange = (configField: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      field_config: {
        ...prev.field_config,
        [configField]: value,
      },
    }))
    setValidationErrors([])
  }

  const validateForm = (): boolean => {
    const validationResult = validateDataField(formData)

    if (!validationResult.success) {
      setValidationErrors(validationResult.error.issues.map(e => e.message))
      return false
    }

    setValidationErrors([])
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const updateData: UpdateDataFieldRequest = {
        name: formData.name.trim(),
        field_name: formData.field_name.trim(),
        data_type: formData.data_type,
        is_required: formData.is_required,
        default_value: formData.default_value.trim() || undefined,
        field_config: formData.field_config,
      }

      let updatedField: DataField

      if (field) {
        // Update existing field
        const response = await api.fields.update(projectId, tableId, field.id, updateData)
        updatedField = response.data
      } else {
        // Create new field (not supported in this modal, but keeping the logic)
        throw new Error('Creating new fields should be done through the table modal')
      }

      onSave?.(updatedField)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save field:', error)
      setValidationErrors([error instanceof Error ? error.message : 'An unexpected error occurred'])
    } finally {
      setIsLoading(false)
    }
  }

  const isValid =
    formData.name.trim() && formData.field_name.trim() && validationErrors.length === 0

  const renderFieldConfigForm = () => {
    const { data_type, field_config } = formData

    switch (data_type) {
      case 'text':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Text Field Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_length">Maximum Length</Label>
                  <Input
                    id="max_length"
                    type="number"
                    min="1"
                    max="65535"
                    value={field_config.max_length || ''}
                    onChange={e =>
                      handleFieldConfigChange('max_length', parseInt(e.target.value) || 255)
                    }
                    placeholder="255"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of characters allowed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_length">Minimum Length</Label>
                  <Input
                    id="min_length"
                    type="number"
                    min="0"
                    max={field_config.max_length || 255}
                    value={field_config.min_length || ''}
                    onChange={e =>
                      handleFieldConfigChange('min_length', parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum number of characters required
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pattern">Validation Pattern</Label>
                <Input
                  id="pattern"
                  value={field_config.pattern || ''}
                  onChange={e => handleFieldConfigChange('pattern', e.target.value)}
                  placeholder="e.g., email format, phone number pattern"
                />
                <p className="text-xs text-muted-foreground">
                  Regular expression pattern for validation (optional)
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 'number':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Number Field Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="precision">Precision</Label>
                  <Input
                    id="precision"
                    type="number"
                    min="1"
                    max="65"
                    value={field_config.precision || ''}
                    onChange={e =>
                      handleFieldConfigChange('precision', parseInt(e.target.value) || 10)
                    }
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">Total number of digits</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scale">Scale</Label>
                  <Input
                    id="scale"
                    type="number"
                    min="0"
                    max={field_config.precision || 10}
                    value={field_config.scale || ''}
                    onChange={e => handleFieldConfigChange('scale', parseInt(e.target.value) || 2)}
                    placeholder="2"
                  />
                  <p className="text-xs text-muted-foreground">Number of decimal places</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min_value">Minimum Value</Label>
                  <Input
                    id="min_value"
                    type="number"
                    value={field_config.min_value || ''}
                    onChange={e =>
                      handleFieldConfigChange('min_value', parseFloat(e.target.value) || 0)
                    }
                    placeholder="No minimum"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_value">Maximum Value</Label>
                  <Input
                    id="max_value"
                    type="number"
                    value={field_config.max_value || ''}
                    onChange={e =>
                      handleFieldConfigChange('max_value', parseFloat(e.target.value) || 0)
                    }
                    placeholder="No maximum"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'date':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Date Field Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Date Format</Label>
                <Select
                  value={field_config.format || 'YYYY-MM-DD'}
                  onValueChange={value => handleFieldConfigChange('format', value)}
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (Date)</SelectItem>
                    <SelectItem value="YYYY-MM-DD HH:mm:ss">
                      YYYY-MM-DD HH:mm:ss (Timestamp)
                    </SelectItem>
                    <SelectItem value="HH:mm:ss">HH:mm:ss (Time)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Format for date storage and display</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="default_now"
                  checked={field_config.default_now || false}
                  onCheckedChange={checked => handleFieldConfigChange('default_now', checked)}
                />
                <Label htmlFor="default_now">Default to current timestamp</Label>
              </div>
            </CardContent>
          </Card>
        )

      case 'boolean':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Boolean Field Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Boolean fields store true/false values. No additional configuration is needed.
              </p>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {field ? 'Configure Field' : 'Add New Field'}
          </DialogTitle>
          <DialogDescription>
            Configure field properties, validation rules, and default values.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Field Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Email, Price, Created At"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_name">Database Field Name *</Label>
                <Input
                  id="field_name"
                  placeholder="e.g., email, price, created_at"
                  value={formData.field_name}
                  onChange={e => handleInputChange('field_name', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_type">Data Type *</Label>
              <Select
                value={formData.data_type}
                onValueChange={(value: 'text' | 'number' | 'date' | 'boolean') =>
                  handleInputChange('data_type', value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="data_type">
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

            <div className="space-y-2">
              <Label htmlFor="default_value">Default Value</Label>
              <Input
                id="default_value"
                placeholder="Default value (optional)"
                value={formData.default_value}
                onChange={e => handleInputChange('default_value', e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Database default value. Use SQL syntax like: CURRENT_TIMESTAMP, true, false, 0
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={checked => handleInputChange('is_required', checked)}
                disabled={isLoading}
              />
              <Label htmlFor="is_required">Required field (NOT NULL)</Label>
            </div>
          </div>

          <Separator />

          {/* Field Type Specific Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Field Configuration</h3>
            {renderFieldConfigForm()}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">
                      • {error}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
