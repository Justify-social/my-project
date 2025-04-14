# Architectural Design Decisions

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Architecture Team

## Overview

This document outlines the key architectural design decisions made in the Justify.social platform. These decisions guide the development process and provide context for future maintenance and enhancements.

## Middleware Architecture

### Decision: Layered Middleware Approach

We implemented a layered middleware system to handle validation, error handling, and business logic:

```
┌─────────────────────────────────────┐
│             API Route               │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      validateApi Middleware         │
│  (Request validation using Zod)     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│     handleApiErrors Middleware      │
│   (Database error standardization)  │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│        Business Logic Layer         │
│  (Core functionality with Prisma)   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      Standardized API Response      │
└─────────────────────────────────────┘
```

**Rationale**:

- Separation of concerns for better maintainability
- Consistent error handling across all API routes
- Centralized validation using schema definitions
- Standardized response format

## Database Access Pattern

### Decision: Prisma ORM with Extended Client

We chose to use Prisma ORM with a custom extended client that provides additional functionality.

**Rationale**:

- Type safety with generated types
- Query optimization and connection pooling
- Custom extensions for specific business needs
- Consistent data access patterns

### Implementation:

```typescript
// Extending the Prisma client
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    // Custom extensions
    model: {
      campaignWizard: {
        async findWithHistoryById(id: string) {
          // Custom implementation
        },
      },
    },
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();
```

## Form Data Transformation

### Decision: Client-Side Data Transformation

We implemented client-side data transformation utilities to convert between UI form state and API-compatible formats.

**Rationale**:

- Reduce backend processing load
- Immediate feedback for users
- Consistent data format for API
- Support for complex form structures

### Implementation:

```typescript
// Example transformer
export function transformCampaignFormData(formValues: CampaignFormValues): CampaignApiPayload {
  return {
    name: formValues.name,
    businessGoal: formValues.businessGoal,
    startDate: new Date(formValues.startDate).toISOString(),
    endDate: new Date(formValues.endDate).toISOString(),
    // Transform nested data
    primaryContact: formValues.primaryContact
      ? {
          name: formValues.primaryContact.name,
          email: formValues.primaryContact.email,
          phone: formValues.primaryContact.phone,
          position: formValues.primaryContact.position,
        }
      : undefined,
    // Convert budget values to proper format
    budget: transformBudgetData(formValues.budget),
  };
}
```

## API Response Format

### Decision: Standardized Response Structure

We implemented a consistent response format for all API endpoints:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}
```

**Rationale**:

- Consistent error handling client-side
- Clear indication of success/failure
- Structured error information
- Type-safe response data

## Authentication Strategy

### Decision: JWT-Based Authentication

We chose JWT (JSON Web Token) for authentication with server-side session validation.

**Rationale**:

- Stateless authentication
- Scalability across multiple servers
- Efficient token verification
- Support for custom claims and roles

## Monitoring and Health Checks

### Decision: Comprehensive Health Check Endpoints

We implemented dedicated health check endpoints for different system components.

**Rationale**:

- Early detection of issues
- Support for automated monitoring
- System status visibility
- Performance metrics collection

## Related Documentation

- [Implementation Plan](./implementation-plan.md)
- [API Documentation](../apis/overview.md)
- [Database Architecture](../database/overview.md)
