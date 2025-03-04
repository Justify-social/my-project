import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';

// Update a team member's role
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure user is authenticated and has permission
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'You must be logged in to update team member roles' 
      }, { status: 401 });
    }

    // Get the team member ID from the URL
    const { id } = params;
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team member ID is required' 
      }, { status: 400 });
    }

    // Get the new role from the request body
    const data = await request.json();
    const { role } = data;

    if (!role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role is required' 
      }, { status: 400 });
    }

    // Validate the role
    const validRoles = ['OWNER', 'ADMIN', 'MEMBER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      }, { status: 400 });
    }

    // Check if team member exists and was added by the current user
    const member = await prisma.$queryRaw`
      SELECT * FROM "TeamMember"
      WHERE "id" = ${id} AND "ownerId" = ${currentUser.id}
    `;

    if (!Array.isArray(member) || member.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team member not found or you do not have permission to update their role' 
      }, { status: 404 });
    }

    // Update the team member's role
    await prisma.$executeRaw`
      UPDATE "TeamMember"
      SET "role" = ${role}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Team member role updated successfully' 
    });
  } catch (error) {
    console.error('Error updating team member role:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update team member role',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
} 