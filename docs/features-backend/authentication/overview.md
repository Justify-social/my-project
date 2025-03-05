# Authentication System Overview

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Security Team

## Overview

The Campaign Wizard application uses a robust authentication system to secure access to the application and its APIs. This document provides an overview of the authentication architecture, flows, and security considerations.

## Authentication Architecture

Our authentication system is built on the following components:

1. **JWT-Based Authentication**: JSON Web Tokens for stateless authentication
2. **Role-Based Access Control**: Different permission levels based on user roles
3. **Secure Session Management**: HTTP-only cookies with proper security attributes
4. **Multi-Factor Authentication**: Optional 2FA for enhanced security
5. **OAuth Integration**: Support for social login providers

## Authentication Flows

### Standard Email/Password Authentication

1. User submits email and password to `/api/auth/login`
2. Server validates credentials against the database
3. If valid, server generates a JWT token
4. Token is returned to the client and stored in an HTTP-only cookie
5. Subsequent requests include the token for authentication

### OAuth Authentication

1. User clicks on a social login provider (Google, Microsoft, etc.)
2. User is redirected to the provider's authentication page
3. After successful authentication, the provider redirects back with an authorization code
4. Server exchanges the code for an access token
5. Server creates or updates the user account and issues a JWT token
6. Token is stored in an HTTP-only cookie

### Multi-Factor Authentication

1. User completes the primary authentication (email/password or OAuth)
2. If MFA is enabled, user is prompted for a second factor
3. User provides the second factor (TOTP code, SMS code, etc.)
4. Server validates the second factor
5. If valid, server issues a JWT token with full access

## JWT Token Structure

Our JWT tokens include the following claims:

```json
{
  "sub": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "ADMIN",
  "permissions": ["campaigns:read", "campaigns:write"],
  "iat": 1620000000,
  "exp": 1620086400
}
```

## Role-Based Access Control

The application defines the following roles:

| Role | Description | Permissions |
|------|-------------|------------|
| `USER` | Standard user | Limited access to own campaigns |
| `ADMIN` | Administrator | Full access to all campaigns, user management |
| `SUPER_ADMIN` | Super administrator | Full access to all features, system configuration |

## Security Considerations

### Token Storage

- JWT tokens are stored in HTTP-only cookies to prevent JavaScript access
- Cookies are configured with the `Secure` flag to ensure HTTPS-only transmission
- Cookies use `SameSite=Lax` to prevent CSRF attacks

### Token Expiration

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Token rotation is implemented for refresh tokens

### Password Security

- Passwords are hashed using bcrypt with a work factor of 12
- Password strength requirements are enforced
- Account lockout is implemented after 5 failed login attempts

## Implementation Details

### Authentication Middleware

The application uses middleware to validate authentication on protected routes:

```typescript
// Authentication middleware
export const withAuth = (handler: NextApiHandler): NextApiHandler => {
  return async (req, res) => {
    try {
      // Extract token from Authorization header or cookie
      const token = extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication required'
          }
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user to request
      req.user = decoded;
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid token'
          }
        });
      }
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      });
    }
  };
};
```

### Authorization Middleware

The application uses middleware to check permissions for specific actions:

```typescript
// Authorization middleware
export const withPermission = (permission: string) => {
  return (handler: NextApiHandler): NextApiHandler => {
    return async (req, res) => {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication required'
          }
        });
      }
      
      // Check if user has the required permission
      if (!req.user.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Permission denied'
          }
        });
      }
      
      // Call the original handler
      return handler(req, res);
    };
  };
};
```

## Authentication API Endpoints

### Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "ADMIN"
    },
    "token": "jwt-token" // Only included if not using cookies
  }
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User

**Endpoint:** `GET /api/users/me`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "ADMIN",
      "permissions": ["campaigns:read", "campaigns:write"]
    }
  }
}
```

## Related Documentation

- [API Overview](../apis/overview.md)
- [API Endpoints](../apis/endpoints.md)
- [Implementation Details](./implementation.md) 