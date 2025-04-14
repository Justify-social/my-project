# API Overview

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** API Team

## Overview

The Justify.social platform provides a comprehensive set of APIs for interacting with the system programmatically. These APIs follow RESTful principles and are designed to be consistent, secure, and performant.

## API Architecture

Our API architecture follows these key principles:

1. **RESTful Design**: Resources are represented as URLs, with HTTP methods defining actions
2. **JSON Format**: All requests and responses use JSON format
3. **Authentication**: JWT-based authentication for secure access
4. **Validation**: Request validation using Zod schemas
5. **Error Handling**: Standardized error responses
6. **Versioning**: API versioning for backward compatibility

## API Categories

The APIs are organized into the following categories:

### Campaign Management

APIs for creating, reading, updating, and deleting campaigns:

- `GET /api/campaigns`: List all campaigns
- `GET /api/campaigns/:id`: Get a specific campaign
- `POST /api/campaigns`: Create a new campaign
- `PATCH /api/campaigns/:id`: Update a campaign
- `DELETE /api/campaigns/:id`: Delete a campaign

### Campaign Wizard

APIs for the step-by-step campaign creation process:

- `GET /api/campaigns/:id/wizard/:step`: Get step data
- `POST /api/campaigns/:id/wizard/:step`: Save step data
- `GET /api/campaigns/:id/wizard/status`: Get wizard completion status
- `POST /api/campaigns/:id/wizard/submit`: Submit completed campaign

### User Management

APIs for user authentication and management:

- `POST /api/auth/login`: User login
- `POST /api/auth/logout`: User logout
- `GET /api/users/me`: Get current user
- `PATCH /api/users/me`: Update current user
- `GET /api/users`: List users (admin only)

### Influencer Management

APIs for managing influencers:

- `GET /api/influencers`: List influencers
- `GET /api/influencers/:id`: Get a specific influencer
- `POST /api/influencers`: Create a new influencer
- `PATCH /api/influencers/:id`: Update an influencer
- `DELETE /api/influencers/:id`: Delete an influencer

### Health & Monitoring

APIs for system health and monitoring:

- `GET /api/health`: Overall system health
- `GET /api/health/db`: Database health
- `GET /api/health/services`: External services health

## Authentication

All API requests (except public endpoints) require authentication using JWT tokens:

```
Authorization: Bearer <token>
```

Tokens are obtained through the login endpoint and have a configurable expiration time.

## Request Format

API requests should follow this format:

```json
{
  "field1": "value1",
  "field2": "value2",
  "nestedObject": {
    "nestedField": "nestedValue"
  }
}
```

## Response Format

API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {
      // Optional error details
    }
  }
}
```

## Error Codes

Common error codes returned by the API:

| Code                   | Description                         |
| ---------------------- | ----------------------------------- |
| `VALIDATION_ERROR`     | Request validation failed           |
| `AUTHENTICATION_ERROR` | Authentication failed               |
| `AUTHORIZATION_ERROR`  | User not authorized for this action |
| `RESOURCE_NOT_FOUND`   | Requested resource not found        |
| `RESOURCE_CONFLICT`    | Resource already exists             |
| `INTERNAL_ERROR`       | Internal server error               |

## Rate Limiting

API requests are rate-limited to prevent abuse:

- 100 requests per minute per user
- 1000 requests per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1620000000
```

## Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Pagination information is included in the response:

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

## Filtering and Sorting

List endpoints support filtering and sorting:

- `filter[field]=value`: Filter by field value
- `sort=field`: Sort by field (ascending)
- `sort=-field`: Sort by field (descending)

Example:

```
GET /api/campaigns?filter[status]=DRAFT&sort=-createdAt
```

## External API Integrations

The Campaign Wizard integrates with several external APIs:

- [Cint API](./cint-api-reference.md): For audience targeting and survey distribution
- Payment Gateway API: For handling payments
- Analytics API: For campaign performance tracking

## API Documentation

Detailed API documentation is available in the following formats:

- [OpenAPI Specification](./openapi.yaml): Machine-readable API definition
- [API Reference](./endpoints.md): Human-readable API reference
- [Postman Collection](./postman-collection.json): Ready-to-use API collection for Postman

## Related Documentation

- [API Endpoints](./endpoints.md)
- [Cint API Reference](./cint-api-reference.md)
- [Authentication System](../authentication/overview.md)
