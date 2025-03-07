# Authentication Implementation Details

**Last Updated:** 2025-03-05  
**Status:** Active  
**Owner:** Security Team

## Overview

This document provides detailed implementation information for the authentication system in the Justify.social platform. It covers the technical implementation of authentication flows, middleware, and security measures.

## Technology Stack

The authentication system uses the following technologies:

- **NextAuth.js**: Authentication framework for Next.js
- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing
- **Prisma**: Database access for user data
- **Zod**: Schema validation for authentication requests

## Database Schema

The authentication system relies on the following database models:

### User Model

```prisma
model User {
  id        String      @id @default(uuid())
  email     String      @unique
  name      String?
  image     String?
  password  String?     // Hashed password (null for OAuth users)
  role      UserRole    @default(USER)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  // Relationships
  notificationPrefs NotificationPrefs?
  campaigns         CampaignWizard[]
  teamMemberships   TeamMember[]
  sessions          Session[]
  accounts          Account[]
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}
```

### Account Model (for OAuth)

```prisma
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

### Session Model

```prisma
model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## NextAuth.js Configuration

The authentication system is configured in `pages/api/auth/[...nextauth].ts`:

```typescript
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import MicrosoftProvider from 'next-auth/providers/microsoft';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }),
    
    // OAuth providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET
    })
  ],
  
  // JWT configuration
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 hour
  },
  
  // JWT callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  
  // Pages configuration
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  
  // Security configuration
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});
```

## Authentication Middleware

The application uses middleware to protect routes that require authentication:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/api/auth'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // If not authenticated, redirect to login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Admin-only paths
  const adminPaths = ['/admin', '/api/admin'];
  
  // Check if the path is admin-only
  const isAdminPath = adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(`${adminPath}/`)
  );
  
  // If admin-only path but user is not admin, return forbidden
  if (isAdminPath && token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Permission denied' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files and public assets
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

## API Route Protection

For API routes, we use a higher-order function to protect routes:

```typescript
// lib/auth/withAuth.ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
    }
    
    // Add user to request
    req.user = session.user;
    
    // Call the original handler
    return handler(req, res);
  };
}
```

## Role-Based Authorization

For role-based authorization, we use a higher-order function:

```typescript
// lib/auth/withRole.ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from './withAuth';

export function withRole(role: string | string[]) {
  return (handler: NextApiHandler) => {
    const authHandler = withAuth(handler);
    
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // Check if user has the required role
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication required'
          }
        });
      }
      
      const roles = Array.isArray(role) ? role : [role];
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Permission denied'
          }
        });
      }
      
      // Call the auth handler
      return authHandler(req, res);
    };
  };
}
```

## User Registration

The user registration process is implemented in `pages/api/auth/register.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      }
    });
  }
  
  try {
    // Validate request body
    const data = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'RESOURCE_CONFLICT',
          message: 'User with this email already exists'
        }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    
    return res.status(201).json({
      success: true,
      data: { user },
      message: 'User registered successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors
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
}
```

## Password Reset Flow

The password reset flow is implemented using the following endpoints:

1. `POST /api/auth/forgot-password`: Initiates the password reset process
2. `GET /api/auth/reset-password/:token`: Validates the reset token
3. `POST /api/auth/reset-password`: Resets the password

### Forgot Password

```typescript
// pages/api/auth/forgot-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateToken } from '@/lib/auth/tokens';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      }
    });
  }
  
  try {
    // Validate request body
    const data = forgotPasswordSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    // Always return success, even if user doesn't exist (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // Generate reset token
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration
    
    // Save reset token
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expires
      }
    });
    
    // Send email
    await sendPasswordResetEmail(user.email, token);
    
    return res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors
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
}
```

### Reset Password

```typescript
// pages/api/auth/reset-password.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      }
    });
  }
  
  try {
    // Validate request body
    const data = resetPasswordSchema.parse(req.body);
    
    // Find reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token: data.token },
      include: { user: true }
    });
    
    // Check if token exists and is valid
    if (!resetToken || resetToken.expires < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });
    
    // Delete reset token
    await prisma.passwordReset.delete({
      where: { id: resetToken.id }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors
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
}
```

## Security Considerations

### CSRF Protection

NextAuth.js includes built-in CSRF protection for authentication routes. For additional protection, we use the `SameSite=Lax` cookie attribute.

### Rate Limiting

We implement rate limiting for authentication endpoints to prevent brute force attacks:

```typescript
// lib/middleware/rateLimit.ts
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import { getClientIp } from 'request-ip';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getClientIp(req) || 'unknown';
  }
});

export function withRateLimit(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      limiter(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        
        return resolve(handler(req, res));
      });
    });
  };
}
```

### Account Lockout

We implement account lockout after multiple failed login attempts:

```typescript
// lib/auth/loginAttempts.ts
import { prisma } from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function recordLoginAttempt(email: string, success: boolean) {
  const now = new Date();
  
  if (success) {
    // Reset failed attempts on successful login
    await prisma.loginAttempt.deleteMany({
      where: { email }
    });
    return;
  }
  
  // Record failed attempt
  await prisma.loginAttempt.create({
    data: {
      email,
      timestamp: now
    }
  });
}

export async function isAccountLocked(email: string) {
  const now = new Date();
  const lockoutTime = new Date(now.getTime() - LOCKOUT_DURATION);
  
  // Count recent failed attempts
  const recentAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      timestamp: {
        gte: lockoutTime
      }
    }
  });
  
  return recentAttempts >= MAX_ATTEMPTS;
}
```

## Related Documentation

- [Authentication Overview](./overview.md)
- [API Endpoints](../apis/endpoints.md)
- [Database Schema](../database/schema.md) 