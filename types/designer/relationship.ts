export type RelationshipType = 'one_to_many'

export interface CascadeConfig {
  on_delete: 'cascade' | 'restrict' | 'set_null'
  on_update: 'cascade' | 'restrict'
}

export interface TableRelationship {
  id: string
  project_id: string
  source_table_id: string
  target_table_id: string
  source_field_id: string
  target_field_id: string
  relationship_name: string
  relationship_type: RelationshipType
  cascade_config: CascadeConfig
  status: 'active' | 'inactive'
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateTableRelationshipRequest {
  source_table_id: string
  target_table_id: string
  source_field_id: string
  target_field_id: string
  relationship_name: string
  relationship_type: RelationshipType
  cascade_config?: CascadeConfig
}

export interface UpdateTableRelationshipRequest {
  relationship_name?: string
  cascade_config?: CascadeConfig
  status?: TableRelationship['status']
}

export interface TableRelationshipListRequest {
  projectId: string
  sourceTableId?: string
  targetTableId?: string
}

export interface RelationshipValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// Utility types for relationship operations
export type RelationshipSide = 'source' | 'target'

export interface RelationshipConnection {
  sourceTable: string
  sourceField: string
  targetTable: string
  targetField: string
  relationshipName: string
}
