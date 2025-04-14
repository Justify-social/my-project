import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getSession } from '@auth0/nextjs-auth0';

const execPromise = promisify(exec);

/**
 * POST /api/debug/run-script
 * Run a specific debugging script and return the results
 *
 * Body: { scriptName: string }
 * Protected: Only accessible by ADMIN and SUPER_ADMIN users (and all users in development mode)
 */
export async function POST(request: NextRequest) {
  // Check authentication and authorization
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Only allow admins to run scripts (or anyone in development mode)
  const userRole = session.user.role || 'USER';
  if (!isDevelopment && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    // Parse the request body
    const { scriptName } = await request.json();

    // Whitelist of allowed scripts for security
    const allowedScripts = ['find-any-types.js', 'find-img-tags.js', 'find-hook-issues.js'];

    if (!scriptName || !allowedScripts.includes(scriptName)) {
      return NextResponse.json({ error: 'Invalid script name' }, { status: 400 });
    }

    // Run the script
    const scriptPath = `src/scripts/${scriptName}`;
    const outputPath = `docs/${scriptName.replace('.js', '-report.md')}`;

    const command = `cd ${process.cwd()} && node ${scriptPath}`;

    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error(`Script execution error: ${stderr}`);
      return NextResponse.json(
        { error: 'Error executing script', details: stderr },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Script executed successfully',
      output: stdout,
      reportPath: outputPath,
    });
  } catch (error) {
    console.error('Error running script:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
