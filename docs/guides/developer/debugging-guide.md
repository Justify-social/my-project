# Debugging Guide

**Last Reviewed:** 2025-05-08
**Status:** Active

## 1. Overview

This guide provides practical steps, techniques, and best practices for debugging common issues encountered while developing the Justify platform. Effective debugging is essential for identifying and fixing problems quickly.

## 2. General Principles

- **Isolate the Problem:** Simplify the scenario. Can you reproduce the issue with a minimal component or API request?
- **Understand the Flow:** Trace the data flow and execution path related to the bug.
- **Read Error Messages:** Carefully analyze error messages and stack traces. They often contain crucial clues.
- **Use Version Control:** Check recent commits (`git log`, `git diff`) to see if the bug was introduced by a recent change.
- **Ask for Help:** If stuck after trying standard techniques, don't hesitate to ask a colleague. Explain the problem clearly and what you've already tried.

## 3. Frontend Debugging (React / Next.js Client Components)

### 3.1. Browser Developer Tools (Essential)

Your browser's built-in developer tools (usually opened with F12 or Right-Click -> Inspect) are your primary frontend debugging tool.

- **Elements Tab:** Inspect the rendered HTML structure and applied CSS styles. Modify styles live to test fixes.
- **Console Tab:**
  - View logs (`console.log`, `warn`, `error`, `debug` output).
  - Identify JavaScript errors and stack traces.
  - Execute JavaScript commands in the current page context.
- **Sources Tab:**
  - View loaded JavaScript/TypeScript source files (often via source maps).
  - **Set Breakpoints:** Click on line numbers to pause execution.
  - Step through code (step over, step into, step out).
  - Inspect variable values, call stack, and scope at breakpoints.
- **Network Tab:**
  - Inspect all network requests (API calls, images, scripts, styles).
  - Check request/response headers, status codes, and payloads.
  - Identify slow or failed requests.
  - Filter requests (e.g., by Fetch/XHR for API calls).
- **Application Tab:** Inspect local storage, session storage, cookies, and other browser storage mechanisms.

### 3.2. React Developer Tools Browser Extension

Install the React DevTools extension for your browser.

- **Components Tab:** Inspect the React component hierarchy, view component props and state, and locate the rendering source file.
- **Profiler Tab:** Record and analyze component render performance to identify bottlenecks.

### 3.3. Logging

- Use `console.log()`, `console.warn()`, `console.error()`, `console.debug()`, and `console.table()` strategically within your component logic to trace execution and inspect variable values.
- Remember to remove or disable excessive debug logging before committing.

### 3.4. Common Frontend Issues & Approaches

- **Hydration Errors:** Often caused by mismatches between server-rendered HTML and initial client-side render. Check for conditional rendering based on `window` or browser APIs executed only on the client, incorrect date/time formatting, or issues with third-party libraries.
- **State Update Issues (`Cannot update during render`):** Usually means you're trying to update state directly within the render function. Move state updates into `useEffect` hooks or event handlers.
- **UI Display Bugs:** Use the Elements tab to inspect CSS and HTML structure. Check for typos, incorrect Tailwind classes, or CSS conflicts.
- **Event Handling Problems:** Use breakpoints or `console.log` within event handlers to ensure they are firing and receiving the correct data.

## 4. Backend Debugging (Next.js API Routes / Server Components)

### 4.1. VS Code Debugger (Recommended)

- **Setup:** Ensure the standard "JavaScript Debugger" extension is installed.
- **Configuration (`.vscode/launch.json`):** Use or create a `launch.json` configuration to attach the debugger to the running Next.js development server (`npm run dev`). A common configuration might look like:
  ```json
  {
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Next.js: debug server-side",
        "type": "node-terminal",
        "request": "launch",
        "command": "npm run dev"
      },
      {
        "name": "Next.js: debug client-side",
        "type": "chrome", // Or "msedge", "firefox"
        "request": "launch",
        "url": "http://localhost:3000"
      },
      {
        "name": "Next.js: full stack",
        "type": "node-terminal",
        "request": "launch",
        "command": "npm run dev",
        "serverReadyAction": {
          "pattern": "started server on .+, url: (https?://.+)",
          "uriFormat": "%s",
          "action": "debugWithChrome" // Or "debugWithEdge"
        }
      }
    ]
  }
  ```
  _(Note: Adjust port and commands if necessary. Ensure `npm run dev` runs in debug mode if needed.)_
- **Usage:**
  - Start debugging using the chosen configuration (e.g., "Next.js: debug server-side" or "Next.js: full stack").
  - Set breakpoints in your API route handlers (`src/app/api/.../route.ts`), Server Components, service functions, or library code by clicking in the editor gutter.
  - Trigger the relevant API request or page load.
  - Execution will pause at your breakpoint, allowing you to inspect variables, the call stack, and step through the code.

### 4.2. Server-Side Logging

- **Project Loggers:** Utilize the shared logger (`@/lib/logger`) and database logger (`@/lib/data-mapping/db-logger`).
  - **Log Levels:** Control verbosity via the `NEXT_PUBLIC_LOG_LEVEL` environment variable (`debug`, `info`, `warn`, `error`). Set to `debug` in `.env.local` for maximum detail during development (`LOGGING_DEFAULTS` set level to `debug` in `development.js`).
  - **Usage:** Call `logger.debug(...)`, `logger.info(...)`, `logger.warn(...)`, `logger.error(...)` with descriptive messages and relevant context objects.
  - ```typescript
    import logger from '@/lib/logger';
    // ...
    logger.debug('Processing campaign update', { campaignId: id, userId });
    // ...
    if (error) {
      logger.error('Failed to update campaign', { campaignId: id, error });
    }
    ```
- **Output:** Logs appear in the terminal where `npm run dev` is running. For Vercel deployments, check the Function Logs in the Vercel dashboard.

### 4.3. Debugging API Requests

- **Direct Testing:** Use tools like Postman, Insomnia, or `curl` to send requests directly to your API endpoints (`http://localhost:3000/api/...`) without involving the frontend. This helps isolate backend issues.
- **Inspect Payloads:** Verify the exact request body, headers, and query parameters being sent.
- **Check Responses:** Analyze the status code, headers, and response body returned by the API.

### 4.4. Common Backend Issues & Approaches

- **Authentication/Authorization Errors (401/403):** Verify Clerk setup, middleware configuration, and that the correct `userId`/`orgId` is being passed and checked. Ensure the user has the required permissions.
- **Database Errors (Prisma):** Enable Prisma query logging (see Section 5). Check the generated SQL. Ensure database migrations are up-to-date (`npx prisma migrate dev`). Verify database connection strings.
- **Validation Errors (Zod):** Check the Zod schema definition against the incoming request data. Use the detailed error output logged by the API handler.
- **External API Failures:** Log requests/responses to external services. Check API keys and external service status dashboards.
- **Environment Variables:** Ensure all required environment variables are correctly set in `.env.local` and loaded properly (check `server-config.ts` logs if applicable).

## 5. Database Debugging (Prisma / PostgreSQL)

- **Prisma Studio:**
  - Run `npx prisma studio` in your terminal.
  - This opens a web interface to browse your database tables, view data, and check relationships.
- **Prisma Logging:**

  - Configure Prisma logging levels in your Prisma Client instantiation (e.g., in `src/lib/db.ts` or `src/lib/prisma.ts`).
  - ```typescript
    // Example: src/lib/prisma.ts
    import { PrismaClient } from '@prisma/client';

    const prismaClientSingleton = () => {
      return new PrismaClient({
        log:
          process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
    };
    // ... (singleton pattern)
    ```

  - Set `log: ['query']` (or more levels) in development to see the exact SQL queries being generated and executed in your `npm run dev` terminal.

- **Direct Database Connection:**
  - Use `psql` or a GUI client (DBeaver, TablePlus, pgAdmin) to connect directly to the database (using credentials from `.env.local`).
  - Allows direct inspection of data, schemas, and manual execution of SQL queries for testing (use with caution on non-local environments).

## 6. Debugging Specific Scenarios

- **Tests (Jest):** Use `console.log` within tests. Run Jest with the `--detectOpenHandles` flag to find leaks. Use the VS Code debugger with a Jest launch configuration.
- **Build Failures (`npm run build`):** Carefully read the error messages from the build output. Look for type errors (TypeScript), configuration issues (`next.config.js`), or problems with specific files mentioned in the logs.
- **Performance Issues:** Use the React DevTools Profiler, Next.js Bundle Analyzer (`ANALYZE=true npm run build`), and browser Network/Performance tabs to identify bottlenecks.

---

Remember to leverage the specific tools and logging capabilities available within the Justify project for efficient debugging.
