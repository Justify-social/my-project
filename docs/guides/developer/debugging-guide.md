# Debugging Guide

**Last Reviewed:** 2025-05-09
**Status:** Placeholder - Needs Content

## Overview

This guide provides practical steps, techniques, and best practices for debugging common issues encountered while developing the Justify platform. Effective debugging is essential for identifying and fixing problems quickly.

_(Action: Tech Lead/Senior Devs to populate this guide with specific techniques and common scenarios.)_

## Key Debugging Areas

### 1. Frontend Debugging (React / Next.js Client Components)

- **Browser Developer Tools (Essential)**
  - Using the Console (`console.log`, `console.warn`, `console.error`, `console.table`)
  - Inspecting Elements and Styles
  - Setting Breakpoints in the Sources Tab
  - Analyzing Network Requests (Status codes, payloads, responses)
  - Using the Application Tab (Local storage, session storage, cookies)
- **React DevTools Browser Extension**
  - Inspecting Component Hierarchy and Props
  - Inspecting State and Hooks
  - Profiling Component Renders to find bottlenecks
- **Common Frontend Issues & How to Approach Them**
  - Hydration Errors
  - State Update Issues (`Cannot update during render`)
  - UI Display Bugs
  - Event Handling Problems

### 2. Backend Debugging (Next.js API Routes / Server Components)

- **VS Code Debugger (or preferred IDE debugger)**
  - Setting up `launch.json` configurations (if not already present).
  - Setting Breakpoints in API routes, services, and library code.
  - Stepping through code execution.
  - Inspecting variables and call stack.
- **Server-Side Logging**
  - Using the centralized logger (`src/lib/logger/`) effectively.
  - Understanding log levels and output.
  - Checking Vercel function logs (or server console output locally).
- **Debugging API Requests**
  - Using tools like Postman or `curl` to test API endpoints directly.
  - Checking API request/response payloads and headers.
- **Common Backend Issues & How to Approach Them**
  - Authentication/Authorization Errors (401, 403)
  - Database Query Errors (Prisma errors)
  - Validation Errors (Zod errors)
  - External API Integration Failures
  - Environment Variable Issues

### 3. Database Debugging (Prisma / PostgreSQL)

- **Prisma Studio**
  - Running `npx prisma studio`.
  - Browsing table data.
  - Verifying data integrity and relationships.
- **Prisma Logging**
  - Enabling query logging in development (configured in `src/lib/db.ts` or similar).
  - Analyzing generated SQL queries.
- **Direct Database Connection**
  - Connecting via `psql` or a GUI client (e.g., pgAdmin, DBeaver) to inspect data or run direct SQL queries (use with caution).

### 4. Debugging Specific Scenarios

- Debugging Tests (Unit, Integration, E2E)
- Debugging Build Failures
- Debugging Performance Issues (using profilers, bundle analyzer)

## General Tips & Best Practices

- Understand the Data Flow
- Isolate the Problem (Simplify the scenario)
- Read Error Messages Carefully
- Use Version Control (Check recent changes)
- Ask for Help (Explain what you've tried)

This guide will be expanded over time with more specific examples and common pitfalls relevant to the Justify codebase.
