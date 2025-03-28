#!/usr/bin/env node

/**
 * Developer Experience Enhancement Script
 * 
 * This script improves the developer experience by:
 * 1. Adding comprehensive route documentation
 * 2. Implementing route type safety
 * 3. Creating route testing utilities
 */

import fs from 'fs';
import path from 'path';

// Configuration
const SRC_DIR = path.resolve(process.cwd(), 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const ROUTE_GROUPS = ['(auth)', '(dashboard)', '(campaigns)', '(settings)', '(admin)'];

// Create route documentation
function createRouteDocumentation() {
  const docsDir = path.join(process.cwd(), 'docs');
  const routeDocsDir = path.join(docsDir, 'routes');
  
  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // Create routes documentation directory if it doesn't exist
  if (!fs.existsSync(routeDocsDir)) {
    fs.mkdirSync(routeDocsDir, { recursive: true });
  }
  
  // Create main routes documentation file
  const routeDocsPath = path.join(routeDocsDir, 'README.md');
  const routeDocsContent = `# Application Routes Documentation

This document provides an overview of the application's route structure, organized by feature domains.

## Route Structure

The application uses Next.js App Router with route groups to organize routes by feature domain:

\`\`\`
src/app/
├── (auth)/              # Authentication routes
├── (dashboard)/         # Dashboard routes
├── (campaigns)/         # Campaign management
├── (settings)/          # Settings routes
└── (admin)/             # Admin routes
\`\`\`

## Route Groups

${ROUTE_GROUPS.map(group => `### ${group}`).join('\n\n')}

`;
  
  fs.writeFileSync(routeDocsPath, routeDocsContent);
  console.log('Created main route documentation file');
  
  // Create detailed documentation for each route group
  for (const group of ROUTE_GROUPS) {
    createRouteGroupDocumentation(group, routeDocsDir);
  }
}

// Create documentation for a specific route group
function createRouteGroupDocumentation(group, routeDocsDir) {
  const groupPath = path.join(APP_DIR, group);
  if (!fs.existsSync(groupPath)) return;
  
  // Get all routes in the group
  const routes = fs.readdirSync(groupPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .map(dirent => dirent.name);
  
  if (routes.length === 0) return;
  
  // Create documentation file for this route group
  const groupDocsPath = path.join(routeDocsDir, `${group.replace(/[()]/g, '')}.md`);
  let groupDocsContent = `# ${group} Routes

This document details the routes in the ${group} group.

## Routes

`;

  // Add documentation for each route
  for (const route of routes) {
    const routePath = path.join(groupPath, route);
    const pageFilePath = path.join(routePath, 'page.tsx');
    
    if (!fs.existsSync(pageFilePath)) continue;
    
    // Extract route information
    let pageContent = '';
    try {
      pageContent = fs.readFileSync(pageFilePath, 'utf8');
    } catch (error) {
      console.error(`Error reading ${pageFilePath}:`, error);
      continue;
    }
    
    // Extract page title from page content
    const titleMatch = pageContent.match(/title[=:][\s]*['"]([^'"]+)['"]/);
    const title = titleMatch ? titleMatch[1] : route;
    
    // Extract page description or JSDoc comment if available
    const descriptionMatch = pageContent.match(/\/\*\*[\s\S]*?\*\//) || 
                           pageContent.match(/description[=:][\s]*['"]([^'"]+)['"]/);
    const description = descriptionMatch 
      ? descriptionMatch[0].replace(/\/\*\*|\*\/|\*/g, '').trim() 
      : `${route} page`;
    
    // Check for data fetching patterns
    const hasFetch = pageContent.includes('fetch(') || pageContent.includes('useEffect');
    const hasRevalidate = pageContent.includes('revalidate');
    const hasCaching = pageContent.includes('fetchCache');
    
    // Add route documentation
    groupDocsContent += `### ${route}

**Path:** \`/${group.replace(/[()]/g, '')}/${route}\`

**Title:** ${title}

**Description:** ${description}

**Implementation Details:**
- Data Fetching: ${hasFetch ? 'Yes' : 'No'}
- Revalidation: ${hasRevalidate ? 'Yes' : 'No'}
- Caching: ${hasCaching ? 'Yes' : 'No'}

`;
  }
  
  fs.writeFileSync(groupDocsPath, groupDocsContent);
  console.log(`Created route documentation for ${group}`);
}

// Implement route types
function implementRouteTypes() {
  const typesDir = path.join(SRC_DIR, 'types');
  const routeTypesPath = path.join(typesDir, 'routes.ts');
  
  // Create types directory if it doesn't exist
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  // Generate route types based on the directory structure
  let routeTypes = `/**
 * Route Type Definitions
 * 
 * This file provides TypeScript type safety for the application's routes.
 */

// Route parameters for dynamic routes
export type RouteParams = {
`;

  // Add route parameters for each route group
  for (const group of ROUTE_GROUPS) {
    const groupPath = path.join(APP_DIR, group);
    if (!fs.existsSync(groupPath)) continue;
    
    // Check for dynamic routes (routes with [param] in the name)
    const dynamicRoutes = fs.readdirSync(groupPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.includes('['))
      .map(dirent => {
        const paramName = dirent.name.match(/\[(.*?)\]/)?.[1];
        return { route: dirent.name, param: paramName };
      });
    
    if (dynamicRoutes.length > 0) {
      for (const { route, param } of dynamicRoutes) {
        if (param) {
          routeTypes += `  // ${group}/${route}\n`;
          routeTypes += `  ${param}: string;\n`;
        }
      }
    }
  }
  
  routeTypes += `};

// Route paths organized by feature domain
export type RoutePaths = {
`;

  // Add route paths for each route group
  for (const group of ROUTE_GROUPS) {
    const cleanGroupName = group.replace(/[()]/g, '');
    routeTypes += `  ${cleanGroupName}: {
`;
    
    const groupPath = path.join(APP_DIR, group);
    if (fs.existsSync(groupPath)) {
      const routes = fs.readdirSync(groupPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);
      
      for (const route of routes) {
        // Handle dynamic routes
        if (route.includes('[')) {
          const paramName = route.match(/\[(.*?)\]/)?.[1];
          const routePathName = route.replace(/\[(.*?)\]/g, '$1');
          routeTypes += `    ${routePathName}: (params: { ${paramName}: string }) => string;\n`;
        } else {
          routeTypes += `    ${route}: string;\n`;
        }
      }
    }
    
    routeTypes += `  };\n`;
  }
  
  routeTypes += `};

// Helper function to build typesafe route paths
export const routes: RoutePaths = {
`;

  // Implement route builders for each route group
  for (const group of ROUTE_GROUPS) {
    const cleanGroupName = group.replace(/[()]/g, '');
    routeTypes += `  ${cleanGroupName}: {
`;
    
    const groupPath = path.join(APP_DIR, group);
    if (fs.existsSync(groupPath)) {
      const routes = fs.readdirSync(groupPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);
      
      for (const route of routes) {
        // Handle dynamic routes
        if (route.includes('[')) {
          const paramName = route.match(/\[(.*?)\]/)?.[1];
          const routePathName = route.replace(/\[(.*?)\]/g, '$1');
          routeTypes += `    ${routePathName}: (params) => \`/${cleanGroupName}/${route.replace(/\[(.*?)\]/g, '\${params.' + paramName + '}')}${route.endsWith('/') ? '' : '/'}\`,\n`;
        } else {
          routeTypes += `    ${route}: \`/${cleanGroupName}/${route}${route.endsWith('/') ? '' : '/'}\`,\n`;
        }
      }
    }
    
    routeTypes += `  },\n`;
  }
  
  routeTypes += `};

export default routes;
`;
  
  fs.writeFileSync(routeTypesPath, routeTypes);
  console.log('Created route type definitions');
}

// Create route testing utilities
function createRouteTestingUtilities() {
  const testUtilsDir = path.join(SRC_DIR, 'lib', 'test-utils');
  const routeTestUtilsPath = path.join(testUtilsDir, 'route-testing.ts');
  
  // Create test utils directory if it doesn't exist
  if (!fs.existsSync(testUtilsDir)) {
    fs.mkdirSync(testUtilsDir, { recursive: true });
  }
  
  // Create route testing utilities
  const routeTestUtilsContent = `/**
 * Route Testing Utilities
 * 
 * This file provides utilities for testing routes in the application.
 */

import { NextRequest } from 'next/server';
import { routes } from '../../types/routes';

/**
 * Creates a mock NextRequest for testing middleware
 * @param path The route path to test
 * @param options Additional request options
 * @returns A mock NextRequest
 */
export function createMockRouteRequest(path: string, options: {
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}) {
  const url = new URL(\`http://localhost\${path}\`);
  
  return new NextRequest(url, {
    method: options.method || 'GET',
    headers: options.headers || {},
    cookies: options.cookies || {},
  });
}

/**
 * Tests if a route exists in the application
 * @param path The route path to test
 * @returns True if the route exists
 */
export function isValidRoute(path: string): boolean {
  // Remove leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Split path into segments
  const segments = normalizedPath.split('/').filter(Boolean);
  
  if (segments.length === 0) return true; // Root path
  
  // Check if the first segment matches a route group
  const routeGroup = segments[0];
  const routeGroups = Object.keys(routes);
  
  if (!routeGroups.includes(routeGroup)) return false;
  
  // Check if the second segment matches a route within the group
  if (segments.length > 1) {
    const route = segments[1];
    const routesInGroup = Object.keys(routes[routeGroup as keyof typeof routes]);
    
    return routesInGroup.some(r => {
      // Handle dynamic routes
      if (r.includes(':')) {
        const pattern = new RegExp('^' + r.replace(/:\w+/g, '[^/]+') + '$');
        return pattern.test(route);
      }
      return r === route;
    });
  }
  
  return true;
}

/**
 * Returns a test ID for a route component
 * @param routeGroup The route group
 * @param route The specific route
 * @param element The element name (optional)
 * @returns A data-testid attribute value
 */
export function getRouteTestId(routeGroup: string, route: string, element?: string): string {
  return element 
    ? \`route-\${routeGroup}-\${route}-\${element}\`
    : \`route-\${routeGroup}-\${route}\`;
}
`;
  
  fs.writeFileSync(routeTestUtilsPath, routeTestUtilsContent);
  console.log('Created route testing utilities');
}

// Create a README file for routes in each route group
function createRouteGroupReadmes() {
  for (const group of ROUTE_GROUPS) {
    const groupPath = path.join(APP_DIR, group);
    if (!fs.existsSync(groupPath)) continue;
    
    const readmePath = path.join(groupPath, 'README.md');
    
    // Create README content based on routes in the group
    let readmeContent = `# ${group} Routes

This directory contains routes for the ${group.replace(/[()]/g, '')} feature domain.

## Routes

`;
    
    const routes = fs.readdirSync(groupPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && !['error.tsx', 'loading.tsx', 'not-found.tsx', 'layout.tsx', 'README.md'].includes(dirent.name))
      .map(dirent => dirent.name);
    
    for (const route of routes) {
      readmeContent += `- **${route}**: \`/${group.replace(/[()]/g, '')}/${route}\`\n`;
    }
    
    readmeContent += `
## Special Files

- **layout.tsx**: Shared layout for all ${group} routes
- **loading.tsx**: Loading state shown during route transitions
- **error.tsx**: Error handling component for route errors
- **not-found.tsx**: 404 page for routes that don't exist

## Usage

Import the route definitions from \`@/types/routes\` to navigate to these routes:

\`\`\`typescript
import { routes } from '@/types/routes';

// Example usage
<Link href={routes.${group.replace(/[()]/g, '')}.${routes.length > 0 ? routes[0] : 'example'}}>
  ${routes.length > 0 ? routes[0] : 'Example'} Link
</Link>
\`\`\`
`;
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`Created README for ${group}`);
  }
}

// Main execution
function main() {
  try {
    console.log('Starting developer experience enhancements...');
    
    // Create comprehensive route documentation
    createRouteDocumentation();
    
    // Implement route type safety
    implementRouteTypes();
    
    // Create route testing utilities
    createRouteTestingUtilities();
    
    // Create README files for route groups
    createRouteGroupReadmes();
    
    console.log('Developer experience enhancements completed successfully!');
  } catch (error) {
    console.error('Error during developer experience enhancements:', error);
    process.exit(1);
  }
}

// Run the implementation
main(); 