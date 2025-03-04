import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getCurrentUser } from '@/lib/user';
import { sendTeamInvitationEmail, generateInvitationToken } from '@/lib/email';

// Match these to the Prisma schema
enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

interface TeamMember {
  id: string;
  ownerId: string;
  memberId: string;
  role: TeamRole;
  createdAt: Date;
  updatedAt: Date;
  // Add member details if needed
}

interface TeamInvitation {
  id: string;
  email: string;
  status: InvitationStatus;
  inviterId: string;
  inviteeId?: string;
  role: TeamRole;
  createdAt: Date;
  expiresAt: Date;
}

// Get team members
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      // Return empty data for better UX
      return NextResponse.json({ 
        success: true, 
        data: { 
          teamMembers: [], 
          pendingInvitations: [] 
        } 
      });
    }

    let teamMembers: TeamMember[] = [];
    let pendingInvitations: TeamInvitation[] = [];

    // Check if TeamMember model exists by trying to access it
    try {
      const result = await prisma.$queryRaw`SELECT * FROM "TeamMember" WHERE "ownerId" = ${currentUser.id}`;
      teamMembers = result as TeamMember[];
    } catch (error) {
      console.warn('TeamMember table might not exist yet:', error);
      // Continue with empty teamMembers
    }

    // Check if TeamInvitation model exists by trying to access it
    try {
      const result = await prisma.$queryRaw`SELECT * FROM "TeamInvitation" WHERE "inviterId" = ${currentUser.id} AND "status" = 'PENDING'`;
      pendingInvitations = result as TeamInvitation[];
    } catch (error) {
      console.warn('TeamInvitation table might not exist yet:', error);
      // Continue with empty pendingInvitations
    }

    return NextResponse.json({ 
      success: true, 
      data: { teamMembers, pendingInvitations } 
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 });
  }
}

// Add this helper function if it doesn't exist in the file already
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const tableResult = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      );
    `;
    
    return Array.isArray(tableResult) && 
           tableResult.length > 0 && 
           (tableResult[0] as any).exists === true;
  } catch (err) {
    console.error(`Error checking if ${tableName} table exists:`, err);
    return false;
  }
}

// Invite team member
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to invite team members' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { email, role } = data;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required to invite a team member' },
        { status: 400 }
      );
    }

    // Default role to 'MEMBER' if not specified
    const memberRole = role || 'MEMBER';
    
    // Check if the invitation table exists first
    const invitationTableExists = await checkTableExists('TeamInvitation');
    
    if (!invitationTableExists) {
      // If table doesn't exist, redirect to setup
      return NextResponse.json(
        { 
          success: false, 
          error: 'Team management tables need to be set up first',
          needsSetup: true
        },
        { status: 400 }
      );
    }
    
    // Set expiration date to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    console.log('Attempting to create invitation with:', {
      email,
      role: memberRole,
      expiresAt: expiresAt.toISOString(),
      currentUserId: currentUser.id
    });

    let invitationId: string;

    // Super simplified approach - use $executeRawUnsafe to avoid type issues
    try {
      // Generate a UUID for the invitation
      const uuidResult = await prisma.$queryRaw`SELECT gen_random_uuid() as uuid`;
      invitationId = (uuidResult as any)[0].uuid;
      
      // Use a very basic SQL query with no type casting
      const query = `
        INSERT INTO "TeamInvitation" 
        ("id", "email", "role", "inviterId", "status", "createdAt", "expiresAt") 
        VALUES 
        ('${invitationId}', '${email}', '${memberRole}', '${currentUser.id}', 'PENDING', CURRENT_TIMESTAMP, '${expiresAt.toISOString()}')
      `;
      
      await prisma.$executeRawUnsafe(query);
      
      // Generate invitation token
      const token = generateInvitationToken();
      
      // Check if InvitationToken table exists
      const tokenTableExists = await checkTableExists('InvitationToken');
      
      if (tokenTableExists) {
        // Store the token
        const tokenQuery = `
          INSERT INTO "InvitationToken" 
          ("id", "token", "invitationId", "createdAt", "isUsed") 
          VALUES 
          (gen_random_uuid(), '${token}', '${invitationId}', CURRENT_TIMESTAMP, false)
        `;
        
        await prisma.$executeRawUnsafe(tokenQuery);
      }
      
      // Send invitation email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      const invitationLink = `${appUrl}/accept-invitation?token=${token}`;
      
      await sendTeamInvitationEmail({
        email,
        inviterName: currentUser.firstName && currentUser.surname 
          ? `${currentUser.firstName} ${currentUser.surname}` 
          : currentUser.email || 'A team member',
        companyName: currentUser.companyName || 'our team',
        role: memberRole,
        invitationLink,
        expiresAt
      });
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Team member invited successfully',
          data: {
            id: invitationId,
            email,
            role: memberRole,
            expiresAt
          }
        },
        { status: 200 }
      );
    } catch (sqlError) {
      console.error('Error with SQL insertion or sending email:', sqlError);
      
      // If that fails, the table might not be set up correctly
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create invitation. Database error occurred.',
          details: process.env.NODE_ENV === 'development' ? String(sqlError) : undefined,
          needsSetup: true
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to invite team member',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Remove team member or cancel invitation
export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const invitationId = searchParams.get('invitationId');

    if (!memberId && !invitationId) {
      return NextResponse.json({ error: 'Either memberId or invitationId is required' }, { status: 400 });
    }

    if (memberId) {
      try {
        await prisma.$executeRaw`
          DELETE FROM "TeamMember" 
          WHERE "ownerId" = ${currentUser.id} AND "memberId" = ${memberId}
        `;
      } catch (error) {
        console.warn('Error deleting team member, table might not exist:', error);
      }
    } else if (invitationId) {
      try {
        await prisma.$executeRaw`
          DELETE FROM "TeamInvitation" 
          WHERE "id" = ${invitationId} AND "inviterId" = ${currentUser.id}
        `;
      } catch (error) {
        console.warn('Error deleting invitation, table might not exist:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 });
  }
} 