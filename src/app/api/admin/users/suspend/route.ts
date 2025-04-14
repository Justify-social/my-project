import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server'; // Use Clerk auth

// Define expected structure for sessionClaims metadata
interface SessionClaimsMetadata {
  role?: string;
}

interface CustomSessionClaims {
  metadata?: SessionClaimsMetadata;
}

// Helper to check if user is a Super Admin using Clerk
async function isSuperAdmin() {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    // Check role in Clerk metadata
    const metadata = (sessionClaims as CustomSessionClaims | null)?.metadata;
    return metadata?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

// POST - Suspend a user
export async function POST(request: Request) {
  try {
    // Verify Super Admin status
    const superAdminCheck = await isSuperAdmin();
    if (!superAdminCheck) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access',
        },
        { status: 403 }
      );
    }

    // Get request data
    const data = await request.json();
    const { userId } = data;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check if the user exists
    // IMPORTANT: Ensure userId being passed matches the ID format in your User table (e.g., Clerk User ID)
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Or perhaps where: { clerkId: userId }
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // In a production application, you would implement actual user suspension here.
    // This might involve calling the Clerk Backend API to ban the user:
    // https://clerk.com/docs/reference/backend-api/tag/Users#operation/BanUser
    // For now, we log and return success.

    console.log(`User suspension requested for user ID: ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'User suspension requested successfully (backend action pending)',
      userId: userId,
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to suspend user',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
