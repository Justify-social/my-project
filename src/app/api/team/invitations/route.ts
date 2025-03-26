import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, this would fetch data from your database
    // Here we're returning mock data for development
    const mockInvitations = [
      {
        id: 'inv1',
        email: 'pending@example.com',
        role: 'MEMBER',
        invitedAt: new Date(2023, 5, 10).toISOString()
      },
      {
        id: 'inv2',
        email: 'waiting@example.com',
        role: 'VIEWER',
        invitedAt: new Date(2023, 6, 15).toISOString()
      }
    ];

    return NextResponse.json({ invitations: mockInvitations });
  } catch (error) {
    console.error('Error in team invitations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team invitations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;
    
    // Validate request data
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would create a new invitation in your database
    // Here we're simulating a successful response
    const newInvitation = {
      id: `inv-${Date.now()}`,
      email,
      role,
      invitedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ 
      success: true, 
      invitation: newInvitation 
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
} 