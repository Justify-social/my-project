import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Verify invitation token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Check if InvitationToken table exists
    const tokenTableExists = await checkTableExists('InvitationToken');
    
    if (!tokenTableExists) {
      return NextResponse.json(
        { success: false, error: 'Invitation system is not set up' },
        { status: 404 }
      );
    }

    // Find the token
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
      return NextResponse.json(
        { success: false, error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    const invitationInfo = tokenResult[0] as any;

    // Check if token is already used
    if (invitationInfo.isUsed) {
      return NextResponse.json(
        { success: false, error: 'This invitation has already been used' },
        { status: 400 }
      );
    }

    // Check if invitation is expired
    const expiresAt = new Date(invitationInfo.expiresAt);
    const now = new Date();
    
    if (expiresAt < now) {
      return NextResponse.json(
        { success: false, error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    // Check if invitation status is still pending
    if (invitationInfo.status !== 'PENDING') {
      return NextResponse.json(
        { 
          success: false, 
          error: `This invitation has been ${invitationInfo.status.toLowerCase()}` 
        },
        { status: 400 }
      );
    }

    // Return invitation details (without the token for security)
    return NextResponse.json({
      success: true,
      invitation: {
        id: invitationInfo.invitationId,
        email: invitationInfo.email,
        role: invitationInfo.role,
        expiresAt: invitationInfo.expiresAt
      }
    });
  } catch (error) {
    console.error('Error verifying invitation token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify invitation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
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