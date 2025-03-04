import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { sendTeamInvitationEmail, generateInvitationToken } from '@/lib/email';

// Resend an invitation email with a new token
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure user is authenticated and has permission
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'You must be logged in to resend invitations' 
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

    // Get invitation details and check permissions
    const invitation = await prisma.$queryRaw`
      SELECT * FROM "TeamInvitation"
      WHERE "id" = ${id} AND "inviterId" = ${currentUser.id}
    `;

    if (!Array.isArray(invitation) || invitation.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation not found or you do not have permission to resend it' 
      }, { status: 404 });
    }

    const invitationData = invitation[0] as any;

    // Only allow resending if the invitation is still pending
    if (invitationData.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot resend invitation that has been ${invitationData.status.toLowerCase()}` 
      }, { status: 400 });
    }

    // Create a new invitation token
    const token = generateInvitationToken();

    // Check if the InvitationToken table exists
    const tokenTableExists = await checkTableExists('InvitationToken');
    if (!tokenTableExists) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invitation token table does not exist. Please set up team management first.' 
      }, { status: 400 });
    }

    // Create a new invitation token
    await prisma.$executeRaw`
      INSERT INTO "InvitationToken" (
        "id", 
        "token", 
        "invitationId", 
        "isUsed", 
        "createdAt"
      )
      VALUES (
        gen_random_uuid(),
        ${token},
        ${id},
        false,
        CURRENT_TIMESTAMP
      )
    `;

    // Update expiration date for the invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Set to expire in 7 days

    await prisma.$executeRaw`
      UPDATE "TeamInvitation"
      SET "expiresAt" = ${expiresAt}
      WHERE "id" = ${id}
    `;

    // Send the invitation email
    const inviteeEmail = invitationData.email;
    const inviterName = currentUser.firstName ? 
      `${currentUser.firstName} ${currentUser.surname || ''}`.trim() : 
      currentUser.email;
    const role = invitationData.role;
    
    // Create invitation link with the token
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
    
    try {
      await sendTeamInvitationEmail({
        email: inviteeEmail,
        inviterName,
        role,
        companyName: process.env.COMPANY_NAME || 'Our Team',
        invitationLink,
        expiresAt
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      
      // Even if email fails, we consider the operation partially successful
      // because the token was created
      return NextResponse.json({ 
        success: true, 
        message: 'Invitation renewed but email delivery failed',
        warning: 'Failed to send email, but token was created. You may need to share the invitation link manually.',
        emailError: process.env.NODE_ENV === 'development' ? String(emailError) : undefined
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation resent successfully' 
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to resend invitation',
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