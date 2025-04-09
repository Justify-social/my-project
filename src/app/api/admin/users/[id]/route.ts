import { NextResponse, NextRequest } from 'next/server';
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

// GET user details - Super Admin only
export async function GET(
  request: NextRequest,
  context: { params: { id: string } } // Use the expected inline type
) {
  try {
    // Verify Super Admin status
    const superAdminCheck = await isSuperAdmin();
    if (!superAdminCheck) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized access'
      }, { status: 403 });
    }

    const { id } = context.params; // Access id via context.params
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Fetch user details and explicitly type the result
    const user: SelectedUserData | null = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        surname: true,
        companyName: true,
        profilePictureUrl: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Format user data for response
    const userData = {
      id: user.id,
      name: user.firstName && user.surname
        ? `${user.firstName} ${user.surname}`
        : user.email?.split('@')[0] || 'Unknown User',
      email: user.email || 'No email',
      firstName: user.firstName,
      surname: user.surname,
      companyName: user.companyName || 'No company',
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.updatedAt.toISOString(),
      role: user.role || 'MEMBER',
    };

    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user details',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
} 