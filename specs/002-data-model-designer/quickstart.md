# Quickstart Guide: Data Model Designer

**Version**: 1.0.0
**Date**: 2025-01-23
**Feature**: Data Model Designer (Branch: `002-data-model-designer`)

## Overview

The Data Model Designer enables users to create and manage database tables through a visual interface, supporting field configuration, relationships, and automatic API generation. This guide covers setup, basic usage, and common workflows.

## Prerequisites

### Development Environment

- Node.js 18+ and pnpm installed
- Supabase project configured with database URL and keys
- Next.js 15 development environment set up
- Authentication system (Supabase Auth) configured

### Required Dependencies

```bash
# Core dependencies (already in project)
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add zustand @radix-ui/react-icons
pnpm add react-hook-form @hookform/resolvers zod

# New dependencies for data model designer (MVP)
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add lucide-react date-fns
```

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Feature Flags
NEXT_PUBLIC_ENABLE_DATA_MODEL_DESIGNER=true
```

## Database Setup

### 1. Run Database Migrations

```bash
# Apply schema migrations
pnpm db:migrate

# Run seed data for testing
pnpm db:seed
```

### 2. Configure RLS Policies

The data model designer requires Row Level Security policies to be properly configured:

```sql
-- Enable RLS on all designer tables
ALTER TABLE data_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies for project-based access
CREATE POLICY "Users can view tables in their projects" ON data_tables
    FOR SELECT USING (project_id IN (
        SELECT project_id FROM project_collaborators
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can modify tables in their projects" ON data_tables
    FOR ALL USING (project_id IN (
        SELECT project_id FROM project_collaborators
        WHERE user_id = auth.uid() AND role IN ('owner', 'editor')
    ));
```

## Component Architecture

### File Structure

```
src/
├── app/
│   └── protected/
│       └── designer/
│           ├── page.tsx                    # Designer main page
│           └── layout.tsx                  # Designer layout
├── components/
│   └── designer/
│       ├── DesignerLayout.tsx              # Three-column layout
│       ├── ComponentPanel.tsx              # Left component panel
│       ├── Canvas.tsx                      # Middle design canvas with drag & drop
│       ├── DraggableTable.tsx              # Draggable table component
│       ├── RelationshipLine.tsx            # SVG relationship visualization
│       ├── PropertiesPanel.tsx             # Right properties panel
│       ├── modals/
│       │   ├── CreateTableModal.tsx        # Table creation dialog
│       │   ├── FieldConfigModal.tsx        # Field configuration dialog
│       │   └── RelationshipModal.tsx       # Relationship setup dialog
│       └── hooks/
│           ├── useDesignerState.ts         # Zustand store
│           ├── useTableOperations.ts       # Table CRUD operations
│           └── useTableLock.ts             # Basic table locking
├── lib/
│   └── designer/
│       ├── api.ts                          # API client functions
│       ├── validation.ts                   # Form validation schemas
│       ├── migrations.ts                   # Database migration helpers
│       └── locking.ts                       # Basic locking logic
└── types/
    └── designer/
        ├── table.ts                        # Table type definitions
        ├── field.ts                        # Field type definitions
        └── relationship.ts                 # Relationship type definitions
```

### Core Components

#### DesignerLayout

```typescript
interface DesignerLayoutProps {
  projectId: string
  children: React.ReactNode
}

// Three-column responsive layout with:
// - Left: Component panel (tables, fields, relationships)
// - Center: Design canvas with drag-and-drop
// - Right: Properties panel for selected elements
```

#### Canvas

```typescript
interface CanvasProps {
  projectId: string
  tables: DataTable[]
  relationships: TableRelationship[]
  onTableSelect: (tableId: string) => void
  onRelationshipCreate: (source: string, target: string) => void
  onTablePositionUpdate: (tableId: string, position: { x: number; y: number }) => void
}

// Visual design canvas with:
// - Drag-and-drop table positioning using @dnd-kit
// - Visual relationship connections with SVG lines
// - Selection and multi-selection support
// - Basic zoom and pan capabilities
// - Grid snapping for table alignment
```

#### DraggableTable

```typescript
interface DraggableTableProps {
  table: DataTable
  position: { x: number; y: number }
  isSelected: boolean
  onPositionChange: (position: { x: number; y: number }) => void
  onSelect: () => void
}

// Drag-and-drop table component with:
// - Handle for dragging
// - Visual feedback during drag
// - Position constraints within canvas
// - Collision detection with other tables
```

#### RelationshipLine

```typescript
interface RelationshipLineProps {
  relationship: TableRelationship
  sourceTable: DataTable
  targetTable: DataTable
  isHighlighted: boolean
}

// SVG-based relationship visualization with:
// - Curved or straight line paths
// - Arrow indicators for relationship direction
// - Interactive hover states
// - Click to select relationship
```

#### ComponentPanel

```typescript
interface ComponentPanelProps {
  projectId: string
  onTableCreate: () => void
  onTableSelect: (tableId: string) => void
}

// Left sidebar with:
// - Table list with search and filtering
// - Add table button
// - Table status indicators
// - Quick actions for each table
```

## Basic Usage

### 1. Create a New Data Table

```typescript
// Example: Creating a users table
const createTable = async () => {
  const newTable = await api.tables.create(projectId, {
    name: 'Users',
    table_name: 'users',
    description: 'User accounts and profiles',
    fields: [
      {
        name: 'Email',
        field_name: 'email',
        data_type: 'text',
        is_required: true,
        field_config: { max_length: 255 },
      },
      {
        name: 'Created At',
        field_name: 'created_at',
        data_type: 'date',
        is_required: true,
        default_value: 'NOW()',
      },
    ],
  })

  return newTable
}
```

### 2. Configure Field Properties

```typescript
// Example: Updating field configuration
const updateField = async (tableId: string, fieldId: string) => {
  const updatedField = await api.fields.update(projectId, tableId, fieldId, {
    name: 'User Email',
    is_required: true,
    field_config: {
      max_length: 255,
      validation: 'email',
    },
  })

  return updatedField
}
```

### 3. Create Table Relationships

```typescript
// Example: Creating one-to-many relationship
const createRelationship = async () => {
  const relationship = await api.relationships.create(projectId, {
    source_table_id: usersTableId, // "one" side
    target_table_id: postsTableId, // "many" side
    source_field_id: usersIdField, // users.id
    target_field_id: postsUserIdField, // posts.user_id
    relationship_name: 'user_posts',
    relationship_type: 'one_to_many',
    cascade_config: {
      on_delete: 'cascade',
      on_update: 'cascade',
    },
  })

  return relationship
}
```

### 4. Deploy Schema to Database

```typescript
// Example: Deploying table schema
const deploySchema = async (tableId: string) => {
  const deployment = await api.tables.deploy(projectId, tableId)

  if (deployment.status === 'success') {
    console.log('Table deployed successfully:', deployment.database_table_name)
    console.log('Generated SQL:', deployment.sql_statements)
  }

  return deployment
}
```

## Drag & Drop Implementation

### Table Positioning with @dnd-kit

```typescript
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';

function DraggableTable({ table, position, onPositionChange }: DraggableTableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: table.id,
  });

  const style = {
    transform: translate(transform?.x || 0, transform?.y || 0),
    opacity: isDragging ? 0.5 : 1,
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="draggable-table"
    >
      {/* Table content */}
      <h3>{table.name}</h3>
      {/* Fields list */}
    </div>
  );
}
```

### Canvas with Drag & Drop

```typescript
function DesignerCanvas({ projectId, tables, onTablePositionUpdate }: CanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (delta.x !== 0 || delta.y !== 0) {
      const table = tables.find(t => t.id === active.id);
      if (table) {
        const newPosition = {
          x: Math.max(0, (table.position?.x || 0) + delta.x),
          y: Math.max(0, (table.position?.y || 0) + delta.y)
        };

        // Grid snapping (20px grid)
        const snappedPosition = {
          x: Math.round(newPosition.x / 20) * 20,
          y: Math.round(newPosition.y / 20) * 20
        };

        onTablePositionUpdate(active.id as string, snappedPosition);
      }
    }
    setActiveId(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="designer-canvas">
        {/* Grid background */}
        <div className="grid-background" />

        {/* Tables */}
        {tables.map(table => (
          <DraggableTable
            key={table.id}
            table={table}
            position={table.position || { x: 0, y: 0 }}
            onPositionChange={(newPos) => onTablePositionUpdate(table.id, newPos)}
          />
        ))}

        {/* Relationship lines */}
        <svg className="relationship-layer">
          {relationships.map(renderRelationshipLine)}
        </svg>
      </div>
    </DndContext>
  );
}
```

### Relationship Creation via Drag & Drop

```typescript
import { useDroppable } from '@dnd-kit/core';

function FieldDragHandle({ field, tableId }: { field: DataField; tableId: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
  } = useDraggable({
    id: `field-${field.id}`,
    data: {
      fieldId: field.id,
      tableId: tableId,
      fieldType: field.data_type
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="field-drag-handle"
      title="拖拽到其他表创建关系"
    >
      🔗
    </div>
  );
}

function TableDropZone({ tableId, onRelationshipCreate }: TableDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `table-drop-${tableId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`table-drop-zone ${isOver ? 'active' : ''}`}
    >
      {/* Table content */}
    </div>
  );
}
```

## State Management

### Zustand Store Structure

```typescript
interface DesignerState {
  // Current project and selection
  projectId: string | null
  selectedTableId: string | null
  selectedFieldId: string | null

  // Data
  tables: DataTable[]
  fields: DataField[]
  relationships: TableRelationship[]

  // UI State
  isCanvasLoading: boolean
  canvasZoom: number
  canvasPan: { x: number; y: number }

  // Table Positions for drag & drop
  tablePositions: Record<string, { x: number; y: number }>

  // Collaboration
  activeLocks: TableLock[]

  // Actions
  loadProjectData: (projectId: string) => Promise<void>
  createTable: (data: CreateDataTableRequest) => Promise<DataTable>
  updateTable: (tableId: string, data: UpdateDataTableRequest) => Promise<void>
  deleteTable: (tableId: string) => Promise<void>
  selectTable: (tableId: string) => void
  updateTablePosition: (tableId: string, position: { x: number; y: number }) => void
  createRelationship: (source: string, target: string, config: RelationshipConfig) => Promise<void>
  acquireLock: (tableId: string, type: LockType) => Promise<TableLock>
  releaseLock: (tableId: string) => Promise<void>
}
```

### Example Store Usage

```typescript
// In a component
import { useDesignerStore } from '@/components/designer/hooks/useDesignerState';

function TableList() {
  const { tables, selectedTableId, selectTable, createTable } = useDesignerStore();

  const handleCreateTable = async () => {
    const newTable = await createTable({
      name: "New Table",
      table_name: "new_table",
      fields: []
    });
    selectTable(newTable.id);
  };

  return (
    <div>
      {tables.map(table => (
        <div
          key={table.id}
          className={selectedTableId === table.id ? 'selected' : ''}
          onClick={() => selectTable(table.id)}
        >
          {table.name}
        </div>
      ))}
      <button onClick={handleCreateTable}>Add Table</button>
    </div>
  );
}
```

## Basic Collaboration (MVP)

### Simple Table Locking

```typescript
// In useTableLock hook
const acquireTableLock = async (tableId: string) => {
  try {
    const lock = await api.tables.acquireLock(projectId, tableId, {
      lock_type: 'optimistic',
      reason: 'Table editing',
      duration_minutes: 30,
    })
    return lock
  } catch (error) {
    if (error.code === 'TABLE_LOCKED') {
      throw new Error('Table is currently being edited by another user')
    }
    throw error
  }
}

const releaseTableLock = async (tableId: string, lockToken: string) => {
  await api.tables.releaseLock(projectId, tableId, lockToken)
}
```

### Basic Conflict Handling

````typescript
// Simple conflict prevention
const handleTableEdit = async (tableId: string, changes: TableChanges) => {
  const lock = await acquireTableLock(tableId);

  try {
    // Apply changes
    await api.tables.update(projectId, tableId, changes);
  } finally {
    await releaseTableLock(tableId, lock.lock_token);
  }
};

## Testing

### Unit Tests

```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { TableDesigner } from '@/components/designer/TableDesigner';

describe('TableDesigner', () => {
  it('should create a new table when add button is clicked', async () => {
    const mockCreateTable = jest.fn();
    render(<TableDesigner onCreateTable={mockCreateTable} />);

    fireEvent.click(screen.getByText('Add Table'));
    fireEvent.change(screen.getByLabelText('Table Name'), {
      target: { value: 'Test Table' }
    });
    fireEvent.click(screen.getByText('Create'));

    expect(mockCreateTable).toHaveBeenCalledWith({
      name: 'Test Table',
      table_name: 'test_table',
      fields: []
    });
  });
});
````

### Integration Tests

```typescript
// Example API integration test
import { api } from '@/lib/designer/api'

describe('Table API Integration', () => {
  it('should create table with fields and deploy to database', async () => {
    const project = await createTestProject()

    const table = await api.tables.create(project.id, {
      name: 'Users',
      table_name: 'users',
      fields: [
        {
          name: 'Email',
          field_name: 'email',
          data_type: 'text',
          is_required: true,
        },
      ],
    })

    expect(table.id).toBeDefined()
    expect(table.status).toBe('draft')

    const deployment = await api.tables.deploy(project.id, table.id)
    expect(deployment.status).toBe('success')
    expect(deployment.database_table_name).toBe('users')
  })
})
```

## Performance Optimization

### Virtualization for Large Schemas

```typescript
// Using @tanstack/react-virtual for large field lists
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualFieldList({ fields }: { fields: DataField[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: fields.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualItem.size,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <FieldItem field={fields[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Debounced Updates

```typescript
// Debouncing rapid field updates
import { useDebouncedCallback } from 'use-debounce'

const debouncedUpdateField = useDebouncedCallback(
  async (fieldId: string, updates: Partial<DataField>) => {
    await api.fields.update(projectId, tableId, fieldId, updates)
  },
  1000 // 1 second delay
)

// In component
const handleFieldChange = (fieldId: string, value: string) => {
  // Update local state immediately
  updateFieldInStore(fieldId, { name: value })

  // Debounce API call
  debouncedUpdateField(fieldId, { name: value })
}
```

## Error Handling

### Comprehensive Error Boundaries

```typescript
class DesignerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Designer error:', error, errorInfo);
    // Report to monitoring service
    reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="designer-error">
          <h2>Something went wrong</h2>
          <p>The data model designer encountered an error.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Deployment Considerations

### Feature Flags

```typescript
// Enable/disable designer feature
const DATA_MODEL_DESIGNER_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_DATA_MODEL_DESIGNER === 'true';

if (!DATA_MODEL_DESIGNER_ENABLED) {
  return <FeatureNotAvailable />;
}
```

### Database Migration Safety

```typescript
// Safe schema deployment with rollback
const deployWithRollback = async (tableId: string) => {
  const backup = await createSchemaBackup(tableId)

  try {
    const deployment = await api.tables.deploy(projectId, tableId)
    return deployment
  } catch (error) {
    // Rollback on failure
    await restoreSchemaBackup(backup)
    throw error
  }
}
```

## Troubleshooting

### Common Issues

1. **Table Deployment Fails**
   - Check field names for SQL reserved words
   - Verify data types are supported
   - Ensure relationship foreign keys exist

2. **Table Locking Issues**
   - Verify user permissions for table operations
   - Check if table is already locked by another user
   - Confirm lock expiration time is set correctly

3. **Performance Issues**
   - Optimize API queries with proper indexing
   - Implement basic pagination for table listings
   - Use debounced updates for rapid field changes

### Debug Mode

```typescript
// Enable debug logging
const DEBUG_DESIGNER = process.env.NODE_ENV === 'development'

if (DEBUG_DESIGNER) {
  console.log('Designer State:', store.getState())
  console.log('API Calls:', api.getDebugLog())
}
```

---

## Next Steps

1. **Set up development environment** with the prerequisites above
2. **Run database migrations** to create the required tables
3. **Configure authentication** and RLS policies
4. **Implement basic table creation** workflow
5. **Add field configuration** and validation
6. **Implement basic relationships** and foreign key constraints
7. **Add simple table locking** for basic collaboration
8. **Test thoroughly** with unit and integration tests

For detailed implementation guidance, refer to the `data-model.md` and `contracts/api.yaml` files in this specification.
