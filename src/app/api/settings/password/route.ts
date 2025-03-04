import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth';
import { getSession } from '@/lib/session';

// This function handles the password change request
export async function POST(request: Request) {
  // Get user session
  const session = await getSession();
  console.log('Session in password API:', session);
  
  if (!session?.user?.sub) {
    console.warn('No authenticated user found in session');
    // For development mode only
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        success: true,
        message: 'Password change simulated in development mode' 
      });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Password validation 
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Password complexity check
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }, { status: 400 });
    }

    // Get access token to use Auth0 Management API
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '');
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    const audience = `https://${auth0Domain}/api/v2/`;

    // Get management API token
    const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get Auth0 management token:', await tokenResponse.text());
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // Change password
    const changePasswordResponse = await fetch(`https://${auth0Domain}/api/v2/users/${session.user.sub}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({
        password: newPassword,
        connection: 'Username-Password-Authentication' // Adjust based on your connection
      })
    });

    if (!changePasswordResponse.ok) {
      const errorData = await changePasswordResponse.json();
      console.error('Failed to change password:', errorData);
      
      // Handle specific error cases
      if (errorData.error === 'invalid_password') {
        return NextResponse.json({ error: 'Invalid password format' }, { status: 400 });
      }
      
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
