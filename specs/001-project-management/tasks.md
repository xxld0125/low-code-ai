---
description: 'Task list for Project Management feature implementation'
---

# Tasks: Project Management for Low-Code Platform

**Input**: Design documents from `/specs/001-project-management/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/openapi.yaml, research.md, quickstart.md

**Tests**: API testing and database testing included as specified in research.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project management directory structure per implementation plan
- [x] T002 Install required dependencies for project management feature
- [x] T003 [P] Configure TypeScript strict mode and ESLint rules for project files
- [x] T004 [P] Setup API testing framework with Supabase test database
- [x] T005 [P] Setup database testing utilities and test data factories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create database schema with migrations for all project management tables
- [x] T007 [P] Implement Row Level Security (RLS) policies for all tables
- [x] T008 [P] Create database functions (get_user_projects, create_project, invite_collaborator)
- [x] T009 Setup project type definitions in types/projects/
- [x] T010 Configure Supabase client extensions for project management
- [x] T011 Create base project utilities in lib/projects/
- [x] T012 [P] Setup API routing structure for /api/projects/
- [x] T013 [P] Configure error handling for project management APIs

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Project Creation and Listing (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create new projects and view all their projects in a list

**Independent Test**: User can log in, create a project, and see it appear in their project list

### Tests for User Story 1 (API and Database Testing)

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US1] API test for POST /api/projects in tests/projects/api/create-project.test.ts
- [x] T016 [P] [US1] API test for GET /api/projects in tests/projects/api/get-projects.test.ts
- [x] T017 [P] [US1] Database test for projects table constraints in tests/projects/database/projects.test.ts
- [x] T018 [P] [US1] Integration test for project creation workflow in tests/projects/integration/project-workflow.test.ts

### Implementation for User Story 1

- [x] T019 [P] [US1] Create Project type definitions in types/projects/project.ts
- [x] T020 [P] [US1] Create project database queries in lib/projects/queries.ts
- [x] T021 [P] [US1] Create project database mutations in lib/projects/mutations.ts
- [x] T022 [US1] Implement GET /api/projects endpoint in app/api/projects/route.ts
- [x] T023 [US1] Implement POST /api/projects endpoint in app/api/projects/route.ts
- [x] T024 [P] [US1] Create ProjectList component in components/projects/ProjectList.tsx
- [x] T025 [P] [US1] Create ProjectCard component in components/projects/ProjectCard.tsx
- [x] T026 [P] [US1] Create CreateProjectModal component in components/projects/CreateProjectModal.tsx
- [x] T027 [US1] Create project dashboard page in app/protected/projects/page.tsx
- [x] T028 [US1] Create project creation page in app/protected/projects/create/page.tsx
- [x] T029 [P] [US1] Setup Zustand store for project state management in stores/project-store.ts
- [x] T030 [US1] Add validation and error handling for project creation
- [x] T031 [US1] Add loading states and user feedback for project operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Project Operations (Delete and Rename) (Priority: P2)

**Goal**: Enable project owners to rename and delete their projects

**Independent Test**: User can create a project, rename it (verify new name appears), then delete it (confirm it's removed)

### Tests for User Story 2 (API and Database Testing)

- [x] T032 [P] [US2] API test for PUT /api/projects/[id] in tests/projects/api/update-project.test.ts
- [x] T033 [P] [US2] API test for DELETE /api/projects/[id] in tests/projects/api/delete-project.test.ts
- [x] T034 [P] [US2] Database test for project ownership permissions in tests/projects/database/permissions.test.ts
- [x] T035 [P] [US2] Integration test for project rename workflow in tests/projects/integration/rename-workflow.test.ts

### Implementation for User Story 2

- [x] T036 [P] [US2] Create project permissions utilities in lib/projects/permissions.ts
- [x] T037 [P] [US2] Update project mutations to include rename and delete operations
- [x] T038 [US2] Implement PUT /api/projects/[projectId] endpoint in app/api/projects/[projectId]/route.ts
- [x] T039 [US2] Implement DELETE /api/projects/[projectId] endpoint in app/api/projects/[projectId]/route.ts
- [x] T040 [P] [US2] Create ProjectSettings component in components/projects/ProjectSettings.tsx
- [x] T041 [P] [US2] Create project settings page in app/protected/projects/[projectId]/settings/page.tsx
- [x] T042 [US2] Integrate rename and delete operations with ProjectCard component
- [x] T043 [US2] Add confirmation dialogs for destructive operations
- [x] T044 [US2] Add permission validation and error handling for project operations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Project Collaboration and Permissions (Priority: P3)

**Goal**: Enable project owners to invite collaborators and manage project permissions

**Independent Test**: Project owner can invite another user, who accepts the invitation, and both can access the shared project

### Tests for User Story 3 (API and Database Testing)

<!--
- [ ] T045 [P] [US3] API test for POST /api/projects/[id]/collaborators in tests/projects/api/invite-collaborator.test.ts
- [ ] T046 [P] [US3] API test for DELETE /api/projects/[id]/collaborators/[userId] in tests/projects/api/remove-collaborator.test.ts
- [ ] T047 [P] [US3] API test for POST /api/invitations/accept in tests/projects/api/accept-invitation.test.ts
- [ ] T048 [P] [US3] Database test for collaboration constraints in tests/projects/database/collaborations.test.ts
- [ ] T049 [P] [US3] Integration test for invitation workflow in tests/projects/integration/invitation-workflow.test.ts
-->

### Implementation for User Story 3

<!--
- [ ] T050 [P] [US3] Create collaboration type definitions in types/projects/collaboration.ts
- [ ] T051 [P] [US3] Create invitation type definitions in types/projects/invitation.ts
- [ ] T052 [P] [US3] Create collaboration database queries in lib/projects/collaboration-queries.ts
- [ ] T053 [P] [US3] Create invitation database queries in lib/projects/invitation-queries.ts
- [ ] T054 [P] [US3] Create invitation database mutations in lib/projects/invitation-mutations.ts
- [ ] T055 [US3] Implement GET /api/projects/[projectId]/collaborators endpoint in app/api/projects/[projectId]/collaborators/route.ts
- [ ] T056 [US3] Implement POST /api/projects/[projectId]/collaborators endpoint in app/api/projects/[projectId]/collaborators/route.ts
- [ ] T057 [US3] Implement DELETE /api/projects/[projectId]/collaborators/[userId] endpoint in app/api/projects/[projectId]/collaborators/[userId]/route.ts
- [ ] T058 [US3] Implement GET /api/invitations endpoint in app/api/invitations/route.ts
- [ ] T059 [US3] Implement POST /api/invitations/accept endpoint in app/api/invitations/accept/route.ts
- [ ] T060 [US3] Implement POST /api/invitations/decline endpoint in app/api/invitations/decline/route.ts
- [ ] T061 [P] [US3] Create CollaboratorManager component in components/projects/CollaboratorManager.tsx
- [ ] T062 [P] [US3] Create InviteCollaborator component in components/projects/InviteCollaborator.tsx
- [ ] T063 [P] [US3] Create collaboration management page in app/protected/projects/[projectId]/collaborate/page.tsx
- [ ] T064 [P] [US3] Update ProjectCard to show collaboration status
- [ ] T065 [US3] Update project store to handle collaborators and invitations
- [ ] T066 [US3] Add invitation status tracking and notifications
- [ ] T067 [US3] Add role-based permission checking for all project operations
-->

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- ~~T068 [P] Create ProjectActivityLog component in components/projects/ProjectActivityLog.tsx~~ (REMOVED)
- [x] T069 [P] Add project overview page in app/protected/projects/[projectId]/page.tsx
- [x] T070 Code cleanup and refactoring across all project components
- [x] T071 Security hardening for all project operations
- [x] T072 Run quickstart.md validation and update documentation
- [x] T073 Error handling and user experience improvements
- [x] T074 Code quality metrics review and technical debt assessment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but independently testable

### Within Each User Story

- API and Database tests MUST be written and FAIL before implementation
- Type definitions before database operations
- Database operations before API endpoints
- API endpoints before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Type definitions within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (ensure they FAIL first):
Task: "API test for POST /api/projects in tests/projects/api/create-project.test.ts"
Task: "API test for GET /api/projects in tests/projects/api/get-projects.test.ts"
Task: "Database test for projects table constraints in tests/projects/database/projects.test.ts"
Task: "Integration test for project creation workflow in tests/projects/integration/project-workflow.test.ts"

# Launch all type definitions for User Story 1 together:
Task: "Create Project type definitions in types/projects/project.ts"
Task: "Create project database queries in lib/projects/queries.ts"
Task: "Create project database mutations in lib/projects/mutations.ts"

# Launch all UI components for User Story 1 together:
Task: "Create ProjectList component in components/projects/ProjectList.tsx"
Task: "Create ProjectCard component in components/projects/ProjectCard.tsx"
Task: "Create CreateProjectModal component in components/projects/CreateProjectModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Quality Requirements

### Code Quality Standards

- **TypeScript**: Strict mode with comprehensive type coverage
- **Testing**: API and database integration tests required

### Security Requirements

- **Authentication**: Supabase JWT-based auth for all operations
- **Authorization**: Row-level security with role-based permissions
- **Input Validation**: All user inputs validated and sanitized
- **Audit Trail**: All project actions logged in activity_log

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify API and database tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Security policies (RLS) must be enforced for all database operations
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
