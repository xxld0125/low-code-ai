<!--
Sync Impact Report:
- Version change: None → 1.0.0 (initial constitution)
- Modified principles: N/A (initial creation)
- Added sections: All sections (Core Principles, Code Quality Standards, Testing Standards, User Experience Standards, Performance Requirements, Governance)
- Removed sections: N/A (initial creation)
- Templates requiring updates:
  ✅ plan-template.md - Constitution Check section updated for new principles
  ✅ spec-template.md - Success criteria alignment confirmed
  ✅ tasks-template.md - Task categorization reflects quality and testing principles
  ⚠️ commands/*.md - Agent-specific references may need review
- Follow-up TODOs: None (all placeholders filled)
-->

# Low-Code AI Constitution

## Core Principles

### I. Code Quality Excellence

Every component MUST follow strict TypeScript standards with proper typing, comprehensive ESLint configuration, and consistent Prettier formatting. Code MUST be self-documenting with clear naming conventions, single-responsibility functions, and proper error handling patterns. All new code MUST pass automated linting, formatting, and type-checking gates before merging. Technical debt MUST be documented and addressed within defined sprint cycles.

**Rationale**: High-quality code reduces maintenance costs, improves developer experience, and ensures long-term project sustainability. Strict typing catches errors at compile-time rather than runtime, while consistent formatting improves readability across team members.

### II. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory: failing tests MUST be written BEFORE implementation code. Red-Green-Refactor cycle MUST be strictly enforced with comprehensive unit test coverage (minimum 80%), integration tests for user workflows, and E2E tests for critical paths. Tests MUST be written to be independent, repeatable, and fast-running. All tests MUST pass in CI/CD before deployment to any environment.

**Rationale**: Test-first development ensures requirements are understood before implementation, provides safety net for refactoring, and serves as living documentation. Comprehensive test coverage prevents regressions and enables confident deployments.

### III. User Experience Consistency

All user interfaces MUST adhere to established design system using shadcn/ui components with consistent styling, accessibility standards (WCAG 2.1 AA), and responsive design patterns. User flows MUST be intuitive with clear visual hierarchy, proper feedback mechanisms, and error states. Cross-platform consistency MUST be maintained across devices and screen sizes. Performance metrics for user interactions MUST meet defined thresholds.

**Rationale**: Consistent UX reduces cognitive load, improves user satisfaction, and reinforces brand identity. Accessibility ensures inclusive design, while responsive patterns provide seamless experiences across all devices.

### IV. Performance-First Architecture

All features MUST meet strict performance requirements: initial page load under 2 seconds, interaction responses under 100ms, and Core Web Vitals thresholds. Database queries MUST be optimized with proper indexing and query analysis. Client-side bundles MUST be optimized with code splitting, lazy loading, and efficient caching strategies. Performance budgets MUST be established and monitored for each feature. Performance regression tests MUST be automated.

**Rationale**: Performance directly impacts user experience, conversion rates, and SEO rankings. Proactive performance management prevents technical debt accumulation and ensures scalable application growth.

## Code Quality Standards

### TypeScript Configuration

- Strict mode MUST be enabled with no implicit any
- All functions MUST have explicit return types
- Interfaces MUST be preferred over types for object shapes
- Enums MUST be used for constant sets of values

### Code Organization

- Components MUST be organized in feature-based structure
- Shared utilities MUST be placed in lib/ directory
- Database operations MUST use Supabase client patterns
- Environment variables MUST be properly typed

### Development Workflow

- All branches MUST follow conventional commit format
- Pull requests MUST require at least one code review
- Automated quality gates MUST block merging on failures
- Documentation MUST be updated for all API changes

## Testing Standards

### Unit Testing

- Minimum 80% line coverage for business logic
- Tests MUST be written using Jest/Testing Library patterns
- Mock dependencies MUST be isolated and consistent
- Test files MUST be co-located with source files

### Integration Testing

- Database operations MUST be tested with test database
- API endpoints MUST have integration test coverage
- Authentication flows MUST be tested end-to-end
- Third-party integrations MUST be validated

### Performance Testing

- Load testing MUST be conducted for all public endpoints
- Bundle size analysis MUST be performed on each build
- Database query performance MUST be benchmarked
- Client-side rendering performance MUST be measured

## User Experience Standards

### Accessibility Requirements

- All interactive elements MUST be keyboard accessible
- Images MUST have appropriate alt text
- Color contrast MUST meet WCAG AA standards
- Screen reader compatibility MUST be validated

### Design System Compliance

- Components MUST use shadcn/ui patterns consistently
- Spacing MUST follow established 8-point grid system
- Typography MUST use defined font scales and weights
- Color usage MUST adhere to defined brand palette

### Responsive Design

- Mobile-first approach MUST be followed
- Breakpoints MUST be defined and used consistently
- Touch targets MUST meet minimum size requirements (44px)
- Content MUST reflow properly across all screen sizes

## Performance Requirements

### Core Web Vitals

- Largest Contentful Paint (LCP) MUST be under 2.5s
- First Input Delay (FID) MUST be under 100ms
- Cumulative Layout Shift (CLS) MUST be under 0.1
- First Contentful Paint (FCP) MUST be under 1.8s

### Bundle Optimization

- JavaScript bundles MUST be under 250KB gzipped per route
- Images MUST be optimized with appropriate formats and sizing
- Font loading MUST be optimized for performance
- Third-party scripts MUST be loaded asynchronously

### Database Performance

- Query response times MUST be under 100ms on average
- Database connections MUST be properly pooled and managed
- Indexes MUST be created for frequently queried columns
- Data pagination MUST be implemented for large datasets

## Governance

This constitution supersedes all other development practices and guidelines. Amendments require:

1. Formal proposal with rationale and impact analysis
2. Team review and approval process
3. Version increment according to semantic versioning
4. Documentation updates and migration plan
5. Communication to all stakeholders

All pull requests and code reviews MUST verify compliance with these principles. Complexity or deviations MUST be explicitly justified in technical documentation. Use CLAUDE.md for runtime development guidance and refer to this constitution for architectural decisions.

**Version**: 1.0.0 | **Ratified**: 2025-10-21 | **Last Amended**: 2025-10-21
