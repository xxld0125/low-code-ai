export type DataFieldType = 'text' | 'number' | 'date' | 'boolean'

export interface DataField {
  id: string
  table_id: string
  name: string
  field_name: string
  data_type: DataFieldType
  is_required: boolean
  default_value?: string
  field_config: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateFieldRequest {
  tableId: string
  name: string
  fieldName: string
  dataType: DataFieldType
  isRequired?: boolean
  defaultValue?: string
  sortOrder?: number
  fieldConfig?: Record<string, unknown>
}

export interface UpdateFieldRequest {
  id: string
  name?: string
  fieldName?: string
  dataType?: DataFieldType
  isRequired?: boolean
  defaultValue?: string
  sortOrder?: number
  fieldConfig?: Record<string, unknown>
}
