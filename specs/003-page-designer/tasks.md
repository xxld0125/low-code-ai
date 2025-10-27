---
description: 'Task list for 基础页面设计器 implementation'
---

# Tasks: 基础页面设计器

**Input**: Design documents from `/specs/003-page-designer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, quickstart.md

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**更新说明**: 已分析当前项目依赖和目录结构，解决了与现有数据库设计器的冲突问题。任务总数90个，其中60个可并行执行。T042已分解为10个具体的组件属性编辑任务，解决了FR-011功能覆盖不完整的问题。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## 依赖和冲突分析

### 已存在的核心依赖 ✅

项目已包含页面设计器所需的大部分核心依赖：

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` ✅
- `zustand` ✅
- `framer-motion` ✅
- `react-zoom-pan-pinch` ✅
- `lodash-es` 和 `@types/lodash-es` ✅
- `zod` ✅
- `@supabase/ssr`, `@supabase/supabase-js` ✅

### 需要补充的依赖 ❌

- `react-use` - 响应式工具库

### 现有目录结构冲突 ⚠️

项目已存在数据库设计器功能，为避免冲突，页面设计器使用专用命名空间：

**冲突的现有目录**:

- `/components/designer/` - 数据库设计器组件
- `/lib/designer/` - 数据库设计器逻辑
- `/stores/designer/` - 数据库设计器状态
- `/types/designer/` - 数据库设计器类型

**页面设计器专用目录**:

- `/components/page-designer/` - 页面设计器组件
- `/lib/page-designer/` - 页面设计器逻辑
- `/stores/page-designer/` - 页面设计器状态
- `/types/page-designer/` - 页面设计器类型
- `/components/lowcode/page-basic/` - 页面基础组件
- `/components/lowcode/page-layout/` - 页面布局组件

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `/app/`, `/components/`, `/lib/`, `/hooks/`, `/types/`
- **API routes**: `/app/api/page-designer/`
- **重要**: 为避免与现有数据库设计器冲突，页面设计器使用以下专用命名空间：
  - 组件: `/components/page-designer/` (不是 `/components/designer/`)
  - 状态: `/stores/page-designer/` (不是 `/stores/designer/`)
  - 类型: `/types/page-designer/` (不是 `/types/designer/`)
  - 低代码组件: `/components/lowcode/page-basic/`, `/components/lowcode/page-layout/` (避免冲突)
  - Hooks: `/hooks/use-page-*` (避免冲突)
- Paths shown below follow the Next.js App Router structure with conflict avoidance

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 创建页面设计器专用目录结构，避免与现有数据库设计器冲突
- [x] T002 安装缺失的页面设计器依赖包 (react-use)
- [x] T003 [P] 验证现有依赖@dnd-kit, zustand, framer-motion等版本兼容性
- [x] T004 [P] 配置TypeScript严格模式和ESLint规则 (如果需要额外配置)
- [x] T005 [P] 配置shadcn/ui设计系统集成 (验证现有集成)
- [x] T006 [P] 设置响应式设计断点和无障碍标准
- [x] T007 [P] 实现性能监控和Core Web Vitals跟踪
- [x] T008 [P] 配置环境变量和Supabase客户端 (验证现有配置)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 创建页面设计器专用数据库表结构和RLS策略 (page_designs, component_instances, design_history)
- [x] T010 [P] 实现页面设计器API路由框架 (/app/api/page-designer/) - 避免与现有数据库设计器API冲突
- [x] T011 [P] 创建页面设计器专用Zustand状态管理 (/stores/page-designer/ 避免与现有/stores/designer/冲突)
- [x] T012 [P] 创建页面设计器TypeScript类型定义 (/types/page-designer/ 避免与现有/types/designer/冲突)
- [x] T013 实现错误处理和日志记录基础设施
- [x] T014 创建页面设计器组件注册表系统 (/lib/page-designer/)
- [x] T015 [P] 实现页面设计器布局引擎核心逻辑 (/lib/page-designer/)
- [x] T016 [P] 创建页面设计器样式系统和验证器 (/lib/page-designer/)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 组件拖拽到画布 (Priority: P1) 🎯 MVP

**Goal**: 实现从组件面板拖拽基础组件到画布的核心功能

**Independent Test**: 用户能够从左侧组件面板拖拽Button、Input、Text、Image等基础组件到中央画布，组件在拖拽位置正确显示

### Implementation for User Story 1

- [x] T017 [P] [US1] 创建页面设计器基础组件类型定义在 /types/page-designer/component.ts
- [x] T018 [P] [US1] 实现页面设计器基础低代码组件在 /components/lowcode/page-basic/ (Button.tsx, Input.tsx, Text.tsx, Image.tsx) - 避免与现有基础组件冲突
- [x] T019 [P] [US1] 创建页面设计器组件面板在 /components/page-designer/ComponentPanel.tsx - 避免与现有数据库设计器组件冲突
- [x] T020 [P] [US1] 实现页面设计器拖拽提供者在 /components/page-designer/PageDesignerProvider.tsx
- [x] T021 [P] [US1] 创建页面设计器拖拽覆盖层在 /components/page-designer/DragOverlay.tsx
- [x] T022 [US1] 实现页面设计器中央画布在 /components/page-designer/PageCanvas.tsx (依赖T018, T019, T020)
- [x] T023 [US1] 集成@dnd-kit拖拽系统到PageDesignerProvider (依赖T020, T021)
- [x] T024 [US1] 实现组件添加到画布的状态管理逻辑
- [x] T025 [US1] 添加拖拽视觉反馈和动画效果
- [x] T026 [US1] 创建页面设计器主布局在 /components/page-designer/PageDesignerLayout.tsx (依赖T019, T022)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 基础布局系统 (Priority: P1)

**Goal**: 实现Container、Row、Col布局组件的嵌套布局系统

**Independent Test**: 用户能够拖拽布局组件到画布，并将其他组件放入布局容器中，形成正确的嵌套结构和响应式布局

### Implementation for User Story 2

- [ ] T027 [P] [US2] 创建页面设计器布局组件类型定义在 /types/page-designer/layout.ts
- [ ] T028 [P] [US2] 实现页面设计器布局组件在 /components/lowcode/page-layout/ (Container.tsx, Row.tsx, Col.tsx) - 避免与现有布局组件冲突
- [ ] T029 [P] [US2] 扩展页面设计器组件注册表支持布局组件在 /lib/page-designer/component-registry.ts
- [ ] T030 [US2] 实现页面设计器布局约束验证器在 /lib/page-designer/constraints.ts
- [ ] T031 [US2] 扩展页面设计器布局引擎支持Container/Row/Col布局计算在 /lib/page-designer/layout-engine.ts
- [ ] T032 [US2] 实现组件嵌套规则验证和层级管理
- [ ] T033 [US2] 添加布局属性编辑功能到页面设计器属性面板
- [ ] T034 [US2] 实现响应式布局断点处理
- [ ] T035 [US2] 集成布局组件到页面设计器拖拽系统

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 组件选择和移动 (Priority: P2)

**Goal**: 实现画布上组件的选择、移动、删除等编辑操作

**Independent Test**: 用户能够点击选择组件看到选中边框，拖拽移动组件到新位置，使用Delete键删除组件

### Implementation for User Story 3

- [ ] T036 [P] [US3] 创建页面设计器选择状态管理在 /stores/page-designer/selection-store.ts
- [ ] T037 [P] [US3] 实现页面设计器组件选择高亮样式和边框
- [ ] T038 [P] [US3] 创建页面设计器组件移动逻辑在拖拽系统
- [ ] T039 [P] [US3] 实现页面设计器组件删除功能
- [ ] T040 [P] [US3] 添加页面设计器键盘快捷键支持在 /hooks/use-page-keyboard-shortcuts.ts
- [ ] T041 [US3] 创建页面设计器属性面板在 /components/page-designer/PagePropertiesPanel.tsx - 避免与现有PropertiesPanel.tsx冲突
- [ ] T042a [P] [US3] 创建组件属性类型定义在 /types/page-designer/properties.ts (定义基础属性和样式属性接口)
- [ ] T042b [P] [US3] 实现文本类属性编辑器在 /components/page-designer/property-editors/TextPropertyEditor.tsx
- [ ] T042c [P] [US3] 实现数值类属性编辑器在 /components/page-designer/property-editors/NumberPropertyEditor.tsx
- [ ] T042d [P] [US3] 实现布尔类属性编辑器在 /components/page-designer/property-editors/BooleanPropertyEditor.tsx
- [ ] T042e [P] [US3] 实现颜色选择器在 /components/page-designer/property-editors/ColorPicker.tsx
- [ ] T042f [P] [US3] 实现尺寸属性编辑器在 /components/page-designer/property-editors/SizePropertyEditor.tsx
- [ ] T042g [US3] 实现属性面板动态渲染逻辑在 /components/page-designer/PagePropertiesPanel.tsx
- [ ] T042h [US3] 添加属性验证和约束检查功能
- [ ] T042i [US3] 实现属性变更的撤销/重做支持
- [ ] T042j [US3] 添加属性变更的自动保存功能
- [ ] T053 [US3] 添加页面设计器组件复制和粘贴功能
- [ ] T054 [US3] 实现页面设计器多选和批量操作
- [ ] T055 [US3] 集成选择和移动功能到页面设计器画布

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - 画布缩放和对齐 (Priority: P3)

**Goal**: 实现画布缩放控制和对齐辅助线功能

**Independent Test**: 用户能够使用缩放控件调整画布大小，拖拽组件时看到对齐辅助线帮助精确定位

### Implementation for User Story 4

- [ ] T056 [P] [US4] 创建页面设计器画布缩放控制在 /components/page-designer/PageToolbar.tsx - 避免与现有组件冲突
- [ ] T057 [P] [US4] 实现页面设计器缩放状态管理在 /stores/page-designer/zoom-store.ts
- [ ] T058 [P] [US4] 集成react-zoom-pan-pinch库实现页面设计器缩放功能
- [ ] T059 [P] [US4] 创建页面设计器对齐辅助线在 /components/page-designer/PageAlignmentGuides.tsx
- [ ] T060 [P] [US4] 实现页面设计器对齐计算算法在 /lib/page-designer/alignment.ts
- [ ] T061 [US4] 添加页面设计器网格显示和网格对齐功能
- [ ] T062 [US4] 实现页面设计器小地图导航在 /components/page-designer/PageMiniMap.tsx
- [ ] T063 [US4] 集成缩放和对齐功能到页面设计器主画布

---

## Phase 7: 高级功能和数据持久化

**Purpose**: 实现自动保存、历史管理、API集成等高级功能

- [ ] T064 [P] 实现自动保存Hook在 /hooks/use-auto-save.ts
- [ ] T065 [P] 创建历史管理器在 /lib/page-designer/history-manager.ts
- [ ] T066 [P] 实现撤销/重做功能在状态管理
- [ ] T067 [P] 创建页面设计API路由在 /app/api/page-designer/page-designs/route.ts
- [ ] T068 [P] 创建组件实例API路由在 /app/api/page-designer/components/route.ts
- [ ] T069 [P] 实现布局API路由在 /app/api/page-designer/layout/route.ts
- [ ] T070 实现页面设计数据加载和保存逻辑
- [ ] T071 实现组件树结构的序列化和反序列化
- [ ] T072 添加错误边界和异常处理
- [ ] T073 实现加载状态和骨架屏

---

## Phase 8: 页面路由和导航

**Purpose**: 创建页面设计器的路由结构和导航

- [ ] T074 [P] 创建设计器列表页面在 /app/protected/designer/list/page.tsx
- [ ] T075 [P] 创建新页面创建页面在 /app/protected/designer/create/page.tsx
- [ ] T076 [P] 创建设计器编辑页面布局在 /app/protected/designer/page/[id]/layout.tsx
- [ ] T077 [P] 创建设计器编辑主页面在 /app/protected/designer/page/[id]/page.tsx
- [ ] T078 实现页面设计列表的CRUD操作
- [ ] T079 添加页面设计分享和权限管理
- [ ] T080 实现页面设计预览功能
- [ ] T081 添加页面设计导出功能

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T082 [P] 优化拖拽性能和响应时间
- [ ] T083 [P] 实现组件懒加载和代码分割
- [ ] T084 [P] 添加无障碍功能和ARIA标签
- [ ] T085 [P] 优化Bundle大小和加载性能
- [ ] T086 [P] 实现跨浏览器兼容性测试
- [ ] T087 [P] 添加错误监控和日志记录
- [ ] T088 更新文档和用户指南
- [ ] T089 代码清理和重构
- [ ] T090 运行完整性能测试和优化
- [ ] T091 实现生产环境部署配置

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Advanced Features (Phase 7)**: Depends on US1, US2 completion
- **Page Routes (Phase 8)**: Depends on all core user stories completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Should integrate with US1 drag system
- **User Story 3 (P2)**: Can start after US1, US2 - Depends on having components to select and move
- **User Story 4 (P3)**: Can start after US1, US2, US3 - Enhances existing canvas interactions

### Within Each User Story

- Component types before component implementations
- Component implementations before integration
- Core functionality before advanced features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, US1 and US2 can start in parallel (both P1)
- All component implementations within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all component creation for User Story 1 together:
Task: "T016 [P] [US1] 创建基础组件类型定义在 /types/component.ts"
Task: "T017 [P] [US1] 实现基础低代码组件在 /components/lowcode/basic/"
Task: "T018 [P] [US1] 创建组件面板在 /components/designer/ComponentPanel.tsx"
Task: "T019 [P] [US1] 实现拖拽提供者在 /components/designer/DesignerProvider.tsx"

# Then integrate:
Task: "T021 [US1] 实现中央画布组件在 /components/designer/Canvas.tsx"
Task: "T025 [US1] 创建设计器主布局在 /components/designer/DesignerLayout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test drag and drop functionality independently
5. Deploy/demo basic drag-drop MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Drag & Drop)
   - Developer B: User Story 2 (Layout System)
   - Developer C: User Story 3 (Selection & Editing)
3. Stories complete and integrate independently
4. Developer D works on User Story 4 (Zoom & Alignment) and advanced features

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Focus on performance: drag response < 50ms, page load < 3s
- Maintain 50 component limit per page for performance
- Fixed canvas width of 1200px for MVP version
- Single-user mode (no collaboration) for MVP
- Auto-save enabled to prevent data loss
- All UI text and comments in Chinese as per project standards

**⚠️ 重要提醒：避免与现有数据库设计器冲突**

- 使用 `/components/page-designer/` 而不是 `/components/designer/`
- 使用 `/stores/page-designer/` 而不是 `/stores/designer/`
- 使用 `/types/page-designer/` 而不是 `/types/designer/`
- 使用 `/lib/page-designer/` 而不是 `/lib/designer/`
- 使用 `Page*` 前缀命名页面设计器组件 (如 PageCanvas, PageDesignerLayout)
- 使用 `use-page-*` 前缀命名页面设计器Hooks
- 确保所有页面设计器相关代码都有明确的命名空间隔离
