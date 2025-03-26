import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, this would fetch data from your database
    // Here we're returning mock data for development
    const mockMembers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'OWNER',
        createdAt: new Date(2023, 0, 15).toISOString()
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'ADMIN',
        createdAt: new Date(2023, 2, 10).toISOString()
      },
      {
        id: '3',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'MEMBER',
        createdAt: new Date(2023, 5, 22).toISOString()
      },
      {
        id: '4',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'VIEWER',
        createdAt: new Date(2023, 8, 5).toISOString()
      }
    ];

    return NextResponse.json({ members: mockMembers });
  } catch (error) {
    console.error('Error in team members API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
} 