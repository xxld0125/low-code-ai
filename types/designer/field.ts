export type DataFieldType = 'text' | 'number' | 'integer' | 'date' | 'boolean'

export interface FieldConfig extends Record<string, unknown> {
  // Text field configuration
  max_length?: number
  min_length?: number
  pattern?: string

  // Number field configuration
  precision?: number
  scale?: number
  min_value?: number
  max_value?: number

  // Date field configuration
  format?: string
  default_now?: boolean

  // Common configuration
  validation?: string
  description?: string
}

export interface DataField {
  id: string
  table_id: string
  name: string
  field_name: string
  data_type: DataFieldType
  is_required: boolean
  is_primary_key?: boolean
  default_value?: string
  field_config: FieldConfig
  sort_order: number
  order?: number // Alternative to sort_order for some use cases
  created_at: string
  updated_at: string
}

export interface CreateDataFieldRequest {
  name: string
  field_name: string
  data_type: DataFieldType
  is_required?: boolean
  default_value?: string
  field_config?: FieldConfig
  sort_order?: number
}

export interface UpdateDataFieldRequest {
  name?: string
  field_name?: string
  data_type?: DataFieldType
  is_required?: boolean
  default_value?: string
  field_config?: FieldConfig
  sort_order?: number
}

export interface DataFieldListRequest {
  projectId: string
  tableId: string
}

// Utility types for field validation
export type TextValidation = {
  max_length?: number
  min_length?: number
  pattern?: string
}

export type NumberValidation = {
  precision?: number
  scale?: number
  min_value?: number
  max_value?: number
}

export type DateValidation = {
  format?: string
  default_now?: boolean
}
