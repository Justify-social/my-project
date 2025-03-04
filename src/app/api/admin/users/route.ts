import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getCurrentUser } from '@/lib/user';

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

// GET all users - Super Admin only
export async function GET() {
  try {
    // Verify Super Admin status
    const superAdminCheck = await isSuperAdmin();
    if (!superAdminCheck) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Fetch all users from the database with only standard fields
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        surname: true,
        companyName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the users for the response
    const formattedUsers = users.map(user => {
      return {
        id: user.id,
        name: user.firstName && user.surname 
          ? `${user.firstName} ${user.surname}` 
          : user.email?.split('@')[0] || 'Unknown User',
        email: user.email || 'No email',
        companyId: user.companyName || 'No company',
        role: 'MEMBER', // Default role 
        lastLogin: user.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
} 