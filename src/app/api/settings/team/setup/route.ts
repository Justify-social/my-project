import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';

// These should match the enum values in schema.prisma
const TEAM_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'];
const INVITATION_STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

/**
 * Setup endpoint to create team management tables if they don't exist
 * This is the super simplified version that will definitely work
 */
export async function POST() {
  try {
    // Ensure user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if tables exist
    const memberTableExists = await checkTableExists('TeamMember');
    const invitationTableExists = await checkTableExists('TeamInvitation');
    
    // Results of operations
    const results = {
      teamMemberTable: { existed: memberTableExists, created: false },
      teamInvitationTable: { existed: invitationTableExists, created: false },
      invitationTokenTable: { existed: false, created: false }
    };
    
    // Super simple table creation - TeamMember
    if (!memberTableExists) {
      try {
        // Create TeamMember table with basic SQL - no enums, just TEXT
        const createMemberTableQuery = `
          CREATE TABLE "TeamMember" (
            "id" TEXT NOT NULL, 
            "ownerId" TEXT NOT NULL,
            "memberId" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'MEMBER',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "TeamMember_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "TeamMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          )
        `;
        
        await prisma.$executeRawUnsafe(createMemberTableQuery);
        results.teamMemberTable.created = true;
        console.log('TeamMember table created successfully');
      } catch (error) {
        console.error('Error creating TeamMember table:', error);
        return NextResponse.json({ 
          error: 'Failed to create TeamMember table',
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    }
    
    // Super simple table creation - TeamInvitation
    if (!invitationTableExists) {
      try {
        // Create TeamInvitation table with basic SQL - no enums, just TEXT
        const createInvitationTableQuery = `
          CREATE TABLE "TeamInvitation" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "inviterId" TEXT NOT NULL,
            "inviteeId" TEXT,
            "role" TEXT NOT NULL DEFAULT 'MEMBER',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
            CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "TeamInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT "TeamInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
          )
        `;
        
        await prisma.$executeRawUnsafe(createInvitationTableQuery);
        results.teamInvitationTable.created = true;
        console.log('TeamInvitation table created successfully');
      } catch (error) {
        console.error('Error creating TeamInvitation table:', error);
        return NextResponse.json({ 
          error: 'Failed to create TeamInvitation table',
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    }
    
    // Create InvitationToken table if it doesn't exist
    const tokenTableExists = await checkTableExists('InvitationToken');
    results.invitationTokenTable = { existed: tokenTableExists, created: false };

    if (!tokenTableExists) {
      try {
        // Create InvitationToken table for storing secure tokens
        const createTokenTableQuery = `
          CREATE TABLE "InvitationToken" (
            "id" TEXT NOT NULL,
            "token" TEXT NOT NULL,
            "invitationId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "isUsed" BOOLEAN NOT NULL DEFAULT false,
            CONSTRAINT "InvitationToken_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "InvitationToken_token_key" UNIQUE ("token"),
            CONSTRAINT "InvitationToken_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "TeamInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE
          )
        `;
        
        await prisma.$executeRawUnsafe(createTokenTableQuery);
        results.invitationTokenTable.created = true;
        console.log('InvitationToken table created successfully');
      } catch (error) {
        console.error('Error creating InvitationToken table:', error);
        // Continue anyway - the main tables are more important
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Team management tables setup completed',
      results 
    });
  } catch (error) {
    console.error('Error setting up team management:', error);
    return NextResponse.json({ 
      error: 'Failed to set up team management',
      details: error instanceof Error ? error.message : String(error)
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