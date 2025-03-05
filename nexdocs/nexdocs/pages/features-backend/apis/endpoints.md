# API Endpoints Reference

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** API Team

## Overview

This document provides detailed information about the API endpoints available in the Campaign Wizard application. Each endpoint includes request and response examples, parameters, and error codes.

## Authentication

Most endpoints require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Campaign Endpoints

### List Campaigns

Retrieves a paginated list of campaigns.

**Endpoint:** `GET /api/campaigns`

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `filter[status]` (optional): Filter by status (DRAFT, IN_REVIEW, APPROVED, ACTIVE, COMPLETED)
- `sort` (optional): Sort field (default: -createdAt)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Summer Campaign 2023",
        "businessGoal": "Increase brand awareness",
        "startDate": "2023-06-01T00:00:00.000Z",
        "endDate": "2023-08-31T00:00:00.000Z",
        "status": "DRAFT",
        "updatedAt": "2023-05-15T14:30:00.000Z"
      },
      // More campaigns...
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to list campaigns

### Get Campaign

Retrieves a specific campaign by ID.

**Endpoint:** `GET /api/campaigns/:id`

**Authentication:** Required

**Path Parameters:**
- `id`: Campaign ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Summer Campaign 2023",
    "businessGoal": "Increase brand awareness",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-08-31T00:00:00.000Z",
    "timeZone": "UTC",
    "primaryContact": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "position": "Manager"
    },
    "budget": {
      "total": 50000,
      "currency": "USD",
      "allocation": [
        {
          "category": "Content Creation",
          "percentage": 30
        },
        {
          "category": "Media Spend",
          "percentage": 70
        }
      ]
    },
    "primaryKPI": "BRAND_AWARENESS",
    "secondaryKPIs": ["PURCHASE_INTENT", "AD_RECALL"],
    "features": ["BRAND_LIFT", "CREATIVE_ASSET_TESTING"],
    "status": "DRAFT",
    "updatedAt": "2023-05-15T14:30:00.000Z"
  }
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to view this campaign
- `RESOURCE_NOT_FOUND`: Campaign not found

### Create Campaign

Creates a new campaign.

**Endpoint:** `POST /api/campaigns`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Summer Campaign 2023",
  "businessGoal": "Increase brand awareness",
  "startDate": "2023-06-01T00:00:00.000Z",
  "endDate": "2023-08-31T00:00:00.000Z",
  "timeZone": "UTC",
  "primaryContact": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1 (555) 123-4567",
    "position": "Manager"
  },
  "budget": {
    "total": 50000,
    "currency": "USD",
    "allocation": [
      {
        "category": "Content Creation",
        "percentage": 30
      },
      {
        "category": "Media Spend",
        "percentage": 70
      }
    ]
  },
  "primaryKPI": "BRAND_AWARENESS",
  "secondaryKPIs": ["PURCHASE_INTENT", "AD_RECALL"],
  "features": ["BRAND_LIFT", "CREATIVE_ASSET_TESTING"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Summer Campaign 2023",
    "businessGoal": "Increase brand awareness",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-08-31T00:00:00.000Z",
    "timeZone": "UTC",
    "status": "DRAFT",
    "updatedAt": "2023-05-15T14:30:00.000Z"
  },
  "message": "Campaign created successfully"
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to create campaigns
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_CONFLICT`: Campaign with the same name already exists

### Update Campaign

Updates an existing campaign.

**Endpoint:** `PATCH /api/campaigns/:id`

**Authentication:** Required

**Path Parameters:**
- `id`: Campaign ID

**Request Body:**
```json
{
  "name": "Summer Campaign 2023 - Updated",
  "endDate": "2025-03-05T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Summer Campaign 2023 - Updated",
    "businessGoal": "Increase brand awareness",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2025-03-05T00:00:00.000Z",
    "timeZone": "UTC",
    "status": "DRAFT",
    "updatedAt": "2023-05-16T09:45:00.000Z"
  },
  "message": "Campaign updated successfully"
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to update this campaign
- `RESOURCE_NOT_FOUND`: Campaign not found
- `VALIDATION_ERROR`: Request validation failed

### Delete Campaign

Deletes a campaign.

**Endpoint:** `DELETE /api/campaigns/:id`

**Authentication:** Required

**Path Parameters:**
- `id`: Campaign ID

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to delete this campaign
- `RESOURCE_NOT_FOUND`: Campaign not found

## Campaign Wizard Endpoints

### Get Wizard Step Data

Retrieves data for a specific step in the campaign wizard.

**Endpoint:** `GET /api/campaigns/:id/wizard/:step`

**Authentication:** Required

**Path Parameters:**
- `id`: Campaign ID
- `step`: Step number (1-4)

**Response:**
```json
{
  "success": true,
  "data": {
    "step": 1,
    "isComplete": true,
    "fields": {
      "name": "Summer Campaign 2023",
      "businessGoal": "Increase brand awareness",
      "startDate": "2023-06-01T00:00:00.000Z",
      "endDate": "2023-08-31T00:00:00.000Z",
      "timeZone": "UTC",
      "primaryContact": {
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "phone": "+1 (555) 123-4567",
        "position": "Manager"
      },
      "budget": {
        "total": 50000,
        "currency": "USD",
        "allocation": [
          {
            "category": "Content Creation",
            "percentage": 30
          },
          {
            "category": "Media Spend",
            "percentage": 70
          }
        ]
      }
    }
  }
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to view this campaign
- `RESOURCE_NOT_FOUND`: Campaign not found
- `VALIDATION_ERROR`: Invalid step number

### Save Wizard Step Data

Saves data for a specific step in the campaign wizard.

**Endpoint:** `POST /api/campaigns/:id/wizard/:step`

**Authentication:** Required

**Path Parameters:**
- `id`: Campaign ID
- `step`: Step number (1-4)

**Request Body:**
```json
{
  "fields": {
    "name": "Summer Campaign 2023",
    "businessGoal": "Increase brand awareness",
    "startDate": "2023-06-01T00:00:00.000Z",
    "endDate": "2023-08-31T00:00:00.000Z",
    "timeZone": "UTC",
    "primaryContact": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "position": "Manager"
    },
    "budget": {
      "total": 50000,
      "currency": "USD",
      "allocation": [
        {
          "category": "Content Creation",
          "percentage": 30
        },
        {
          "category": "Media Spend",
          "percentage": 70
        }
      ]
    }
  },
  "isComplete": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "step": 1,
    "isComplete": true,
    "updatedAt": "2023-05-15T14:30:00.000Z"
  },
  "message": "Step data saved successfully"
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to update this campaign
- `RESOURCE_NOT_FOUND`: Campaign not found
- `VALIDATION_ERROR`: Request validation failed or invalid step number

### Get Wizard Status

Retrieves the completion status of all steps in the campaign wizard.

**Endpoint:** `GET /api/campaigns/:id/wizard/status`

**Authentication:** Required

**Path Parameters:**
- `id`: Campaign ID

**Response:**
```json
{
  "success": true,
  "data": {
    "currentStep": 2,
    "steps": [
      {
        "step": 1,
        "isComplete": true,
        "updatedAt": "2023-05-15T14:30:00.000Z"
      },
      {
        "step": 2,
        "isComplete": false,
        "updatedAt": null
      },
      {
        "step": 3,
        "isComplete": false,
        "updatedAt": null
      },
      {
        "step": 4,
        "isComplete": false,
        "updatedAt": null
      }
    ],
    "isComplete": false
  }
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to view this campaign
- `RESOURCE_NOT_FOUND`: Campaign not found

### Submit Campaign

Submits a completed campaign for review.

**Endpoint:** `POST /api/campaigns/:id/wizard/submit`

**Authentication:** Required

**Path Parameters:**
- `id`: Campaign ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "IN_REVIEW",
    "submittedAt": "2023-05-16T10:15:00.000Z"
  },
  "message": "Campaign submitted successfully"
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to submit this campaign
- `RESOURCE_NOT_FOUND`: Campaign not found
- `VALIDATION_ERROR`: Campaign is incomplete or already submitted

## Health Check Endpoints

### Database Health Check

Checks the health of the database connection.

**Endpoint:** `GET /api/health/db`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": {
      "connected": true,
      "responseTime": 5,
      "lastCheck": "2023-05-16T10:00:00.000Z"
    },
    "performance": {
      "slowQueries": {
        "total": 2,
        "slow": 1,
        "verySlow": 1,
        "critical": 0
      },
      "averageResponseTime": 12
    }
  }
}
```

**Error Codes:**
- `AUTHENTICATION_ERROR`: User is not authenticated
- `AUTHORIZATION_ERROR`: User is not authorized to access health checks

## Related Documentation

- [API Overview](./overview.md)
- [Cint API Reference](./cint-api-reference.md)
- [Authentication System](../authentication/overview.md) 