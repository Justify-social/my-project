import { NextRequest, NextResponse } from 'next/server';
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

// Define interface for the GET route context parameters
// interface RouteParams { // Keep commented out
//   id: string;
// }

// Define type for selected user data
interface SelectedUserData {
  id: string;
  email: string | null;
  firstName: string | null;
  surname: string | null;
  companyName: string | null;
  profilePictureUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null; // Assuming role is optional/string
}

/**
 * GET user details by ID (Admin)
 * TODO: Implement proper user fetching and ensure calling code checks isSuperAdmin()
 */
export async function GET(
  request: NextRequest,
  contextOrParams: any // Revert to 'any' workaround
) {
  let id: string | undefined; // Declare id outside try
  try {
    // Check admin status first (assuming this route requires admin)
    // if (!await isSuperAdmin()) {
    //   return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    // }

    // Safely access id
    id = contextOrParams?.params?.id || contextOrParams?.id;
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // TODO: Add actual admin check and Prisma logic here, referencing backup file
    // const user = await prisma.user.findUnique({ where: { id } });
    // if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Simulated response for now
    const simulatedUser = { id, name: 'Simulated User', email: `user-${id}@example.com` };
    return NextResponse.json({ success: true, data: simulatedUser });
  } catch (error) {
    // Use id (now accessible) in error message
    console.error(`Error in GET /api/admin/users/${id}:`, error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
