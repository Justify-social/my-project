import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint for listing files in a directory
 *
 * Accepts:
 * - directory: Path to directory in public folder
 * - extension: Optional file extension to filter by
 *
 * Example: /api/file-system?directory=/icons/light&extension=.svg
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const directory = searchParams.get('directory');
    const extension = searchParams.get('extension');

    // Validate and sanitize the directory parameter
    if (!directory) {
      return NextResponse.json({ error: 'Directory parameter is required' }, { status: 400 });
    }

    // Sanitize directory to prevent directory traversal
    const sanitizedDir = path.normalize(directory).replace(/^(\.\.(\/|\\|$))+/, '');

    // Resolve to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    const fullPath = path.join(publicDir, sanitizedDir);

    // Check if the path exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
    }

    // Ensure it's a directory
    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return NextResponse.json({ error: 'Path is not a directory' }, { status: 400 });
    }

    // Read the directory
    const files = fs.readdirSync(fullPath);

    // Filter and format the results
    const results = files
      .filter(file => {
        // Skip hidden files
        if (file.startsWith('.')) return false;

        // Apply extension filter if provided
        if (extension && !file.endsWith(extension)) return false;

        // Only include files, not directories
        const filePath = path.join(fullPath, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(fullPath, file);
        const stats = fs.statSync(filePath);

        return {
          name: file,
          path: path.join(sanitizedDir, file).replace(/\\/g, '/'),
          size: stats.size,
          modified: stats.mtime,
        };
      });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in file-system API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
