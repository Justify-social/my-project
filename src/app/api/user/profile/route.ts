import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { auth0 } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  location?: string;
}

/**
 * GET /api/user/profile
 * Fetches the user's profile information
 */
export async function GET() {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // In development mode, return mock data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        data: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          jobTitle: 'Product Manager',
          department: 'Product',
          location: 'New York, NY'
        } 
      });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.sub }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Map database model to response format
    const profileData: UserProfileData = {
      firstName: user.firstName || '',
      lastName: user.surname || '',
      email: user.email,
      jobTitle: user.jobTitle || '',
      department: user.department || '',
      location: user.location || ''
    };
    
    return NextResponse.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

/**
 * PUT /api/user/profile
 * Updates the user's profile information
 */
export async function PUT(request: Request) {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const userData: UserProfileData = await request.json();
    
    // Basic validation
    if (!userData.firstName || !userData.lastName || !userData.email) {
      return NextResponse.json({ 
        error: 'First name, last name, and email are required' 
      }, { status: 400 });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // In development mode, just return success
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true, 
        data: userData 
      });
    }
    
    // Update user in Auth0
    try {
      const { token } = await auth0.getAccessToken();
      
      // Call Auth0 Management API to update user
      const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session.user.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          given_name: userData.firstName,
          family_name: userData.lastName,
          name: `${userData.firstName} ${userData.lastName}`,
          // Only update email if changed and email_verified will be set to false by Auth0
          ...(userData.email !== session.user.email ? { email: userData.email } : {})
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Auth0 profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile in Auth0' }, { status: 500 });
      }
    } catch (authError) {
      console.error('Error updating Auth0 profile:', authError);
      return NextResponse.json({ error: 'Failed to update Auth0 profile' }, { status: 500 });
    }
    
    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.sub },
      data: {
        firstName: userData.firstName,
        surname: userData.lastName,
        email: userData.email,
        jobTitle: userData.jobTitle,
        department: userData.department,
        location: userData.location,
        updatedAt: new Date()
      }
    });
    
    // Map database model to response format
    const profileData: UserProfileData = {
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.surname || '',
      email: updatedUser.email,
      jobTitle: updatedUser.jobTitle || '',
      department: updatedUser.department || '',
      location: updatedUser.location || ''
    };
    
    return NextResponse.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
} 