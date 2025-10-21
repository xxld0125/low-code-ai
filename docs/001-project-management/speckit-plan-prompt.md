# FlowBase 项目管理功能 - 技术实现规划提示词

**文档版本**: v1.0
**创建日期**: 2025年01月21日
**功能模块**: 项目管理系统
**对应规格**: [spec.md](../../specs/001-project-management/spec.md)

---

## 概述

基于项目管理功能规格说明书和当前 FlowBase 项目上下文，为项目管理功能创建全面的技术实现计划。请充分考虑以下上下文和约束条件。

---

## 当前项目上下文

### 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript (App Router)
- **后端服务**: Supabase (PostgreSQL + Auth + Storage)，已有完整认证系统
- **UI组件库**: shadcn/ui + Tailwind CSS
- **认证方式**: 通过 @supabase/ssr 实现的 Cookie 认证
- **状态管理**: Zustand

### 现有基础设施

- **完整的用户认证系统**: 注册、登录、密码重置功能已实现
- **受保护路由**: 通过中间件实现的路由保护 (`app/protected/`)
- **Supabase 配置**: 客户端/服务端配置已就绪
- **基础UI组件**: 通过 shadcn/ui 提供的基础组件库

---

## 实现要求

### 数据库设计

#### 核心表结构设计

- **Projects 表**: 存储项目基本信息
  - `id` (UUID, 主键)
  - `name` (TEXT, 项目名称)
  - `description` (TEXT, 可选的项目描述)
  - `owner_id` (UUID, 外键关联 users.id)
  - `created_at` (TIMESTAMP, 创建时间)
  - `updated_at` (TIMESTAMP, 更新时间)

- **Project_Collaborators 表**: 项目协作关系
  - `id` (UUID, 主键)
  - `project_id` (UUID, 外键关联 projects.id)
  - `user_id` (UUID, 外键关联 users.id)
  - `role` (TEXT, 角色: 'owner' | 'collaborator')
  - `invited_at` (TIMESTAMP, 邀请时间)
  - `joined_at` (TIMESTAMP, 加入时间)

- **Project_Invitations 表**: 项目邀请记录
  - `id` (UUID, 主键)
  - `project_id` (UUID, 外键关联 projects.id)
  - `invited_email` (TEXT, 被邀请邮箱)
  - `invited_by` (UUID, 邀请人ID)
  - `token` (TEXT, 邀请令牌)
  - `status` (TEXT, 状态: 'pending' | 'accepted' | 'declined')
  - `created_at` (TIMESTAMP, 创建时间)
  - `expires_at` (TIMESTAMP, 过期时间)

#### 行级安全策略 (RLS)

- **Projects 表**:
  - 用户只能查看自己的项目或参与协作的项目
  - 只有项目所有者可以更新/删除项目
  - 项目删除时级联删除相关协作关系和邀请

- **Project_Collaborators 表**:
  - 项目成员可以查看项目协作关系
  - 只有项目所有者可以添加/删除协作者
  - 用户不能修改自己的角色为所有者

#### 数据库索引策略

- 在 `projects.owner_id` 上创建索引
- 在 `project_collaborators.project_id` 和 `project_collaborators.user_id` 上创建复合索引
- 在 `project_invitations.token` 上创建唯一索引
- 在 `project_invitations.invited_email` 上创建索引

### 功能实现

#### 1. 项目仪表板 (`/app/protected/projects/`)

**页面结构**:

```typescript
app/protected/projects/
├── page.tsx              // 项目列表主页
├── components/
│   ├── ProjectCard.tsx    // 项目卡片组件
│   ├── CreateProjectModal.tsx // 创建项目弹窗
│   ├── ProjectSearch.tsx  // 项目搜索组件
│   └── ProjectList.tsx   // 项目列表容器
└── types/
    └── project.ts         // 项目相关类型定义
```

**核心功能**:

- 项目列表展示（支持分页和搜索）
- 创建新项目功能
- 项目卡片显示元信息（名称、创建日期、协作者数量）
- 快速操作入口（编辑、删除、邀请）

#### 2. 项目详情页 (`/app/protected/projects/[id]/`)

**页面结构**:

```typescript
app/protected/projects/[id]/
├── page.tsx              // 项目详情主页
├── settings/
│   └── page.tsx         // 项目设置页面
├── collaborators/
│   └── page.tsx         // 协作者管理页面
└── components/
    ├── ProjectHeader.tsx // 项目头部信息
    ├── ProjectActions.tsx // 项目操作按钮
    └── CollaboratorList.tsx // 协作者列表
```

**核心功能**:

- 项目设置和基本信息管理
- 协作者管理界面
- 项目重命名和删除操作
- 权限状态显示

#### 3. 协作系统

**邀请流程**:

```typescript
// 邀请流程状态机
type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

// 邀请创建
async function createInvitation(projectId: string, email: string): Promise<Invitation>

// 邀请接受
async function acceptInvitation(token: string): Promise<void>

// 邀请拒绝
async function declineInvitation(token: string): Promise<void>
```

**实时更新**:

- 使用 Supabase Realtime 实现实时协作更新
- 协作者列表实时刷新
- 项目权限变更即时生效

#### 4. API 层设计

**Server Actions 结构**:

```typescript
// 项目相关操作
export async function createProject(data: CreateProjectData): Promise<Project>
export async function updateProject(id: string, data: UpdateProjectData): Promise<Project>
export async function deleteProject(id: string): Promise<void>
export async function getProjects(filters?: ProjectFilters): Promise<Project[]>

// 协作相关操作
export async function inviteCollaborator(projectId: string, email: string): Promise<Invitation>
export async function removeCollaborator(projectId: string, userId: string): Promise<void>
export async function acceptInvitation(token: string): Promise<void>
export async function declineInvitation(token: string): Promise<void>
```

**权限检查中间件**:

```typescript
async function requireProjectOwner(projectId: string, userId: string): Promise<void>
async function requireProjectAccess(projectId: string, userId: string): Promise<void>
```

### 技术约束

#### 性能要求

- **页面加载时间**: 项目列表页面 < 3秒
- **数据库查询**: 所有查询响应时间 < 100ms
- **用户支持规模**: 支持每个用户最多100个项目
- **打包大小**: JavaScript 包大小 < 150KB (gzipped)

#### 安全要求

- **数据隔离**: 严格的数据用户隔离
- **权限控制**: 基于角色的访问控制
- **输入验证**: 完整的输入验证和清理
- **操作审计**: 记录所有关键操作

#### 用户体验要求

- **响应式设计**: 支持桌面端和移动端
- **无障碍访问**: 符合 WCAG 2.1 AA 标准
- **直观操作**: 简洁明了的导航和反馈
- **组件一致性**: 与现有 shadcn/ui 组件保持一致

### 集成点

#### 与现有系统集成

- **认证系统**: 完全基于现有的 Supabase Auth
- **中间件**: 遵循已建立的中间件模式
- **布局结构**: 集成到现有的受保护布局结构
- **样式系统**: 使用现有的 ThemeProvider 和样式系统

#### 为未来功能预留

- **数据模型设计器**: 为下一步的数据模型设计器集成做准备
- **页面设计器**: 设计支持页面设计器的集成
- **模板系统**: 预留模板系统集成的扩展性

---

## 开发指南

### 代码组织原则

#### 目录结构

```
app/protected/projects/
├── page.tsx                 // 项目列表页面
├── [id]/
│   ├── page.tsx            // 项目详情页
│   ├── settings/page.tsx    // 项目设置
│   └── collaborators/page.tsx // 协作者管理
├── components/             // 项目相关组件
│   ├── ui/               // 基础UI组件
│   ├── forms/            // 表单组件
│   └── lists/           // 列表组件
├── lib/                 // 工具函数
│   ├── supabase/        // Supabase 相关操作
│   └── utils.ts         // 通用工具函数
└── types/              // TypeScript 类型定义
    ├── project.ts
    ├── collaboration.ts
    └── invitation.ts
```

#### 开发模式

- **Server Components**: 在适当的地方使用 Server Components
- **类型安全**: 实现完整的 TypeScript 类型覆盖
- **代码规范**: 保持一致的编码标准和最佳实践
- **错误处理**: 统一的错误处理和用户反馈机制

### 测试策略

#### 测试类型

- **单元测试**: 工具函数和业务逻辑
- **集成测试**: API 端点和数据库操作
- **端到端测试**: 关键用户工作流程
- **性能测试**: 数据库查询和页面加载性能

#### 测试覆盖率要求

- **工具函数**: 100% 覆盖率
- **API 端点**: 90% 覆盖率
- **组件**: 80% 覆盖率
- **关键路径**: 100% E2E 覆盖

### 文档要求

#### 技术文档

- **API 文档**: 所有端点的详细文档
- **数据库文档**: 完整的数据库模式文档
- **组件文档**: 复杂UI组件的使用文档
- **部署文档**: 生产环境部署指南

#### 用户文档

- **用户指南**: 项目管理功能使用手册
- **常见问题**: 用户常见问题解答
- **最佳实践**: 项目组织和协作的最佳实践

---

## 交付物

请生成一个全面的实现计划，包括以下内容：

### 1. 数据库模式设计

- 详细的表结构和字段定义
- 行级安全策略完整实现
- 索引优化策略
- 数据迁移脚本

### 2. 组件架构设计

- 组件层次结构分解
- 状态管理策略设计
- API 集成模式定义
- UI 组件规格说明

### 3. 实现任务分解

- 优先级排序的任务列表
- 预估开发时间
- 任务依赖关系分析
- 风险缓解策略

### 4. 质量保证计划

- 测试策略和实施计划
- 性能优化方案
- 安全性考虑事项
- 可访问性实施方案

### 5. 部署和维护

- 生产环境部署计划
- 监控和日志策略
- 备份和恢复方案
- 扩展性规划

---

## 注意事项

### 关键约束

- **不生成代码**: 本阶段专注于技术规划，不涉及具体代码实现
- **保持一致性**: 与现有代码库架构和模式保持一致
- **考虑扩展性**: 为后续功能扩展预留空间
- **重视安全性**: 在设计中优先考虑安全性

### 成功标准

- 技术方案可行且可实施
- 满足所有功能和非功能需求
- 与现有系统无缝集成
- 为未来开发奠定坚实基础

这个计划应该作为项目管理功能实现的完整技术蓝图，同时确保与 FlowBase MVP 开发路线图的整体协调，并保持与现有代码库架构的一致性。
