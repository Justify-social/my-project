import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { auth0 } from '@/lib/auth';

/**
 * PUT /api/user/password
 * Updates the user's password in Auth0
 */
export async function PUT(request: Request) {
  const session = await getSession();
  
  if (!session?.user?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { currentPassword, newPassword } = await request.json();
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }
    
    // Validate password requirements
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }
    
    // In development mode, just mock the response
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Password change mocked');
      return NextResponse.json({ success: true });
    }
    
    try {
      // Get Auth0 management API token
      const { token } = await auth0.getAccessToken();
      
      // Call Auth0 Management API to change password
      // Note: Auth0 Management API client must be implemented or imported
      const response = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${session.user.sub}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: newPassword,
          connection: 'Username-Password-Authentication' // Replace with your connection name
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Auth0 password change error:', error);
        
        // Handle Auth0 error codes
        if (error.message?.includes('PasswordStrengthError')) {
          return NextResponse.json({ error: 'Password does not meet strength requirements' }, { status: 400 });
        }
        
        if (error.message?.includes('PasswordHistoryError')) {
          return NextResponse.json({ error: 'Password has been used previously' }, { status: 400 });
        }
        
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error changing password:', error);
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 