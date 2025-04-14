import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Specify Node.js runtime since we're using fs module
export const runtime = 'nodejs';

// Explicitly mark this route as dynamic since it uses request parameters
export const dynamic = 'force-dynamic';

// Map of problematic icons to their working alternatives
const ICON_ALIASES: Record<string, string> = {
  'x-circle': 'circle-xmark',
  // Add any other problem icons here in the future
};

export async function GET(request: NextRequest) {
  try {
    // Get search params directly from request instead of constructing URL
    const style = request.nextUrl.searchParams.get('style') || 'light';
    const name = request.nextUrl.searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Icon name required' }, { status: 400 });
    }

    // Security: Sanitize inputs to prevent directory traversal
    const sanitizedStyle = style.replace(/[^a-zA-Z0-9-]/g, '');
    const sanitizedName = name.replace(/[^a-zA-Z0-9-]/g, '');

    // Base path for icons
    const basePath = path.join(process.cwd(), 'public', 'icons');

    // Try to find the icon with the original name
    let iconPath = path.join(basePath, sanitizedStyle, `${sanitizedName}.svg`);

    // If not found, check if we have an alias for this icon
    if (!fs.existsSync(iconPath) && ICON_ALIASES[sanitizedName]) {
      iconPath = path.join(basePath, sanitizedStyle, `${ICON_ALIASES[sanitizedName]}.svg`);
    }

    // If still not found, try to use question mark icon as a fallback
    if (!fs.existsSync(iconPath)) {
      iconPath = path.join(basePath, sanitizedStyle, 'question.svg');

      // If even the fallback doesn't exist, return error
      if (!fs.existsSync(iconPath)) {
        return NextResponse.json({ error: 'Icon not found' }, { status: 404 });
      }
    }

    // Read and return the SVG content
    const svgContent = fs.readFileSync(iconPath, 'utf8');

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      },
    });
  } catch (error) {
    console.error('Error serving icon:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
