import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { auth } from '@clerk/nextjs/server'; // Use Clerk auth

const execFileAsync = promisify(execFile);

// Define expected structure for sessionClaims metadata
interface SessionClaimsMetadata {
  role?: string;
}

interface CustomSessionClaims {
  metadata?: SessionClaimsMetadata;
}

// Define the allowed scripts to prevent arbitrary code execution
const ALLOWED_SCRIPTS: { [key: string]: { path: string; reportPath?: string } } = {
  'scripts/debug/database/find-hook-issues.js': {
    path: 'scripts/debug/database/find-hook-issues.js',
    reportPath: 'docs/hook-dependency-issues-report.md',
  },
  // Add other allowed scripts here if needed
};

/**
 * POST /api/debug/run-script
 * Run a specific debugging script and return the results
 *
 * Body: { scriptName: string }
 * Protected: Only accessible by users with 'ADMIN' or 'SUPER_ADMIN' roles (or all users in development)
 */
export async function POST(request: NextRequest) {
  // Check authentication and authorization using Clerk
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Get role from Clerk metadata
  const metadata = (sessionClaims as CustomSessionClaims | null)?.metadata;
  const userRole = metadata?.role || 'USER';

  // Only allow admins to run scripts (or anyone in development mode)
  if (!isDevelopment && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    console.warn(`Forbidden access attempt to run-script by user ${userId} with role ${userRole}`);
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const requestedScriptName = body.scriptName;

    if (!requestedScriptName) {
      return NextResponse.json({ error: 'Missing scriptName in request body' }, { status: 400 });
    }

    const scriptConfig = ALLOWED_SCRIPTS[requestedScriptName];

    if (!scriptConfig) {
      console.warn(`Attempted to run disallowed script: ${requestedScriptName}`);
      return NextResponse.json({ error: 'Invalid or disallowed script name' }, { status: 400 });
    }

    // Construct the absolute path safely
    const scriptPath = path.join(process.cwd(), scriptConfig.path);

    // Optional: Check if the script file actually exists before trying to run it
    try {
      await fs.promises.access(scriptPath, fs.constants.F_OK | fs.constants.X_OK); // Check existence and execute permission
    } catch (fsError) {
      console.error(`Script not found or not executable: ${scriptPath}`, fsError);
      return NextResponse.json({ error: `Script file not found or not executable: ${scriptConfig.path}` }, { status: 404 });
    }

    console.log(`Executing script: ${scriptPath}`);

    // Execute the script using Node.js
    // Pass any necessary arguments if required by the scripts
    const { stdout, stderr } = await execFileAsync('node', [scriptPath], {
      timeout: 60000, // Set a timeout (e.g., 60 seconds)
      cwd: process.cwd(), // Set the working directory
    });

    if (stderr) {
      console.error(`Script execution error for ${scriptConfig.path}:
${stderr}`);
      // Decide if stderr always means failure or could be warnings
      // For simplicity, we'll treat stderr as an error for now
      return NextResponse.json({ error: `Script execution failed: ${stderr}` }, { status: 500 });
    }

    console.log(`Script execution successful for ${scriptConfig.path}:
${stdout}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully ran ${scriptConfig.path}. ${stdout ? `Output: ${stdout.substring(0, 100)}...` : ''}`, // Include partial output if desired
      reportPath: scriptConfig.reportPath, // Include report path if defined
    });

  } catch (error: any) {
    console.error('Error in run-script API route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
