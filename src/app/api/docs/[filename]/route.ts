import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@auth0/nextjs-auth0';

/**
 * GET /api/docs/[filename]
 * Get content of a documentation file
 * 
 * Protected: Only accessible by ADMIN and SUPER_ADMIN users
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Check authentication and authorization
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }
  
  // Only allow admins to access these files
  // Note: Replace with the actual role check based on your Auth0 setup
  const userRole = session.user.role || 'USER';
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  const { filename } = params;
  
  // Sanitize the filename to prevent directory traversal
  const sanitizedFilename = path.basename(filename);
  
  // Define the path to the documentation files
  const docsPath = path.join(process.cwd(), 'docs');
  const filePath = path.join(docsPath, sanitizedFilename);
  
  try {
    // Check if the file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    // Return the content as markdown
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/markdown',
      },
    });
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 