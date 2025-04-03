import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { discoverComponents } from '../utils/component-discovery';

/**
 * API endpoint to discover components on the server side and provide them to the client
 * This solves the "module not found" errors by ensuring component discovery happens server-side
 * 
 * @param req The NextRequest object
 * @returns JSON response with discovered components
 */
export async function GET(req: NextRequest) {
  try {
    // Get the components from the discovery system (server-side only)
    const components = await discoverComponents();
    
    // Return the components as JSON
    return NextResponse.json({ 
      status: 'success',
      components,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error discovering components:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to discover components',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Verify component existence
 * 
 * Check if a specific component exists and is accessible
 * This helps diagnose "module not found" errors
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { componentPath } = data;
    
    if (!componentPath) {
      return NextResponse.json({
        status: 'error',
        message: 'Component path is required'
      }, { status: 400 });
    }
    
    // Convert @/ path to filesystem path
    const fsPath = componentPath
      .replace('@/components/', 'src/components/')
      .replace('@/src/components/', 'src/components/');
    
    // Check extensions in order of preference
    const possibleExtensions = ['.tsx', '.jsx', '.js', '.ts'];
    let fullPath = '';
    let exists = false;
    
    // Try with the exact path provided
    for (const ext of possibleExtensions) {
      fullPath = `${fsPath}${ext}`;
      if (fs.existsSync(fullPath)) {
        exists = true;
        break;
      }
    }
    
    // If not found, try with index files
    if (!exists) {
      const dirPath = path.dirname(fsPath);
      for (const ext of possibleExtensions) {
        fullPath = path.join(dirPath, 'index' + ext);
        if (fs.existsSync(fullPath)) {
          exists = true;
          break;
        }
      }
    }
    
    if (exists) {
      // Get file stats for more info
      const stats = fs.statSync(fullPath);
      return NextResponse.json({
        status: 'success',
        exists: true,
        path: fullPath,
        size: stats.size,
        modified: stats.mtime
      });
    }
    
    return NextResponse.json({
      status: 'error',
      exists: false,
      message: 'Component not found',
      checkedPaths: possibleExtensions.map(ext => `${fsPath}${ext}`).concat(
        possibleExtensions.map(ext => path.join(path.dirname(fsPath), 'index' + ext))
      )
    });
  } catch (error) {
    console.error('Error verifying component:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to verify component',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 