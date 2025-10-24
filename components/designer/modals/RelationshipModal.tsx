'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Link2, Database, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataTable, DataTableWithFields } from '@/types/designer/table'
import {
  TableRelationship,
  CreateTableRelationshipRequest,
  RelationshipType,
} from '@/types/designer/relationship'

interface RelationshipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  tables: DataTableWithFields[]
  initialData?: {
    sourceTableId?: string
    sourceFieldId?: string
    targetTableId?: string
    targetFieldId?: string
  }
  existingRelationship?: TableRelationship
  onSave: (data: CreateTableRelationshipRequest) => Promise<void>
  onUpdate?: (
    relationshipId: string,
    data: Partial<CreateTableRelationshipRequest>
  ) => Promise<void>
  isLoading?: boolean
}

interface ValidationError {
  field: string
  message: string
}

export function RelationshipModal({
  open,
  onOpenChange,
  tables,
  initialData,
  existingRelationship,
  onSave,
  onUpdate,
  isLoading = false,
}: RelationshipModalProps) {
  const [formData, setFormData] = useState<{
    source_table_id: string
    source_field_id: string
    target_table_id: string
    target_field_id: string
    relationship_name: string
    relationship_type: RelationshipType
    cascade_config: {
      on_delete: 'cascade' | 'restrict' | 'set_null'
      on_update: 'cascade' | 'restrict'
    }
  }>({
    source_table_id: initialData?.sourceTableId || '',
    source_field_id: initialData?.sourceFieldId || '',
    target_table_id: initialData?.targetTableId || '',
    target_field_id: initialData?.targetFieldId || '',
    relationship_name: '',
    relationship_type: 'one_to_many' as RelationshipType,
    cascade_config: {
      on_delete: 'restrict' as const,
      on_update: 'cascade' as const,
    },
  })

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isValid, setIsValid] = useState(false)
  const [isCheckingCircularDependency, setIsCheckingCircularDependency] = useState(false)
  const [circularDependencyWarning, setCircularDependencyWarning] = useState<string | null>(null)

  const checkCircularDependency = useCallback(async () => {
    setIsCheckingCircularDependency(true)
    try {
      // This would be implemented with actual circular dependency detection logic
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 500))

      // Example: Check if target table already has a relationship to source table
      const hasReverseRelationship = tables
        .find(t => t.id === formData.target_table_id)
        ?.relationships?.incoming?.some(
          r =>
            r.source_table_id === formData.target_table_id &&
            r.target_table_id === formData.source_table_id
        )

      if (hasReverseRelationship) {
        setCircularDependencyWarning('检测到可能存在循环依赖，请确认这是您想要的关系配置')
      } else {
        setCircularDependencyWarning(null)
      }
    } catch (error) {
      console.error('Error checking circular dependency:', error)
    } finally {
      setIsCheckingCircularDependency(false)
    }
  }, [tables, formData.target_table_id, formData.source_table_id])

  // Initialize form with existing relationship data if editing
  useEffect(() => {
    if (existingRelationship) {
      setFormData({
        source_table_id: existingRelationship.source_table_id,
        source_field_id: existingRelationship.source_field_id,
        target_table_id: existingRelationship.target_table_id,
        target_field_id: existingRelationship.target_field_id,
        relationship_name: existingRelationship.relationship_name,
        relationship_type: existingRelationship.relationship_type,
        cascade_config: {
          on_delete: existingRelationship.cascade_config?.on_delete || 'restrict',
          on_update: existingRelationship.cascade_config?.on_update || 'cascade',
        },
      })
    } else if (initialData) {
      setFormData(prev => ({
        ...prev,
        source_table_id: initialData.sourceTableId || prev.source_table_id,
        source_field_id: initialData.sourceFieldId || prev.source_field_id,
        target_table_id: initialData.targetTableId || prev.target_table_id,
        target_field_id: initialData.targetFieldId || prev.target_field_id,
        relationship_name:
          prev.relationship_name ||
          generateRelationshipName(
            initialData.sourceTableId || '',
            initialData.targetTableId || '',
            tables
          ),
      }))
    }
  }, [existingRelationship, initialData, tables])

  // Auto-generate relationship name when tables/fields change
  useEffect(() => {
    if (!existingRelationship && formData.source_table_id && formData.target_table_id) {
      const generatedName = generateRelationshipName(
        formData.source_table_id,
        formData.target_table_id,
        tables
      )
      setFormData(prev => ({
        ...prev,
        relationship_name: generatedName,
      }))
    }
  }, [formData.source_table_id, formData.target_table_id, tables, existingRelationship])

  // Validate form
  useEffect(() => {
    const errors: ValidationError[] = []

    if (!formData.source_table_id) {
      errors.push({ field: 'source_table_id', message: '请选择源表' })
    }

    if (!formData.source_field_id) {
      errors.push({ field: 'source_field_id', message: '请选择源字段' })
    }

    if (!formData.target_table_id) {
      errors.push({ field: 'target_table_id', message: '请选择目标表' })
    }

    if (!formData.target_field_id) {
      errors.push({ field: 'target_field_id', message: '请选择目标字段' })
    }

    if (!formData.relationship_name.trim()) {
      errors.push({ field: 'relationship_name', message: '请输入关系名称' })
    }

    if (formData.source_table_id === formData.target_table_id) {
      errors.push({ field: 'target_table_id', message: '源表和目标表不能相同' })
    }

    // Validate field types compatibility
    const sourceField = tables
      .find(t => t.id === formData.source_table_id)
      ?.fields?.find(f => f.id === formData.source_field_id)

    const targetField = tables
      .find(t => t.id === formData.target_table_id)
      ?.fields?.find(f => f.id === formData.target_field_id)

    if (sourceField && targetField) {
      // Basic type compatibility check
      if (!areFieldTypesCompatible(sourceField.data_type, targetField.data_type)) {
        errors.push({
          field: 'target_field_id',
          message: `字段类型不兼容: ${sourceField.data_type} ↔ ${targetField.data_type}`,
        })
      }
    }

    setValidationErrors(errors)
    setIsValid(errors.length === 0)

    // Check for circular dependencies when form is valid
    if (errors.length === 0 && formData.source_table_id && formData.target_table_id) {
      checkCircularDependency()
    } else {
      setCircularDependencyWarning(null)
    }
  }, [formData, tables, checkCircularDependency])

  const generateRelationshipName = (
    sourceTableId: string,
    targetTableId: string,
    tablesList: DataTable[]
  ): string => {
    const sourceTable = tablesList.find(t => t.id === sourceTableId)
    const targetTable = tablesList.find(t => t.id === targetTableId)

    if (sourceTable && targetTable) {
      return `${sourceTable.table_name}_to_${targetTable.table_name}`
    }

    return ''
  }

  const areFieldTypesCompatible = (sourceType: string, targetType: string): boolean => {
    // Basic compatibility rules
    const compatibleTypes: Record<string, string[]> = {
      text: ['text'],
      number: ['number'],
      date: ['date'],
      boolean: ['boolean'],
    }

    return compatibleTypes[sourceType]?.includes(targetType) || false
  }

  const handleSave = async () => {
    if (!isValid || circularDependencyWarning) {
      return
    }

    try {
      if (existingRelationship && onUpdate) {
        await onUpdate(existingRelationship.id, formData)
      } else {
        await onSave(formData)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving relationship:', error)
    }
  }

  const getFieldError = (field: string): string | null => {
    const error = validationErrors.find(e => e.field === field)
    return error?.message || null
  }

  const availableSourceTables = tables.filter(t => t.status === 'active' || t.status === 'draft')
  const availableTargetTables = tables.filter(
    t => t.id !== formData.source_table_id && (t.status === 'active' || t.status === 'draft')
  )

  const sourceTable = tables.find(t => t.id === formData.source_table_id)
  const targetTable = tables.find(t => t.id === formData.target_table_id)

  const availableSourceFields =
    sourceTable?.fields?.filter(
      f => ['text', 'number'].includes(f.data_type) // Foreign keys typically use text or number
    ) || []

  const availableTargetFields =
    targetTable?.fields?.filter(
      f => f.data_type === 'number' && f.is_required // Target field should typically be a required number field (primary key)
    ) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            {existingRelationship ? '编辑关系' : '创建表关系'}
          </DialogTitle>
          <DialogDescription>配置表之间的外键关系，建立数据的关联约束</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Relationship Type Selection */}
          <div className="space-y-2">
            <Label>关系类型</Label>
            <Select
              value={formData.relationship_type}
              onValueChange={(value: RelationshipType) =>
                setFormData(prev => ({ ...prev, relationship_type: value }))
              }
              disabled={!!existingRelationship}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择关系类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_to_many">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <div>
                      <div className="font-medium">一对多关系</div>
                      <div className="text-xs text-muted-foreground">
                        源表中的一条记录对应目标表中的多条记录
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('relationship_type') && (
              <p className="text-sm text-destructive">{getFieldError('relationship_type')}</p>
            )}
          </div>

          <Separator />

          {/* Source Table Selection */}
          <div className="space-y-2">
            <Label>源表 (主表)</Label>
            <Select
              value={formData.source_table_id}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  source_table_id: value,
                  source_field_id: '', // Reset field when table changes
                }))
              }
              disabled={!!existingRelationship}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择源表" />
              </SelectTrigger>
              <SelectContent>
                {availableSourceTables.map(table => (
                  <SelectItem key={table.id} value={table.id}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{table.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {table.table_name} ({table.fields?.length || 0} 字段)
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('source_table_id') && (
              <p className="text-sm text-destructive">{getFieldError('source_table_id')}</p>
            )}
          </div>

          {/* Source Field Selection */}
          {formData.source_table_id && (
            <div className="space-y-2">
              <Label>源字段</Label>
              <Select
                value={formData.source_field_id}
                onValueChange={value => setFormData(prev => ({ ...prev, source_field_id: value }))}
                disabled={!!existingRelationship}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择源字段" />
                </SelectTrigger>
                <SelectContent>
                  {availableSourceFields.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            field.is_required ? 'bg-orange-400' : 'bg-blue-400'
                          )}
                        />
                        <div>
                          <div className="font-medium">{field.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {field.field_name} ({field.data_type})
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('source_field_id') && (
                <p className="text-sm text-destructive">{getFieldError('source_field_id')}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Target Table Selection */}
          <div className="space-y-2">
            <Label>目标表 (从表)</Label>
            <Select
              value={formData.target_table_id}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  target_table_id: value,
                  target_field_id: '', // Reset field when table changes
                }))
              }
              disabled={!!existingRelationship}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择目标表" />
              </SelectTrigger>
              <SelectContent>
                {availableTargetTables.map(table => (
                  <SelectItem key={table.id} value={table.id}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{table.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {table.table_name} ({table.fields?.length || 0} 字段)
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('target_table_id') && (
              <p className="text-sm text-destructive">{getFieldError('target_table_id')}</p>
            )}
          </div>

          {/* Target Field Selection */}
          {formData.target_table_id && (
            <div className="space-y-2">
              <Label>目标字段</Label>
              <Select
                value={formData.target_field_id}
                onValueChange={value => setFormData(prev => ({ ...prev, target_field_id: value }))}
                disabled={!!existingRelationship}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择目标字段" />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetFields.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            field.is_required ? 'bg-orange-400' : 'bg-blue-400'
                          )}
                        />
                        <div>
                          <div className="font-medium">{field.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {field.field_name} ({field.data_type})
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('target_field_id') && (
                <p className="text-sm text-destructive">{getFieldError('target_field_id')}</p>
              )}
            </div>
          )}

          <Separator />

          {/* Relationship Name */}
          <div className="space-y-2">
            <Label>关系名称</Label>
            <Input
              value={formData.relationship_name}
              onChange={e => setFormData(prev => ({ ...prev, relationship_name: e.target.value }))}
              placeholder="输入关系名称"
            />
            {getFieldError('relationship_name') && (
              <p className="text-sm text-destructive">{getFieldError('relationship_name')}</p>
            )}
          </div>

          {/* Cascade Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">级联配置</CardTitle>
              <CardDescription>配置当主表记录被删除或更新时，从表记录的处理方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>删除时级联</Label>
                <Select
                  value={formData.cascade_config.on_delete}
                  onValueChange={(value: 'cascade' | 'restrict' | 'set_null') =>
                    setFormData(prev => ({
                      ...prev,
                      cascade_config: {
                        ...prev.cascade_config,
                        on_delete: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restrict">
                      <div>
                        <div className="font-medium">限制 (RESTRICT)</div>
                        <div className="text-xs text-muted-foreground">
                          如果从表存在关联记录，则禁止删除主表记录
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="cascade">
                      <div>
                        <div className="font-medium">级联删除 (CASCADE)</div>
                        <div className="text-xs text-muted-foreground">
                          删除主表记录时，同时删除所有关联的从表记录
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="set_null">
                      <div>
                        <div className="font-medium">设为空值 (SET NULL)</div>
                        <div className="text-xs text-muted-foreground">
                          删除主表记录时，将从表关联字段设为 NULL
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>更新时级联</Label>
                <Select
                  value={formData.cascade_config.on_update}
                  onValueChange={(value: 'cascade' | 'restrict') =>
                    setFormData(prev => ({
                      ...prev,
                      cascade_config: {
                        ...prev.cascade_config,
                        on_update: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cascade">
                      <div>
                        <div className="font-medium">级联更新 (CASCADE)</div>
                        <div className="text-xs text-muted-foreground">
                          主表记录更新时，同时更新所有关联的从表记录
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="restrict">
                      <div>
                        <div className="font-medium">限制 (RESTRICT)</div>
                        <div className="text-xs text-muted-foreground">
                          如果从表存在关联记录，则禁止更新主表记录
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Validation Warnings */}
          {isCheckingCircularDependency && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>正在检查循环依赖...</AlertDescription>
            </Alert>
          )}

          {circularDependencyWarning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{circularDependencyWarning}</AlertDescription>
            </Alert>
          )}

          {isValid && !circularDependencyWarning && !isCheckingCircularDependency && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>关系配置验证通过，可以创建</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || isLoading || !!circularDependencyWarning}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingRelationship ? '更新关系' : '创建关系'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
