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

    // Separately fetch team member data if needed
    // This is a separate query to avoid schema issues
    try {
      // Check if TeamMember table exists
      const teamMembersExist = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'TeamMember'
        );
      `;
      
      const exists = Array.isArray(teamMembersExist) && 
                   teamMembersExist.length > 0 && 
                   (teamMembersExist[0] as any).exists === true;
      
      if (exists) {
        // If table exists, fetch team memberships
        const teamMemberships = await prisma.$queryRaw`
          SELECT "memberId", "role" FROM "TeamMember"
        `;
        
        // Add team roles to formatted users
        if (Array.isArray(teamMemberships)) {
          const membershipMap = new Map();
          teamMemberships.forEach((membership: any) => {
            membershipMap.set(membership.memberId, membership.role);
          });
          
          formattedUsers.forEach(user => {
            if (membershipMap.has(user.id)) {
              user.role = membershipMap.get(user.id);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching team memberships:', error);
      // Continue without team memberships
    }

    return NextResponse.json({ 
      success: true, 
      users: formattedUsers 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
} 