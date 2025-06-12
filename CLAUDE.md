# CLAUDE.md

- 必ず日本語で回答すること
- 敬語は使用しないこと
- TDDで進めること

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Deployment

- `npm run dev` - Start development server with Remix
- `npm run preview` - Preview with Wrangler (Cloudflare Workers)
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to Cloudflare Workers

### Testing

- `npm run test` - Run all tests
- `npm run test:service:coverage` - Test domain/service layer with coverage
- `npm run test:api:coverage` - Test API layer with coverage
- `npm run test:frontend:coverage` - Test frontend components with coverage
- `npm run e2e` - Run E2E tests with Playwright
- `npm run e2e:report` - Show Playwright test report
- `npm run e2e:gen` - Generate Playwright test code
- Individual test files can be run with `npx vitest run <path/to/test>`

### Database Management

- `npm run db:gen` - Generate Prisma client 
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:sql-only` - Run migrations without generating client
- `npm run db:migrate:deploy` - Deploy migrations to production
- `npm run db:reset` - Reset database and run seeds
- `npm run db:studio` - Open Prisma Studio
- `npm run supabase:db:type-gen` - Generate Supabase database types

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run check-types` - Run TypeScript checks
- `npm run format` - Check code formatting with Prettier
- `npm run format:fix` - Fix code formatting with Prettier

## Architecture Overview

This is a **Domain-Driven Design (DDD)** application with clean architecture principles, deployed as a **hybrid Cloudflare Workers + Supabase Functions** setup.

### Key Architectural Patterns

**Error Handling**: Uses `neverthrow` library for functional error handling

- Service layer returns `Promise<Result<T, E>>`
- Lower layers use `ResultAsync<T, E>`
- Custom error types in `src/common/errors/`

**Domain Layer Structure**:

```
src/domain/{aggregate}/
├── model/           # Domain entities
├── service/         # Domain business logic
├── repository/      # Repository interfaces
├── schema/          # Zod validation schemas
└── infrastructure/  # Repository implementations
```

**Testing Strategy** (multi-tier):

- **Service layer**: Unit tests with mocked Prisma client using `vitest/config.service.ts`
- **API layer**: Integration tests with real database using `vitest/config.api.ts`
- **Frontend**: Component and hook testing using `vitest/config.frontend.ts`
- **E2E tests**: Playwright tests for end-to-end scenarios

### Technology Stack

**Runtime**: Cloudflare Workers (main app) + Supabase Functions (background jobs)
**Backend**: Hono web framework with Remix adapter
**Frontend**: Remix with React + TailwindCSS v4 + Radix UI
**Database**: PostgreSQL with Prisma ORM
**Testing**: Vitest with separate configs per layer

### Entry Points

- **Main Application**: `/functions/[[path]].ts` (Cloudflare Workers entry)
- **Development Server**: `/src/application/server.ts` (Hono + Remix)
- **Background Jobs**: `/supabase/functions/*/index.ts`

### Database Schema

Prisma models are split across files in `prisma/models/`:

- `user.prisma` - User management
- `account.prisma` - Account management  
- `session.prisma` - Session management
- `article.prisma` - Article aggregation system
- All models extend base schema with consistent ID/timestamp patterns

### Important Conventions

**Imports**: Use absolute imports from `src/` root
**Error Handling**: Always use Result types in service layer, throw errors only in infrastructure layer
**Testing**: Mock Prisma client using `src/test/__mocks__/prisma.ts`
**Validation**: Use Zod schemas in domain layer for all data validation
**Logging**: Use structured logging with Pino logger
