import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Custom type for Auth0 session user
interface Auth0User {
  sub: string;
  email: string;
  name: string;
  [key: string]: any; // For custom claims
}

// Helper to check if user is a Super Admin
async function isSuperAdmin() {
  try {
    const session = await getSession();
    if (!session || !session.user) return false;

    // Cast user to Auth0User type to access custom claims
    const user = session.user as Auth0User;
    const roles = user['https://justify.social/roles'] || [];
    return Array.isArray(roles) && roles.includes('super_admin');
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
 */
export async function GET(
  request: NextRequest,
  contextOrParams: any // Revert to 'any' workaround
) {
  let id: string | undefined; // Declare id outside try
  try {
    // Safely access id
    id = contextOrParams?.params?.id || contextOrParams?.id;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // TODO: Add actual admin check and Prisma logic here, referencing backup file
    // const user = await prisma.user.findUnique({ where: { id } });
    // if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Simulated response for now
    const simulatedUser = { id, name: "Simulated User", email: `user-${id}@example.com` };
    return NextResponse.json({ success: true, data: simulatedUser });

  } catch (error) {
    // Use id (now accessible) in error message
    console.error(`Error in GET /api/admin/users/${id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 