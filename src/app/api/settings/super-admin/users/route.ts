import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { User } from '@prisma/client'; // Import User type if needed for explicit typing
// import { prisma } from '@/lib/prisma'; // We'll need this later

/**
 * GET /api/settings/super-admin/users
 * Fetches a list of users (Super Admin only).
 */
export async function GET(_request: Request) {
  try {
    const { userId: _userId, sessionClaims } = await auth();

    // Verify Super Admin role from custom claims
    if (sessionClaims?.['metadata.role'] !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Admin role required.' },
        { status: 403 }
      );
    }

    console.log('API: Fetching users (Super Admin verified)');

    // TODO: Implement actual Prisma query to fetch users
    // Example: const users = await prisma.user.findMany({...});
    const users: User[] = []; // Explicitly type the placeholder array

    return NextResponse.json({ success: true, users: users }, { status: 200 });
  } catch (error) {
    console.error('API Error fetching users:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// TODO: Add POST/PATCH/DELETE handlers for user management (update role, suspend, etc.)
