# Implementation Tasks: 基础页面设计器

**Branch**: `003-page-designer` | **Date**: 2025-10-27
**Spec**: [基础页面设计器规格](./spec.md) | **Plan**: [技术实现规划](./plan.md)
**Total Tasks**: 68 | **Estimated Duration**: 12 weeks

---

## Implementation Strategy

### MVP Scope

**Suggested MVP**: User Story 1 (组件拖拽到画布) + User Story 2 (基础布局系统)

- Rationale: These two stories provide the core value proposition of a drag-and-drop page builder
- Timeline: 6-8 weeks for functional MVP
- Risk mitigation: Core drag-and-drop functionality validated early

### Incremental Delivery

1. **Phase 1**: Infrastructure setup (2 weeks) - Blocking for all stories
2. **Phase 2**: Foundational systems (2 weeks) - Shared drag-drop foundation
3. **Phase 3**: User Story 1 - Component drag-drop (2 weeks)
4. **Phase 4**: User Story 2 - Layout system (2 weeks)
5. **Phase 5**: User Story 3 - Component selection/movement (1-2 weeks)
6. **Phase 6**: User Story 4 - Canvas zoom/alignment (1-2 weeks)
7. **Phase 7**: Polish & optimization (1-2 weeks)

### Parallel Execution Opportunities

- **Setup Phase**: Multiple developers can work on different infrastructure components
- **User Story Phases**: Frontend components can be developed in parallel with backend APIs
- **Component Development**: Different basic components (Button, Input, Text, Image) can be built simultaneously

---

## Phase 1: Infrastructure Setup (Week 1-2)

**Goal**: Establish project foundation and development environment
**Independent Test Criteria**: Project starts, builds successfully, and basic routing works

- [ ] T001 Install @dnd-kit core dependencies for drag-drop functionality
- [ ] T002 [P] Install framer-motion for animations and transitions
- [ ] T003 [P] Install react-zoom-pan-pinch for canvas zoom functionality
- [ ] T004 [P] Configure TypeScript strict mode and project type definitions
- [ ] T005 Create project structure per implementation plan (all directories)
- [ ] T006 Create database migration scripts for all tables (page_designs, component_instances, design_history)
- [ ] T007 Apply RLS policies for all designer tables
- [ ] T008 [P] Create basic TypeScript type definitions in types/designer.ts
- [ ] T009 [P] Create basic TypeScript type definitions in types/component.ts
- [ ] T010 [P] Create basic TypeScript type definitions in types/layout.ts
- [ ] T011 Configure ESLint and Prettier rules for designer components
- [ ] T012 Create basic Zustand store structure in stores/designer-store.ts
- [ ] T013 [P] Create basic Zustand store structure in stores/component-store.ts
- [ ] T014 [P] Create basic Zustand store structure in stores/layout-store.ts
- [ ] T015 Create Next.js routing structure for /protected/designer/\* pages
- [ ] T016 Create basic layout.tsx for designer pages with three-column structure
- [ ] T017 [P] Create empty page.tsx for designer list page
- [ ] T018 [P] Create empty page.tsx for designer create page
- [ ] T019 [P] Create empty page.tsx for designer edit page [id]
- [ ] T020 [P] Create empty layout.tsx for designer edit page [id]
- [ ] T021 Configure environment variables for designer functionality
- [ ] T022 Test project builds successfully with all dependencies installed

---

## Phase 2: Foundational Systems (Week 3-4)

**Goal**: Build shared drag-drop foundation and core designer infrastructure
**Independent Test Criteria**: Basic three-column layout renders, drag-drop context works

- [ ] T023 Create DesignerLayout.tsx with three-column structure (left panel, canvas, right panel)
- [ ] T024 [P] Create ComponentPanel.tsx empty structure for component library
- [ ] T025 [P] Create Canvas.tsx empty structure for design canvas
- [ ] T026 [P] Create PropertiesPanel.tsx empty structure for property editing
- [ ] T027 Create DragOverlay.tsx for drag preview functionality
- [ ] T028 [P] Create Toolbar.tsx for canvas controls
- [ ] T029 Implement DndContext wrapper in DesignerLayout.tsx with @dnd-kit
- [ ] T030 [P] Configure drag sensors (PointerSensor, KeyboardSensor) in drag context
- [ ] T031 Create component registry system in lib/designer/component-registry.ts
- [ ] T032 [P] Define component types constants in types/component.ts
- [ ] T033 Create basic component validation in lib/designer/validation.ts
- [ ] T034 [P] Create layout constraints system in lib/designer/constraints.ts
- [ ] T035 Implement designer state management actions in stores/designer-store.ts
- [ ] T036 [P] Implement component state management actions in stores/component-store.ts
- [ ] T037 Create API route for page designs in app/api/designer/page-designs/route.ts
- [ ] T038 [P] Create API route for components in app/api/designer/components/route.ts
- [ ] T039 Create API route for layout in app/api/designer/layout/route.ts
- [ ] T040 [P] Implement Supabase client for designer operations in lib/supabase/designer.ts
- [ ] T041 Test three-column layout renders and drag-drop context initializes

---

## Phase 3: User Story 1 - 组件拖拽到画布 (Week 5-6)

**Story Goal**: Enable users to drag basic components from panel to canvas
**Independent Test Criteria**: User can successfully drag Button from left panel to canvas and see it appear

### Tests (not requested - Constitution shows testing needs setup)

_(Note: Test framework needs to be configured per Constitution gaps)_

### Implementation Tasks

- [ ] T042 Create Button.tsx basic component in components/lowcode/basic/
- [ ] T043 [P] Create Input.tsx basic component in components/lowcode/basic/
- [ ] T044 [P] Create Text.tsx basic component in components/lowcode/basic/
- [ ] T045 [P] Create Image.tsx basic component in components/lowcode/basic/
- [ ] T046 Register Button component in component-registry.ts with type 'button'
- [ ] T047 [P] Register Input component in component-registry.ts with type 'input'
- [ ] T048 [P] Register Text component in component-registry.ts with type 'text'
- [ ] T049 [P] Register Image component in component-registry.ts with type 'image'
- [ ] T050 Implement draggability in ComponentPanel.tsx for basic components
- [ ] T051 Create droppable area in Canvas.tsx for accepting dragged components
- [ ] T052 Implement drag start handler in ComponentPanel.tsx
- [ ] T053 [P] Implement drag end handler in DesignerLayout.tsx
- [ ] T054 Implement drop handler in Canvas.tsx to add components to canvas
- [ ] T055 Add visual drag indicators when component is over canvas
- [ ] T056 [P] Prevent drops outside canvas boundaries
- [ ] T057 Implement component rendering in Canvas.tsx based on component state
- [ ] T058 Add component styling and appearance in canvas
- [ ] T059 Update component store when new components are added
- [ ] T060 [P] Save component data to backend via API when dropped
- [ ] T061 Test drag-drop workflow: panel → canvas → component appears

---

## Phase 4: User Story 2 - 基础布局系统 (Week 7-8)

**Story Goal**: Enable Container/Row/Col layout components with proper nesting
**Independent Test Criteria**: User can create Container, add Row inside, add Col in Row, add Button in Col

### Implementation Tasks

- [ ] T062 Create Container.tsx layout component in components/lowcode/layout/
- [ ] T063 [P] Create Row.tsx layout component in components/lowcode/layout/
- [ ] T064 Create Col.tsx layout component in components/lowcode/layout/
- [ ] T065 Register Container component in component-registry.ts with type 'container'
- [ ] T066 [P] Register Row component in component-registry.ts with type 'row'
- [ ] T067 Register Col component in component-registry.ts with type 'col'
- [ ] T068 Implement layout engine in lib/designer/layout-engine.ts
- [ ] T069 [P] Create layout constraint validation for nesting rules
- [ ] T070 Container can contain all component types (button, input, text, image, row, col)
- [ ] T071 [P] Row can only contain Col components
- [ ] T072 Col can contain basic components and Container
- [ ] T073 Implement component drop validation based on layout constraints
- [ ] T074 [P] Prevent invalid nesting (e.g., Row inside Col directly)
- [ ] T075 Implement layout property editing for Container (direction, gap, padding)
- [ ] T076 [P] Implement layout property editing for Row (justify, align, wrap, gap)
- [ ] T077 Implement layout property editing for Col (span, offset)
- [ ] T078 Update Canvas.tsx to render layout components with flexbox styling
- [ ] T079 [P] Implement responsive layout calculations for different breakpoints
- [ ] T080 Test layout creation workflow: Container → Row → Col → Button
- [ ] T081 Test layout constraint validation prevents invalid nesting

---

## Phase 5: User Story 3 - 组件选择和移动 (Week 9-10)

**Story Goal**: Enable component selection, visual feedback, and repositioning
**Independent Test Criteria**: User can select component, see selection border, drag to new position

### Implementation Tasks

- [ ] T082 Implement component selection in Canvas.tsx with click handler
- [ ] T083 [P] Add visual selection feedback (border, handles, highlight)
- [ ] T084 Update component store with selected component IDs
- [ ] T085 Implement component deselection when clicking empty canvas area
- [ ] T086 [P] Implement multi-select with Shift+click
- [ ] T087 Enable dragging of existing components within canvas
- [ ] T088 Implement component move to new parent container
- [ ] T089 [P] Implement component reordering within same parent
- [ ] T090 Update layout engine when components are moved
- [ ] T091 Add visual feedback during component move operations
- [ ] T092 [P] Implement component deletion with Delete key
- [ ] T093 Implement component deletion with right-click context menu
- [ ] T094 Update backend when components are moved/deleted
- [ ] T095 Add undo/redo support for component operations in history manager
- [ ] T096 Test component selection, move, and deletion workflow

---

## Phase 6: User Story 4 - 画布缩放和对齐 (Week 11)

**Story Goal**: Add canvas zoom controls and alignment guides for precise positioning
**Independent Test Criteria**: User can zoom canvas and see alignment guides when dragging components

### Implementation Tasks

- [ ] T097 Create AlignmentGuides.tsx component for visual alignment lines
- [ ] T098 [P] Implement zoom controls in Toolbar.tsx (zoom in, zoom out, reset)
- [ ] T099 Implement canvas zoom functionality with react-zoom-pan-pinch
- [ ] T100 Calculate alignment positions for components in Canvas.tsx
- [ ] T101 [P] Show vertical alignment guides when dragging near other components
- [ ] T102 Show horizontal alignment guides when dragging near other components
- [ ] T103 Show center alignment guides for component centering
- [ ] T104 Implement snap-to-grid functionality for precise alignment
- [ ] T105 [P] Update component positions when alignment guides are followed
- [ ] T106 Add keyboard shortcuts for zoom (Ctrl +/-, Ctrl 0)
- [ ] T107 Implement MiniMap.tsx component for navigation in large canvases
- [ ] T108 Test zoom controls and alignment guide functionality

---

## Phase 7: Polish & Cross-Cutting Concerns (Week 12)

**Goal**: Complete implementation with performance optimization and user experience refinements

### Implementation Tasks

- [ ] T109 Implement auto-save functionality in use-auto-save.ts hook
- [ ] T110 [P] Add loading states and skeleton screens for better UX
- [ ] T111 Implement error boundaries for designer components
- [ ] T112 Add keyboard shortcuts support (Ctrl+Z, Ctrl+Y, Delete, etc.)
- [ ] T113 [P] Implement component copy/paste functionality
- [ ] T114 Add responsive design for mobile/tablet view of designer
- [ ] T115 Optimize performance for large numbers of components (>50)
- [ ] T116 Add accessibility features (ARIA labels, keyboard navigation)
- [ ] T117 [P] Implement component property validation and error display
- [ ] T118 Add user preference settings (theme, grid display, etc.)
- [ ] T119 Create comprehensive error handling and user feedback
- [ ] T120 Add analytics and performance monitoring
- [ ] T121 Final integration testing and bug fixes
- [ ] T122 Documentation updates and deployment preparation

---

## Dependencies

### Story Completion Order

1. **Setup Phase** (T001-T022) → **Foundational Phase** (T023-T041)
2. **Foundational Phase** → **User Story 1** (T042-T061)
3. **Foundational Phase** → **User Story 2** (T062-T081)
4. **User Story 1** + **User Story 2** → **User Story 3** (T082-T096)
5. **User Story 3** → **User Story 4** (T097-T108)
6. **All Previous** → **Polish Phase** (T109-T122)

### Critical Dependencies

- **T029** (DndContext) must complete before any drag-drop tasks
- **T031** (Component Registry) must complete before component registration tasks
- **T068** (Layout Engine) must complete before layout component tasks
- **T082** (Component Selection) must complete before component movement tasks

### Parallel Development Opportunities

**Setup Phase Parallel Tasks**:

- Team A: T001, T003, T004, T008, T011, T021 (Dependencies & Configuration)
- Team B: T002, T005, T009, T010, T012, T013 (Types & Stores)
- Team C: T006, T007, T014, T015-T020 (Database & Routing)

**Component Development Parallel Tasks**:

- Team A: T042, T046, T050, T054 (Button & Drag Implementation)
- Team B: T043, T047, T051, T055 (Input & Visual Feedback)
- Team C: T044, T048, T052, T056 (Text & Validation)

**Layout System Parallel Tasks**:

- Team A: T062, T065, T068, T071 (Container & Layout Engine)
- Team B: T063, T066, T069, T073 (Row & Validation)
- Team C: T064, T067, T070, T075 (Col & Properties)

---

## Risk Mitigation

### Technical Risks

- **Drag Performance Risk**: Early implementation of T029, T030, T031 to validate performance
- **Layout Complexity Risk**: Start with simple Container/Row/Col, add complexity in T068-T077
- **State Management Risk**: Use Zustand patterns proven in T035-T037 for all state

### Integration Risks

- **API Integration Risk**: Implement T037-T040 early to validate backend communication
- **Component Rendering Risk**: Test T058, T078 early to ensure components render correctly
- **Browser Compatibility Risk**: Test core drag-drop in multiple browsers during T041

---

## Success Metrics

### User Story 1 Success

- Users can drag Button from panel to canvas within 30 seconds
- Drag operations complete in <100ms with visual feedback
- Components appear at correct drop positions with 95% accuracy

### User Story 2 Success

- Users can create Container→Row→Col→Button structure in 2 minutes
- Layout constraints prevent 100% of invalid nesting attempts
- Responsive layout works correctly across all breakpoints

### Overall Success

- Designer loads in <3 seconds on initial visit
- Drag operations maintain 60fps (16ms) performance
- No critical bugs in core drag-drop workflow
- Users can complete basic page creation without assistance

---

**Document End**

_This task list provides a complete, actionable roadmap for implementing the FlowBase基础页面设计器. Tasks are organized for independent testing and incremental delivery, with clear dependencies and parallel execution opportunities._
