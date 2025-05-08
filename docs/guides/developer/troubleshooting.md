# Developer Troubleshooting Guide

**Last Reviewed:** 2025-05-08
**Status:** Active
**Owner:** Platform Team

## 1. Overview

This guide addresses common issues developers encounter when working with the Justify platform, offering both quick solutions and deeper insights into the underlying architecture. It aims to be a living document, updated with new issues and solutions as they arise.

## 2. Architectural Context

Understanding Justify's architecture helps troubleshoot issues more effectively:

```
Client (React/Next.js) <=> API Layer (Next.js API Routes) <=> Database (PostgreSQL/Prisma) <=> External Services (Clerk, Stripe, Cint, InsightIQ, etc.)
```

Issues often occur at the boundaries between these layers, especially during data transformation, authentication/authorization, or state synchronization.

## 3. Common Issue Patterns & Solutions

### 3.1. Frontend-Backend Data Mismatches

- **Symptoms:** "Validation failed" errors from API, unexpected `null` or `undefined` values in UI, forms not populating correctly, data displayed differs from database.
- **Root Causes:**
  - Enum format differences (e.g., frontend `'active'` vs. backend `Status.ACTIVE`).
  - Date/time format inconsistencies (ISO string vs. Date object vs. locale string).
  - JSON serialization/deserialization issues (e.g., `BigInt` not supported by default `JSON.stringify`).
  - Mismatched Zod schemas between client-side form validation and server-side API validation.
  - Incorrect data fetching/caching logic (TanStack Query/React Query).
- **Solutions:**
  - **Enum Transformers:** Consistently use data transformers like `EnumTransformers` (`@/utils/enum-transformers`) at API boundaries for known enum mismatches.
  - **Zod Schemas:** Ensure Zod schemas used in forms (`react-hook-form`) align precisely with those used in corresponding API route validation.
  - **Date Handling:** Standardize on ISO 8601 strings for API transfer. Use `new Date()` for object manipulation. Be mindful of timezones (use `date-fns` for reliable handling).
  - **Data Fetching:** Invalidate TanStack Query caches (`queryClient.invalidateQueries`) after mutations to ensure UI reflects DB changes.
- **Key Insight:** Always validate and transform data explicitly at system boundaries (API client <-> API server, API server <-> DB).

### 3.2. Component Rendering Issues (React/Next.js)

- **Symptoms:** Hydration warnings in console, "Cannot update state during render" errors, UI not updating after state change, infinite re-render loops, flickering UI.
- **Root Causes:**
  - Incorrect Server/Client component boundaries (`'use client'` placement).
  - State updates occurring directly within the render function.
  - Missing `key` props in lists rendered via `.map()`.
  - Incorrect dependency arrays in `useEffect`, `useMemo`, `useCallback`.
  - Direct DOM manipulation instead of using React state/refs.
  - Mismatched conditional rendering logic between server and client (leading to hydration errors).
- **Solutions:**
  - **Boundaries:** Only add `'use client'` to components that _require_ client-side interactivity (state, effects, browser APIs). Keep components server-side by default where possible.
  - **State Updates:** Move state updates (`setState`, Zustand actions) into `useEffect` hooks (for effects based on props/state changes) or event handlers (onClick, onChange, onSubmit).
  - **Keys:** Always provide a unique and stable `key` prop when rendering lists with `.map()`.
  - **Dependency Arrays:** Carefully list _all_ reactive values (props, state, context values) used inside hooks like `useEffect` in their dependency array, unless you specifically intend to capture the initial value.
  - **Hydration:** Ensure any logic depending on `window` or browser-specific APIs is either inside a `useEffect` hook (which runs only client-side) or conditionally rendered using state that's set client-side (e.g., `const [isClient, setIsClient] = useState(false); useEffect(() => setIsClient(true), []); if (!isClient) return null;`).
- **Key Insight:** Understand the React/Next.js rendering lifecycle, component types (Server vs. Client), and hook rules.

### 3.3. API Route Issues (Next.js API Routes)

- **Symptoms:** 500 Internal Server Error, 4xx errors (400, 401, 403, 404), timeouts, inconsistent responses, CORS errors.
- **Root Causes:**
  - Unhandled exceptions in route handler logic.
  - Prisma query errors (invalid syntax, connection issues, constraint violations).
  - Missing or incorrect request validation (Zod).
  - Incorrect or missing environment variables for external services (API keys, secrets).
  - Authentication or authorization failures (Clerk).
  - Incorrect CORS configuration (if accessed from different origin).
- **Solutions:**
  - **Error Handling:** Ensure all route handlers use `try...catch` blocks and delegate error formatting/logging to the shared `handleApiError` utility.
  - **Validation:** Implement mandatory Zod validation for request bodies, query params, and path params using `safeParse`.
  - **Authentication/Authorization:** Verify `auth()` results from Clerk at the start of protected routes. Implement resource-level permission checks.
  - **Logging:** Check server logs (local terminal or Vercel Function Logs) for detailed error messages and stack traces logged by `logger` or `handleApiError`.
  - **Environment Variables:** Verify that all required env vars are defined in `.env.local` and correctly loaded/accessed via `serverConfig` or `process.env`.
  - **External Services:** Check credentials, API usage quotas, and status pages for external services (Clerk, Stripe, Cint, etc.).
  - **CORS:** If needed, configure `Access-Control-Allow-Origin` and other CORS headers, typically in `next.config.js` or via Vercel configuration.
- **Key Insight:** Structure API routes defensively with explicit validation, auth checks, robust error handling, and contextual logging.

### 3.4. Form Data Handling (React Hook Form / Zustand)

- **Symptoms:** Form state not updating on input change, form not submitting, lost data between wizard steps, unexpected validation errors, fields not resetting correctly after submission or data load.
- **Root Causes:**
  - Incorrect `useForm` configuration (e.g., `defaultValues`, `resolver`).
  - Issues with controlled vs. uncontrolled component setup (ensure `register` or `Controller` is used correctly).
  - Zod schema used in `useForm` resolver doesn't match form field structure or API expectations.
  - Global state (Zustand) not syncing correctly with local form state, especially in multi-step forms.
  - Incorrect use of `form.reset()` or lack of resetting after successful submission or when loading new data.
- **Solutions:**
  - **`defaultValues`:** Ensure `defaultValues` in `useForm` are correctly populated, potentially asynchronously in a `useEffect` hook that depends on fetched data. Use `form.reset(fetchedData)` to update the form once data arrives.
  - **Controlled Components:** Use RHF's `Controller` component when integrating with complex UI library components (like some Shadcn selects or custom inputs) that need explicit value/onChange handling.
  - **Schema Alignment:** Keep Zod schemas for forms and API validation consistent or map data appropriately before API submission.
  - **State Sync (Wizards):** For multi-step wizards potentially using Zustand, ensure data from completed steps is correctly persisted to the Zustand store and rehydrated into subsequent steps' `defaultValues`.
  - **Resetting:** Call `form.reset()` after a successful submission or when navigating away if the form needs to be cleared.
- **Key Insight:** Understand React Hook Form's state management, how it integrates with Zod validation, and how to synchronize it with global state stores like Zustand when necessary.

### 3.5. Database Connection / Prisma Issues

- **Symptoms:** API errors mentioning "connection refused", "authentication failed", "database does not exist", Prisma client initialization errors, slow API responses, unique constraint violation errors, migration failures.
- **Root Causes:**
  - Incorrect `DATABASE_URL` environment variable in `.env.local` or Vercel.
  - Local PostgreSQL server not running or inaccessible.
  - Incorrect database credentials (user/password).
  - Network issues preventing connection to a remote database.
  - Prisma schema drift (database schema doesn't match `schema.prisma`).
  - Missing database indexes causing slow queries.
  - Trying to insert data that violates a `@@unique` constraint.
- **Solutions:**
  - **Verify `DATABASE_URL`:** Double-check the connection string in `.env.local` (format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`). Verify Vercel env vars.
  - **Check DB Server:** Ensure your local PostgreSQL server is running (`brew services start postgresql` or similar).
  - **Check Credentials:** Verify DB username and password.
  - **Network:** Ensure no firewalls are blocking the connection (especially for remote DBs).
  - **Migrations:** Run `npx prisma migrate dev` to ensure your local database schema matches `schema.prisma`. Run `npx prisma db push` (use with caution, non-production) or deploy migrations for hosted environments.
  - **Prisma Client:** Ensure the Prisma client is generated (`npx prisma generate`) after schema changes.
  - **Query Logging:** Enable Prisma query logging in development (see Debugging Guide) to inspect generated SQL and query timings.
  - **Unique Constraints:** Catch Prisma `P2002` errors specifically and provide user-friendly feedback (e.g., "Email already exists").
  - **Prisma Studio:** Use `npx prisma studio` to inspect data directly.
- **Key Insight:** Keep your database schema, migrations, and Prisma client synchronized. Validate connection details carefully.

## 4. Debugging Tools & Techniques Recap

- **Console Debugging**: Use `console.log`, `console.debug`, etc. Leverage the project's `logger` which respects environment log levels.
- **Network Monitoring**: Browser DevTools Network tab is invaluable for inspecting API request/response cycles.
- **React DevTools**: Essential for inspecting component props, state, and renders.
- **Prisma Studio**: `npx prisma studio` for direct database inspection (uses connection string from `.env.local`).
- **VS Code Debugger**: Set breakpoints in both frontend (`.tsx`) and backend (`route.ts`, server components, lib files) code using appropriate `launch.json` configurations.
- **Direct DB Connection:** `psql` or GUI clients (DBeaver, TablePlus) using credentials from `.env.local`.

## 5. Common Error Messages Explained

| Error Message                                            | Likely Cause(s)                                         | Potential Solution(s)                                                                                                          |
| :------------------------------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| "Hydration failed..." / "Text content does not match..." | Server-rendered HTML differs from initial client render | Check conditional rendering based on `window`, date/time formats, invalid HTML nesting. Use `useEffect` for client-only logic. |
| "Invalid enum value for ..."                             | Enum format mismatch (client vs. server)                | Use `EnumTransformers`; Ensure Zod schema matches Prisma enum.                                                                 |
| "Cannot update during render"                            | State update logic inside component render function     | Move state updates to `useEffect` or event handlers.                                                                           |
| "TypeError: Cannot read properties of undefined"         | Accessing property on null/undefined object/variable    | Add null/undefined checks (`?.` optional chaining), provide default values, check data fetching.                               |
| Prisma `P2002` (Unique constraint failed)                | Attempting to insert data violating a unique constraint | Check if the record already exists; provide user feedback (e.g., "Email already in use").                                      |
| Prisma `P1001` (Can't reach database server)             | Incorrect `DATABASE_URL`, DB server down, network issue | Verify connection string, check DB server status, check network/firewall rules.                                                |
| Clerk: 401 / 403 errors in API                           | Missing/invalid session token, insufficient permissions | Verify `auth()` check, ensure user is logged in, check Clerk middleware, check permissions.                                    |
| Zod: Validation errors in API response (`details`)       | Incoming request data doesn't match Zod schema          | Inspect `details` field, compare request payload with Zod schema definition, check form logic.                                 |
| "Environment variable not found: ..."                    | Missing environment variable in `.env.local` or Vercel  | Define the required variable; ensure correct naming (`NEXT_PUBLIC_` prefix for client-side).                                   |

## 6. Prevention Strategies

- **Write Tests:** Unit, integration, and E2E tests help catch issues early.
- **Code Reviews:** Focus on potential issues at boundaries (API, DB), state management, error handling, and validation.
- **TypeScript Strict Mode:** Keep enabled (`strict: true` in `tsconfig.json`).
- **Error Boundaries:** Implement React error boundaries in the UI for graceful failure handling.
- **Consistent Logging:** Use the shared loggers with good context.
- **Incremental Development:** Build and test features incrementally.

## 7. Related Resources

- **[Debugging Guide](./debugging-guide.md)** (This document)
- **[Local Testing Guide](./local-testing-guide.md)**
- **[API Design Standards](../standards/api-design.md)**
- **[Prisma Error Message Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)**
- **[React DevTools](https://react.dev/learn/react-developer-tools)**
- **[MDN Browser DevTools](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools)**
