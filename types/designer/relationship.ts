export type RelationshipType = 'one_to_many' | 'many_to_many'

export interface TableRelationship {
  id: string
  project_id: string
  source_table_id: string
  target_table_id: string
  source_field_id: string
  target_field_id: string
  relationship_name: string
  relationship_type: RelationshipType
  cascade_config: Record<string, unknown>
  status: 'active' | 'inactive'
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateRelationshipRequest {
  projectId: string
  sourceTableId: string
  targetTableId: string
  sourceFieldId: string
  targetFieldId: string
  relationshipName: string
  relationshipType: RelationshipType
  cascadeConfig?: Record<string, unknown>
}

export interface UpdateRelationshipRequest {
  id: string
  relationshipName?: string
  cascadeConfig?: Record<string, unknown>
  status?: TableRelationship['status']
}
