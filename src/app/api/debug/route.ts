import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getCurrentUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    const currentUser = await getCurrentUser();
    
    // Check if database is accessible
    let dbStatus = 'unknown';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error: ' + (error instanceof Error ? error.message : String(error));
    }
    
    // Check db schema
    let schemaStatus = {};
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      schemaStatus = { tables };
    } catch (error) {
      schemaStatus = { error: error instanceof Error ? error.message : String(error) };
    }
    
    return NextResponse.json({
      env: process.env.NODE_ENV,
      session,
      user: currentUser,
      database: {
        status: dbStatus,
        schema: schemaStatus
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 