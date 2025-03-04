import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';

// Accept team invitation
export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'You must be logged in to accept an invitation' 
      }, { status: 401 });
    }

    // Get the token from the request
    const data = await request.json();
    const { token } = data;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation token is required' 
      }, { status: 400 });
    }

    // 1. Find the token and get invitation details
    const tokenResult = await prisma.$queryRaw`
      SELECT 
        t."id" as "tokenId", 
        t."invitationId", 
        t."isUsed", 
        i."email", 
        i."role", 
        i."status", 
        i."expiresAt", 
        i."inviterId"
      FROM "InvitationToken" t
      JOIN "TeamInvitation" i ON t."invitationId" = i."id"
      WHERE t."token" = ${token}
    `;

    if (!Array.isArray(tokenResult) || tokenResult.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid invitation token' 
      }, { status: 404 });
    }

    const invitationInfo = tokenResult[0] as any;

    // 2. Validate invitation
    // Check if token is already used
    if (invitationInfo.isUsed) {
      return NextResponse.json({ 
        success: false, 
        error: 'This invitation has already been used' 
      }, { status: 400 });
    }

    // Check if invitation is expired
    const expiresAt = new Date(invitationInfo.expiresAt);
    const now = new Date();
    
    if (expiresAt < now) {
      return NextResponse.json({ 
        success: false, 
        error: 'This invitation has expired' 
      }, { status: 400 });
    }

    // Check if invitation status is still pending
    if (invitationInfo.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        error: `This invitation has been ${invitationInfo.status.toLowerCase()}` 
      }, { status: 400 });
    }

    // 3. Check if user's email matches the invitation email
    if (currentUser.email !== invitationInfo.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'This invitation was sent to a different email address' 
      }, { status: 400 });
    }

    // 4. Begin transaction to update invitation and create team membership
    try {
      // 4.1 Mark the token as used
      await prisma.$executeRaw`
        UPDATE "InvitationToken"
        SET "isUsed" = true
        WHERE "id" = ${invitationInfo.tokenId}
      `;

      // 4.2 Update the invitation status to ACCEPTED and link to current user
      await prisma.$executeRaw`
        UPDATE "TeamInvitation"
        SET 
          "status" = 'ACCEPTED',
          "inviteeId" = ${currentUser.id}
        WHERE "id" = ${invitationInfo.invitationId}
      `;

      // 4.3 Create team membership (check if table exists first)
      const memberTableExists = await checkTableExists('TeamMember');
      if (memberTableExists) {
        // Check if membership already exists to avoid duplicates
        const existingMembership = await prisma.$queryRaw`
          SELECT id FROM "TeamMember"
          WHERE "ownerId" = ${invitationInfo.inviterId}
          AND "memberId" = ${currentUser.id}
        `;

        if (!Array.isArray(existingMembership) || existingMembership.length === 0) {
          // Create new team membership
          await prisma.$executeRaw`
            INSERT INTO "TeamMember" (
              "id", 
              "ownerId", 
              "memberId", 
              "role", 
              "createdAt", 
              "updatedAt"
            )
            VALUES (
              gen_random_uuid(),
              ${invitationInfo.inviterId},
              ${currentUser.id},
              ${invitationInfo.role},
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            )
          `;
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Team invitation accepted successfully',
        data: {
          role: invitationInfo.role
        }
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process invitation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to accept invitation',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// Helper function to check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      );
    `;
    
    const result = await prisma.$queryRawUnsafe(checkQuery);
    
    return Array.isArray(result) && 
           result.length > 0 && 
           result[0].exists === true;
  } catch (error) {
    console.error(`Error checking if ${tableName} exists:`, error);
    return false;
  }
} 