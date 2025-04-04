# API and Authentication

## API Structure

The application uses Next.js API Routes for backend functionality. API endpoints are organized in the `src/app/api` directory following the App Router pattern.

### API Directory Structure

```
src/app/api/
├── auth/                 # Authentication endpoints
│   └── [...nextauth]/    # NextAuth.js configuration
├── campaigns/            # Campaign management endpoints
│   ├── route.ts          # List and create campaigns
│   ├── [id]/             # Campaign-specific operations
│   │   └── route.ts      # Get, update, delete campaigns by ID
│   └── wizard/           # Campaign wizard endpoints
├── users/                # User management endpoints
├── influencers/          # Influencer management endpoints
├── search/               # Search functionality endpoints
├── uploads/              # File upload handling endpoints
├── reports/              # Reporting endpoints
└── webhooks/             # External service webhook endpoints
```

## Authentication

The application uses Auth0 and NextAuth.js for authentication and authorization.

### Authentication Flow

1. **User Sign-in**: 
   - Users authenticate through Auth0
   - NextAuth.js handles the OAuth flow
   - Upon successful authentication, JWT tokens are issued

2. **Session Management**:
   - User sessions are managed using secure HTTP-only cookies
   - JWT tokens contain user ID, role, and permissions
   - Sessions are validated on each API request

3. **Authorization**:
   - User roles (USER, ADMIN, SUPER_ADMIN, MANAGER, VIEWER)
   - Role-based access control for API endpoints
   - Feature-based permissions

### Auth Implementation

The authentication is configured in `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user roles and permissions to session
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
    async jwt({ token, user }) {
      // Add user data to JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Middleware

The application uses Next.js middleware to protect routes and validate auth tokens:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // Public paths - allowed without authentication
  const publicPaths = ["/auth/signin", "/auth/signup"];
  
  // Check if path is public
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to signin if not authenticated and path is protected
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }
  
  // Role-based access control
  if (token && req.nextUrl.pathname.startsWith("/admin") && token.role !== "ADMIN") {
    // Redirect to home if trying to access admin routes without admin role
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all paths except public assets
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

## API Security

The application employs several security measures:

1. **CORS Configuration**:
   - Strict origin validation
   - Allowlist of trusted domains

2. **Rate Limiting**:
   - Prevents brute force and DDoS attacks
   - Configured per-endpoint with different thresholds

3. **CSRF Protection**:
   - Anti-CSRF tokens for state-changing operations
   - SameSite cookie attributes

4. **Input Validation**:
   - Zod for schema validation
   - Sanitization of user inputs

5. **Error Handling**:
   - Custom error middleware
   - Appropriate error codes
   - Logging without sensitive information

## API Examples

### Campaign API Example

```typescript
// src/app/api/campaigns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema validation for campaign creation
const campaignSchema = z.object({
  name: z.string().min(2).max(255),
  businessGoal: z.string(),
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val)),
  timeZone: z.string(),
  primaryContact: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    position: z.string(),
  }),
  budget: z.object({
    currency: z.string(),
    amount: z.number().positive(),
  }),
});

// GET handler for listing campaigns
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 10;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
    const skip = (page - 1) * limit;

    // Database query with filters
    const where = {
      userId: session.user.id,
      ...(status ? { status } : {}),
    };

    // Get campaigns
    const campaigns = await prisma.campaignWizard.findMany({
      where,
      take: limit,
      skip,
      orderBy: { updatedAt: "desc" },
    });

    // Count total for pagination
    const total = await prisma.campaignWizard.count({ where });

    return NextResponse.json({
      data: campaigns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST handler for creating campaigns
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = campaignSchema.parse(body);

    // Create campaign
    const campaign = await prisma.campaignWizard.create({
      data: {
        id: uuidv4(),
        ...validatedData,
        updatedAt: new Date(),
        userId: session.user.id,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
```

### Protected Function Example

```typescript
// Example of a utility function to check permissions

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

// Role-based permission check
export async function checkPermission(
  req: NextRequest,
  allowedRoles: string[]
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return {
      hasPermission: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    return {
      hasPermission: false,
      response: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }
  
  return {
    hasPermission: true,
    userId: session.user.id,
    userRole: session.user.role,
  };
}
```

## API Error Handling

The application uses a consistent error handling approach:

1. HTTP Status Codes:
   - 200: Success
   - 201: Resource created
   - 400: Bad request (validation errors)
   - 401: Unauthorized (not authenticated)
   - 403: Forbidden (authenticated but not authorized)
   - 404: Resource not found
   - 500: Server error

2. Error Response Format:
   ```json
   {
     "error": "Error message",
     "details": {
       "fieldName": ["Validation error message"]
     }
   }
   ```

3. Success Response Format:
   ```json
   {
     "data": [...],
     "pagination": {
       "total": 100,
       "page": 1,
       "limit": 10,
       "pages": 10
     }
   }
   ``` 