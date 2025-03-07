# Developer Troubleshooting Guide

**Last Updated:** 2025-03-07  
**Status:** Active  
**Owner:** Platform Team

## Overview

This guide addresses common issues developers encounter when working with Justify.social, offering both quick solutions and deeper insights into the underlying architecture.

## Architectural Context

Understanding Justify.social's architecture helps troubleshoot issues more effectively:

```
Client (React/Next.js) ↔ API Layer (Next.js API Routes) ↔ Database (PostgreSQL/Prisma)
```

Most issues occur at the boundaries between these layers, especially during data transformation.

## Common Issue Patterns

### 1. Frontend-Backend Data Mismatches

**Symptoms:**
- "Validation failed" errors during form submission
- Unexpected null values in the UI
- Form fields not populating with API data

**Root Causes:**
- Enum format mismatches (camelCase vs. UPPERCASE_SNAKE_CASE)
- Date format inconsistencies
- JSON serialization/deserialization issues

**Solutions:**

```typescript
// Use the EnumTransformers consistently at API boundaries
import { EnumTransformers } from '@/utils/enum-transformers';

// For outgoing data (frontend → backend)
const apiData = EnumTransformers.transformObjectToBackend(formData);

// For incoming data (backend → frontend)
const uiData = EnumTransformers.transformObjectFromBackend(apiResponse);
```

**Key Insight:** Always transform data at system boundaries, not within components.

### 2. Component Rendering Issues

**Symptoms:**
- Client/server hydration warnings
- "Cannot update a component while rendering" errors
- Unresponsive UI after state updates

**Root Causes:**
- Mixing server and client components incorrectly
- State updates during render
- Missing key props in lists

**Solutions:**

```tsx
// Clear separation of server/client components
// layout.tsx (Server Component)
export const dynamic = 'force-dynamic';

// page.tsx (Client Component)
"use client";
import { useEffect, useState } from 'react';
```

**Key Insight:** Design components with clear responsibilities - data fetching in server components, interactivity in client components.

### 3. API Route Issues

**Symptoms:**
- 500 errors from API routes
- Timeouts during API calls
- Inconsistent response formats

**Root Causes:**
- Incorrect error handling
- Prisma query issues
- Missing request validation

**Solutions:**

```typescript
// Consistent API route pattern
export async function GET(request: Request) {
  try {
    // 1. Extract and validate parameters
    // 2. Perform database operation
    // 3. Transform response data
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status || 500 }
    );
  }
}
```

**Key Insight:** Every API route should follow the same pattern for consistency and predictability.

### 4. Form Data Handling

**Symptoms:**
- Form state not updating
- Lost data between form steps
- Unexpected validation errors

**Root Causes:**
- Incorrect form initialization
- Missing context providers
- Improper validation schemas

**Solutions:**

```tsx
// WizardContext proper usage
const { updateFormData, formData } = useWizardContext();

// Initialize with useEffect, not in render
useEffect(() => {
  if (campaignData && !hasLoadedData) {
    setFormValues(transformData(campaignData));
    setHasLoadedData(true);
  }
}, [campaignData, hasLoadedData]);
```

**Key Insight:** Use the WizardContext for all multi-step form state management to prevent data loss.

### 5. Database Connection Issues

**Symptoms:**
- "Connection refused" errors
- Prisma client initialization failures
- Slow database operations

**Root Causes:**
- Environment variable misconfiguration
- Connection pool exhaustion
- Missing database indexes

**Solutions:**

```typescript
// Proper Prisma client initialization
import { PrismaClient } from '@prisma/client';

// Use global singleton to prevent connection leaks
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Key Insight:** Database connections are limited resources; manage them carefully.

## Debugging Tools & Techniques

### Console Debugging

Strategic console logging provides visibility into application flow:

```typescript
// Tagged console logs for easier filtering
console.log('[API:Campaign]', data);
console.log('[Component:Step1]', formState);
console.log('[Context:Wizard]', contextValue);
```

### Network Monitoring

Monitor API calls through the browser's Network tab:
1. Filter by XHR/Fetch requests
2. Examine request payloads and response bodies
3. Look for error status codes (4xx, 5xx)

### React DevTools

Use React DevTools to inspect:
1. Component hierarchy
2. Props and state values
3. Context providers and consumers
4. Render performance

### Prisma Studio

For database issues:
1. Run `npx prisma studio`
2. Examine table relationships
3. Verify data integrity
4. Test queries directly

## Common Error Messages Explained

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| "Invalid enum value" | Enum value format mismatch | Use EnumTransformers at API boundaries |
| "Cannot update during render" | State change during component render | Move updates to effects or event handlers |
| "Invalid revalidate value" | Server/client component confusion | Move directives to layout components |
| "Influencer data incomplete" | Missing required fields in influencer object | Use draft validation for incomplete data |
| "TypeError: Cannot read properties of undefined" | Attempting to access properties on null/undefined | Add null checks and default values |

## Prevention Strategies

1. **Code Reviews**: Focus on boundary transformations and state management
2. **TypeScript Strict Mode**: Enable strict null checks and no implicit any
3. **Automated Tests**: Unit test transformers, integration test API routes
4. **Error Boundaries**: Implement React error boundaries to contain failures
5. **Logging**: Use structured logging with context tags

## Related Resources

- [Database Schema Updates](../../features-backend/database/schema-updates.md)
- [Campaign Wizard Workflow](../../features-frontend/campaign-wizard/workflow.md)
- [Deployment Guide](./deployment.md) 