import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '@/lib/designer/api'
import type {
  DataTable,
  DataField,
  TableRelationship,
  TableLock,
  CreateTableRequest,
  UpdateDataTableRequest,
  CreateDataFieldRequest,
  UpdateDataFieldRequest,
  CreateTableRelationshipRequest,
  AcquireLockRequest,
} from '@/types/designer'

// Canvas position type for drag-and-drop
export interface TablePosition {
  x: number
  y: number
}

// Designer state interface
export interface DesignerState {
  // Current project and selection
  projectId: string | null
  selectedTableId: string | null
  selectedFieldId: string | null
  selectedRelationshipId: string | null

  // Data
  tables: DataTable[]
  fields: DataField[]
  relationships: TableRelationship[]
  activeLocks: TableLock[]

  // UI State
  isLoading: boolean
  isCanvasLoading: boolean
  canvasZoom: number
  canvasPan: { x: number; y: number }
  gridSnapping: boolean

  // Table positions for drag-and-drop
  tablePositions: Record<string, TablePosition>

  // Modal states
  isCreateTableModalOpen: boolean
  isFieldConfigModalOpen: boolean
  isRelationshipModalOpen: boolean
  activeModalTableId: string | null
  activeModalFieldId: string | null

  // Error state
  error: string | null
  errors: Record<string, string>

  // Actions - Project and Data Management
  loadProjectData: (projectId: string) => Promise<void>
  setProjectId: (projectId: string | null) => void

  // Table operations
  createTable: (projectId: string, data: CreateTableRequest) => Promise<DataTable>
  updateTable: (tableId: string, data: UpdateDataTableRequest) => Promise<void>
  deleteTable: (projectId: string, tableId: string) => Promise<void>
  deployTable: (projectId: string, tableId: string) => Promise<void>

  // Field operations
  createField: (tableId: string, data: CreateDataFieldRequest) => Promise<DataField>
  updateField: (tableId: string, fieldId: string, data: UpdateDataFieldRequest) => Promise<void>
  deleteField: (tableId: string, fieldId: string) => Promise<void>
  reorderFields: (tableId: string, fieldIds: string[]) => Promise<void>

  // Relationship operations
  createRelationship: (data: CreateTableRelationshipRequest) => Promise<TableRelationship>
  deleteRelationship: (relationshipId: string) => Promise<void>

  // Selection operations
  selectTable: (tableId: string | null) => void
  selectField: (fieldId: string | null) => void
  selectRelationship: (relationshipId: string | null) => void
  clearSelection: () => void

  // Canvas operations
  updateTablePosition: (tableId: string, position: TablePosition) => void
  setCanvasZoom: (zoom: number) => void
  setCanvasPan: (pan: { x: number; y: number }) => void
  setGridSnapping: (enabled: boolean) => void

  // Lock operations
  acquireLock: (tableId: string, request: AcquireLockRequest) => Promise<TableLock>
  releaseLock: (tableId: string) => Promise<void>
  refreshLocks: () => Promise<void>

  // Modal operations
  openCreateTableModal: () => void
  closeCreateTableModal: () => void
  openFieldConfigModal: (tableId: string, fieldId?: string) => void
  closeFieldConfigModal: () => void
  openRelationshipModal: () => void
  closeRelationshipModal: () => void

  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
  setFieldError: (field: string, error: string) => void
  clearFieldError: (field: string) => void
  clearAllErrors: () => void

  // Utility operations
  reset: () => void
  refreshData: () => Promise<void>
}

// Initial state
const initialState = {
  // Current project and selection
  projectId: null,
  selectedTableId: null,
  selectedFieldId: null,
  selectedRelationshipId: null,

  // Data
  tables: [],
  fields: [],
  relationships: [],
  activeLocks: [],

  // UI State
  isLoading: false,
  isCanvasLoading: false,
  canvasZoom: 1,
  canvasPan: { x: 0, y: 0 },
  gridSnapping: true,

  // Table positions
  tablePositions: {},

  // Modal states
  isCreateTableModalOpen: false,
  isFieldConfigModalOpen: false,
  isRelationshipModalOpen: false,
  activeModalTableId: null,
  activeModalFieldId: null,

  // Error state
  error: null,
  errors: {},
}

// Store implementation
export const useDesignerStore = create<DesignerState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Project and Data Management
      setProjectId: projectId => set({ projectId }),

      loadProjectData: async projectId => {
        set({ isLoading: true, error: null })
        try {
          const tablesResponse = await api.tables.list({ projectId })
          const tables = tablesResponse.data

          // Load fields for all tables
          const fieldsByTable = await Promise.all(
            tables.map(async table => {
              const fieldsResponse = await api.fields.list({ projectId, tableId: table.id })
              return { tableId: table.id, fields: fieldsResponse.data }
            })
          )

          const fields = fieldsByTable.flatMap(({ fields }) => fields)

          // Load relationships
          const relationshipsResponse = await api.relationships.list({ projectId })
          const relationships = relationshipsResponse.data

          set({
            projectId,
            tables,
            fields,
            relationships,
            activeLocks: [], // TODO: Load locks when API is available
            isLoading: false,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load project data',
            isLoading: false,
          })
        }
      },

      // Table operations
      createTable: async (projectId: string, data: CreateTableRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.tables.create(projectId, data)
          const newTable = response.data

          set(state => ({
            tables: [...state.tables, newTable],
            tablePositions: {
              ...state.tablePositions,
              [newTable.id]: { x: 100, y: 100 }, // Default position
            },
            isLoading: false,
          }))

          return newTable
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create table',
            isLoading: false,
          })
          throw error
        }
      },

      updateTable: async (tableId, data) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implement actual table update
          // await api.tables.update(get().projectId!, tableId, data)

          set(state => ({
            tables: state.tables.map(table =>
              table.id === tableId
                ? { ...table, ...data, updated_at: new Date().toISOString() }
                : table
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update table',
            isLoading: false,
          })
          throw error
        }
      },

      deleteTable: async (projectId: string, tableId: string) => {
        set({ isLoading: true, error: null })
        try {
          await api.tables.delete(projectId, tableId)

          set(state => ({
            tables: state.tables.filter(table => table.id !== tableId),
            fields: state.fields.filter(field => field.table_id !== tableId),
            relationships: state.relationships.filter(
              rel => rel.source_table_id !== tableId && rel.target_table_id !== tableId
            ),
            tablePositions: { ...state.tablePositions },
            isLoading: false,
          }))

          // Remove table position
          const newTablePositions = { ...get().tablePositions }
          delete newTablePositions[tableId]
          set({ tablePositions: newTablePositions })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete table',
            isLoading: false,
          })
          throw error
        }
      },

      deployTable: async (projectId: string, tableId: string) => {
        set({ isLoading: true, error: null })
        try {
          const deployment = await api.tables.deploy({ projectId, tableId })

          set(state => ({
            tables: state.tables.map(table =>
              table.id === tableId
                ? { ...table, status: 'active', updated_at: new Date().toISOString() }
                : table
            ),
            isLoading: false,
          }))

          return deployment
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to deploy table',
            isLoading: false,
          })
          throw error
        }
      },

      // Field operations
      createField: async (tableId, data) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implement actual field creation
          // const newField = await api.fields.create(get().projectId!, tableId, data)

          const newField: DataField = {
            id: `field_${Date.now()}`,
            table_id: tableId,
            name: data.name,
            field_name: data.field_name,
            data_type: data.data_type,
            is_required: data.is_required || false,
            default_value: data.default_value,
            field_config: data.field_config || {},
            sort_order: data.sort_order || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          set(state => ({
            fields: [...state.fields, newField],
            isLoading: false,
          }))

          return newField
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create field',
            isLoading: false,
          })
          throw error
        }
      },

      updateField: async (tableId, fieldId, data) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implement actual field update
          // await api.fields.update(get().projectId!, tableId, fieldId, data)

          set(state => ({
            fields: state.fields.map(field =>
              field.id === fieldId
                ? { ...field, ...data, updated_at: new Date().toISOString() }
                : field
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update field',
            isLoading: false,
          })
          throw error
        }
      },

      deleteField: async (tableId, fieldId) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implement actual field deletion
          // await api.fields.delete(get().projectId!, tableId, fieldId)

          set(state => ({
            fields: state.fields.filter(field => field.id !== fieldId),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete field',
            isLoading: false,
          })
          throw error
        }
      },

      reorderFields: async (tableId, fieldIds) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implement actual field reordering
          // await api.fields.reorder(get().projectId!, tableId, fieldIds)

          set(state => ({
            fields: state.fields.map(field =>
              field.table_id === tableId
                ? { ...field, sort_order: fieldIds.indexOf(field.id) }
                : field
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to reorder fields',
            isLoading: false,
          })
          throw error
        }
      },

      // Relationship operations
      createRelationship: async data => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implement actual relationship creation
          // const newRelationship = await api.relationships.create(get().projectId!, data)

          const newRelationship: TableRelationship = {
            id: `rel_${Date.now()}`,
            project_id: get().projectId!,
            source_table_id: data.source_table_id,
            target_table_id: data.target_table_id,
            source_field_id: data.source_field_id,
            target_field_id: data.target_field_id,
            relationship_name: data.relationship_name,
            relationship_type: data.relationship_type,
            cascade_config: data.cascade_config || {
              on_delete: 'restrict',
              on_update: 'cascade',
            },
            status: 'active',
            created_by: 'current_user', // TODO: Get actual user
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          set(state => ({
            relationships: [...state.relationships, newRelationship],
            isLoading: false,
          }))

          return newRelationship
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create relationship',
            isLoading: false,
          })
          throw error
        }
      },

      deleteRelationship: async relationshipId => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Implement actual relationship deletion
          // await api.relationships.delete(get().projectId!, relationshipId)

          set(state => ({
            relationships: state.relationships.filter(rel => rel.id !== relationshipId),
            isLoading: false,
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete relationship',
            isLoading: false,
          })
          throw error
        }
      },

      // Selection operations
      selectTable: tableId => set({ selectedTableId: tableId, selectedFieldId: null }),
      selectField: fieldId => set({ selectedFieldId: fieldId }),
      selectRelationship: relationshipId => set({ selectedRelationshipId: relationshipId }),
      clearSelection: () =>
        set({
          selectedTableId: null,
          selectedFieldId: null,
          selectedRelationshipId: null,
        }),

      // Canvas operations
      updateTablePosition: (tableId, position) =>
        set(state => ({
          tablePositions: { ...state.tablePositions, [tableId]: position },
        })),

      setCanvasZoom: zoom => set({ canvasZoom: zoom }),
      setCanvasPan: pan => set({ canvasPan: pan }),
      setGridSnapping: enabled => set({ gridSnapping: enabled }),

      // Lock operations
      acquireLock: async (tableId, request) => {
        try {
          // TODO: Implement actual lock acquisition
          // const lock = await api.locks.acquire(get().projectId!, tableId, request)

          const lock: TableLock = {
            id: `lock_${Date.now()}`,
            table_id: tableId,
            user_id: 'current_user', // TODO: Get actual user
            lock_token: `token_${Date.now()}`,
            lock_type: request.lock_type,
            locked_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + request.duration_minutes! * 60000).toISOString(),
            reason: request.reason,
          }

          set(state => ({
            activeLocks: [...state.activeLocks, lock],
          }))

          return lock
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to acquire lock',
          })
          throw error
        }
      },

      releaseLock: async tableId => {
        try {
          // TODO: Implement actual lock release
          // await api.locks.release(get().projectId!, tableId, lockToken)

          set(state => ({
            activeLocks: state.activeLocks.filter(lock => lock.table_id !== tableId),
          }))
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to release lock',
          })
          throw error
        }
      },

      refreshLocks: async () => {
        try {
          // TODO: Implement actual lock refresh
          // const locks = await api.locks.listActive(get().projectId!)
          set({ activeLocks: [] })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh locks',
          })
        }
      },

      // Modal operations
      openCreateTableModal: () => set({ isCreateTableModalOpen: true }),
      closeCreateTableModal: () => set({ isCreateTableModalOpen: false }),
      openFieldConfigModal: (tableId: string, fieldId?: string) =>
        set({
          isFieldConfigModalOpen: true,
          activeModalTableId: tableId,
          activeModalFieldId: fieldId,
        }),
      closeFieldConfigModal: () =>
        set({
          isFieldConfigModalOpen: false,
          activeModalTableId: null,
          activeModalFieldId: null,
        }),
      openRelationshipModal: () => set({ isRelationshipModalOpen: true }),
      closeRelationshipModal: () => set({ isRelationshipModalOpen: false }),

      // Error handling
      setError: error => set({ error }),
      clearError: () => set({ error: null }),
      setFieldError: (field, error) =>
        set(state => ({
          errors: { ...state.errors, [field]: error },
        })),
      clearFieldError: field =>
        set(state => {
          const newErrors = { ...state.errors }
          delete newErrors[field]
          return { errors: newErrors }
        }),
      clearAllErrors: () => set({ error: null, errors: {} }),

      // Utility operations
      reset: () => set(initialState),
      refreshData: async () => {
        const { projectId } = get()
        if (projectId) {
          await get().loadProjectData(projectId)
        }
      },
    }),
    {
      name: 'designer-store',
    }
  )
)

// Selectors for common use cases
export const useDesignerTables = () => useDesignerStore(state => state.tables)
export const useDesignerFields = () => useDesignerStore(state => state.fields)
export const useDesignerRelationships = () => useDesignerStore(state => state.relationships)
export const useDesignerSelection = () => ({
  selectedTableId: useDesignerStore(state => state.selectedTableId),
  selectedFieldId: useDesignerStore(state => state.selectedFieldId),
  selectedRelationshipId: useDesignerStore(state => state.selectedRelationshipId),
})
export const useDesignerCanvas = () => ({
  zoom: useDesignerStore(state => state.canvasZoom),
  pan: useDesignerStore(state => state.canvasPan),
  gridSnapping: useDesignerStore(state => state.gridSnapping),
  tablePositions: useDesignerStore(state => state.tablePositions),
})
export const useDesignerModals = () => ({
  isCreateTableModalOpen: useDesignerStore(state => state.isCreateTableModalOpen),
  isFieldConfigModalOpen: useDesignerStore(state => state.isFieldConfigModalOpen),
  isRelationshipModalOpen: useDesignerStore(state => state.isRelationshipModalOpen),
  activeModalTableId: useDesignerStore(state => state.activeModalTableId),
  activeModalFieldId: useDesignerStore(state => state.activeModalFieldId),
})
