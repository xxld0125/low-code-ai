# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15 + Supabase Starter Kit** using the App Router. It's a full-stack application template with authentication, styling, and development tooling pre-configured.

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

- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19
- **Backend**: Supabase (database + auth)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript with strict mode
- **Package Manager**: pnpm (lockfile present)
- **Auth**: Supabase Auth with cookie-based sessions via `@supabase/ssr`

## Architecture & Key Patterns

### Directory Structure

```
/app/          # Next.js App Router pages
  /auth/       # Authentication pages (login, sign-up, forgot-password)
  /protected/  # Pages requiring authentication
/components/   # Reusable React components
  /ui/        # shadcn/ui components
/lib/          # Utility libraries
  /supabase/  # Supabase client configurations
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
