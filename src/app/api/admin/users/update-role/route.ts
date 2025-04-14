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

// Valid roles for users
const VALID_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];

// POST - Update user role
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
    const { userId, role } = data;

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

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Role must be one of: ${VALID_ROLES.join(', ')}`,
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

    // Try to update the team member role if table exists
    let teamMemberUpdated = false;
    try {
      // Check if TeamMember table exists
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'TeamMember'
        );
      `;

      const exists =
        Array.isArray(tableExists) &&
        tableExists.length > 0 &&
        (tableExists[0] as any).exists === true;

      if (exists) {
        // Update the user's role in the TeamMember table
        await prisma.$executeRaw`
          UPDATE "TeamMember"
          SET "role" = ${role}
          WHERE "memberId" = ${userId}
        `;
        teamMemberUpdated = true;
      }
    } catch (error) {
      console.error('Error updating TeamMember role:', error);
      // Continue anyway - we'll try the direct approach as fallback
    }

    // If we couldn't update team member role, update a 'role' field directly on User model if it exists
    if (!teamMemberUpdated) {
      try {
        // Using raw query to gracefully handle schema differences
        // Adjust WHERE clause if User model uses clerkId
        await prisma.$executeRaw`
          UPDATE "User"
          SET "role" = ${role}
          WHERE "id" = ${userId}
        `;
      } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update user role',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user role',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
