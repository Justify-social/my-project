# Developer Troubleshooting Guide

**Last Reviewed:** 2025-05-09
**Status:** Active (Needs Content Completion)
**Owner:** Platform Team

## Overview

This guide addresses common issues developers encounter when working with the Justify platform, offering both quick solutions and deeper insights into the underlying architecture. It aims to be a living document, updated with new issues and solutions as they arise.

_(Action: Team to contribute specific examples and solutions encountered during development.)_

## Architectural Context

Understanding Justify's architecture helps troubleshoot issues more effectively:

```
Client (React/Next.js) ↔ API Layer (Next.js API Routes) ↔ Database (PostgreSQL/Prisma)
```

Most issues occur at the boundaries between these layers, especially during data transformation or state synchronization.

## Common Issue Patterns & Solutions

_(Action: Populate this section with detailed examples specific to Justify.)_

### 1. Frontend-Backend Data Mismatches

- **Symptoms:** "Validation failed" errors, unexpected nulls in UI, forms not populating correctly.
- **Root Causes:** Enum format differences, date format inconsistencies, JSON serialization issues, mismatched Zod schemas between client/server.
- **Solutions:**
  - Consistently use data transformers (e.g., `EnumTransformers` if applicable) at API boundaries.
  - Ensure Zod schemas used in forms align with those used in API route validation.
  - Verify date serialization/deserialization.
  - _(Example needed: Show a common data mismatch error and its fix in Justify.)_
- **Key Insight:** Always transform data at system boundaries.

### 2. Component Rendering Issues

- **Symptoms:** Hydration warnings, "Cannot update during render" errors, UI not updating, infinite loops.
- **Root Causes:** Incorrect Server/Client component boundaries, state updates during render phase, missing `key` props in lists, improper dependency arrays in `useEffect`.
- **Solutions:**
  - Clearly separate Server (`.server.tsx` or default) and Client (`'use client'`) components.
  - Move state updates into `useEffect` or event handlers.
  - Ensure unique `key` props are provided for list items.
  - Carefully manage dependency arrays for hooks.
  - _(Example needed: Show a common rendering pitfall specific to Justify's component library or patterns.)_
- **Key Insight:** Understand the React/Next.js rendering lifecycle and component types.

### 3. API Route Issues

- **Symptoms:** 500/4xx errors from API routes, timeouts, inconsistent responses, unexpected behavior.
- **Root Causes:** Incorrect error handling, Prisma query errors, missing request validation, environment variable issues, auth/permission failures.
- **Solutions:**
  - Use standardized error handling (e.g., `tryCatch` / `handleDbError` helpers from `src/lib/middleware/`).
  - Validate incoming requests using Zod (`withValidation` helper).
  - Implement proper authentication/authorization checks (e.g., using Clerk's `auth()` helper).
  - Check server logs (Vercel logs or local console) for detailed error messages.
  - _(Example needed: Show debugging steps for a frequent API error.)_
- **Key Insight:** Structure API routes consistently with validation, business logic, and error handling.

### 4. Form Data Handling (React Hook Form / Zustand / Context)

- **Symptoms:** Form state not updating, lost data between steps (e.g., Campaign Wizard), unexpected validation errors, fields not resetting.
- **Root Causes:** Incorrect `useForm` default values or reset logic, context provider missing or incorrectly placed, Zod schema mismatches, issues with controlled vs. uncontrolled components.
- **Solutions:**
  - Ensure `useForm` `defaultValues` are correctly populated (often asynchronously in `useEffect`).
  - Use `form.reset()` appropriately when loading data into a form.
  - Verify context providers wrap the necessary components.
  - Double-check Zod schema logic against form field names and types.
  - _(Example needed: Show troubleshooting steps for Campaign Wizard context/form interactions.)_
- **Key Insight:** Understand how RHF state interacts with global state (Zustand/Context) if applicable.

### 5. Database Connection / Prisma Issues

- **Symptoms:** "Connection refused", Prisma client init failures, slow queries, unexpected query results, migration failures.
- **Root Causes:** Incorrect `DATABASE_URL` env var, DB server not running, connection pool issues (less common with Prisma defaults), missing indexes, schema/migration mismatches.
- **Solutions:**
  - Verify `DATABASE_URL` in `.env.local` and Vercel environment settings.
  - Ensure PostgreSQL server is running locally.
  - Use the global Prisma client singleton (`src/lib/db.ts` or `src/lib/prisma.ts`).
  - Analyze slow queries using logging or `EXPLAIN ANALYZE`.
  - Ensure migrations (`npm run db:migrate`) have been run correctly.
  - _(Example needed: Add details on interpreting common Prisma error codes.)_
- **Key Insight:** Treat DB connections as critical resources; ensure schema and client are synchronized via migrations.

## Debugging Tools & Techniques

_(This section provides a good overview - specific usage examples for Justify could be added for each tool.)_

- **Console Debugging**: Use tagged logs (e.g., `console.log('[API:Campaign]', data);`).
- **Network Monitoring**: Browser DevTools Network tab.
- **React DevTools**: Component hierarchy, props, state, hooks.
- **Prisma Studio**: `npx prisma studio` for data inspection.
- **VS Code Debugger**: Breakpoints in frontend and backend code.

## Common Error Messages Explained

_(Action: Populate this table with common error messages specific to Justify and their typical resolutions.)_

| Error Message                                    | Likely Cause                                  | Potential Solution(s)                           |
| ------------------------------------------------ | --------------------------------------------- | ----------------------------------------------- |
| "Invalid enum value"                             | Enum format mismatch (client vs. server)      | Use EnumTransformers; Check Prisma Enum defs.   |
| "Cannot update during render"                    | State update during component render          | Move updates to `useEffect` or event handlers.  |
| "Invalid revalidate value"                       | Next.js caching directive on Client Component | Move `dynamic`, `revalidate` to Layout/Page.    |
| "TypeError: Cannot read properties of undefined" | Accessing property on null/undefined variable | Add null checks (`?.`), provide default values. |
| _Add Justify-specific errors here_               | _Common cause in Justify_                     | _Specific fix/check in Justify_                 |

## Prevention Strategies

_(These are good general practices)_

1.  **Code Reviews**: Focus on boundary transformations, state management, error handling.
2.  **TypeScript Strict Mode**: Keep enabled.
3.  **Automated Tests**: Cover data transformations, API logic, key user flows.
4.  **Error Boundaries**: Implement React error boundaries for graceful UI failure.
5.  **Logging**: Use structured logging with context.

## Related Resources

- **[Debugging Guide](./debugging-guide.md)** (This document)
- **[Local Testing Guide](./local-testing-guide.md)**
- **[Deployment Guide](./deployment.md)**
- Specific feature documentation in `/docs/architecture/features/`.
