/**
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
  const url = new URL(`http://localhost${path}`);
  
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
        const pattern = new RegExp('^' + r.replace(/:w+/g, '[^/]+') + '$');
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
    ? `route-${routeGroup}-${route}-${element}`
    : `route-${routeGroup}-${route}`;
}
