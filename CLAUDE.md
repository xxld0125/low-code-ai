# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **全栈低代码开发平台** built on Next.js 15 + Supabase. It's a full-stack low-code development platform that provides complete development capabilities from data model design to frontend page building.

### Product Positioning

- **Technical Positioning**: Open-source modern full-stack low-code development platform
- **Target Users**: Developers with technical background, development teams, IT departments
- **Value Proposition**: Complete development chain from data model design to frontend page building

### Core Features

1. **Full-stack Capabilities**: Complete development pipeline from data modeling to frontend page building
2. **Open Source & Controllable**: Based on mature open-source technology stack, supporting private deployment
3. **Developer-friendly**: Lowers development barriers without sacrificing flexibility
4. **Advanced Features**: Permission management, multi-tenancy, API integration, and other enterprise-level features

## Development Language & Communication

### Language Preference

**🌏 Primary Language: Chinese (中文)**

- **Project Language**: This project uses Chinese as the primary language for development
- **Documentation**: All project documentation, comments, and commit messages should be written in Chinese
- **Communication**: Use Chinese for all project-related communication, discussions, and explanations
- **Code Comments**: Write code comments in Chinese to ensure team understanding
- **Error Messages**: User-facing error messages should be in Chinese
- **UI Text**: All user interface text should be in Chinese

### Code & Documentation Standards

```typescript
// ✅ 推荐：使用中文注释
// 用户数据表 - 存储系统用户的基本信息
export interface User {
  id: string // 用户唯一标识
  name: string // 用户姓名
  email: string // 用户邮箱
  created_at: string // 创建时间
}

// ❌ 避免：英文注释
// User table - stores basic user information
export interface User {
  id: string // Unique user identifier
  // ...
}
```

## Development Commands

```bash
# Start development server with Turbopack (fast refresh)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

## Tech Stack & Dependencies

### Core Technology Stack

| Layer                    | Technology                                | Selection Rationale                                                                 |
| ------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| **Frontend Framework**   | Next.js 15 + React 19 + TypeScript        | Latest tech stack, SSR support, type safety, mature ecosystem                       |
| **UI Component Library** | shadcn/ui + Tailwind CSS                  | Modern design, highly customizable, Radix UI foundation, excellent performance      |
| **State Management**     | Zustand                                   | Lightweight, TypeScript-friendly, simple API                                        |
| **Build Tools**          | Next.js built-in build system + Turbopack | Excellent development experience, fast hot reload, comprehensive optimization       |
| **Backend Services**     | Supabase (PostgreSQL + Auth)              | BaaS solution, rapid development, real-time features, enterprise-level capabilities |
| **Database**             | Supabase PostgreSQL                       | Managed service, powerful features, automatic backup, RESTful API                   |
| **Authentication**       | Supabase Auth + @supabase/ssr             | Complete authentication solution, secure and reliable, easy integration             |
| **Caching**              | Supabase Edge Functions + CDN             | Globally distributed cache, automatic optimization, deep platform integration       |
| **File Storage**         | Supabase Storage                          | S3-compatible, secure storage, automatic CDN distribution                           |

### Additional Development Tools

- **Language**: TypeScript with strict mode
- **Package Manager**: pnpm (lockfile present)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: Supabase Auth with cookie-based sessions via `@supabase/ssr`
- **Real-time**: Supabase Realtime Engine for live collaboration

## Architecture & Key Patterns

### Directory Structure

```
/app/                          # Next.js App Router pages
  /auth/                       # Authentication pages (login, sign-up, forgot-password)
  /protected/                  # Pages requiring authentication
    /designer/                 # Low-code designer interface
  /api/                        # API routes
    /designer/                 # Designer-related APIs
    /components/               # Component-related APIs
/components/                   # React components
  /designer/                   # Designer components
    ├── DesignerLayout.tsx     # Three-column layout
    ├── ComponentPanel.tsx     # Left component panel
    ├── Canvas.tsx             # Middle canvas
    └── PropertiesPanel.tsx    # Right properties panel
  /ui/                         # shadcn/ui components
  /lowcode/                    # Low-code component library
    ├── basic/                  # Basic components (Button, Input, etc.)
    ├── layout/                 # Layout components (Container, Grid, etc.)
    └── business/               # Business components (UserSelector, etc.)
/lib/                          # Utility libraries
  /designer/                   # Designer core logic
  /supabase/                   # Supabase client configurations
  /utils/                      # Common utility functions
/hooks/                        # Custom React Hooks
/stores/                       # Zustand state management
/types/                        # TypeScript type definitions
```

### Authentication Architecture

- **Middleware-based**: All routes protected via middleware logic in `lib/supabase/middleware.ts`
- **Cookie sessions**: Uses `@supabase/ssr` for server-side session management
- **Protected routes**: Pages in `/app/protected/` require authentication
- **Auth flows**: Complete password-based auth with email confirmation and password reset

### Supabase Configuration

- **Client**: `lib/supabase/client.ts` - Browser-side Supabase client
- **Server**: `lib/supabase/server.ts` - Server-side Supabase client
- **Middleware**: `lib/supabase/middleware.ts` - Auth middleware for route protection

### Component Patterns

- **shadcn/ui**: Uses class-variance-authority for component variants
- **Path aliases**: `@/*` maps to project root (configured in `tsconfig.json`)
- **Composition**: Built on Radix UI primitives with slot-based architecture

### Styling System

- **CSS variables**: Design tokens in `tailwind.config.ts`
- **Dark mode**: System-aware theme switching via `next-themes`
- **Responsive**: Mobile-first Tailwind utilities

## Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Key Files to Understand

- `app/layout.tsx` - Root layout with ThemeProvider and font configuration
- `lib/supabase/server.ts` - Server-side Supabase client for SSR
- `middleware.ts` - Route protection and auth handling
- `components/ui/` - Reusable shadcn/ui components
- `app/auth/` - Authentication page implementations
- `app/protected/` - Authenticated page examples

## Development Notes

- Uses **Turbopack** for fast development builds
- **TypeScript strict mode** enabled
- **ESLint** configured with Next.js rules
- **shadcn/ui** components ready for customization
- Cookie-based auth works across Client Components, Server Components, Route Handlers, and Middleware

## TypeScript 编码规范

### 严格类型要求

**🚫 禁止使用 `any` 类型**

```typescript
// ❌ 错误：使用 any 类型
const data: any = response.data;
function handleSubmit(data: any) { ... }

// ✅ 正确：使用明确类型定义
interface ApiResponse {
  code: number;
  data: UserData;
  message: string;
}

const data: ApiResponse = response.data;
function handleSubmit(data: FormDataType) { ... }

// ✅ 正确：必要时使用 unknown 并进行类型守卫
function processUnknownData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  return null;
}
```

### 类型定义最佳实践

1. **接口优先**: 使用 `interface` 而非 `type` 定义对象类型
2. **联合类型**: 明确所有可能的类型值，避免泛泛的 `any`
3. **泛型约束**: 使用泛型参数约束，而非 `any`
4. **类型守卫**: 对于不确定类型，使用类型守卫进行运行时检查

```typescript
// ✅ 推荐：定义明确的接口
interface ComponentProps {
  title: string
  variant: 'primary' | 'secondary' | 'outline'
  onClick: (event: MouseEvent) => void
  children?: React.ReactNode
}

// ✅ 推荐：使用泛型约束
interface ApiResponse<T extends object> {
  data: T
  status: 'success' | 'error'
}
```

### 错误处理模式

```typescript
// ✅ 推荐：明确的错误类型
interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ✅ 推荐：Result 模式避免异常
type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E }
```
