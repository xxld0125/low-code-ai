'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Type, Hash, Calendar, ToggleLeft, Info, Database } from 'lucide-react'
import type { DataFieldType } from '@/types/designer/field'
import { SUPPORTED_FIELD_TYPES, FIELD_TYPE_INFO } from '@/lib/designer/constants'

interface FieldTypeSelectorProps {
  value?: DataFieldType
  onValueChange: (value: DataFieldType) => void
  disabled?: boolean
  variant?: 'select' | 'cards' | 'radio'
  showDescription?: boolean
}

interface FieldTypeCardProps {
  type: DataFieldType
  info: (typeof FIELD_TYPE_INFO)[DataFieldType]
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

function FieldTypeCard({ type, info, isSelected, onClick }: FieldTypeCardProps) {
  // eslint-disable-line @typescript-eslint/no-unused-vars
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Type':
        return <Type className="h-6 w-6" />
      case 'Hash':
        return <Hash className="h-6 w-6" />
      case 'Calendar':
        return <Calendar className="h-6 w-6" />
      case 'ToggleLeft':
        return <ToggleLeft className="h-6 w-6" />
      default:
        return <Database className="h-6 w-6" />
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return isSelected
          ? 'border-blue-500 bg-blue-50 text-blue-900'
          : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
      case 'green':
        return isSelected
          ? 'border-green-500 bg-green-50 text-green-900'
          : 'border-green-200 hover:border-green-300 hover:bg-green-50'
      case 'purple':
        return isSelected
          ? 'border-purple-500 bg-purple-50 text-purple-900'
          : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
      case 'orange':
        return isSelected
          ? 'border-orange-500 bg-orange-50 text-orange-900'
          : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
      default:
        return isSelected
          ? 'border-gray-500 bg-gray-50 text-gray-900'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${getColorClasses(info.color)}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 ${isSelected ? 'text-current' : 'text-muted-foreground'}`}>
            {getIcon(info.icon)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{info.label}</h3>
              {isSelected && (
                <Badge variant="secondary" className="text-xs">
                  Selected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{info.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function FieldTypeRadio({
  value,
  onValueChange,
  disabled,
}: Pick<FieldTypeSelectorProps, 'value' | 'onValueChange' | 'disabled'>) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className="space-y-3"
    >
      {SUPPORTED_FIELD_TYPES.map(typeInfo => {
        const info = FIELD_TYPE_INFO[typeInfo.value]
        const getIcon = (iconName: string) => {
          switch (iconName) {
            case 'Type':
              return <Type className="h-4 w-4" />
            case 'Hash':
              return <Hash className="h-4 w-4" />
            case 'Calendar':
              return <Calendar className="h-4 w-4" />
            case 'ToggleLeft':
              return <ToggleLeft className="h-4 w-4" />
            default:
              return <Database className="h-4 w-4" />
          }
        }

        return (
          <div key={typeInfo.value} className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value={typeInfo.value} id={`field-type-${typeInfo.value}`} />
            <Label
              htmlFor={`field-type-${typeInfo.value}`}
              className="flex flex-1 cursor-pointer items-center gap-3"
            >
              <div className={`text-${info.color}-600`}>{getIcon(info.icon)}</div>
              <div className="flex-1">
                <div className="font-medium">{typeInfo.label}</div>
                <div className="text-sm text-muted-foreground">{typeInfo.description}</div>
              </div>
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}

export function FieldTypeSelector({
  value,
  onValueChange,
  disabled = false,
  variant = 'select',
  showDescription = true,
}: FieldTypeSelectorProps) {
  const [expandedCard, setExpandedCard] = useState<DataFieldType | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars

  if (variant === 'cards') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Select a field type to define what kind of data this field will store</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {SUPPORTED_FIELD_TYPES.map(typeInfo => (
            <FieldTypeCard
              key={typeInfo.value}
              type={typeInfo.value}
              info={FIELD_TYPE_INFO[typeInfo.value]}
              isSelected={value === typeInfo.value}
              onClick={() => onValueChange(typeInfo.value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'radio') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Select a field type to define what kind of data this field will store</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Field Type</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldTypeRadio value={value} onValueChange={onValueChange} disabled={disabled} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default: Select variant
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Field Type</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select field type" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_FIELD_TYPES.map(typeInfo => {
            const info = FIELD_TYPE_INFO[typeInfo.value]
            const getIcon = (iconName: string) => {
              switch (iconName) {
                case 'Type':
                  return <Type className="h-4 w-4" />
                case 'Hash':
                  return <Hash className="h-4 w-4" />
                case 'Calendar':
                  return <Calendar className="h-4 w-4" />
                case 'ToggleLeft':
                  return <ToggleLeft className="h-4 w-4" />
                default:
                  return <Database className="h-4 w-4" />
              }
            }

            return (
              <SelectItem key={typeInfo.value} value={typeInfo.value}>
                <div className="flex items-center gap-3">
                  <div className={`text-${info.color}-600`}>{getIcon(info.icon)}</div>
                  <div className="flex-1">
                    <div className="font-medium">{typeInfo.label}</div>
                    {showDescription && (
                      <div className="text-xs text-muted-foreground">{typeInfo.description}</div>
                    )}
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {showDescription && value && (
        <div className="mt-2 rounded-md bg-muted p-3">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p>{FIELD_TYPE_INFO[value]?.description}</p>
              <div className="mt-2 text-xs">
                <strong>Default Configuration:</strong>
                <ul className="ml-4 mt-1 list-disc space-y-1">
                  {Object.entries(FIELD_TYPE_INFO[value]?.defaultConfig || {}).map(([key, val]) => (
                    <li key={key}>
                      <code>{key}</code>: <code>{String(val)}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Quick selector for common field types
export function QuickFieldTypeSelector({
  value,
  onValueChange,
  disabled = false,
}: Pick<FieldTypeSelectorProps, 'value' | 'onValueChange' | 'disabled'>) {
  const commonTypes = [
    { value: 'text' as DataFieldType, label: 'Text', icon: Type },
    { value: 'number' as DataFieldType, label: 'Number', icon: Hash },
    { value: 'date' as DataFieldType, label: 'Date', icon: Calendar },
    { value: 'boolean' as DataFieldType, label: 'Boolean', icon: ToggleLeft },
  ]

  return (
    <div className="flex gap-2">
      {commonTypes.map(type => {
        const Icon = type.icon
        const isSelected = value === type.value
        const info = FIELD_TYPE_INFO[type.value]

        return (
          <Button
            key={type.value}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onValueChange(type.value)}
            disabled={disabled}
            className={`flex items-center gap-2 ${isSelected ? `bg-${info.color}-600 hover:bg-${info.color}-700` : ''}`}
          >
            <Icon className="h-4 w-4" />
            {type.label}
          </Button>
        )
      })}
    </div>
  )
}

// Advanced field type selector with preview
export function AdvancedFieldTypeSelector({
  value,
  onValueChange,
  disabled = false,
}: Pick<FieldTypeSelectorProps, 'value' | 'onValueChange' | 'disabled'>) {
  const [selectedType, setSelectedType] = useState<DataFieldType | null>(value || null)

  const handleTypeSelect = (type: DataFieldType) => {
    setSelectedType(type)
    onValueChange(type)
  }

  return (
    <div className="space-y-4">
      <QuickFieldTypeSelector value={value} onValueChange={handleTypeSelect} disabled={disabled} />

      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              {FIELD_TYPE_INFO[selectedType].label} Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="mb-2 text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {FIELD_TYPE_INFO[selectedType].description}
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Database Type</h4>
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {(() => {
                    switch (selectedType) {
                      case 'text':
                        return 'VARCHAR'
                      case 'number':
                        return 'DECIMAL'
                      case 'date':
                        return 'TIMESTAMP'
                      case 'boolean':
                        return 'BOOLEAN'
                      default:
                        return 'UNKNOWN'
                    }
                  })()}
                </code>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Default Configuration</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(FIELD_TYPE_INFO[selectedType].defaultConfig).length > 0 ? (
                    Object.entries(FIELD_TYPE_INFO[selectedType].defaultConfig).map(
                      ([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 text-xs">{key}</code>
                          <span className="text-muted-foreground">:</span>
                          <code className="rounded bg-muted px-2 py-1 text-xs">{String(val)}</code>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No additional configuration needed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
