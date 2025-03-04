import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { sendTeamInvitationEmail } from '@/lib/email';

// Delete (cancel) an invitation
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
        error: 'You must be logged in to cancel invitations' 
      }, { status: 401 });
    }

    // Get the invitation ID from the URL
    const { id } = params;
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation ID is required' 
      }, { status: 400 });
    }

    // Check if invitation exists and was created by the current user
    const invitation = await prisma.$queryRaw`
      SELECT * FROM "TeamInvitation"
      WHERE "id" = ${id} AND "inviterId" = ${currentUser.id}
    `;

    if (!Array.isArray(invitation) || invitation.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation not found or you do not have permission to cancel it' 
      }, { status: 404 });
    }

    // Cancel the invitation by updating its status
    await prisma.$executeRaw`
      UPDATE "TeamInvitation"
      SET "status" = 'CANCELLED'
      WHERE "id" = ${id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation cancelled successfully' 
    });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to cancel invitation',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// GET handler to retrieve invitation details
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
        error: 'You must be logged in to view invitation details' 
      }, { status: 401 });
    }

    // Get the invitation ID from the URL
    const { id } = params;
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation ID is required' 
      }, { status: 400 });
    }

    // Retrieve invitation details
    const invitation = await prisma.$queryRaw`
      SELECT 
        i."id", 
        i."email", 
        i."role", 
        i."status", 
        i."expiresAt", 
        i."createdAt",
        i."inviterId"
      FROM "TeamInvitation" i
      WHERE i."id" = ${id}
    `;

    if (!Array.isArray(invitation) || invitation.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation not found' 
      }, { status: 404 });
    }

    // Check if user has permission to view this invitation
    const invitationData = invitation[0] as any;
    if (invitationData.inviterId !== currentUser.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to view this invitation' 
      }, { status: 403 });
    }

    // Return invitation details
    return NextResponse.json({ 
      success: true, 
      data: invitationData
    });
  } catch (error) {
    console.error('Error retrieving invitation details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve invitation details',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
} 