'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Type, Hash, ToggleLeft, Info, Lightbulb, RefreshCw } from 'lucide-react'
import type { DataFieldType, FieldConfig } from '@/types/designer'

interface DefaultValueSelectorProps {
  data_type: DataFieldType
  field_config: FieldConfig
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  showHelp?: boolean
}

interface DefaultValueTemplate {
  label: string
  value: string
  description: string
  applicableTypes: DataFieldType[]
  category: 'common' | 'advanced' | 'special'
}

export function DefaultValueSelector({
  data_type,
  value,
  onChange,
  disabled = false,
  showHelp = true,
}: Omit<DefaultValueSelectorProps, 'field_config'>) {
  const [customValue, setCustomValue] = useState(value || '')
  const [useCustom, setUseCustom] = useState(!!value && !isPredefinedValue(value, data_type))
  const [selectedTemplate, setSelectedTemplate] = useState(value || '')

  const predefinedDefaults: DefaultValueTemplate[] = [
    // Common defaults
    {
      label: 'Current Timestamp',
      value: 'CURRENT_TIMESTAMP',
      description: 'Current date and time',
      applicableTypes: ['date'],
      category: 'common',
    },
    {
      label: 'Current Date',
      value: 'CURRENT_DATE',
      description: 'Current date only',
      applicableTypes: ['date'],
      category: 'common',
    },
    {
      label: 'Current Time',
      value: 'CURRENT_TIME',
      description: 'Current time only',
      applicableTypes: ['date'],
      category: 'common',
    },
    {
      label: 'Now()',
      value: 'NOW()',
      description: 'Current timestamp (PostgreSQL)',
      applicableTypes: ['date'],
      category: 'common',
    },
    {
      label: 'True',
      value: 'true',
      description: 'Boolean true value',
      applicableTypes: ['boolean'],
      category: 'common',
    },
    {
      label: 'False',
      value: 'false',
      description: 'Boolean false value',
      applicableTypes: ['boolean'],
      category: 'common',
    },
    {
      label: 'Zero',
      value: '0',
      description: 'Numeric zero',
      applicableTypes: ['number'],
      category: 'common',
    },
    {
      label: 'Empty String',
      value: "''",
      description: 'Empty text string',
      applicableTypes: ['text'],
      category: 'common',
    },

    // Advanced defaults
    {
      label: 'UUID Generate',
      value: 'gen_random_uuid()',
      description: 'Generate random UUID (PostgreSQL)',
      applicableTypes: ['text'],
      category: 'advanced',
    },
    {
      label: 'Auto Increment',
      value: "nextval('sequence_name')",
      description: 'Auto increment sequence',
      applicableTypes: ['number'],
      category: 'advanced',
    },

    // Special defaults
    {
      label: 'User Session',
      value: 'current_user',
      description: 'Current database user',
      applicableTypes: ['text'],
      category: 'special',
    },
    {
      label: 'NULL',
      value: 'NULL',
      description: 'Null value',
      applicableTypes: ['text', 'number', 'date', 'boolean'],
      category: 'special',
    },
  ]

  function isPredefinedValue(value: string, type: DataFieldType): boolean {
    return predefinedDefaults.some(
      template => template.value === value && template.applicableTypes.includes(type)
    )
  }

  function getApplicableDefaults(type: DataFieldType): DefaultValueTemplate[] {
    return predefinedDefaults.filter(template => template.applicableTypes.includes(type))
  }

  function getDefaultHelp(): { icon: React.ReactNode; text: string; suggestions: string[] } {
    switch (data_type) {
      case 'text':
        return {
          icon: <Type className="h-4 w-4" />,
          text: 'Text fields can use string literals, functions, or NULL.',
          suggestions: [
            "Use single quotes for literals: 'example text'",
            'Common functions: CURRENT_USER, gen_random_uuid()',
            'Use NULL for optional fields',
          ],
        }
      case 'number':
        return {
          icon: <Hash className="h-4 w-4" />,
          text: 'Number fields accept numeric literals, functions, or NULL.',
          suggestions: [
            'Integer: 42, -10, 0',
            'Decimal: 3.14, -0.5, 100.00',
            "Functions: nextval('sequence')",
          ],
        }
      case 'date':
        return {
          icon: <Calendar className="h-4 w-4" />,
          text: 'Date fields accept timestamp functions, date literals, or NULL.',
          suggestions: [
            'Functions: CURRENT_TIMESTAMP, NOW(), CURRENT_DATE',
            "Literals: '2024-01-01', '2024-01-01 12:00:00'",
            'Use current_timestamp for auto-updating timestamps',
          ],
        }
      case 'boolean':
        return {
          icon: <ToggleLeft className="h-4 w-4" />,
          text: 'Boolean fields accept true, false, 1, 0, or NULL.',
          suggestions: [
            'Values: true, false (case insensitive)',
            'Numeric: 1 (true), 0 (false)',
            'Use NULL for optional boolean fields',
          ],
        }
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          text: 'Enter a valid default value for this field type.',
          suggestions: [],
        }
    }
  }

  const applicableDefaults = getApplicableDefaults(data_type)
  const commonDefaults = applicableDefaults.filter(d => d.category === 'common')
  const advancedDefaults = applicableDefaults.filter(d => d.category === 'advanced')
  const specialDefaults = applicableDefaults.filter(d => d.category === 'special')

  useEffect(() => {
    if (!useCustom && !isPredefinedValue(value, data_type)) {
      setUseCustom(true)
      setCustomValue(value || '')
    }
  }, [value, data_type, useCustom]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTemplateSelect = (templateValue: string) => {
    setSelectedTemplate(templateValue)
    setUseCustom(false)
    onChange(templateValue)
  }

  const handleCustomChange = (newValue: string) => {
    setCustomValue(newValue)
    setUseCustom(true)
    onChange(newValue)
  }

  const handleToggleCustom = (checked: boolean) => {
    if (checked) {
      setUseCustom(true)
      onChange(customValue)
    } else {
      setUseCustom(false)
      if (selectedTemplate) {
        onChange(selectedTemplate)
      } else if (commonDefaults.length > 0) {
        onChange(commonDefaults[0].value)
        setSelectedTemplate(commonDefaults[0].value)
      }
    }
  }

  const getDefaultPreview = () => {
    if (data_type === 'boolean') {
      return (
        <div className="flex gap-2">
          <Button
            variant={selectedTemplate === 'true' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTemplateSelect('true')}
            disabled={disabled}
          >
            True
          </Button>
          <Button
            variant={selectedTemplate === 'false' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTemplateSelect('false')}
            disabled={disabled}
          >
            False
          </Button>
        </div>
      )
    }

    if (commonDefaults.length === 0) {
      return (
        <Input
          value={customValue}
          onChange={e => handleCustomChange(e.target.value)}
          placeholder="Enter default value..."
          disabled={disabled}
        />
      )
    }

    return (
      <div className="space-y-3">
        {/* Quick Select */}
        <div className="flex flex-wrap gap-2">
          {commonDefaults.slice(0, 4).map(template => (
            <Button
              key={template.value}
              variant={selectedTemplate === template.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTemplateSelect(template.value)}
              disabled={disabled}
              className="text-xs"
            >
              {template.label}
            </Button>
          ))}
        </div>

        {/* More Options */}
        {(advancedDefaults.length > 0 || specialDefaults.length > 0) && (
          <Select
            value={useCustom ? 'custom' : selectedTemplate}
            onValueChange={value => {
              if (value === 'custom') {
                setUseCustom(true)
              } else {
                handleTemplateSelect(value)
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Choose a default value..." />
            </SelectTrigger>
            <SelectContent>
              {commonDefaults.slice(4).map(template => (
                <SelectItem key={template.value} value={template.value}>
                  <div>
                    <div className="font-medium">{template.label}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                  </div>
                </SelectItem>
              ))}
              {advancedDefaults.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Advanced
                  </div>
                  {advancedDefaults.map(template => (
                    <SelectItem key={template.value} value={template.value}>
                      <div>
                        <div className="font-medium">{template.label}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
              {specialDefaults.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Special
                  </div>
                  {specialDefaults.map(template => (
                    <SelectItem key={template.value} value={template.value}>
                      <div>
                        <div className="font-medium">{template.label}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              )}
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-3 w-3" />
                  Custom Value
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Custom Input */}
        {(useCustom || commonDefaults.length === 0) && (
          <Input
            value={customValue}
            onChange={e => handleCustomChange(e.target.value)}
            placeholder={`Enter custom default value for ${data_type} field...`}
            disabled={disabled}
          />
        )}
      </div>
    )
  }

  const help = getDefaultHelp()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Default Value</Label>
        <Badge variant="outline" className="text-xs">
          Optional
        </Badge>
      </div>

      {/* Default Value Input */}
      <div className="space-y-3">
        {getDefaultPreview()}

        {/* Custom/Template Toggle */}
        {commonDefaults.length > 0 && (
          <div className="flex items-center space-x-2">
            <Switch
              id="use-custom-default"
              checked={useCustom}
              onCheckedChange={handleToggleCustom}
              disabled={disabled}
            />
            <Label htmlFor="use-custom-default" className="text-sm">
              Use custom value
            </Label>
          </div>
        )}
      </div>

      {/* Help Section */}
      {showHelp && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {help.icon}
              <div className="space-y-2">
                <p className="text-sm text-blue-900">{help.text}</p>
                {help.suggestions.length > 0 && (
                  <ul className="ml-4 list-disc space-y-1 text-xs text-blue-800">
                    {help.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Value Display */}
      {value && (
        <div className="flex items-center gap-2 rounded bg-muted p-2">
          <span className="text-xs text-muted-foreground">Current:</span>
          <code className="rounded border bg-background px-2 py-1 text-xs">{value}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange('')
              setCustomValue('')
              setSelectedTemplate('')
              setUseCustom(false)
            }}
            disabled={disabled}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Validation Info */}
      <div className="text-xs text-muted-foreground">
        <p>
          Default values are applied when creating new records. They must be valid SQL expressions
          compatible with {data_type.toUpperCase()} fields.
        </p>
      </div>
    </div>
  )
}

// Utility function to get default value suggestions
export function getDefaultValueSuggestions(data_type: DataFieldType): string[] {
  const suggestions: Record<DataFieldType, string[]> = {
    text: ["''", 'CURRENT_USER', 'gen_random_uuid()', 'NULL'],
    number: ['0', '1', '-1', '0.0', "nextval('sequence_name')", 'NULL'],
    date: ['CURRENT_TIMESTAMP', 'NOW()', 'CURRENT_DATE', 'CURRENT_TIME', 'NULL'],
    boolean: ['true', 'false', '1', '0', 'NULL'],
  }

  return suggestions[data_type] || []
}

// Utility function to validate default value syntax
export function validateDefaultValueSyntax(
  value: string,
  data_type: DataFieldType
): { isValid: boolean; error?: string; suggestion?: string } {
  if (!value.trim()) {
    return { isValid: true } // Empty default is valid (means no default)
  }

  const trimmedValue = value.trim()

  switch (data_type) {
    case 'text':
      if (
        !trimmedValue.startsWith("'") &&
        !trimmedValue.endsWith("'") &&
        !isKnownFunction(trimmedValue) &&
        !isKnownConstant(trimmedValue)
      ) {
        return {
          isValid: false,
          error: 'Text values should be in single quotes or be a known function',
          suggestion: `Try: '${trimmedValue}' or use a function like CURRENT_USER`,
        }
      }
      break

    case 'number':
      if (
        !isNumeric(trimmedValue) &&
        !isKnownFunction(trimmedValue) &&
        !isKnownConstant(trimmedValue)
      ) {
        return {
          isValid: false,
          error: 'Number default must be a valid number or function',
          suggestion: 'Try: 0, 42, 3.14, or use a function like nextval()',
        }
      }
      break

    case 'date':
      if (
        !isKnownFunction(trimmedValue) &&
        !isKnownConstant(trimmedValue) &&
        !isDateLiteral(trimmedValue)
      ) {
        return {
          isValid: false,
          error: 'Date defaults should use functions or date literals',
          suggestion: "Try: CURRENT_TIMESTAMP, NOW(), or 'YYYY-MM-DD'",
        }
      }
      break

    case 'boolean':
      const booleanValues = ['true', 'false', '1', '0', 'TRUE', 'FALSE']
      if (!booleanValues.includes(trimmedValue) && !isKnownConstant(trimmedValue)) {
        return {
          isValid: false,
          error: 'Boolean default must be true, false, 1, 0, or NULL',
          suggestion: 'Try: true, false, 1, or 0',
        }
      }
      break
  }

  return { isValid: true }
}

function isKnownFunction(value: string): boolean {
  const functions = [
    'CURRENT_TIMESTAMP',
    'NOW()',
    'CURRENT_DATE',
    'CURRENT_TIME',
    'gen_random_uuid()',
    'current_user',
    'nextval(',
  ]
  return functions.some(func => value.toUpperCase().includes(func.toUpperCase()))
}

function isKnownConstant(value: string): boolean {
  const constants = ['NULL', 'TRUE', 'FALSE']
  return constants.includes(value.toUpperCase())
}

function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && value.trim() !== ''
}

function isDateLiteral(value: string): boolean {
  // Simple check for date-like strings in quotes
  return (
    value.startsWith("'") &&
    value.endsWith("'") &&
    (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value))
  )
}
