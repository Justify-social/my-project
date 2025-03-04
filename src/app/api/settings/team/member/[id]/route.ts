import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';

// Delete (remove) a team member
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure user is authenticated and has permission
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'You must be logged in to remove team members' 
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

    // Check if team member exists and was added by the current user
    const member = await prisma.$queryRaw`
      SELECT * FROM "TeamMember"
      WHERE "id" = ${id} AND "ownerId" = ${currentUser.id}
    `;

    if (!Array.isArray(member) || member.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team member not found or you do not have permission to remove them' 
      }, { status: 404 });
    }

    // Remove the team member
    await prisma.$executeRaw`
      DELETE FROM "TeamMember"
      WHERE "id" = ${id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Team member removed successfully' 
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove team member',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// GET handler to retrieve team member details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'You must be logged in to view team member details' 
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

    // Retrieve team member details
    const member = await prisma.$queryRaw`
      SELECT 
        tm."id", 
        tm."role", 
        tm."createdAt",
        tm."ownerId",
        tm."memberId",
        u."firstName",
        u."surname",
        u."email"
      FROM "TeamMember" tm
      JOIN "User" u ON tm."memberId" = u."id"
      WHERE tm."id" = ${id}
    `;

    if (!Array.isArray(member) || member.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team member not found' 
      }, { status: 404 });
    }

    // Check if user has permission to view this team member
    const memberData = member[0] as any;
    if (memberData.ownerId !== currentUser.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to view this team member' 
      }, { status: 403 });
    }

    // Return team member details
    return NextResponse.json({ 
      success: true, 
      data: {
        id: memberData.id,
        role: memberData.role,
        createdAt: memberData.createdAt,
        memberId: memberData.memberId,
        name: memberData.firstName ? `${memberData.firstName} ${memberData.surname || ''}`.trim() : null,
        email: memberData.email
      }
    });
  } catch (error) {
    console.error('Error retrieving team member details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve team member details',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
} 