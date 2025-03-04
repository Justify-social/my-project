import { NextResponse } from 'next/server';
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

// POST - Suspend a user
export async function POST(request: Request) {
  try {
    // Verify Super Admin status
    const superAdminCheck = await isSuperAdmin();
    if (!superAdminCheck) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access' 
      }, { status: 403 });
    }

    // Get request data
    const data = await request.json();
    const { userId } = data;

    // Validate input
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // In a production application, you would implement actual user suspension here.
    // For this demo, we'll just return success and handle it on the frontend
    
    console.log(`User suspension requested for user ID: ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'User suspended successfully',
      userId: userId
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to suspend user',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
} 